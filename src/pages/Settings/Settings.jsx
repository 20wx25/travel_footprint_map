/**
 * 用户设置页面
 * User Settings Page
 */

import { useState } from 'react'
import { useToast } from '../../components/Toast'
import Button from '../../components/Button'
import Toggle from '../../components/Toggle'
import styles from './Settings.module.css'

const Settings = ({ onBack }) => {
  const { success, info, error } = useToast()

  // 用户信息 - 从localStorage加载头像
  const [user, setUser] = useState(() => {
    const savedAvatar = localStorage.getItem('userAvatar')
    return {
      email: 'user@example.com',
      avatar: savedAvatar || '👤'
    }
  })

  // 隐私设置
  const [isPublic, setIsPublic] = useState(false)

  // 分享链接
  const [shareLink] = useState(`${window.location.origin}/map/share/${Date.now()}`)

  // 切换隐私设置
  const handleTogglePrivacy = (checked) => {
    setIsPublic(checked)
    if (checked) {
      info('地图已设为公开，其他人可以通过分享链接访问')
    } else {
      info('地图已设为私密，只有您可以访问')
    }
  }

  // 复制分享链接
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      success('分享链接已复制到剪贴板')
    } catch (err) {
      // 备用方案：使用旧的复制方法
      const textarea = document.createElement('textarea')
      textarea.value = shareLink
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        success('分享链接已复制到剪贴板')
      } catch (e) {
        info('复制失败，请手动复制链接')
      }
      document.body.removeChild(textarea)
    }
  }

  // 上传头像
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      error('请选择图片文件')
      return
    }

    // 检查文件大小（2MB限制）
    if (file.size > 2 * 1024 * 1024) {
      error('图片大小不能超过2MB')
      return
    }

    try {
      // 压缩头像
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          // 创建canvas进行压缩
          const maxSize = 200
          let width = img.width
          let height = img.height

          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize
              width = maxSize
            } else {
              width = (width / height) * maxSize
              height = maxSize
            }
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          // 转换为base64
          const avatarDataUrl = canvas.toDataURL('image/jpeg', 0.8)

          // 保存到state和localStorage
          const newUser = { ...user, avatar: avatarDataUrl }
          setUser(newUser)
          localStorage.setItem('userAvatar', avatarDataUrl)
          success('头像已更新')
        }
        img.onerror = () => error('图片加载失败')
        img.src = e.target.result
      }
      reader.onerror = () => error('文件读取失败')
      reader.readAsDataURL(file)
    } catch (err) {
      error('头像上传失败，请重试')
      console.error('Avatar upload error:', err)
    }
  }

  // 导出数据
  const handleExportData = () => {
    try {
      // 从localStorage获取所有数据
      const markers = localStorage.getItem('travelMarkers')
      const avatar = localStorage.getItem('userAvatar')

      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        markers: markers ? JSON.parse(markers) : [],
        userAvatar: avatar,
        metadata: {
          totalMarkers: markers ? JSON.parse(markers).length : 0,
          totalVisits: markers ? JSON.parse(markers).reduce((acc, m) => acc + (m.visits?.length || 0), 0) : 0
        }
      }

      // 创建Blob并下载
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `travel-footprint-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      success('数据导出成功！')
    } catch (err) {
      error('数据导出失败，请重试')
      console.error('Export error:', err)
    }
  }

  // 导入数据
  const handleImportData = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 检查文件类型
    if (!file.name.endsWith('.json')) {
      error('请选择JSON文件')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const importData = JSON.parse(event.target.result)

        // 验证数据格式
        if (!importData.markers || !Array.isArray(importData.markers)) {
          error('数据格式不正确')
          return
        }

        // 确认是否覆盖现有数据
        const existingMarkers = localStorage.getItem('travelMarkers')
        const hasExistingData = existingMarkers && JSON.parse(existingMarkers).length > 0

        if (hasExistingData) {
          const confirmed = window.confirm(
            `检测到现有数据（${JSON.parse(existingMarkers).length}个标记）。\n\n` +
            `导入操作将覆盖所有现有数据。\n\n确定要继续吗？`
          )
          if (!confirmed) {
            info('已取消导入')
            return
          }
        }

        // 保存数据到localStorage
        localStorage.setItem('travelMarkers', JSON.stringify(importData.markers))
        if (importData.userAvatar) {
          localStorage.setItem('userAvatar', importData.userAvatar)
          setUser(prev => ({ ...prev, avatar: importData.userAvatar }))
        }

        success(`数据导入成功！共导入 ${importData.markers.length} 个标记`)

        // 提示刷新页面
        setTimeout(() => {
          if (window.confirm('数据导入成功！需要刷新页面以显示新数据，是否立即刷新？')) {
            window.location.reload()
          }
        }, 500)

      } catch (err) {
        error('文件解析失败，请确保文件格式正确')
        console.error('Import error:', err)
      }
    }
    reader.onerror = () => error('文件读取失败')
    reader.readAsText(file)

    // 重置input以便可以重复导入同一个文件
    e.target.value = ''
  }

  // 返回地图
  const handleBack = () => {
    onBack?.()
  }

  return (
    <div className={styles.settingsPage}>
      {/* 顶部导航栏 */}
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <Button
            variant="text"
            size="small"
            onClick={handleBack}
            className={styles.backButton}
          >
            ← 返回地图
          </Button>
        </div>

        <div className={styles.navCenter}>
          <h1 className={styles.pageTitle}>设置</h1>
        </div>

        <div className={styles.navRight}>
          {/* 占位，保持居中 */}
        </div>
      </nav>

      {/* 内容区 */}
      <div className={styles.content}>
        {/* 用户信息卡片 */}
        <section className={styles.section}>
          <div className={styles.userCard}>
            <div className={styles.avatarContainer}>
              {user.avatar.startsWith('data:') ? (
                <img src={user.avatar} alt="用户头像" className={styles.userAvatarImage} />
              ) : (
                <div className={styles.userAvatar}>{user.avatar}</div>
              )}
              <label className={styles.avatarUploadButton}>
                📷 更换头像
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className={styles.avatarInput}
                />
              </label>
            </div>
            <div className={styles.userInfo}>
              <h2 className={styles.userName}>用户</h2>
              <p className={styles.userEmail}>{user.email}</p>
            </div>
          </div>
        </section>

        {/* 隐私设置 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🔒 隐私设置</h2>
          <div className={styles.settingCard}>
            <div className={styles.settingContent}>
              <div className={styles.settingInfo}>
                <h3 className={styles.settingLabel}>公开地图</h3>
                <p className={styles.settingDescription}>
                  开启后，其他人可以通过分享链接查看您的旅行地图
                </p>
              </div>
              <Toggle
                checked={isPublic}
                onChange={handleTogglePrivacy}
              />
            </div>
          </div>

          {!isPublic && (
            <div className={styles.notice}>
              <p className={styles.noticeText}>
                💡 您的地图当前为私密状态，只有您可以访问
              </p>
            </div>
          )}
        </section>

        {/* 分享链接 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🔗 分享链接</h2>
          <div className={styles.settingCard}>
            <div className={styles.shareLinkContainer}>
              <div className={styles.linkBox}>
                <code className={styles.linkText}>{shareLink}</code>
              </div>
              <Button
                variant="primary"
                onClick={handleCopyLink}
                disabled={!isPublic}
              >
                📋 复制链接
              </Button>
            </div>

            {!isPublic && (
              <p className={styles.hint}>
                请先开启"公开地图"才能分享链接
              </p>
            )}

            {isPublic && (
              <div className={styles.shareInfo}>
                <p className={styles.shareInfoText}>
                  ✨ 任何拥有此链接的人都可以查看您的旅行地图
                </p>
                <p className={styles.shareInfoText}>
                  📌 标记、照片和笔记都会公开显示
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 数据管理 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📊 数据管理</h2>
          <div className={styles.settingCard}>
            <div className={styles.dataManagementInfo}>
              <p className={styles.dataInfoText}>
                备份您的旅行数据，或从其他设备导入数据
              </p>
            </div>
            <div className={styles.dataActions}>
              <Button
                variant="primary"
                onClick={handleExportData}
                className={styles.dataButton}
              >
                📥 导出数据
              </Button>
              <label className={styles.importButton}>
                📤 导入数据
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className={styles.importInput}
                />
              </label>
            </div>
            <div className={styles.dataHint}>
              <p className={styles.hintText}>
                💡 提示：导出的数据包含所有标记、访问记录和用户头像
              </p>
            </div>
          </div>
        </section>

        {/* 关于 */}
        <section className={styles.section}>
          <div className={styles.aboutCard}>
            <p className={styles.aboutText}>
              🗺️ 旅行足迹地图 v1.0.0
            </p>
            <p className={styles.aboutText}>
              记录您的每一次旅行，珍藏美好回忆
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Settings
