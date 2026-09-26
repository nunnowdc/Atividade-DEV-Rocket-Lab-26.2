# Os ENDPOINTS (URLs)

"""Endpoints HTTP do domínio de filmes."""

from math import ceil
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.movies import service
from app.movies.schemas import MovieDetail, MoviePage, MovieSummary

router = APIRouter()

DbSession = Annotated[AsyncSession, Depends(get_db)]


@router.get("", response_model=MoviePage)
async def list_movies(
    db: DbSession,
    page: Annotated[int, Query(ge=1)] = 1,
    size: Annotated[int, Query(ge=1, le=100)] = 20,
    q: Annotated[str | None, Query(max_length=200, description="Busca pelo título")] = None,
) -> MoviePage:
    """Catálogo paginado, com busca opcional pelo título."""

    movies, total = await service.list_movies(db, page=page, size=size, search=q)
    return MoviePage(
        items=[MovieSummary.model_validate(movie) for movie in movies],
        total=total,
        page=page,
        size=size,
        pages=ceil(total / size),
    )


@router.get("/{movie_id}", response_model=MovieDetail)
async def get_movie(movie_id: str, db: DbSession) -> MovieDetail:
    """Detalhes completos de um filme, com as avaliações."""

    movie = await service.get_movie(db, movie_id)
    if movie is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Filme não encontrado")
    return MovieDetail.model_validate(movie)
