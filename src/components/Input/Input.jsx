/**
 * Input 输入框组件
 *
 * 使用示例：
 * <Input label="地点名称" placeholder="例如：巴黎卢浮宫" required />
 * <Input type="email" value={email} onChange={setEmail} error="邮箱格式不正确" />
 * <Input multiline rows={4} placeholder="写下你的旅行回忆..." maxLength={500} />
 */

import { forwardRef, useState } from 'react'
import styles from './Input.module.css'

const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  required = false,
  error,
  helperText,
  maxLength,
  multiline = false,
  rows = 3,
  fullWidth = true,
  className = '',
  id,
  name,
  ...props
}, ref) => {

  const [isFocused, setIsFocused] = useState(false)
  const [charCount, setCharCount] = useState(value?.length || defaultValue?.length || 0)

  // 生成唯一ID
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

  // 处理输入变化
  const handleChange = (e) => {
    const newValue = e.target.value
    if (maxLength) {
      setCharCount(newValue.length)
    }
    onChange?.(e)
  }

  // 处理聚焦
  const handleFocus = (e) => {
    setIsFocused(true)
    onFocus?.(e)
  }

  // 处理失焦
  const handleBlur = (e) => {
    setIsFocused(false)
    onBlur?.(e)
  }

  // 组合容器类名
  const containerClasses = [
    styles.container,
    fullWidth && styles.fullWidth,
    className
  ].filter(Boolean).join(' ')

  // 组合输入框类名
  const inputClasses = [
    styles.input,
    multiline && styles.multiline,
    error && styles.error,
    isFocused && styles.focused,
    disabled && styles.disabled
  ].filter(Boolean).join(' ')

  // 输入框组件（input或textarea）
  const InputComponent = multiline ? 'textarea' : 'input'

  return (
    <div className={containerClasses}>
      {/* 标签 */}
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      {/* 输入框 */}
      <InputComponent
        ref={ref}
        id={inputId}
        name={name}
        type={!multiline ? type : undefined}
        className={inputClasses}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        rows={multiline ? rows : undefined}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={
          error ? `${inputId}-error` :
          helperText ? `${inputId}-helper` :
          undefined
        }
        {...props}
      />

      {/* 底部信息区域 */}
      <div className={styles.footer}>
        {/* 错误提示或帮助文本 */}
        {error ? (
          <span id={`${inputId}-error`} className={styles.errorText}>
            {error}
          </span>
        ) : helperText ? (
          <span id={`${inputId}-helper`} className={styles.helperText}>
            {helperText}
          </span>
        ) : (
          <span />
        )}

        {/* 字数统计 */}
        {maxLength && (
          <span className={styles.charCount}>
            <span className={charCount > maxLength ? styles.charCountError : ''}>
              {charCount}
            </span>
            /{maxLength}
          </span>
        )}
      </div>
    </div>
  )
})

Input.displayName = 'Input'

export default Input
