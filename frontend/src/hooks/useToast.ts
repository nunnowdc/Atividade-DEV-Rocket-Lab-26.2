import { useContext } from 'react'
import { ToastContext } from '../components/ToastProvider/toastContext'

// Atalho para mostrar notificações: const { showToast } = useToast()
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast precisa estar dentro de <ToastProvider>')
  return context
}
