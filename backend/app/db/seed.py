"""Carga inicial do banco a partir dos CSVs em ``backend/data``.

Uso (dentro de ``backend/``, com o venv ativo e as migrações aplicadas):

    python -m app.db.seed

O script apaga os dados atuais e recarrega tudo em uma única transação,
então pode ser executado mais de uma vez sem duplicar registros.

Os CSVs são importados como foram fornecidos; o script apenas converte o
texto de cada coluna para o tipo que o banco espera (date, int, float, Decimal...).
"""

import csv
import time
from collections.abc import Callable, Iterable, Iterator
from datetime import date
from decimal import Decimal
from itertools import islice
from pathlib import Path
from typing import Any

from sqlalchemy import Connection, Table, create_engine, delete, event

from app.core.config import get_settings
from app.db.base import Base
from app.movies.models import (
    DimCompany,
    DimGenre,
    DimMovie,
    DimPerson,
    DimReview,
    FactMoviePerformance,
    MovieReview,
    bridge_movie_company,
    bridge_movie_genre,
    bridge_movie_person,
)

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
BATCH_SIZE = 5_000

Converter = Callable[[str], Any]


# --- Conversores: transformam o texto do CSV no tipo esperado pelo banco ---


def optional_text(value: str) -> str | None:
    return value or None


def optional_int(value: str) -> int | None:
    # Alguns inteiros vêm como "2375.0" no CSV.
    return int(float(value)) if value else None


def optional_float(value: str) -> float | None:
    return float(value) if value else None


def optional_decimal(value: str) -> Decimal | None:
    return Decimal(value) if value else None


def optional_date(value: str) -> date | None:
    return date.fromisoformat(value) if value else None


# --- Plano de carga: a ordem respeita as chaves estrangeiras ---

LOAD_PLAN: list[tuple[Table, str, dict[str, Converter]]] = [
    (DimGenre.__table__, "dim_genres", {}),
    (DimCompany.__table__, "dim_companies", {}),
    (DimPerson.__table__, "dim_people", {}),
    (
        DimMovie.__table__,
        "dim_movies",
        {
            "data_lancamento": optional_date,
            "ano_lancamento": optional_int,
            "duracao_minutos": optional_int,
            "status_filme": optional_text,
            "sinopse": optional_text,
            "url_poster": optional_text,
            "url_backdrop": optional_text,
        },
    ),
    (bridge_movie_genre, "bridge_movie_genre", {}),
    (bridge_movie_company, "bridge_movie_company", {}),
    (bridge_movie_person, "bridge_movie_person", {}),
    (
        FactMoviePerformance.__table__,
        "fact_movies_performance",
        {
            "orcamento_usd": optional_decimal,
            "receita_usd": optional_decimal,
            "lucro_usd": optional_decimal,
            "orcamento_brl": optional_decimal,
            "receita_brl": optional_decimal,
            "lucro_brl": optional_decimal,
            "popularidade": optional_float,
            "nota_tmdb": optional_float,
            "qtd_tmdb": optional_int,
            "nota_imdb": optional_float,
            "qtd_imdb": optional_int,
        },
    ),
    (MovieReview.__table__, "movies_reviews", {"nota": float}),
    (
        DimReview.__table__,
        "dim_reviews",
        {
            "qtd_avaliacoes_usuarios": optional_int,
            "nota_media_usuarios": optional_float,
        },
    ),
]


def find_csv(name: str) -> Path:
    """Procura o CSV em qualquer subpasta de ``data/``."""

    matches = list(DATA_DIR.rglob(f"{name}.csv"))
    if not matches:
        raise FileNotFoundError(f"{name}.csv não encontrado em {DATA_DIR}")
    return matches[0]


def batched(rows: Iterable[dict[str, Any]], size: int) -> Iterator[list[dict[str, Any]]]:
    """Agrupa as linhas em listas de até ``size`` itens."""

    iterator = iter(rows)
    while batch := list(islice(iterator, size)):
        yield batch


def read_rows(path: Path, converters: dict[str, Converter]) -> Iterator[dict[str, Any]]:
    """Lê o CSV linha a linha, aplicando os conversores de cada coluna."""

    with path.open(encoding="utf-8", newline="") as file:
        for row in csv.DictReader(file):
            for column, convert in converters.items():
                row[column] = convert(row[column])
            yield row


def load_table(conn: Connection, table: Table, csv_name: str, converters: dict) -> None:
    path = find_csv(csv_name)
    total = 0
    for batch in batched(read_rows(path, converters), BATCH_SIZE):
        conn.execute(table.insert(), batch)
        total += len(batch)
    print(f"  {table.name:<25} {total:>9,} linhas")


def clear_tables(conn: Connection) -> None:
    """Apaga os dados das tabelas, dos filhos para os pais."""

    for table in reversed(Base.metadata.sorted_tables):
        conn.execute(delete(table))


def main() -> None:
    # O script roda de forma síncrona, como o Alembic (ver migrations/env.py).
    database_url = get_settings().database_url.replace("+aiosqlite", "")
    engine = create_engine(database_url)

    @event.listens_for(engine, "connect")
    def _enable_foreign_keys(dbapi_connection: Any, connection_record: Any) -> None:
        dbapi_connection.execute("PRAGMA foreign_keys=ON")

    start = time.perf_counter()
    print(f"Carregando CSVs de {DATA_DIR}")

    # engine.begin() abre uma transação: se algo falhar, nada é gravado.
    with engine.begin() as conn:
        clear_tables(conn)
        for table, csv_name, converters in LOAD_PLAN:
            load_table(conn, table, csv_name, converters)

    print(f"Concluído em {time.perf_counter() - start:.1f}s")


if __name__ == "__main__":
    main()
