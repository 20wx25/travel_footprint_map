/**
 * Toast Context
 * 提供全局Toast功能
 */

import { createContext, useContext, useState, useCallback } from 'react'
import Toast from './Toast'
import styles from './Toast.module.css'

const ToastContext = createContext(null)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  // 显示Toast
  const showToast = useCallback(({ message, type = 'info', duration = 2000 }) => {
    const id = Date.now()
    const newToast = { id, message, type, duration }

    setToasts(prev => [...prev, newToast])

    // 自动移除
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration + 300) // 多300ms确保动画完成
    }

    return id
  }, [])

  // 移除Toast
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // 快捷方法
  const success = useCallback((message, duration) => {
    return showToast({ message, type: 'success', duration })
  }, [showToast])

  const error = useCallback((message, duration) => {
    return showToast({ message, type: 'error', duration })
  }, [showToast])

  const info = useCallback((message, duration) => {
    return showToast({ message, type: 'info', duration })
  }, [showToast])

  const warning = useCallback((message, duration) => {
    return showToast({ message, type: 'warning', duration })
  }, [showToast])

  const value = {
    showToast,
    success,
    error,
    info,
    warning,
    removeToast
  }

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast容器 */}
      {toasts.length > 0 && (
        <div className={styles.toastContainer}>
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              duration={0} // 已在这里处理，不需要Toast组件自动关闭
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}
