import { createContext } from 'react'

export type ToastType = 'success' | 'error'

export interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

// O "canal" por onde qualquer componente pede uma notificação.
export const ToastContext = createContext<ToastContextValue | null>(null)
