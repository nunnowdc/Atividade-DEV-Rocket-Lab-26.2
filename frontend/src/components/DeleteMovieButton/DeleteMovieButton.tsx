import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useDeleteMovie } from '../../hooks/useMovieMutations'
import { useToast } from '../../hooks/useToast'
import { useWatchlist } from '../../hooks/useWatchlist'
import styles from './DeleteMovieButton.module.css'

interface DeleteMovieButtonProps {
  movieId: string
  titulo: string
}

// Excluir não tem volta: o primeiro clique só pede confirmação.
function DeleteMovieButton({ movieId, titulo }: DeleteMovieButtonProps) {
  const [confirming, setConfirming] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { remove: removeFromWatchlist } = useWatchlist()
  const deleteMovie = useDeleteMovie(movieId)

  function handleDelete() {
    deleteMovie.mutate(undefined, {
      onSuccess: () => {
        removeFromWatchlist(movieId) // filme excluído não pode ficar na watchlist
        showToast(`"${titulo}" foi excluído.`)
        navigate('/', { replace: true })
      },
    })
  }

  if (!confirming) {
    return (
      <button type="button" className={styles.deleteButton} onClick={() => setConfirming(true)}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7h16" />
          <path d="M10 11v6M14 11v6" />
          <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
          <path d="M9 7V4h6v3" />
        </svg>
        Excluir
      </button>
    )
  }

  return (
    <div className={styles.confirm} role="alert">
      <p>
        Excluir <strong>{titulo}</strong> e todas as suas avaliações? Essa ação não pode ser
        desfeita.
      </p>
      {deleteMovie.isError && (
        <p className={styles.error}>Não foi possível excluir: {deleteMovie.error.message}</p>
      )}
      <div className={styles.buttons}>
        <button
          type="button"
          className={styles.danger}
          onClick={handleDelete}
          disabled={deleteMovie.isPending}
        >
          {deleteMovie.isPending ? 'Excluindo...' : 'Sim, excluir'}
        </button>
        <button type="button" className={styles.cancel} onClick={() => setConfirming(false)}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default DeleteMovieButton
