import { useParams } from 'react-router'

function MovieFormPage() {
  const { movieId } = useParams()
  const isEditing = movieId !== undefined

  return <h1>{isEditing ? 'Editar filme' : 'Adicionar filme'}</h1>
}

export default MovieFormPage
