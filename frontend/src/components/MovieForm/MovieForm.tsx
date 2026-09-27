import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import type { MovieInput } from '../../types/movie'
import GenreSelector from '../GenreSelector/GenreSelector'
import NamesInput from '../NamesInput/NamesInput'
import styles from './MovieForm.module.css'
import {
  STATUS_OPTIONS,
  formValuesToMovieInput,
  validateMovieForm,
  type MovieFormValues,
} from './movieFormValues'

interface MovieFormProps {
  initialValues: MovieFormValues
  submitLabel: string
  cancelTo: string
  isSubmitting: boolean
  submitError: string | null
  onSubmit: (data: MovieInput) => void
}

function MovieForm({
  initialValues,
  submitLabel,
  cancelTo,
  isSubmitting,
  submitError,
  onSubmit,
}: MovieFormProps) {
  const [values, setValues] = useState(initialValues)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Atualiza um campo mantendo os outros. O TypeScript garante que o valor
  // tem o tipo certo para o campo informado. Mexer em um campo apaga o aviso
  // de validação anterior.
  function setField<K extends keyof MovieFormValues>(field: K, value: MovieFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setValidationError(null)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const error = validateMovieForm(values)
    setValidationError(error)
    if (!error) onSubmit(formValuesToMovieInput(values))
  }

  const error = validationError ?? submitError

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.columns}>
        <div className={styles.fields}>
          <label className={styles.field}>
            <span>Título *</span>
            <input
              value={values.titulo}
              onChange={(event) => setField('titulo', event.target.value)}
              maxLength={500}
              required
            />
          </label>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Ano de lançamento *</span>
              <input
                type="number"
                min={1888}
                max={2100}
                value={values.ano_lancamento}
                onChange={(event) => setField('ano_lancamento', event.target.value)}
                required
              />
            </label>
            <label className={styles.field}>
              <span>Data de lançamento</span>
              <input
                type="date"
                value={values.data_lancamento}
                onChange={(event) => setField('data_lancamento', event.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>Duração (min)</span>
              <input
                type="number"
                min={1}
                value={values.duracao_minutos}
                onChange={(event) => setField('duracao_minutos', event.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>Status</span>
              <select
                value={values.status_filme}
                onChange={(event) =>
                  setField('status_filme', event.target.value as MovieFormValues['status_filme'])
                }
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.field}>
            <span>Gêneros *</span>
            <GenreSelector
              selected={values.genre_ids}
              onChange={(genreIds) => setField('genre_ids', genreIds)}
            />
          </div>

          <label className={styles.field}>
            <span>Sinopse</span>
            <textarea
              value={values.sinopse}
              onChange={(event) => setField('sinopse', event.target.value)}
              rows={5}
              maxLength={4000}
            />
          </label>

          <div className={styles.field}>
            <label htmlFor="diretores">Diretores *</label>
            <NamesInput
              id="diretores"
              names={values.diretores}
              onChange={(names) => setField('diretores', names)}
              placeholder="Digite um nome e aperte Enter"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="atores">Elenco</label>
            <NamesInput
              id="atores"
              names={values.atores}
              onChange={(names) => setField('atores', names)}
              placeholder="Digite um nome e aperte Enter"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="roteiristas">Roteiro</label>
            <NamesInput
              id="roteiristas"
              names={values.roteiristas}
              onChange={(names) => setField('roteiristas', names)}
              placeholder="Digite um nome e aperte Enter"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="produtoras">Produtoras</label>
            <NamesInput
              id="produtoras"
              names={values.produtoras}
              onChange={(names) => setField('produtoras', names)}
              placeholder="Digite um nome e aperte Enter"
            />
          </div>
        </div>

        <div className={styles.side}>
          <div className={styles.posterPreview}>
            {values.url_poster ? (
              <img src={values.url_poster} alt="Prévia do pôster" />
            ) : (
              <span>Prévia do pôster</span>
            )}
          </div>
          <label className={styles.field}>
            <span>URL do pôster</span>
            <input
              type="url"
              value={values.url_poster}
              onChange={(event) => setField('url_poster', event.target.value)}
              placeholder="https://..."
            />
          </label>
          <label className={styles.field}>
            <span>URL da imagem de fundo</span>
            <input
              type="url"
              value={values.url_backdrop}
              onChange={(event) => setField('url_backdrop', event.target.value)}
              placeholder="https://..."
            />
          </label>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : submitLabel}
        </button>
        <Link to={cancelTo} className={styles.cancel}>
          Cancelar
        </Link>
      </div>
    </form>
  )
}

export default MovieForm
