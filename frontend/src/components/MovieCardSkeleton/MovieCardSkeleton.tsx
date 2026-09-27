import Skeleton from '../Skeleton/Skeleton'
import styles from './MovieCardSkeleton.module.css'

// "Esqueleto" do MovieCard: mesmo formato, sem conteúdo.
function MovieCardSkeleton() {
  return (
    <div className={styles.card}>
      <Skeleton className={styles.poster} />
      <Skeleton width="85%" height="0.95rem" />
      <div className={styles.meta}>
        <Skeleton width="30%" height="0.8rem" />
        <Skeleton width="20%" height="0.8rem" />
      </div>
    </div>
  )
}

export default MovieCardSkeleton
