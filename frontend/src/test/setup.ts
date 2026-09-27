import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Depois de cada teste: desmonta o que foi renderizado e limpa o navegador
// simulado, para um teste não interferir no outro.
afterEach(() => {
  cleanup()
  localStorage.clear()
})
