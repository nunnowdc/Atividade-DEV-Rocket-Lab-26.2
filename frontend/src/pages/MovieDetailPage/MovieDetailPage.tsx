import { Link, useParams } from 'react-router'
import DeleteMovieButton from '../../components/DeleteMovieButton/DeleteMovieButton'
import GenreTags from '../../components/GenreTags/GenreTags'
import RatingBadge from '../../components/RatingBadge/RatingBadge'
import ReviewForm from '../../components/ReviewForm/ReviewForm'
import ReviewList from '../../components/ReviewList/ReviewList'
import { useMovie } from '../../hooks/useMovie'
import { ApiError } from '../../services/api'
import type { Person, PersonType } from '../../types/movie'
import { formatDate, formatDuration, formatUsd } from '../../utils/format'
import styles from './MovieDetailPage.module.css'

function namesOf(people: Person[], tipo: PersonType) {
  return people.filter((person) => person.tipo_pessoa === tipo).map((person) => person.nome_pessoa)
}

function MovieDetailPage() {
  const { movieId = '' } = useParams()
  const { data: movie, isPending, isError, error } = useMovie(movieId)

  if (isPending) {
    return <p className={styles.status}>Carregando filme...</p>
  }

  if (isError) {
    const notFound = error instanceof ApiError && error.status === 404
    return (
      <div className={styles.status}>
        <h1>{notFound ? 'Filme não encontrado' : 'Erro ao carregar o filme'}</h1>
        {!notFound && <p>{error.message}</p>}
        <Link to="/">Voltar ao catálogo</Link>
      </div>
    )
  }

  const directors = namesOf(movie.people, 'Diretor')
  const actors = namesOf(movie.people, 'Ator')
  const writers = namesOf(movie.people, 'Roteirista')
  const summary = movie.reviews_summary
  const reviewCount = summary?.qtd_avaliacoes_usuarios ?? 0
  const performance = movie.performance

  return (
    <article>
      {movie.url_backdrop && (
        <div
          className={styles.backdrop}
          style={{ backgroundImage: `url(${movie.url_backdrop})` }}
        />
      )}

      <div className={styles.top}>
        <div className={styles.poster}>
          {movie.url_poster ? (
            <img src={movie.url_poster} alt={`Pôster de ${movie.titulo}`} />
          ) : (
            <span>{movie.titulo}</span>
          )}
        </div>

        <div className={styles.info}>
          <h1 className={styles.title}>
            {movie.titulo}
            {movie.ano_lancamento ? (
              <span className={styles.year}>{movie.ano_lancamento}</span>
            ) : null}
          </h1>

          {directors.length > 0 && (
            <p className={styles.directors}>
              Dirigido por <strong>{directors.join(', ')}</strong>
            </p>
          )}

          <GenreTags genres={movie.genres} />

          {movie.sinopse && <p className={styles.synopsis}>{movie.sinopse}</p>}

          <dl className={styles.facts}>
            {movie.duracao_minutos ? (
              <div>
                <dt>Duração</dt>
                <dd>{formatDuration(movie.duracao_minutos)}</dd>
              </div>
            ) : null}
            {movie.data_lancamento && (
              <div>
                <dt>Lançamento</dt>
                <dd>{formatDate(movie.data_lancamento)}</dd>
              </div>
            )}
            {movie.status_filme && (
              <div>
                <dt>Status</dt>
                <dd>{movie.status_filme}</dd>
              </div>
            )}
            {performance?.nota_imdb != null && (
              <div>
                <dt>IMDb</dt>
                <dd>{performance.nota_imdb.toFixed(1)}</dd>
              </div>
            )}
            {performance?.orcamento_usd != null && (
              <div>
                <dt>Orçamento</dt>
                <dd>{formatUsd(performance.orcamento_usd)}</dd>
              </div>
            )}
            {performance?.receita_usd != null && (
              <div>
                <dt>Bilheteria</dt>
                <dd>{formatUsd(performance.receita_usd)}</dd>
              </div>
            )}
          </dl>

          <div className={styles.actions}>
            <Link to={`/movies/${movie.sk_movie_id}/edit`} className={styles.editLink}>
              Editar filme
            </Link>
            <DeleteMovieButton movieId={movie.sk_movie_id} titulo={movie.titulo} />
          </div>
        </div>

        <aside className={styles.ratingBox}>
          <span className={styles.ratingLabel}>Média dos usuários</span>
          <span className={styles.ratingValue}>
            <RatingBadge average={summary?.nota_media_usuarios} count={reviewCount} />
          </span>
          <span className={styles.ratingCount}>
            {reviewCount === 1 ? '1 avaliação' : `${reviewCount} avaliações`}
          </span>
        </aside>
      </div>

      {(actors.length > 0 || writers.length > 0 || movie.companies.length > 0) && (
        <section className={styles.credits}>
          {actors.length > 0 && (
            <div>
              <h2>Elenco</h2>
              <p>{actors.join(', ')}</p>
            </div>
          )}
          {writers.length > 0 && (
            <div>
              <h2>Roteiro</h2>
              <p>{writers.join(', ')}</p>
            </div>
          )}
          {movie.companies.length > 0 && (
            <div>
              <h2>Produtoras</h2>
              <p>{movie.companies.map((company) => company.nome_produtora).join(', ')}</p>
            </div>
          )}
        </section>
      )}

      <section className={styles.reviews}>
        <h2>Avaliações</h2>
        <div className={styles.reviewsGrid}>
          <ReviewList reviews={movie.reviews} />
          <ReviewForm movieId={movie.sk_movie_id} />
        </div>
      </section>
    </article>
  )
}

export default MovieDetailPage
