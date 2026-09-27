import type { Review } from '../../types/movie'
import DeleteReviewButton from '../DeleteReviewButton/DeleteReviewButton'
import { formatDateTime } from '../../utils/format'
import styles from './ReviewList.module.css'

interface ReviewListProps {
  movieId: string
  reviews: Review[]
}

function ReviewList({ movieId, reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return <p className={styles.empty}>Nenhuma avaliação ainda. Seja o primeiro!</p>
  }

  // A API devolve da mais antiga para a mais nova; mostramos as novas primeiro.
  const newestFirst = [...reviews].reverse()

  return (
    <ul className={styles.list}>
      {newestFirst.map((review) => (
        <li key={review.sk_movie_review_id} className={styles.review}>
          <div className={styles.header}>
            <span className={styles.author}>{review.nome}</span>
            <span className={styles.rating}>
              ★ {Number.isInteger(review.nota) ? review.nota : review.nota.toFixed(1)}
            </span>
            <span className={styles.date}>{formatDateTime(review.created_at)}</span>
            <DeleteReviewButton movieId={movieId} reviewId={review.sk_movie_review_id} />
          </div>
          <p className={styles.comment}>{review.comentario}</p>
        </li>
      ))}
    </ul>
  )
}

export default ReviewList
