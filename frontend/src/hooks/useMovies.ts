import { useQuery } from '@tanstack/react-query'
import { ApiError } from '../services/api'
import { getMovie } from '../services/movies'

// Busca os detalhes completos de um filme.
export function useMovie(movieId: string) {
  return useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => getMovie(movieId),
    // Não adianta tentar de novo se o filme não existe (404).
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 404) && failureCount < 1,
  })
}
