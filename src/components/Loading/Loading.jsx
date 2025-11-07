/**
 * Loading 加载指示器组件
 *
 * 使用示例：
 * <Loading />  // 默认尺寸
 * <Loading size="small" />  // 小尺寸（按钮内）
 * <Loading size="large" />  // 大尺寸
 * <Loading fullscreen text="加载中..." />  // 全屏加载
 */

import styles from './Loading.module.css'

const Loading = ({
  size = 'medium',      // small | medium | large
  fullscreen = false,   // 是否全屏显示
  overlay = false,      // 是否作为覆盖层（相对定位的容器内）
  text = '',            // 加载文字
  className = ''
}) => {

  // 尺寸映射
  const sizeMap = {
    small: 16,
    medium: 24,
    large: 40
  }

  const spinnerSize = sizeMap[size]

  // 如果是全屏模式
  if (fullscreen) {
    return (
      <div className={styles.fullscreenOverlay} role="status" aria-live="polite">
        <div className={styles.fullscreenContent}>
          <svg
            className={styles.spinner}
            width={40}
            height={40}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className={styles.spinnerCircle}
              cx="12"
              cy="12"
              r="10"
              fill="none"
              strokeWidth="3"
            />
          </svg>
          {text && <p className={styles.loadingText}>{text}</p>}
        </div>
      </div>
    )
  }

  // 如果是覆盖层模式（用于相对定位的容器内）
  if (overlay) {
    return (
      <div className={styles.overlayContainer} role="status" aria-live="polite">
        <div className={styles.overlayContent}>
          <svg
            className={styles.spinner}
            width={32}
            height={32}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className={styles.spinnerCircle}
              cx="12"
              cy="12"
              r="10"
              fill="none"
              strokeWidth="3"
            />
          </svg>
          {text && <p className={styles.loadingText}>{text}</p>}
        </div>
      </div>
    )
  }

  // 普通加载指示器
  return (
    <div
      className={`${styles.loadingContainer} ${className}`}
      role="status"
      aria-label="加载中"
    >
      <svg
        className={styles.spinner}
        width={spinnerSize}
        height={spinnerSize}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className={styles.spinnerCircle}
          cx="12"
          cy="12"
          r="10"
          fill="none"
          strokeWidth="3"
        />
      </svg>
      {text && <span className={styles.loadingText}>{text}</span>}
    </div>
  )
}

export default Loading
