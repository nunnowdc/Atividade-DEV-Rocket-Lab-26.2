import { useQuery } from '@tanstack/react-query'
import { listGenres } from '../services/movies'

// Os gêneros praticamente não mudam: ficam em cache durante toda a visita.
export function useGenres() {
  return useQuery({
    queryKey: ['genres'],
    queryFn: listGenres,
    staleTime: Infinity,
  })
}
