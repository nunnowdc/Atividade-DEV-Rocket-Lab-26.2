// Uma função para cada endpoint da API de filmes.

import type {
  Genre,
  MovieDetail,
  MovieInput,
  MoviePage,
  Review,
  ReviewInput,
} from '../types/movie'
import { request } from './api'

export interface ListMoviesParams {
  page: number
  size?: number
  q?: string
}

export function listMovies({ page, size = 20, q }: ListMoviesParams) {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (q) params.set('q', q)
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
