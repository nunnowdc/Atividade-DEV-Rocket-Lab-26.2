import { describe, expect, it } from 'vitest'
import type { MovieDetail } from '../../types/movie'
import {
  EMPTY_MOVIE_FORM,
  formValuesToMovieInput,
  movieToFormValues,
  validateMovieForm,
  type MovieFormValues,
} from './movieFormValues'

const validForm: MovieFormValues = {
  ...EMPTY_MOVIE_FORM,
  titulo: '  Meu Filme  ',
  ano_lancamento: '2024',
  duracao_minutos: '120',
  genre_ids: ['g1'],
  diretores: ['Diretora'],
}

describe('formValuesToMovieInput', () => {
  it('converte texto para número e campos vazios para null', () => {
    const input = formValuesToMovieInput(validForm)

    expect(input.titulo).toBe('Meu Filme')
    expect(input.ano_lancamento).toBe(2024)
    expect(input.duracao_minutos).toBe(120)
    expect(input.sinopse).toBeNull()
    expect(input.url_poster).toBeNull()
    expect(input.data_lancamento).toBeNull()
  })
})

describe('validateMovieForm', () => {
  it('aceita um formulário válido', () => {
    expect(validateMovieForm(validForm)).toBeNull()
  })

  it('exige gênero, diretor e data no mesmo ano', () => {
    expect(validateMovieForm({ ...validForm, genre_ids: [] })).toMatch(/gênero/)
    expect(validateMovieForm({ ...validForm, diretores: [] })).toMatch(/diretor/)
    expect(validateMovieForm({ ...validForm, data_lancamento: '2020-05-01' })).toMatch(/ano/)
  })
})

describe('movieToFormValues', () => {
  it('separa as pessoas por papel e troca null por texto vazio', () => {
    const movie = {
      sk_movie_id: 'm1',
      titulo: 'Filme',
      ano_lancamento: 2020,
      sinopse: null,
      duracao_minutos: null,
      data_lancamento: null,
      status_filme: 'Lançado',
      url_poster: null,
      url_backdrop: null,
      genres: [{ sk_genre_id: 'g1', nome_genero: 'Drama' }],
      people: [
        { sk_person_id: 'p1', nome_pessoa: 'Diretora', tipo_pessoa: 'Diretor' },
        { sk_person_id: 'p2', nome_pessoa: 'Ator', tipo_pessoa: 'Ator' },
        { sk_person_id: 'p3', nome_pessoa: 'Roteirista', tipo_pessoa: 'Roteirista' },
      ],
      companies: [{ sk_company_id: 'c1', nome_produtora: 'Estúdio' }],
    } as MovieDetail

    const values = movieToFormValues(movie)

    expect(values.diretores).toEqual(['Diretora'])
    expect(values.atores).toEqual(['Ator'])
    expect(values.roteiristas).toEqual(['Roteirista'])
    expect(values.produtoras).toEqual(['Estúdio'])
    expect(values.genre_ids).toEqual(['g1'])
    expect(values.sinopse).toBe('')
    expect(values.ano_lancamento).toBe('2020')
  })
})
