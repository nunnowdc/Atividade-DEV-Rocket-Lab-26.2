import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createMovie, deleteMovie, updateMovie } from '../services/movies'
import type { MovieInput } from '../types/movie'

// Cadastrar, editar e excluir mudam o catálogo: depois de cada operação o
// cache é atualizado para as telas não mostrarem dados antigos.

export function useCreateMovie() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: MovieInput) => createMovie(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] })
    },
  })
}

export function useUpdateMovie(movieId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: MovieInput) => updateMovie(movieId, data),
    onSuccess: (movie) => {
      // A API já devolve o filme atualizado: guardamos direto no cache.
      queryClient.setQueryData(['movie', movieId], movie)
      queryClient.invalidateQueries({ queryKey: ['movies'] })
    },
  })
}

export function useDeleteMovie(movieId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteMovie(movieId),
    onSuccess: () => {
      // "refetchType: none": marca como desatualizado sem buscar de novo
      // agora (o filme não existe mais; buscaria só para receber um 404).
      queryClient.invalidateQueries({ queryKey: ['movie', movieId], refetchType: 'none' })
      queryClient.invalidateQueries({ queryKey: ['movies'] })
    },
  })
}
