import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import NamesInput from './NamesInput'

// O NamesInput é controlado: o teste guarda a lista num estado, como o formulário faz.
function Harness({ initial = [] }: { initial?: string[] }) {
  const [names, setNames] = useState(initial)
  return (
    <>
      <NamesInput id="nomes" names={names} onChange={setNames} placeholder="Digite um nome" />
      <output>{names.join('|')}</output>
    </>
  )
}

function currentNames() {
  return screen.getByRole('status').textContent
}

describe('NamesInput', () => {
  it('Enter transforma o texto em etiqueta', async () => {
    render(<Harness />)

    await userEvent.type(screen.getByPlaceholderText('Digite um nome'), 'Greta Gerwig{Enter}')

    expect(currentNames()).toBe('Greta Gerwig')
    expect(screen.getByRole('button', { name: 'Remover Greta Gerwig' })).toBeInTheDocument()
  })

  it('ignora nomes repetidos, sem diferenciar maiúsculas', async () => {
    render(<Harness initial={['Greta Gerwig']} />)

    await userEvent.type(screen.getByRole('textbox'), 'greta gerwig{Enter}')

    expect(currentNames()).toBe('Greta Gerwig')
  })

  it('Backspace com o campo vazio remove o último nome', async () => {
    render(<Harness initial={['Ana', 'Bia']} />)

    await userEvent.type(screen.getByRole('textbox'), '{Backspace}')

    expect(currentNames()).toBe('Ana')
  })

  it('não perde o nome digitado ao sair do campo sem apertar Enter', async () => {
    render(<Harness />)

    await userEvent.type(screen.getByRole('textbox'), 'Sem Enter')
    await userEvent.tab()

    expect(currentNames()).toBe('Sem Enter')
  })
})
