import styles from './Skeleton.module.css'

interface SkeletonProps {
  width?: string
  height?: string
  className?: string
}

// Bloco cinza com brilho animado, usado no lugar do conteúdo enquanto ele
// carrega. O tamanho vem das props ou de uma classe CSS de quem usa.
function Skeleton({ width, height, className = '' }: SkeletonProps) {
  return (
    <span className={`${styles.skeleton} ${className}`} style={{ width, height }} aria-hidden="true" />
  )
}

export default Skeleton
 