import { useToast } from '../../hooks/useToast'
import { useWatchlist } from '../../hooks/useWatchlist'
import type { MovieSummary } from '../../types/movie'
import styles from './WatchlistBookmark.module.css'

interface WatchlistBookmarkProps {
  movie: MovieSummary
}

// Bandeirinha no canto do pôster: vazia = fora da watchlist, verde = dentro.
function WatchlistBookmark({ movie }: WatchlistBookmarkProps) {
  const { getItem, add, remove } = useWatchlist()
  const { showToast } = useToast()
  const saved = getItem(movie.sk_movie_id) !== undefined

  function handleClick() {
    if (saved) {
      remove(movie.sk_movie_id)
      showToast(`"${movie.titulo}" saiu da watchlist.`)
    } else {
      add(movie)
      showToast(`"${movie.titulo}" foi para a watchlist.`)
    }
  }

  return (
    <button
      type="button"
      className={`${styles.bookmark} ${saved ? styles.saved : ''}`}
      aria-pressed={saved}
      aria-label={saved ? 'Remover da watchlist' : 'Adicionar à watchlist'}
      title={saved ? 'Remover da watchlist' : 'Adicionar à watchlist'}
      onClick={handleClick}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 3h12v18l-6-4-6 4z" />
      </svg>
    </button>
  )
}

export default WatchlistBookmark
