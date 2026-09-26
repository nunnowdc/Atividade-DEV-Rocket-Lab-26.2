import { useParams } from 'react-router'

function MovieDetailPage() {
  const { movieId } = useParams()

  return <h1>Filme {movieId}</h1>
}

export default MovieDetailPage
