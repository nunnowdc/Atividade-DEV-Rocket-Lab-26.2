import { useEffect } from 'react'
import { useToast } from '../../hooks/useToast'
import { useWatchlist } from '../../hooks/useWatchlist'
import type { MovieSummary } from '../../types/movie'
import styles from './WatchlistButton.module.css'

interface WatchlistButtonProps {
  movie: MovieSummary
}

// Botões da página do filme: adicionar/remover da watchlist e marcar como assistido.
function WatchlistButton({ movie }: WatchlistButtonProps) {
  const { getItem, add, remove, setWatched, refresh } = useWatchlist()
  const { showToast } = useToast()
  const item = getItem(movie.sk_movie_id)
  const watched = Boolean(item?.watchedAt)

  // Mantém a "foto" salva em dia se o filme foi editado.
  useEffect(() => {
    refresh(movie)
  }, [movie, refresh])

  if (!item) {
    return (
      <button
        type="button"
        className={styles.add}
        onClick={() => {
          add(movie)
          showToast(`"${movie.titulo}" foi para a watchlist.`)
        }}
      >
        + Adicionar à Watchlist
      </button>
    )
  }

  return (
    <div className={styles.group}>
      <button
        type="button"
        className={`${styles.toggle} ${styles.active}`}
        title="Remover da watchlist"
        onClick={() => {
          remove(movie.sk_movie_id)
          showToast(`"${movie.titulo}" saiu da watchlist.`)
        }}
      >
        ✓ Na Watchlist
      </button>
      <button
        type="button"
        className={`${styles.toggle} ${watched ? styles.active : ''}`}
        aria-pressed={watched}
        onClick={() => {
          setWatched(movie.sk_movie_id, !watched)
          showToast(watched ? 'Movido para "Quero ver".' : 'Marcado como assistido!')
        }}
      >
        {watched ? '✓ Assistido' : 'Marcar como assistido'}
      </button>
    </div>
  )
}

export default WatchlistButton
