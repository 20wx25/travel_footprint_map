/**
 * 用户认证页面
 * Authentication Page (Login & Register)
 */

import { useState } from 'react'
import { useToast } from '../../components/Toast'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Card from '../../components/Card'
import styles from './Auth.module.css'

const Auth = ({ onBack, onLoginSuccess }) => {
  const { success, error } = useToast()

  // 当前模式：login 或 register
  const [mode, setMode] = useState('login')

  // 登录表单数据
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  // 注册表单数据
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })

  // 表单错误
  const [errors, setErrors] = useState({})

  // 加载状态
  const [loading, setLoading] = useState(false)

  // 验证邮箱格式
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // 验证密码强度
  const validatePassword = (password) => {
    return password.length >= 8
  }

  // 验证登录表单
  const validateLoginForm = () => {
    const newErrors = {}

    if (!loginData.email) {
      newErrors.email = '请输入邮箱地址'
    } else if (!validateEmail(loginData.email)) {
      newErrors.email = '邮箱格式不正确'
    }

    if (!loginData.password) {
      newErrors.password = '请输入密码'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 验证注册表单
  const validateRegisterForm = () => {
    const newErrors = {}

    if (!registerData.email) {
      newErrors.email = '请输入邮箱地址'
    } else if (!validateEmail(registerData.email)) {
      newErrors.email = '邮箱格式不正确'
    }

    if (!registerData.password) {
      newErrors.password = '请输入密码'
    } else if (!validatePassword(registerData.password)) {
      newErrors.password = '密码至少需要8位字符'
    }

    if (!registerData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码'
    } else if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 处理登录
  const handleLogin = async (e) => {
    e.preventDefault()

    if (!validateLoginForm()) return

    setLoading(true)

    // 模拟API调用
    setTimeout(() => {
      setLoading(false)
      success('登录成功！正在跳转...')

      // 跳转到地图页面
      setTimeout(() => {
        onLoginSuccess?.()
      }, 1000)
    }, 1500)
  }

  // 处理注册
  const handleRegister = async (e) => {
    e.preventDefault()

    if (!validateRegisterForm()) return

    setLoading(true)

    // 模拟API调用
    setTimeout(() => {
      setLoading(false)
      success('注册成功！正在跳转...')

      // 跳转到地图页面
      setTimeout(() => {
        onLoginSuccess?.()
      }, 1000)
    }, 1500)
  }

  // 切换模式
  const switchMode = (newMode) => {
    setMode(newMode)
    setErrors({})
  }

  // 清除错误
  const clearError = (field) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }

  return (
    <div className={styles.authPage}>
      {/* 返回按钮 */}
      <button className={styles.backButton} onClick={onBack} aria-label="返回首页">
        ← 返回
      </button>

      <div className={styles.authContainer}>
        {/* 左侧品牌区域 */}
        <div className={styles.brandSection}>
          <div className={styles.brandContent}>
            <div className={styles.brandIcon}>🗺️</div>
            <h1 className={styles.brandTitle}>旅行足迹</h1>
            <p className={styles.brandSubtitle}>
              记录每一段旅程<br />
              保存珍贵的回忆
            </p>
          </div>
        </div>

        {/* 右侧表单区域 */}
        <div className={styles.formSection}>
          <Card className={styles.formCard}>
            {/* 标签页切换 */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${mode === 'login' ? styles.active : ''}`}
                onClick={() => switchMode('login')}
              >
                登录
              </button>
              <button
                className={`${styles.tab} ${mode === 'register' ? styles.active : ''}`}
                onClick={() => switchMode('register')}
              >
                注册
              </button>
            </div>

            {/* 登录表单 */}
            {mode === 'login' && (
              <form className={styles.form} onSubmit={handleLogin}>
                <h2 className={styles.formTitle}>欢迎回来</h2>
                <p className={styles.formSubtitle}>登录你的账户，继续记录旅行</p>

                <Input
                  type="email"
                  label="邮箱地址"
                  placeholder="your@email.com"
                  value={loginData.email}
                  onChange={(e) => {
                    setLoginData({ ...loginData, email: e.target.value })
                    clearError('email')
                  }}
                  error={errors.email}
                  required
                />

                <Input
                  type="password"
                  label="密码"
                  placeholder="至少8位字符"
                  value={loginData.password}
                  onChange={(e) => {
                    setLoginData({ ...loginData, password: e.target.value })
                    clearError('password')
                  }}
                  error={errors.password}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  className={styles.submitButton}
                >
                  登录
                </Button>

                <p className={styles.hint}>
                  还没有账户？
                  <button
                    type="button"
                    className={styles.linkButton}
                    onClick={() => switchMode('register')}
                  >
                    立即注册
                  </button>
                </p>
              </form>
            )}

            {/* 注册表单 */}
            {mode === 'register' && (
              <form className={styles.form} onSubmit={handleRegister}>
                <h2 className={styles.formTitle}>创建账户</h2>
                <p className={styles.formSubtitle}>开始你的旅行记录之旅</p>

                <Input
                  type="email"
                  label="邮箱地址"
                  placeholder="your@email.com"
                  value={registerData.email}
                  onChange={(e) => {
                    setRegisterData({ ...registerData, email: e.target.value })
                    clearError('email')
                  }}
                  error={errors.email}
                  required
                />

                <Input
                  type="password"
                  label="密码"
                  placeholder="至少8位字符"
                  value={registerData.password}
                  onChange={(e) => {
                    setRegisterData({ ...registerData, password: e.target.value })
                    clearError('password')
                  }}
                  error={errors.password}
                  helperText="密码需包含至少8位字符"
                  required
                />

                <Input
                  type="password"
                  label="确认密码"
                  placeholder="再次输入密码"
                  value={registerData.confirmPassword}
                  onChange={(e) => {
                    setRegisterData({ ...registerData, confirmPassword: e.target.value })
                    clearError('confirmPassword')
                  }}
                  error={errors.confirmPassword}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  className={styles.submitButton}
                >
                  注册
                </Button>

                <p className={styles.hint}>
                  已有账户？
                  <button
                    type="button"
                    className={styles.linkButton}
                    onClick={() => switchMode('login')}
                  >
                    立即登录
                  </button>
                </p>
              </form>
            )}
          </Card>

          {/* 开发提示 */}
          <p className={styles.devNote}>
            🎉 阶段4完成：用户认证界面已创建
          </p>
        </div>
      </div>
    </div>
  )
}

export default Auth
