import type { Review } from '../../types/movie'
import { formatDateTime } from '../../utils/format'
import styles from './ReviewList.module.css'

interface ReviewListProps {
  reviews: Review[]
}

function ReviewList({ reviews }: ReviewListProps) {
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
            <span className={styles.rating}>★ {review.nota.toFixed(1)}</span>
            <span className={styles.date}>{formatDateTime(review.created_at)}</span>
          </div>
          <p className={styles.comment}>{review.comentario}</p>
        </li>
      ))}
    </ul>
  )
}

export default ReviewList
