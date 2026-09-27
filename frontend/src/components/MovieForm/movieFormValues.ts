// Conversão entre os dados da API e os valores dos campos do formulário.
// Campos de texto trabalham com strings; a API espera números e null.

import type { MovieDetail, MovieInput, MovieStatus, PersonType } from '../../types/movie'

export interface MovieFormValues {
  titulo: string
  sinopse: string
  ano_lancamento: string
  data_lancamento: string
  duracao_minutos: string
  status_filme: MovieStatus
  url_poster: string
  url_backdrop: string
  genre_ids: string[]
  diretores: string[]
  atores: string[]
  roteiristas: string[]
  produtoras: string[]
}

export const STATUS_OPTIONS: MovieStatus[] = ['Lançado', 'Pós-Produção', 'Em Produção', 'Planejado']

export const EMPTY_MOVIE_FORM: MovieFormValues = {
  titulo: '',
  sinopse: '',
  ano_lancamento: '',
  data_lancamento: '',
  duracao_minutos: '',
  status_filme: 'Lançado',
  url_poster: '',
  url_backdrop: '',
  genre_ids: [],
  diretores: [],
  atores: [],
  roteiristas: [],
  produtoras: [],
}

function isMovieStatus(value: string | null): value is MovieStatus {
  return STATUS_OPTIONS.includes(value as MovieStatus)
}

// Filme vindo da API -> valores iniciais do formulário de edição.
export function movieToFormValues(movie: MovieDetail): MovieFormValues {
  const namesOf = (tipo: PersonType) =>
    movie.people.filter((person) => person.tipo_pessoa === tipo).map((person) => person.nome_pessoa)

  return {
    titulo: movie.titulo,
    sinopse: movie.sinopse ?? '',
    ano_lancamento: movie.ano_lancamento?.toString() ?? '',
    data_lancamento: movie.data_lancamento ?? '',
    duracao_minutos: movie.duracao_minutos?.toString() ?? '',
    status_filme: isMovieStatus(movie.status_filme) ? movie.status_filme : 'Lançado',
    url_poster: movie.url_poster ?? '',
    url_backdrop: movie.url_backdrop ?? '',
    genre_ids: movie.genres.map((genre) => genre.sk_genre_id),
    diretores: namesOf('Diretor'),
    atores: namesOf('Ator'),
    roteiristas: namesOf('Roteirista'),
    produtoras: movie.companies.map((company) => company.nome_produtora),
  }
}

// Valores do formulário -> corpo enviado para a API (vazio vira null).
export function formValuesToMovieInput(values: MovieFormValues): MovieInput {
  const textOrNull = (value: string) => value.trim() || null

  return {
    titulo: values.titulo.trim(),
    sinopse: textOrNull(values.sinopse),
    ano_lancamento: Number(values.ano_lancamento),
    data_lancamento: values.data_lancamento || null,
    duracao_minutos: values.duracao_minutos ? Number(values.duracao_minutos) : null,
    status_filme: values.status_filme,
    url_poster: textOrNull(values.url_poster),
    url_backdrop: textOrNull(values.url_backdrop),
    genre_ids: values.genre_ids,
    diretores: values.diretores,
    atores: values.atores,
    roteiristas: values.roteiristas,
    produtoras: values.produtoras,
  }
}

// Regras que o HTML sozinho não cobre. Devolve a mensagem do primeiro erro.
export function validateMovieForm(values: MovieFormValues): string | null {
  if (values.genre_ids.length === 0) return 'Escolha pelo menos um gênero.'
  if (values.diretores.length === 0) return 'Informe pelo menos um diretor.'
  if (values.data_lancamento && !values.data_lancamento.startsWith(values.ano_lancamento)) {
    return 'A data de lançamento precisa ser do mesmo ano de lançamento.'
  }
  return null
}
