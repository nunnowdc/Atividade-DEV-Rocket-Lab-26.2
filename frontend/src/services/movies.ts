// Uma função para cada endpoint da API de filmes.

import type {
  Genre,
  MovieDetail,
  MovieInput,
  MoviePage,
  MovieSort,
  Review,
  ReviewInput,
} from '../types/movie'
import { request } from './api'

// 24 filmes por página: divisível por 6, 4, 3 e 2, então as linhas da grade
// ficam completas em qualquer largura de tela.
export const PAGE_SIZE = 24

export interface ListMoviesParams {
  page: number
  size?: number
  q?: string
  genre?: string
  year?: number
  sort?: MovieSort
}

export function listMovies({ page, size = PAGE_SIZE, q, genre, year, sort }: ListMoviesParams) {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (q) params.set('q', q)
  if (genre) params.set('genre', genre)
  if (year) params.set('year', String(year))
  if (sort) params.set('sort', sort)
  return request<MoviePage>(`/movies?${params}`)
}

export function getMovie(movieId: string) {
  return request<MovieDetail>(`/movies/${movieId}`)
}

export function createMovie(data: MovieInput) {
  return request<MovieDetail>('/movies', { method: 'POST', body: JSON.stringify(data) })
}

export function updateMovie(movieId: string, data: MovieInput) {
  return request<MovieDetail>(`/movies/${movieId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteMovie(movieId: string) {
  return request<void>(`/movies/${movieId}`, { method: 'DELETE' })
}

export function createReview(movieId: string, data: ReviewInput) {
  return request<Review>(`/movies/${movieId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function listGenres() {
  return request<Genre[]>('/genres')
}

export function listYears() {
  return request<number[]>('/years')
}
