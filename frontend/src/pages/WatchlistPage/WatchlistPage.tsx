import { Link, useSearchParams } from 'react-router'
import WatchlistCard from '../../components/WatchlistCard/WatchlistCard'
import { useWatchlist } from '../../hooks/useWatchlist'
import styles from './WatchlistPage.module.css'

type Tab = 'quero-ver' | 'ja-vi'

function WatchlistPage() {
  const { items } = useWatchlist()
  // A aba fica na URL (?aba=ja-vi), como os filtros do catálogo.
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: Tab = searchParams.get('aba') === 'ja-vi' ? 'ja-vi' : 'quero-ver'

  const toWatch = items.filter((item) => item.watchedAt === null)
  const watched = items.filter((item) => item.watchedAt !== null)
  const shown = tab === 'ja-vi' ? watched : toWatch

  return (
    <section>
      <h1>Minha watchlist</h1>

      <div className={styles.tabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'quero-ver'}
          className={tab === 'quero-ver' ? styles.activeTab : ''}
          onClick={() => setSearchParams({})}
        >
          Quero ver <span className={styles.count}>{toWatch.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'ja-vi'}
          className={tab === 'ja-vi' ? styles.activeTab : ''}
          onClick={() => setSearchParams({ aba: 'ja-vi' })}
        >
          Já vi <span className={styles.count}>{watched.length}</span>
        </button>
      </div>

      {shown.length === 0 ? (
        <div className={styles.empty}>
          {tab === 'ja-vi' ? (
            <p>Nenhum filme marcado como assistido ainda.</p>
          ) : (
            <>
              <p>Sua lista está vazia. Use a bandeirinha nos pôsteres do catálogo para salvar filmes.</p>
              <Link to="/">Explorar o catálogo</Link>
            </>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {shown.map((item) => (
            <WatchlistCard key={item.movieId} item={item} />
          ))}
        </div>
      )}
    </section>
  )
}

export default WatchlistPage
