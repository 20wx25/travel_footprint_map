/**
 * 模态框组件
 * Modal Component
 */

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Button from '../Button'
import styles from './Modal.module.css'

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'medium', // small | medium | large
  closeOnOverlay = true,
  className = ''
}) => {
  // 按ESC键关闭
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleEscape)
    // 阻止背景滚动
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // 点击遮罩层关闭
  const handleOverlayClick = (e) => {
    if (closeOnOverlay && e.target === e.currentTarget) {
      onClose?.()
    }
  }

  const modalContent = (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={`${styles.modalContainer} ${styles[size]} ${className}`}>
        {/* 头部 */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        {/* 内容 */}
        <div className={styles.modalContent}>
          {children}
        </div>

        {/* 底部（可选） */}
        {footer && (
          <div className={styles.modalFooter}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )

  // 使用 Portal 渲染到 body
  return createPortal(modalContent, document.body)
}

export default Modal
