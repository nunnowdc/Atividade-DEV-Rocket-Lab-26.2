import styles from './RatingBadge.module.css'

interface RatingBadgeProps {
  average: number | null | undefined
  count?: number
}

function RatingBadge({ average, count }: RatingBadgeProps) {
  if (average == null) {
    return <span className={`${styles.badge} ${styles.empty}`}>Sem nota</span>
  }

  const label = count === 1 ? '1 avaliação' : `${count} avaliações`
  return (
    <span className={styles.badge} title={count === undefined ? undefined : label}>
      ★ {average.toFixed(1)}
    </span>
  )
}

export default RatingBadge
