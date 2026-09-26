import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listMovies, type ListMoviesParams } from '../services/movies'

// Busca uma página do catálogo. O TanStack Query guarda cada combinação de
// página + busca em cache, identificada pela queryKey.
export function useMovies(params: ListMoviesParams) {
  return useQuery({
    queryKey: ['movies', params],
    queryFn: () => listMovies(params),
    placeholderData: keepPreviousData,
  })
}
