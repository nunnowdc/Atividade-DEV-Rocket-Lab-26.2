import { Link } from 'react-router'
import { useWatchlist } from '../../hooks/useWatchlist'
import type { WatchlistItem } from '../../types/watchlist'
import { formatDateTime } from '../../utils/format'
import styles from './WatchlistCard.module.css'

interface WatchlistCardProps {
  item: WatchlistItem
}

// Card da página da watchlist: pôster, título e as ações da lista.
function WatchlistCard({ item }: WatchlistCardProps) {
  const { remove, setWatched } = useWatchlist()
  const watched = item.watchedAt !== null

  return (
    <article className={styles.card}>
      <Link to={`/movies/${item.movieId}`} className={styles.link}>
        <div className={styles.poster}>
          {item.url_poster ? (
            <img src={item.url_poster} alt={`Pôster de ${item.titulo}`} loading="lazy" />
          ) : (
            <span>{item.titulo}</span>
          )}
        </div>
        <h3 className={styles.title}>{item.titulo}</h3>
      </Link>
      <p className={styles.meta}>
        {item.ano_lancamento ?? '—'} ·{' '}
        {watched
          ? `assistido em ${formatDateTime(item.watchedAt!)}`
          : `adicionado em ${formatDateTime(item.addedAt)}`}
      </p>
      <div className={styles.actions}>
        <button type="button" onClick={() => setWatched(item.movieId, !watched)}>
          {watched ? '↩ Quero ver' : '✓ Assisti'}
        </button>
        <button type="button" className={styles.remove} onClick={() => remove(item.movieId)}>
          Remover
        </button>
      </div>
    </article>
  )
}

export default WatchlistCard
