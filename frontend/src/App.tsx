import { Route, Routes } from 'react-router'
import Layout from './components/Layout/Layout'
import CatalogPage from './pages/CatalogPage/CatalogPage'
import MovieDetailPage from './pages/MovieDetailPage/MovieDetailPage'
import MovieFormPage from './pages/MovieFormPage/MovieFormPage'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage'
import WatchlistPage from './pages/WatchlistPage/WatchlistPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<CatalogPage />} />
        <Route path="movies/new" element={<MovieFormPage />} />
        <Route path="movies/:movieId" element={<MovieDetailPage />} />
        <Route path="movies/:movieId/edit" element={<MovieFormPage />} />
        <Route path="watchlist" element={<WatchlistPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
