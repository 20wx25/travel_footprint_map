/**
 * 开关切换组件
 * Toggle Switch Component
 */

import styles from './Toggle.module.css'

const Toggle = ({ checked = false, onChange, disabled = false, label }) => {
  const handleChange = (e) => {
    if (!disabled) {
      onChange?.(e.target.checked)
    }
  }

  return (
    <label className={`${styles.toggleContainer} ${disabled ? styles.disabled : ''}`}>
      <input
        type="checkbox"
        className={styles.input}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
      />
      <span className={styles.switch}>
        <span className={styles.slider} />
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  )
}

export default Toggle
