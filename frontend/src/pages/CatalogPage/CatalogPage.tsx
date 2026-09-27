import { useSearchParams } from 'react-router'
import MovieCard from '../../components/MovieCard/MovieCard'
import MovieCardSkeleton from '../../components/MovieCardSkeleton/MovieCardSkeleton'
import Pagination from '../../components/Pagination/Pagination'
import SearchBar from '../../components/SearchBar/SearchBar'
import Skeleton from '../../components/Skeleton/Skeleton'
import { useMovies } from '../../hooks/useMovies'
import { PAGE_SIZE } from '../../services/movies'
import styles from './CatalogPage.module.css'

function CatalogPage() {
  // A busca e a página ficam na URL (?q=matrix&page=2): dá para voltar,
  // atualizar ou compartilhar o link sem perder o estado.
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const { data, isPending, isError, error, isPlaceholderData } = useMovies({
    page,
    q: q || undefined,
  })

  function handleSearch(term: string) {
    setSearchParams(term ? { q: term } : {})
  }

  function handlePageChange(newPage: number) {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(newPage))
    setSearchParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section>
      <div className={styles.header}>
        <h1>{q ? `Resultados para "${q}"` : 'Catálogo'}</h1>
        <SearchBar key={q} defaultValue={q} onSearch={handleSearch} />
      </div>

      {isPending && (
        <>
          <Skeleton width="110px" height="0.85rem" className={styles.countSkeleton} />
          <div className={styles.grid} aria-busy="true" aria-label="Carregando filmes">
            {Array.from({ length: PAGE_SIZE }, (_, index) => (
              <MovieCardSkeleton key={index} />
            ))}
          </div>
        </>
      )}

      {isError && (
        <p className={styles.error}>Não foi possível carregar os filmes: {error.message}</p>
      )}

      {data && (
        <>
          <p className={styles.count}>
            {data.total.toLocaleString('pt-BR')} {data.total === 1 ? 'filme' : 'filmes'}
          </p>

          {data.items.length === 0 ? (
            <p className={styles.status}>Nenhum filme encontrado.</p>
          ) : (
            <div className={`${styles.grid} ${isPlaceholderData ? styles.fetching : ''}`}>
              {data.items.map((movie) => (
                <MovieCard key={movie.sk_movie_id} movie={movie} />
              ))}
            </div>
          )}

          <Pagination page={page} pages={data.pages} onChange={handlePageChange} />
        </>
      )}
    </section>
  )
}

export default CatalogPage
