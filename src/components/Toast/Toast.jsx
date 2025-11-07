/**
 * Toast 提示组件
 *
 * 使用示例：
 * import { useToast } from './ToastContext'
 *
 * const { showToast } = useToast()
 * showToast({ message: '保存成功', type: 'success' })
 * showToast({ message: '操作失败', type: 'error', duration: 3000 })
 */

import { useEffect } from 'react'
import styles from './Toast.module.css'

const Toast = ({ message, type = 'info', onClose, duration = 2000 }) => {
  // 自动关闭
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  // 图标映射
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  }

  return (
    <div
      className={`${styles.toast} ${styles[type]}`}
      role="alert"
      aria-live="polite"
    >
      <span className={styles.icon}>
        {icons[type]}
      </span>
      <span className={styles.message}>
        {message}
      </span>
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="关闭提示"
      >
        ✕
      </button>
    </div>
  )
}

export default Toast
