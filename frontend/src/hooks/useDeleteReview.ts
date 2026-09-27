import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteReview } from '../services/movies'

// Exclui uma avaliação. Depois, detalhe e catálogo são recarregados porque a
// lista, a média e a quantidade de avaliações mudaram.
export function useDeleteReview(movieId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reviewId: string) => deleteReview(movieId, reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movie', movieId] })
      queryClient.invalidateQueries({ queryKey: ['movies'] })
    },
  })
}
