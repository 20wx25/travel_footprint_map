/**
 * 主应用组件
 * Main App Component
 */

import { useState } from 'react'
import { ToastProvider } from './components/Toast'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Map from './pages/Map'

function App() {
  // 当前页面状态：'home' | 'auth' | 'map'
  const [currentPage, setCurrentPage] = useState('home')

  // 页面导航处理
  const handleNavigate = (page) => {
    setCurrentPage(page)
    // 切换页面时滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <ToastProvider>
      {/* 未登录首页 */}
      {currentPage === 'home' && <Home onNavigate={handleNavigate} />}

      {/* 认证页面 */}
      {currentPage === 'auth' && (
        <Auth
          onBack={() => handleNavigate('home')}
          onLoginSuccess={() => handleNavigate('map')}
        />
      )}

      {/* 地图主界面 */}
      {currentPage === 'map' && <Map onLogout={() => handleNavigate('home')} />}
    </ToastProvider>
  )
}

export default App
