import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Pagination from './Pagination'

describe('Pagination', () => {
  it('não aparece quando só existe uma página', () => {
    const { container } = render(<Pagination page={1} pages={1} onChange={() => {}} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('desativa "Primeira" e "Anterior" na primeira página', () => {
    render(<Pagination page={1} pages={5} onChange={() => {}} />)

    expect(screen.getByRole('button', { name: /primeira/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /anterior/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /próxima/i })).toBeEnabled()
    expect(screen.getByText('Página 1 de 5')).toBeInTheDocument()
  })

  it('avisa a página escolhida', async () => {
    const onChange = vi.fn()
    render(<Pagination page={2} pages={4783} onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: /próxima/i }))
    await userEvent.click(screen.getByRole('button', { name: /última/i }))

    expect(onChange).toHaveBeenNthCalledWith(1, 3)
    expect(onChange).toHaveBeenNthCalledWith(2, 4783)
    expect(screen.getByText('Página 2 de 4.783')).toBeInTheDocument()
  })
})
