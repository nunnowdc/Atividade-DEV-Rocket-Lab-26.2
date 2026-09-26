// Formatos dos dados trocados com a API. Espelham os schemas do backend
// (backend/app/movies/schemas.py).

export interface Genre {
  sk_genre_id: string
  nome_genero: string
}

export type PersonType = 'Ator' | 'Diretor' | 'Roteirista'

export interface Person {
  sk_person_id: string
  nome_pessoa: string
  tipo_pessoa: PersonType
}

export interface Company {
  sk_company_id: string
  nome_produtora: string
}

export interface ReviewSummary {
  qtd_avaliacoes_usuarios: number
  nota_media_usuarios: number | null
}

export interface Performance {
  orcamento_usd: number | null
  receita_usd: number | null
  popularidade: number | null
  nota_tmdb: number | null
  qtd_tmdb: number | null
  nota_imdb: number | null
  qtd_imdb: number | null
}

export interface Review {
  sk_movie_review_id: string
  nome: string
  nota: number
  comentario: string
  created_at: string
}

export interface MovieSummary {
  sk_movie_id: string
  titulo: string
  ano_lancamento: number | null
  url_poster: string | null
  genres: Genre[]
  reviews_summary: ReviewSummary | null
}

export interface MovieDetail extends MovieSummary {
  id_filme: string
  data_lancamento: string | null
  duracao_minutos: number | null
  status_filme: string | null
  sinopse: string | null
  url_backdrop: string | null
  people: Person[]
  companies: Company[]
  performance: Performance | null
  reviews: Review[]
}

export interface MoviePage {
  items: MovieSummary[]
  total: number
  page: number
  size: number
  pages: number
}

export type MovieStatus = 'Lançado' | 'Pós-Produção' | 'Em Produção' | 'Planejado'

export interface MovieInput {
  titulo: string
  sinopse: string | null
  ano_lancamento: number
  data_lancamento: string | null
  duracao_minutos: number | null
  status_filme: MovieStatus
  url_poster: string | null
  url_backdrop: string | null
  genre_ids: string[]
  diretores: string[]
  atores: string[]
  roteiristas: string[]
  produtoras: string[]
}

export interface ReviewInput {
  nome: string
  nota: number
  comentario: string
}
