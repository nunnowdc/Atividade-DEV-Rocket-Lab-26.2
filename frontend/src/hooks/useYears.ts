import { useQuery } from '@tanstack/react-query'
import { listYears } from '../services/movies'

// Anos existentes no catálogo, para o filtro. Mudam raramente.
export function useYears() {
  return useQuery({
    queryKey: ['years'],
    queryFn: listYears,
    staleTime: Infinity,
  })
}
