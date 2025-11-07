/**
 * Button 按钮组件
 *
 * 使用示例：
 * <Button variant="primary" onClick={handleClick}>保存</Button>
 * <Button variant="secondary" disabled>取消</Button>
 * <Button variant="text" size="small">了解更多</Button>
 * <Button variant="danger">删除</Button>
 */

import { forwardRef } from 'react'
import styles from './Button.module.css'

const Button = forwardRef(({
  children,
  variant = 'primary',  // primary | secondary | text | danger
  size = 'medium',      // small | medium | large
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',      // button | submit | reset
  onClick,
  className = '',
  ...props
}, ref) => {

  // 组合CSS类名
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    loading && styles.loading,
    className
  ].filter(Boolean).join(' ')

  // 处理点击事件
  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault()
      return
    }
    onClick?.(e)
  }

  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <span className={styles.spinner} aria-label="加载中">
          <svg className={styles.spinnerIcon} viewBox="0 0 24 24">
            <circle
              className={styles.spinnerCircle}
              cx="12"
              cy="12"
              r="10"
              fill="none"
              strokeWidth="3"
            />
          </svg>
        </span>
      )}
      <span className={loading ? styles.contentHidden : styles.content}>
        {children}
      </span>
    </button>
  )
})

Button.displayName = 'Button'

export default Button
