import { Link, NavLink, Outlet } from 'react-router'
import { useWatchlist } from '../../hooks/useWatchlist'
import SearchBar from '../SearchBar/SearchBar'
import styles from './Layout.module.css'

function Layout() {
  const { items } = useWatchlist()
  const toWatchCount = items.filter((item) => item.watchedAt === null).length
  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link to="/" className={styles.logo}>
            <span className={styles.dotGreen} />
            <span className={styles.dotOrange} />
            <span className={styles.dotBlue} />
            CineRocket
          </Link>
          <div className={styles.search}>
            <SearchBar />
          </div>
          <nav className={styles.nav}>
            <NavLink to="/" end className={({ isActive }) => (isActive ? styles.active : '')}>
              Catálogo
            </NavLink>
            <NavLink to="/watchlist" className={({ isActive }) => (isActive ? styles.active : '')}>
              Watchlist
              {toWatchCount > 0 && <span className={styles.badge}>{toWatchCount}</span>}
            </NavLink>
            <NavLink
              to="/movies/new"
              className={({ isActive }) => (isActive ? styles.active : '')}
            >
              + Adicionar filme
            </NavLink>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </>
  )
}

export default Layout
