import { Link, NavLink, Outlet } from 'react-router'
import styles from './Layout.module.css'

function Layout() {
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
          <nav className={styles.nav}>
            <NavLink to="/" end className={({ isActive }) => (isActive ? styles.active : '')}>
              Catálogo
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
