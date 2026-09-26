"""Consultas ao banco do domínio de filmes."""

from uuid import uuid4

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.movies.models import (
    DimCompany,
    DimGenre,
    DimMovie,
    DimPerson,
    FactMoviePerformance,
    PersonType,
)
from app.movies.schemas import MovieIn


class InvalidGenresError(Exception):
    """Um ou mais ids de gênero enviados não existem."""


async def list_movies(
    db: AsyncSession, *, page: int, size: int, search: str | None = None
) -> tuple[list[DimMovie], int]:
    """Devolve os filmes da página pedida e o total de filmes encontrados."""

    filters = []
    if search:
        filters.append(DimMovie.titulo.icontains(search, autoescape=True))

    total = await db.scalar(select(func.count()).select_from(DimMovie).where(*filters))

    query = (
        select(DimMovie)
        .outerjoin(DimMovie.performance)
        .where(*filters)
        .options(selectinload(DimMovie.genres), selectinload(DimMovie.reviews_summary))
        .order_by(FactMoviePerformance.popularidade.desc().nulls_last(), DimMovie.titulo)
        .offset((page - 1) * size)
        .limit(size)
    )
    movies = (await db.scalars(query)).all()
    return list(movies), total or 0


async def get_movie(db: AsyncSession, movie_id: str) -> DimMovie | None:
    """Busca um filme com todos os relacionamentos da página de detalhes."""

    query = (
        select(DimMovie)
        .where(DimMovie.sk_movie_id == movie_id)
        .options(
            selectinload(DimMovie.genres),
            selectinload(DimMovie.people),
            selectinload(DimMovie.companies),
            selectinload(DimMovie.performance),
            selectinload(DimMovie.reviews_summary),
            selectinload(DimMovie.reviews),
        )
    )
    return await db.scalar(query)


async def list_genres(db: AsyncSession) -> list[DimGenre]:
    return list(await db.scalars(select(DimGenre).order_by(DimGenre.nome_genero)))


async def create_movie(db: AsyncSession, data: MovieIn) -> DimMovie:
    # id_filme é o id do TMDB; filmes cadastrados aqui recebem um id local.
    movie = DimMovie(id_filme=f"local-{uuid4().hex[:12]}")
    await _apply_movie_data(db, movie, data)
    db.add(movie)
    await db.commit()
    return await get_movie(db, movie.sk_movie_id)


async def update_movie(db: AsyncSession, movie: DimMovie, data: MovieIn) -> DimMovie:
    """Substitui os dados do filme. ``movie`` deve vir de ``get_movie``."""

    await _apply_movie_data(db, movie, data)
    await db.commit()
    return await get_movie(db, movie.sk_movie_id)


async def delete_movie(db: AsyncSession, movie: DimMovie) -> None:
    """Remove o filme; ligações, desempenho e avaliações saem em cascata."""

    await db.delete(movie)
    await db.commit()


# --- Funções internas ---


async def _apply_movie_data(db: AsyncSession, movie: DimMovie, data: MovieIn) -> None:
    movie.titulo = data.titulo
    movie.sinopse = data.sinopse
    movie.ano_lancamento = data.ano_lancamento
    movie.data_lancamento = data.data_lancamento
    movie.duracao_minutos = data.duracao_minutos
    movie.status_filme = data.status_filme
    movie.url_poster = str(data.url_poster) if data.url_poster else None
    movie.url_backdrop = str(data.url_backdrop) if data.url_backdrop else None

    movie.genres = await _get_genres(db, data.genre_ids)
    movie.people = [
        *await _get_or_create_people(db, data.diretores, "Diretor"),
        *await _get_or_create_people(db, data.atores, "Ator"),
        *await _get_or_create_people(db, data.roteiristas, "Roteirista"),
    ]
    movie.companies = await _get_or_create_companies(db, data.produtoras)


async def _get_genres(db: AsyncSession, genre_ids: list[str]) -> list[DimGenre]:
    ids = set(genre_ids)
    genres = list(await db.scalars(select(DimGenre).where(DimGenre.sk_genre_id.in_(ids))))
    if len(genres) != len(ids):
        raise InvalidGenresError
    return genres


def _unique_names(names: list[str]) -> list[str]:
    """Remove nomes repetidos, sem diferenciar maiúsculas de minúsculas."""

    unique: dict[str, str] = {}
    for name in names:
        unique.setdefault(name.lower(), name)
    return list(unique.values())


async def _get_or_create_people(
    db: AsyncSession, names: list[str], tipo: PersonType
) -> list[DimPerson]:
    """Reaproveita as pessoas que já existem com esse papel e cria as que faltam."""

    names = _unique_names(names)
    if not names:
        return []

    query = select(DimPerson).where(
        DimPerson.tipo_pessoa == tipo,
        or_(
            DimPerson.nome_pessoa.in_(names),
            func.lower(DimPerson.nome_pessoa).in_([name.lower() for name in names]),
        ),
    )
    existing = {person.nome_pessoa.lower(): person for person in await db.scalars(query)}
    return [
        existing.get(name.lower()) or DimPerson(nome_pessoa=name, tipo_pessoa=tipo)
        for name in names
    ]


async def _get_or_create_companies(db: AsyncSession, names: list[str]) -> list[DimCompany]:
    """Reaproveita as produtoras que já existem e cria as que faltam."""

    names = _unique_names(names)
    if not names:
        return []

    query = select(DimCompany).where(
        or_(
            DimCompany.nome_produtora.in_(names),
            func.lower(DimCompany.nome_produtora).in_([name.lower() for name in names]),
        )
    )
    existing = {company.nome_produtora.lower(): company for company in await db.scalars(query)}
    return [existing.get(name.lower()) or DimCompany(nome_produtora=name) for name in names]
