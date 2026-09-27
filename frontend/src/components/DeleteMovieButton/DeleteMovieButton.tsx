import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useDeleteMovie } from '../../hooks/useMovieMutations'
import styles from './DeleteMovieButton.module.css'

interface DeleteMovieButtonProps {
  movieId: string
  titulo: string
}

// Excluir não tem volta: o primeiro clique só pede confirmação.
function DeleteMovieButton({ movieId, titulo }: DeleteMovieButtonProps) {
  const [confirming, setConfirming] = useState(false)
  const navigate = useNavigate()
  const deleteMovie = useDeleteMovie(movieId)

  function handleDelete() {
    deleteMovie.mutate(undefined, {
      onSuccess: () => navigate('/', { replace: true }),
    })
  }

  if (!confirming) {
    return (
      <button type="button" className={styles.link} onClick={() => setConfirming(true)}>
        Excluir filme
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
