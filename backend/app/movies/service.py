# As CONSULTAS ao banco

"""Consultas ao banco do domínio de filmes."""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.movies.models import DimMovie, FactMoviePerformance


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
