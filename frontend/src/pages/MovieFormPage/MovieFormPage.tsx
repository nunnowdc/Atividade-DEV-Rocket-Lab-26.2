import { Link, useNavigate, useParams } from 'react-router'
import MovieForm from '../../components/MovieForm/MovieForm'
import { EMPTY_MOVIE_FORM, movieToFormValues } from '../../components/MovieForm/movieFormValues'
import { useMovie } from '../../hooks/useMovie'
import { useCreateMovie, useUpdateMovie } from '../../hooks/useMovieMutations'
import { useToast } from '../../hooks/useToast'
import styles from './MovieFormPage.module.css'

// A mesma rota serve para cadastrar (/movies/new) e editar (/movies/:id/edit).
function MovieFormPage() {
  const { movieId } = useParams()
  return movieId ? <EditMovie movieId={movieId} /> : <CreateMovie />
}

function CreateMovie() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const createMovie = useCreateMovie()

  return (
    <section>
      <h1>Adicionar filme</h1>
      <MovieForm
        initialValues={EMPTY_MOVIE_FORM}
        submitLabel="Cadastrar filme"
        cancelTo="/"
        isSubmitting={createMovie.isPending}
        submitError={createMovie.error?.message ?? null}
        onSubmit={(data) =>
          createMovie.mutate(data, {
            onSuccess: (movie) => {
              showToast(`"${movie.titulo}" foi cadastrado!`)
              navigate(`/movies/${movie.sk_movie_id}`)
            },
          })
        }
      />
    </section>
  )
}

function EditMovie({ movieId }: { movieId: string }) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { data: movie, isPending, isError, error } = useMovie(movieId)
  const updateMovie = useUpdateMovie(movieId)

  if (isPending) return <p className={styles.status}>Carregando filme...</p>

  if (isError) {
    return (
      <div className={styles.status}>
        <h1>Não foi possível carregar o filme</h1>
        <p>{error.message}</p>
        <Link to="/">Voltar ao catálogo</Link>
      </div>
    )
  }

  return (
    <section>
      <h1>Editar filme</h1>
      <MovieForm
        initialValues={movieToFormValues(movie)}
        submitLabel="Salvar alterações"
        cancelTo={`/movies/${movieId}`}
        isSubmitting={updateMovie.isPending}
        submitError={updateMovie.error?.message ?? null}
        onSubmit={(data) =>
          updateMovie.mutate(data, {
            onSuccess: () => {
              showToast('Alterações salvas!')
              navigate(`/movies/${movieId}`)
            },
          })
        }
      />
    </section>
  )
}

export default MovieFormPage
