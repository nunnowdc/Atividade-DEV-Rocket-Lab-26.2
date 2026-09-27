import { useState } from 'react'
import { useDeleteReview } from '../../hooks/useDeleteReview'
import { useToast } from '../../hooks/useToast'
import styles from './DeleteReviewButton.module.css'

interface DeleteReviewButtonProps {
  movieId: string
  reviewId: string
}

// Lixeira de uma avaliação: o primeiro clique só pede confirmação.
function DeleteReviewButton({ movieId, reviewId }: DeleteReviewButtonProps) {
  const [confirming, setConfirming] = useState(false)
  const { showToast } = useToast()
  const deleteReview = useDeleteReview(movieId)

  function handleDelete() {
    deleteReview.mutate(reviewId, {
      onSuccess: () => showToast('Avaliação excluída.'),
      onError: (error) => showToast(`Não foi possível excluir: ${error.message}`, 'error'),
      onSettled: () => setConfirming(false),
    })
  }

  if (!confirming) {
    return (
      <button
        type="button"
        className={styles.trash}
        aria-label="Excluir avaliação"
        title="Excluir avaliação"
        onClick={() => setConfirming(true)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7h16" />
          <path d="M10 11v6M14 11v6" />
          <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
          <path d="M9 7V4h6v3" />
        </svg>
      </button>
    )
  }

  return (
    <span className={styles.confirm}>
      Excluir?
      <button
        type="button"
        className={styles.yes}
        onClick={handleDelete}
        disabled={deleteReview.isPending}
      >
        {deleteReview.isPending ? 'Excluindo...' : 'Sim'}
      </button>
      <button type="button" className={styles.no} onClick={() => setConfirming(false)}>
        Não
      </button>
    </span>
  )
}

export default DeleteReviewButton
