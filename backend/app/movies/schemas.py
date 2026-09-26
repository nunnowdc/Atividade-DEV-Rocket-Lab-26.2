"""Schemas Pydantic: definem o formato do JSON que a API recebe e devolve."""

from datetime import date, datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, StringConstraints, model_validator


class ORMModel(BaseModel):
    """Base que permite montar o schema direto a partir de um objeto do SQLAlchemy."""

    model_config = ConfigDict(from_attributes=True)


class GenreOut(ORMModel):
    sk_genre_id: str
    nome_genero: str


class PersonOut(ORMModel):
    sk_person_id: str
    nome_pessoa: str
    tipo_pessoa: str


class CompanyOut(ORMModel):
    sk_company_id: str
    nome_produtora: str


class ReviewSummaryOut(ORMModel):
    qtd_avaliacoes_usuarios: int
    nota_media_usuarios: float | None


class PerformanceOut(ORMModel):
    orcamento_usd: float | None
    receita_usd: float | None
    popularidade: float | None
    nota_tmdb: float | None
    qtd_tmdb: int | None
    nota_imdb: float | None
    qtd_imdb: int | None


class ReviewOut(ORMModel):
    sk_movie_review_id: str
    nome: str
    nota: float
    comentario: str
    created_at: datetime


class MovieSummary(ORMModel):
    """Filme como aparece no catálogo: só o necessário para o card."""

    sk_movie_id: str
    titulo: str
    ano_lancamento: int | None
    url_poster: str | None
    genres: list[GenreOut]
    reviews_summary: ReviewSummaryOut | None


class MovieDetail(MovieSummary):
    """Filme completo, para a página de detalhes."""

    id_filme: str
    data_lancamento: date | None
    duracao_minutos: int | None
    status_filme: str | None
    sinopse: str | None
    url_backdrop: str | None
    people: list[PersonOut]
    companies: list[CompanyOut]
    performance: PerformanceOut | None
    reviews: list[ReviewOut]


class MoviePage(BaseModel):
    """Uma página do catálogo."""

    items: list[MovieSummary]
    total: int
    page: int
    size: int
    pages: int


# --- Entrada: o que o formulário de cadastro/edição envia ---

StatusFilme = Literal["Lançado", "Pós-Produção", "Em Produção", "Planejado"]
Name = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=255)]


class MovieIn(BaseModel):
    """Dados para cadastrar ou atualizar um filme."""

    titulo: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=500)]
    sinopse: str | None = Field(default=None, max_length=4000)
    ano_lancamento: int = Field(ge=1888, le=2100)
    data_lancamento: date | None = None
    duracao_minutos: int | None = Field(default=None, ge=1)
    status_filme: StatusFilme = "Lançado"
    url_poster: HttpUrl | None = None
    url_backdrop: HttpUrl | None = None
    genre_ids: list[str] = Field(min_length=1)
    diretores: list[Name] = Field(min_length=1)
    atores: list[Name] = []
    roteiristas: list[Name] = []
    produtoras: list[Name] = []

    @model_validator(mode="after")
    def check_release_year(self) -> "MovieIn":
        if self.data_lancamento and self.data_lancamento.year != self.ano_lancamento:
            raise ValueError("data_lancamento deve estar no ano_lancamento informado")
        return self



class ReviewIn(BaseModel):
    """Dados de uma nova avaliação."""

    nome: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)]
    nota: float = Field(ge=0, le=10)
    comentario: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=1, max_length=4000)
    ]
