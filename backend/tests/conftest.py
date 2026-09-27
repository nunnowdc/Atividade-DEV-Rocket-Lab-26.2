"""Fixtures compartilhadas pelos testes da API.

Cada teste recebe um banco SQLite novo, num arquivo temporário, com um pequeno
catálogo de exemplo. A API é apontada para esse banco trocando a dependência
``get_db``, então o banco real (rocketlab.db) nunca é usado.
"""

from collections.abc import AsyncIterator

import httpx
import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.session import enable_sqlite_foreign_keys, get_db
from app.main import app
from app.movies.models import (
    DimGenre,
    DimMovie,
    DimPerson,
    DimReview,
    FactMoviePerformance,
    MovieReview,
)

# Ids fixos para os testes poderem se referir aos dados de exemplo.
DRAMA = "genre-drama"
HORROR = "genre-horror"


def build_catalog() -> list:
    """Catálogo de exemplo, com os mesmos tipos de inconsistência do CSV."""

    drama = DimGenre(sk_genre_id=DRAMA, nome_genero="Drama")
    horror = DimGenre(sk_genre_id=HORROR, nome_genero="Horror")
    nolan = DimPerson(
        sk_person_id="p-nolan", nome_pessoa="Christopher Nolan", tipo_pessoa="Diretor"
    )

    alpha = DimMovie(
        sk_movie_id="m-alpha",
        id_filme="1",
        titulo="Alpha",
        ano_lancamento=2020,
        genres=[drama],
        people=[nolan],
        performance=FactMoviePerformance(popularidade=50),
        # Resumo diz 3 votos, mas só existem 2 avaliações (como no CSV).
        reviews_summary=DimReview(qtd_avaliacoes_usuarios=3, nota_media_usuarios=9.5),
        reviews=[
            MovieReview(sk_movie_review_id="r-alpha-1", nome="Ana", nota=9.0, comentario="Ótimo"),
            MovieReview(sk_movie_review_id="r-alpha-2", nome="Bia", nota=8.5, comentario="Bom"),
        ],
    )
    beta = DimMovie(
        sk_movie_id="m-beta",
        id_filme="2",
        titulo="Beta",
        ano_lancamento=2021,
        genres=[horror],
        performance=FactMoviePerformance(popularidade=80),
        # Uma única avaliação nota 10: não deve dominar o "melhor avaliados".
        reviews_summary=DimReview(qtd_avaliacoes_usuarios=1, nota_media_usuarios=10.0),
        reviews=[
            MovieReview(sk_movie_review_id="r-beta-1", nome="Caio", nota=10.0, comentario="Uau"),
        ],
    )
    gamma = DimMovie(
        sk_movie_id="m-gamma",
        id_filme="3",
        titulo="Gamma Matrix",
        ano_lancamento=2020,
        genres=[drama, horror],
        # Sem popularidade e sem resumo de avaliações.
        reviews=[
            MovieReview(sk_movie_review_id="r-gamma-1", nome="Duda", nota=4.0, comentario="Ok"),
        ],
    )
    delta = DimMovie(
        sk_movie_id="m-delta",
        id_filme="4",
        titulo="Delta",
        ano_lancamento=2019,
        performance=FactMoviePerformance(popularidade=10),
        # Resumo que não bate com a avaliação: excluir daria média acima de 10.
        reviews_summary=DimReview(qtd_avaliacoes_usuarios=2, nota_media_usuarios=6.05),
        reviews=[
            MovieReview(sk_movie_review_id="r-delta-1", nome="Eva", nota=1.1, comentario="Ruim"),
        ],
    )
    return [alpha, beta, gamma, delta]


@pytest.fixture
async def session_factory(tmp_path) -> AsyncIterator[async_sessionmaker[AsyncSession]]:
    """Banco novo por teste, com as tabelas criadas e o catálogo de exemplo."""

    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'test.db'}")
    enable_sqlite_foreign_keys(engine)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    factory = async_sessionmaker(bind=engine, expire_on_commit=False, autoflush=False)
    async with factory() as session:
        session.add_all(build_catalog())
        await session.commit()

    yield factory
    await engine.dispose()


@pytest.fixture
async def client(session_factory) -> AsyncIterator[httpx.AsyncClient]:
    """Cliente HTTP da API usando o banco de teste no lugar do real."""

    async def override_get_db() -> AsyncIterator[AsyncSession]:
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test/api/v1") as http:
        yield http
    app.dependency_overrides.clear()


@pytest.fixture
async def db(session_factory) -> AsyncIterator[AsyncSession]:
    """Sessão para os testes conferirem o que ficou gravado no banco."""

    async with session_factory() as session:
        yield session
