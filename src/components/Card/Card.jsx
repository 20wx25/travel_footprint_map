/**
 * Card 卡片组件
 *
 * 使用示例：
 * <Card>
 *   <h3>标题</h3>
 *   <p>内容...</p>
 * </Card>
 *
 * <Card hoverable onClick={handleClick}>
 *   可点击的卡片
 * </Card>
 *
 * <Card noPadding>
 *   <img src="..." alt="..." />
 *   <div style={{padding: '16px'}}>内容</div>
 * </Card>
 */

import { forwardRef } from 'react'
import styles from './Card.module.css'

const Card = forwardRef(({
  children,
  hoverable = false,    // 是否有悬停效果
  noPadding = false,    // 是否移除内边距
  bordered = false,     // 是否显示边框
  shadow = 'medium',    // light | medium | heavy
  onClick,
  className = '',
  ...props
}, ref) => {

  // 组合CSS类名
  const cardClasses = [
    styles.card,
    styles[`shadow-${shadow}`],
    hoverable && styles.hoverable,
    noPadding && styles.noPadding,
    bordered && styles.bordered,
    onClick && styles.clickable,
    className
  ].filter(Boolean).join(' ')

  // 处理点击
  const handleClick = (e) => {
    onClick?.(e)
  }

  // 处理键盘事件（可访问性）
  const handleKeyDown = (e) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onClick(e)
    }
  }

  return (
    <div
      ref={ref}
      className={cardClasses}
      onClick={handleClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'

export default Card
