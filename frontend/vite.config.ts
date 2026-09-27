import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Simula um navegador (DOM) dentro do Node, para renderizar componentes.
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
