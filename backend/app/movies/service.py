"""Consultas ao banco do domínio de filmes."""

from uuid import uuid4

from sqlalchemy import Select, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, selectinload

from app.movies.models import (
    DimCompany,
    DimGenre,
    DimMovie,
    DimPerson,
    DimReview,
    FactMoviePerformance,
    MovieReview,
    PersonType,
)
from app.movies.schemas import MovieIn, MovieSort, ReviewIn


class InvalidGenresError(Exception):
    """Um ou mais ids de gênero enviados não existem."""


# "Votos imaginários" da média ponderada: quanto maior, mais avaliações um
# filme precisa ter para se destacar da média geral.
BAYES_MIN_VOTES = 3


async def list_movies(
    db: AsyncSession,
    *,
    page: int,
    size: int,
    search: str | None = None,
    sort: MovieSort = "popularidade",
) -> tuple[list[DimMovie], int]:
    """Devolve os filmes da página pedida e o total de filmes encontrados."""

    filters = []
    if search:
        filters.append(DimMovie.titulo.icontains(search, autoescape=True))

    total = await db.scalar(select(func.count()).select_from(DimMovie).where(*filters))

    query = (
        _apply_sort(select(DimMovie), sort)
        .where(*filters)
        .options(selectinload(DimMovie.genres), selectinload(DimMovie.reviews_summary))
        .offset((page - 1) * size)
        .limit(size)
    )
    movies = (await db.scalars(query)).all()
    return list(movies), total or 0


def _apply_sort(query: Select, sort: MovieSort) -> Select:
    """Acrescenta à consulta os JOINs e o ORDER BY de cada ordenação."""

    if sort == "titulo":
        # Ignora aspas no início ("Blessed" ordena como Blessed, não antes do A).
        return query.order_by(func.lower(func.ltrim(DimMovie.titulo, "\"'")), DimMovie.titulo)

    if sort == "recentes":
        return query.order_by(
            DimMovie.data_lancamento.desc().nulls_last(),
            DimMovie.ano_lancamento.desc().nulls_last(),
            DimMovie.titulo,
        )

    if sort == "avaliacao":
        # Média ponderada (bayesiana): (qtd × média + m × média geral) / (qtd + m).
        # Filmes com poucas avaliações ficam "puxados" para a média geral.
        qtd = DimReview.qtd_avaliacoes_usuarios
        media = DimReview.nota_media_usuarios
        all_reviews = aliased(DimReview)  # tabela à parte para a média geral
        global_mean = (
            select(
                func.sum(all_reviews.nota_media_usuarios * all_reviews.qtd_avaliacoes_usuarios)
                / func.sum(all_reviews.qtd_avaliacoes_usuarios)
            )
            .where(all_reviews.nota_media_usuarios.is_not(None))
            .scalar_subquery()
        )
        score = (qtd * media + BAYES_MIN_VOTES * global_mean) / (qtd + BAYES_MIN_VOTES)
        return query.outerjoin(DimMovie.reviews_summary).order_by(
            score.desc().nulls_last(), qtd.desc().nulls_last(), DimMovie.titulo
        )

    # Padrão: mais populares primeiro.
    return query.outerjoin(DimMovie.performance).order_by(
        FactMoviePerformance.popularidade.desc().nulls_last(), DimMovie.titulo
    )


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


async def create_review(db: AsyncSession, movie_id: str, data: ReviewIn) -> MovieReview:
    """Registra uma avaliação e atualiza a média guardada do filme."""

    review = MovieReview(
        sk_movie_id=movie_id, nome=data.nome, nota=data.nota, comentario=data.comentario
    )
    db.add(review)
    await _add_to_review_summary(db, movie_id, data.nota)
    await db.commit()
    await db.refresh(review)  # carrega o created_at gerado pelo banco
    return review


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


async def _add_to_review_summary(db: AsyncSession, movie_id: str, nota: float) -> None:
    """Soma uma nota à média guardada em ``dim_reviews``, sem recalcular do zero.

    nova média = (média atual × quantidade atual + nota) / (quantidade atual + 1)
    """

    qtd = DimReview.qtd_avaliacoes_usuarios
    media = func.coalesce(DimReview.nota_media_usuarios, 0)  # média vazia conta como 0

    result = await db.execute(
        update(DimReview)
        .where(DimReview.sk_movie_id == movie_id)
        .values(
            nota_media_usuarios=func.round((media * qtd + nota) / (qtd + 1), 2),
            qtd_avaliacoes_usuarios=qtd + 1,
        )
    )
    if result.rowcount == 0:
        # O filme ainda não tinha resumo: esta é a primeira avaliação.
        db.add(DimReview(sk_movie_id=movie_id, qtd_avaliacoes_usuarios=1, nota_media_usuarios=nota))
