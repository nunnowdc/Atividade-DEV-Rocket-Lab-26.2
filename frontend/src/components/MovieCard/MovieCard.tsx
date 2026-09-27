import { Link } from 'react-router'
import type { MovieSummary } from '../../types/movie'
import RatingBadge from '../RatingBadge/RatingBadge'
import WatchlistBookmark from '../WatchlistBookmark/WatchlistBookmark'
import styles from './MovieCard.module.css'

interface MovieCardProps {
  movie: MovieSummary
}

function MovieCard({ movie }: MovieCardProps) {
  const summary = movie.reviews_summary

  // A bandeirinha fica fora do link (um botão não pode ficar dentro de um <a>)
  // e é posicionada por cima do canto do pôster.
  return (
    <div className={styles.wrapper}>
      <Link to={`/movies/${movie.sk_movie_id}`} className={styles.card}>
        <div className={styles.poster}>
          {movie.url_poster ? (
            <img src={movie.url_poster} alt={`Pôster de ${movie.titulo}`} loading="lazy" />
          ) : (
            <span className={styles.noPoster}>{movie.titulo}</span>
          )}
        </div>
        <h3 className={styles.title}>{movie.titulo}</h3>
        <div className={styles.meta}>
          <span>{movie.ano_lancamento ?? '—'}</span>
          <RatingBadge
            average={summary?.nota_media_usuarios}
            count={summary?.qtd_avaliacoes_usuarios}
          />
        </div>
      </Link>
      <div className={styles.bookmark}>
        <WatchlistBookmark movie={movie} />
      </div>
    </div>
  )
}

export default MovieCard
