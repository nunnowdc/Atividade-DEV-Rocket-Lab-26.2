import { useCallback, useMemo, useState, type ReactNode } from 'react'
import styles from './ToastProvider.module.css'
import { ToastContext, type ToastType } from './toastContext'

interface Toast {
  id: number
  message: string
  type: ToastType
}

const DURATION_MS = 3500
let nextId = 1

// Guarda a lista de notificações e as desenha no canto da tela. Fica em volta
// do app inteiro, então qualquer tela pode chamar showToast (via useToast).
function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = nextId++
      setToasts((current) => [...current, { id, message, type }])
      setTimeout(() => dismiss(id), DURATION_MS)
    },
    [dismiss],
  )

  // useMemo: o valor só muda se showToast mudar, evitando redesenhar à toa
  // todos os componentes que usam o contexto.
  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.container} role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
            <span>{toast.message}</span>
            <button
              type="button"
              className={styles.close}
              aria-label="Fechar notificação"
              onClick={() => dismiss(toast.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider
