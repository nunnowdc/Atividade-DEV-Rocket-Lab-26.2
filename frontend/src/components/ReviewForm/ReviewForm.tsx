import { useState, type FormEvent } from 'react'
import { useCreateReview } from '../../hooks/useCreateReview'
import StarRatingInput from '../StarRatingInput/StarRatingInput'
import styles from './ReviewForm.module.css'

interface ReviewFormProps {
  movieId: string
}

function ReviewForm({ movieId }: ReviewFormProps) {
  const [nome, setNome] = useState('')
  const [nota, setNota] = useState(0)
  const [comentario, setComentario] = useState('')
  const createReview = useCreateReview(movieId)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    createReview.mutate(
      { nome: nome.trim(), nota, comentario: comentario.trim() },
      {
        // Limpa o formulário só se a API aceitou a avaliação.
        onSuccess: () => {
          setNome('')
          setNota(0)
          setComentario('')
        },
      },
    )
  }

  const canSubmit =
    nome.trim() !== '' && nota > 0 && comentario.trim() !== '' && !createReview.isPending

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.title}>Avaliar este filme</h3>

      <label className={styles.field}>
        <span>Seu nome</span>
        <input
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          maxLength={120}
          required
        />
      </label>

      <div className={styles.field}>
        <span>Nota</span>
        <StarRatingInput value={nota} onChange={setNota} />
      </div>

      <label className={styles.field}>
        <span>Resenha</span>
        <textarea
          value={comentario}
          onChange={(event) => setComentario(event.target.value)}
          rows={4}
          maxLength={4000}
          required
        />
      </label>

      {createReview.isError && (
        <p className={styles.error}>Não foi possível salvar: {createReview.error.message}</p>
      )}
      {createReview.isSuccess && <p className={styles.success}>Avaliação publicada!</p>}

      <button type="submit" className={styles.button} disabled={!canSubmit}>
        {createReview.isPending ? 'Enviando...' : 'Publicar avaliação'}
      </button>
    </form>
  )
}

export default ReviewForm
