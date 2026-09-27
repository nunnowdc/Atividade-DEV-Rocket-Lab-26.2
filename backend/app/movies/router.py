"""Endpoints HTTP do domínio de filmes."""

from math import ceil
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.movies import service
from app.movies.models import DimMovie
from app.movies.schemas import (
    GenreOut,
    MovieDetail,
    MovieIn,
    MoviePage,
    MovieSummary,
    ReviewIn,
    ReviewOut,
)

router = APIRouter()
genres_router = APIRouter()

DbSession = Annotated[AsyncSession, Depends(get_db)]


async def get_movie_or_404(movie_id: str, db: DbSession) -> DimMovie:
    """Dependência: busca o filme da URL ou responde 404."""

    movie = await service.get_movie(db, movie_id)
    if movie is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Filme não encontrado")
    return movie


MovieFromPath = Annotated[DimMovie, Depends(get_movie_or_404)]


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


@router.post("", response_model=MovieDetail, status_code=status.HTTP_201_CREATED)
async def create_movie(data: MovieIn, db: DbSession) -> MovieDetail:
    """Cadastra um filme."""

    try:
        movie = await service.create_movie(db, data)
    except service.InvalidGenresError:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Gênero inválido") from None
    return MovieDetail.model_validate(movie)


@router.get("/{movie_id}", response_model=MovieDetail)
async def get_movie(movie: MovieFromPath) -> MovieDetail:
    """Detalhes completos de um filme, com as avaliações."""

    return MovieDetail.model_validate(movie)


@router.put("/{movie_id}", response_model=MovieDetail)
async def update_movie(data: MovieIn, movie: MovieFromPath, db: DbSession) -> MovieDetail:
    """Atualiza todos os dados de um filme."""

    try:
        movie = await service.update_movie(db, movie, data)
    except service.InvalidGenresError:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Gênero inválido") from None
    return MovieDetail.model_validate(movie)


@router.delete("/{movie_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_movie(movie: MovieFromPath, db: DbSession) -> Response:
    """Exclui um filme."""

    await service.delete_movie(db, movie)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{movie_id}/reviews", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
async def create_review(data: ReviewIn, movie: MovieFromPath, db: DbSession) -> ReviewOut:
    """Adiciona uma avaliação (nota inteira de 1 a 10 e comentário) a um filme."""

    review = await service.create_review(db, movie.sk_movie_id, data)
    return ReviewOut.model_validate(review)


@genres_router.get("", response_model=list[GenreOut])
async def list_genres(db: DbSession) -> list[GenreOut]:
    """Gêneros disponíveis, para a caixa de tags do formulário."""

    return [GenreOut.model_validate(genre) for genre in await service.list_genres(db)]
