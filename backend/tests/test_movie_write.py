"""Cadastro, edição e exclusão de filmes."""

from sqlalchemy import func, select

from app.movies.models import DimPerson, MovieReview
from tests.conftest import DRAMA, HORROR


def movie_body(**overrides) -> dict:
    body = {
        "titulo": "  Novo Filme  ",
        "ano_lancamento": 2024,
        "genre_ids": [DRAMA],
        "diretores": ["christopher nolan"],
        "atores": ["Atriz Nova"],
    }
    return body | overrides


async def count_people(db, name: str) -> int:
    query = select(func.count()).select_from(DimPerson).where(DimPerson.nome_pessoa == name)
    return await db.scalar(query)


async def test_cadastra_filme_reaproveitando_pessoas(client, db):
    response = await client.post("/movies", json=movie_body())

    assert response.status_code == 201
    movie = response.json()
    assert movie["titulo"] == "Novo Filme"  # espaços removidos
    assert movie["id_filme"].startswith("local-")
    names = {person["nome_pessoa"] for person in movie["people"]}
    assert names == {"Christopher Nolan", "Atriz Nova"}
    # "christopher nolan" reaproveitou o diretor existente, sem duplicar.
    assert await count_people(db, "Christopher Nolan") == 1


async def test_validacoes_do_cadastro(client):
    cases = [
        movie_body(diretores=[]),
        movie_body(genre_ids=[]),
        movie_body(titulo="   "),
        movie_body(ano_lancamento=1500),
        movie_body(data_lancamento="2020-01-01"),  # ano diferente de 2024
        movie_body(url_poster="nao-e-url"),
        movie_body(status_filme="Cancelado"),
    ]
    for body in cases:
        response = await client.post("/movies", json=body)
        assert response.status_code == 422, body


async def test_genero_inexistente_retorna_422(client):
    response = await client.post("/movies", json=movie_body(genre_ids=["nao-existe"]))

    assert response.status_code == 422
    assert response.json()["detail"] == "Gênero inválido"


async def test_edicao_substitui_generos_e_pessoas(client):
    body = movie_body(titulo="Alpha Editado", genre_ids=[HORROR], diretores=["Outra Diretora"])
    response = await client.put("/movies/m-alpha", json=body)

    assert response.status_code == 200
    movie = response.json()
    assert movie["titulo"] == "Alpha Editado"
    assert [genre["nome_genero"] for genre in movie["genres"]] == ["Horror"]
    directors = [p["nome_pessoa"] for p in movie["people"] if p["tipo_pessoa"] == "Diretor"]
    assert directors == ["Outra Diretora"]


async def test_exclusao_remove_filme_e_avaliacoes(client, db):
    response = await client.delete("/movies/m-alpha")

    assert response.status_code == 204
    assert (await client.get("/movies/m-alpha")).status_code == 404
    remaining = await db.scalar(
        select(func.count()).select_from(MovieReview).where(MovieReview.sk_movie_id == "m-alpha")
    )
    assert remaining == 0


async def test_excluir_filme_inexistente_retorna_404(client):
    assert (await client.delete("/movies/nao-existe")).status_code == 404
