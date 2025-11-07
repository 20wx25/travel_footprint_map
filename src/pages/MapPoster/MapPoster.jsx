/**
 * 地图海报生成器
 * Map Poster Generator
 */

import { useState, useRef } from 'react'
import html2canvas from 'html2canvas'
import Button from '../../components/Button'
import Input from '../../components/Input'
import PosterMap from '../../components/PosterMap/PosterMap'
import { useToast } from '../../components/Toast'
import styles from './MapPoster.module.css'

const MapPoster = ({ markers = [], onBack }) => {
  const { success, error: showError } = useToast()
  const posterRef = useRef(null)
  const fileInputRef = useRef(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // 海报配置
  const [config, setConfig] = useState({
    title: '我的旅行足迹',
    subtitle: new Date().getFullYear().toString(),
    theme: 'classic', // classic, modern, minimal, custom
    customBackground: null, // 自定义背景图片
    backgroundBlur: 10, // 高斯模糊程度
    backgroundOpacity: 0.3 // 背景透明度（用于遮罩层）
  })

  // 计算统计数据
  const stats = {
    totalLocations: markers.length,
    totalVisits: markers.reduce((sum, m) => sum + (m.visits?.length || 0), 0),
    uniqueDates: new Set(
      markers.flatMap(m => m.visits?.map(v => v.visitDate) || [])
    ).size,
    countries: new Set(markers.map(m => m.name)).size
  }

  // 获取访问最多的地点（前5）
  const topLocations = markers
    .map(m => ({
      name: m.name,
      visits: m.visits?.length || 0
    }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 5)

  // 更新配置
  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  // 处理背景图片上传
  const handleBackgroundUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      showError('请上传图片文件')
      return
    }

    // 读取图片
    const reader = new FileReader()
    reader.onload = (event) => {
      setConfig(prev => ({
        ...prev,
        theme: 'custom',
        customBackground: event.target.result
      }))
      success('背景图片已上传')
    }
    reader.onerror = () => {
      showError('图片读取失败')
    }
    reader.readAsDataURL(file)
  }

  // 移除自定义背景
  const handleRemoveBackground = () => {
    setConfig(prev => ({
      ...prev,
      customBackground: null,
      theme: 'classic'
    }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 生成海报图片
  const handleGeneratePoster = async () => {
    if (!posterRef.current) return

    setIsGenerating(true)
    try {
      // 等待地图渲染完成
      await new Promise(resolve => setTimeout(resolve, 500))

      const canvas = await html2canvas(posterRef.current, {
        backgroundColor: config.theme === 'custom' && config.customBackground ? null : '#ffffff',
        scale: 2, // 高清输出
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false
      })

      // 转换为图片并下载
      canvas.toBlob((blob) => {
        if (!blob) {
          showError('生成图片失败')
          return
        }
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `travel-poster-${Date.now()}.png`
        link.href = url
        link.click()

        // 清理
        setTimeout(() => URL.revokeObjectURL(url), 100)
        success('海报已下载！')
      }, 'image/png', 1.0)
    } catch (err) {
      console.error('生成海报失败:', err)
      showError('生成海报失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className={styles.posterPage}>
      {/* 头部 */}
      <div className={styles.header}>
        <Button variant="text" onClick={onBack}>
          ← 返回
        </Button>
        <h1 className={styles.title}>🖼️ 地图海报</h1>
        <div className={styles.subtitle}>生成你的专属旅行海报</div>
      </div>

      {/* 内容区域 */}
      <div className={styles.content}>
        {/* 配置面板 */}
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>海报配置</h2>

          <div className={styles.configSection}>
            <label className={styles.label}>标题</label>
            <Input
              value={config.title}
              onChange={(e) => handleConfigChange('title', e.target.value)}
              placeholder="输入海报标题"
            />
          </div>

          <div className={styles.configSection}>
            <label className={styles.label}>副标题</label>
            <Input
              value={config.subtitle}
              onChange={(e) => handleConfigChange('subtitle', e.target.value)}
              placeholder="输入副标题（如年份）"
            />
          </div>

          <div className={styles.configSection}>
            <label className={styles.label}>主题风格</label>
            <div className={styles.themeOptions}>
              <button
                className={`${styles.themeOption} ${config.theme === 'classic' ? styles.active : ''}`}
                onClick={() => handleConfigChange('theme', 'classic')}
              >
                <div className={styles.themePreview} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} />
                <span>经典</span>
              </button>
              <button
                className={`${styles.themeOption} ${config.theme === 'modern' ? styles.active : ''}`}
                onClick={() => handleConfigChange('theme', 'modern')}
              >
                <div className={styles.themePreview} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }} />
                <span>现代</span>
              </button>
              <button
                className={`${styles.themeOption} ${config.theme === 'minimal' ? styles.active : ''}`}
                onClick={() => handleConfigChange('theme', 'minimal')}
              >
                <div className={styles.themePreview} style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }} />
                <span>简约</span>
              </button>
            </div>
          </div>

          <div className={styles.configSection}>
            <label className={styles.label}>自定义背景</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleBackgroundUpload}
              style={{ display: 'none' }}
            />
            <div className={styles.uploadControls}>
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                className={styles.uploadButton}
              >
                📸 上传图片
              </Button>
              {config.customBackground && (
                <Button
                  variant="text"
                  onClick={handleRemoveBackground}
                  className={styles.removeButton}
                >
                  ✕
                </Button>
              )}
            </div>
            {config.customBackground && (
              <div className={styles.backgroundPreview}>
                <img src={config.customBackground} alt="背景预览" />
              </div>
            )}
          </div>

          {config.customBackground && (
            <>
              <div className={styles.configSection}>
                <label className={styles.label}>
                  模糊程度: {config.backgroundBlur}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={config.backgroundBlur}
                  onChange={(e) => handleConfigChange('backgroundBlur', Number(e.target.value))}
                  className={styles.slider}
                />
              </div>

              <div className={styles.configSection}>
                <label className={styles.label}>
                  遮罩透明度: {Math.round(config.backgroundOpacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.backgroundOpacity}
                  onChange={(e) => handleConfigChange('backgroundOpacity', Number(e.target.value))}
                  className={styles.slider}
                />
              </div>
            </>
          )}

          <Button
            variant="primary"
            onClick={handleGeneratePoster}
            loading={isGenerating}
            className={styles.generateButton}
          >
            {isGenerating ? '生成中...' : '💾 下载海报'}
          </Button>
        </div>

        {/* 海报预览 */}
        <div className={styles.previewContainer}>
          <div className={styles.previewLabel}>预览</div>

          <div
            ref={posterRef}
            className={`${styles.poster} ${styles[`theme-${config.theme}`]}`}
            style={{
              background: config.customBackground
                ? 'transparent'
                : undefined
            }}
          >
            {/* 自定义背景图片（带模糊和白边效果） */}
            {config.customBackground && (
              <>
                <div
                  className={styles.posterBackgroundImage}
                  style={{
                    backgroundImage: `url(${config.customBackground})`,
                    filter: `blur(${config.backgroundBlur}px)`,
                  }}
                />
                <div
                  className={styles.posterBackgroundOverlay}
                  style={{
                    backgroundColor: `rgba(255, 255, 255, ${config.backgroundOpacity})`
                  }}
                />
              </>
            )}

            {/* 海报内容容器 */}
            <div className={styles.posterContent}>
              {/* 海报头部 */}
              <div className={styles.posterHeader}>
                <h1 className={styles.posterTitle}>{config.title}</h1>
                <div className={styles.posterSubtitle}>{config.subtitle}</div>
              </div>

              {/* 统计卡片 */}
              <div className={styles.statsSection}>
              <div className={styles.statBox}>
                <div className={styles.statIcon}>📍</div>
                <div className={styles.statValue}>{stats.totalLocations}</div>
                <div className={styles.statLabel}>个地点</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statIcon}>🎯</div>
                <div className={styles.statValue}>{stats.totalVisits}</div>
                <div className={styles.statLabel}>次访问</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statIcon}>📅</div>
                <div className={styles.statValue}>{stats.uniqueDates}</div>
                <div className={styles.statLabel}>天旅行</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statIcon}>🌏</div>
                <div className={styles.statValue}>{stats.countries}</div>
                <div className={styles.statLabel}>个城市</div>
              </div>
            </div>

              {/* 真实地图 */}
              {markers.length > 0 && (
                <div className={styles.worldMapSection}>
                  <PosterMap markers={markers} />
                </div>
              )}

              {/* 海报底部 */}
              <div className={styles.posterFooter}>
                <div className={styles.footerText}>旅行足迹地图</div>
                <div className={styles.footerIcon}>🗺️</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 空状态 */}
      {markers.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🖼️</div>
          <div className={styles.emptyTitle}>暂无数据</div>
          <div className={styles.emptyText}>开始添加旅行标记，即可生成海报</div>
        </div>
      )}
    </div>
  )
}

export default MapPoster
