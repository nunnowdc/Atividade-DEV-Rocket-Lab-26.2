import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createReview } from '../services/movies'
import type { ReviewInput } from '../types/movie'

// Envia uma nova avaliação. Depois de salvar, marca como desatualizados o
// detalhe do filme (lista e média mudaram) e o catálogo (média no card).
export function useCreateReview(movieId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ReviewInput) => createReview(movieId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movie', movieId] })
      queryClient.invalidateQueries({ queryKey: ['movies'] })
    },
  })
}
