"""Catálogo: paginação, busca, filtros, ordenação e listas auxiliares."""

from tests.conftest import DRAMA, HORROR


def titles(response) -> list[str]:
    return [movie["titulo"] for movie in response.json()["items"]]


async def test_catalogo_paginado(client):
    response = await client.get("/movies", params={"page": 1, "size": 3})

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 4
    assert body["pages"] == 2
    assert len(body["items"]) == 3

    second_page = await client.get("/movies", params={"page": 2, "size": 3})
    assert len(second_page.json()["items"]) == 1


async def test_parametros_invalidos_retornam_422(client):
    assert (await client.get("/movies", params={"page": 0})).status_code == 422
    assert (await client.get("/movies", params={"size": 500})).status_code == 422
    assert (await client.get("/movies", params={"sort": "xyz"})).status_code == 422
    assert (await client.get("/movies", params={"year": 1500})).status_code == 422


async def test_busca_por_titulo_ignora_maiusculas(client):
    response = await client.get("/movies", params={"q": "matrix"})

    assert titles(response) == ["Gamma Matrix"]


async def test_filtro_por_genero_e_ano(client):
    drama = await client.get("/movies", params={"genre": DRAMA, "sort": "titulo"})
    assert titles(drama) == ["Alpha", "Gamma Matrix"]

    horror_2020 = await client.get("/movies", params={"genre": HORROR, "year": 2020})
    assert titles(horror_2020) == ["Gamma Matrix"]
    assert horror_2020.json()["total"] == 1


async def test_ordem_padrao_e_popularidade(client):
    response = await client.get("/movies")

    # Filme sem popularidade (Gamma) vai para o fim.
    assert titles(response) == ["Beta", "Alpha", "Delta", "Gamma Matrix"]


async def test_ordem_alfabetica_e_recentes(client):
    by_title = await client.get("/movies", params={"sort": "titulo"})
    assert titles(by_title) == ["Alpha", "Beta", "Delta", "Gamma Matrix"]

    recent = await client.get("/movies", params={"sort": "recentes"})
    assert titles(recent)[0] == "Beta"  # 2021
    assert titles(recent)[-1] == "Delta"  # 2019


async def test_melhor_avaliados_usa_media_ponderada(client):
    response = await client.get("/movies", params={"sort": "avaliacao"})

    # Alpha (3 votos, 9.5) fica acima de Beta (1 voto, 10.0): com poucos votos,
    # a nota é "puxada" para a média geral. Gamma, sem resumo, vai para o fim.
    ordered = titles(response)
    assert ordered.index("Alpha") < ordered.index("Beta")
    assert ordered[-1] == "Gamma Matrix"


async def test_detalhe_do_filme(client):
    response = await client.get("/movies/m-alpha")

    assert response.status_code == 200
    movie = response.json()
    assert movie["titulo"] == "Alpha"
    assert [genre["nome_genero"] for genre in movie["genres"]] == ["Drama"]
    assert movie["people"][0]["nome_pessoa"] == "Christopher Nolan"
    assert len(movie["reviews"]) == 2
    assert movie["reviews_summary"] == {"qtd_avaliacoes_usuarios": 3, "nota_media_usuarios": 9.5}


async def test_filme_inexistente_retorna_404(client):
    response = await client.get("/movies/nao-existe")

    assert response.status_code == 404
    assert response.json()["detail"] == "Filme não encontrado"


async def test_listas_de_generos_e_anos(client):
    genres = (await client.get("/genres")).json()
    assert [genre["nome_genero"] for genre in genres] == ["Drama", "Horror"]

    years = (await client.get("/years")).json()
    assert years == [2021, 2020, 2019]
