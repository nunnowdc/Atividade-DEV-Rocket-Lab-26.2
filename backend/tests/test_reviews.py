"""Avaliações: criação, exclusão e a média guardada em dim_reviews."""

import pytest


async def summary(client, movie_id: str) -> dict | None:
    return (await client.get(f"/movies/{movie_id}")).json()["reviews_summary"]


async def add_review(client, movie_id: str, nota: int) -> str:
    body = {"nome": "Teste", "nota": nota, "comentario": "Comentário"}
    response = await client.post(f"/movies/{movie_id}/reviews", json=body)
    assert response.status_code == 201
    return response.json()["sk_movie_review_id"]


async def test_nova_avaliacao_atualiza_media_sem_recalcular(client):
    await add_review(client, "m-alpha", 5)

    # Parte do resumo guardado (3 votos, 9.5), não das 2 avaliações listadas:
    # (9.5 × 3 + 5) / 4 = 8.375
    assert await summary(client, "m-alpha") == {
        "qtd_avaliacoes_usuarios": 4,
        "nota_media_usuarios": 8.375,
    }


async def test_primeira_avaliacao_cria_o_resumo(client):
    assert await summary(client, "m-gamma") is None

    await add_review(client, "m-gamma", 7)

    assert await summary(client, "m-gamma") == {
        "qtd_avaliacoes_usuarios": 1,
        "nota_media_usuarios": 7.0,
    }


@pytest.mark.parametrize("nota", [0, 11, 7.5])
async def test_nota_precisa_ser_inteira_de_1_a_10(client, nota):
    body = {"nome": "Teste", "nota": nota, "comentario": "Comentário"}
    response = await client.post("/movies/m-alpha/reviews", json=body)

    assert response.status_code == 422


async def test_excluir_avaliacao_desfaz_a_media(client):
    response = await client.delete("/movies/m-alpha/reviews/r-alpha-1")

    assert response.status_code == 204
    # (9.5 × 3 − 9.0) / 2 = 9.75
    assert await summary(client, "m-alpha") == {
        "qtd_avaliacoes_usuarios": 2,
        "nota_media_usuarios": 9.75,
    }


async def test_media_invertida_fica_limitada_entre_0_e_10(client):
    # Delta: resumo (2 votos, 6.05) que não bate com a avaliação (1.1).
    # (6.05 × 2 − 1.1) / 1 = 11.0 → limitado a 10.
    await client.delete("/movies/m-delta/reviews/r-delta-1")

    assert await summary(client, "m-delta") == {
        "qtd_avaliacoes_usuarios": 1,
        "nota_media_usuarios": 10.0,
    }


async def test_excluir_ultimo_voto_deixa_sem_nota(client):
    await client.delete("/movies/m-beta/reviews/r-beta-1")

    assert await summary(client, "m-beta") == {
        "qtd_avaliacoes_usuarios": 0,
        "nota_media_usuarios": None,
    }


async def test_filme_sem_resumo_nao_ganha_resumo_ao_excluir(client):
    response = await client.delete("/movies/m-gamma/reviews/r-gamma-1")

    assert response.status_code == 204
    assert await summary(client, "m-gamma") is None


async def test_adicionar_e_excluir_volta_a_media_original(client):
    ids = [await add_review(client, "m-alpha", nota) for nota in (6, 3, 10, 7, 1)]
    for review_id in reversed(ids):
        await client.delete(f"/movies/m-alpha/reviews/{review_id}")

    result = await summary(client, "m-alpha")
    assert result["qtd_avaliacoes_usuarios"] == 3
    # Sem arredondar a cada passo, a ida e volta é exata.
    assert result["nota_media_usuarios"] == pytest.approx(9.5)


async def test_avaliacao_de_outro_filme_retorna_404(client):
    response = await client.delete("/movies/m-alpha/reviews/r-beta-1")

    assert response.status_code == 404
    assert response.json()["detail"] == "Avaliação não encontrada"
