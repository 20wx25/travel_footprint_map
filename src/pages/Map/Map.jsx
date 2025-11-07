/**
 * 地图主界面
 * Main Map Interface
 */

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { useToast } from '../../components/Toast'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import AddMarkerForm from '../../components/AddMarkerForm'
import EditMarkerForm from '../../components/EditMarkerForm'
import MarkerDetail from '../../components/MarkerDetail'
import MemorySidebar from '../../components/MemorySidebar'
import SearchBar from '../../components/SearchBar'
import Settings from '../Settings'
import Statistics from '../Statistics'
import MapPoster from '../MapPoster'
import { createColoredMarkerIcon } from '../../utils/markerIcon'
import { getTagsByIds } from '../../constants/tags'
import 'leaflet/dist/leaflet.css'
import styles from './Map.module.css'

// 修复 Leaflet 默认图标问题
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// 地图视图控制组件
const MapViewController = ({ center, zoom }) => {
  const map = useMap()

  useEffect(() => {
    if (center && zoom) {
      const currentCenter = map.getCenter()
      const currentZoom = map.getZoom()

      // 只有当中心位置或zoom级别发生显著变化时才移动地图
      const centerChanged = Math.abs(currentCenter.lat - center[0]) > 0.0001 ||
                           Math.abs(currentCenter.lng - center[1]) > 0.0001
      const zoomChanged = Math.abs(currentZoom - zoom) > 0.1

      if (centerChanged || zoomChanged) {
        map.flyTo(center, zoom, {
          duration: 0.5
        })
      }
    }
  }, [map, center, zoom])

  return null
}

// 地图点击事件处理组件
const MapClickHandler = ({ isAddingMarker, onMapClick }) => {
  useMapEvents({
    click: (e) => {
      if (isAddingMarker) {
        onMapClick(e.latlng)
      }
    }
  })

  return null
}

const Map = ({ onLogout }) => {
  const { info, success } = useToast()

  // 页面切换
  const [showSettings, setShowSettings] = useState(false)
  const [showStatistics, setShowStatistics] = useState(false)
  const [showMapPoster, setShowMapPoster] = useState(false)

  // 回忆录侧边栏
  const [isMemorySidebarOpen, setIsMemorySidebarOpen] = useState(false)

  // 地图中心位置（默认：中国）
  const [mapCenter, setMapCenter] = useState([35.0, 105.0])
  const [mapZoom, setMapZoom] = useState(4)

  // 用户信息 - 从localStorage加载头像
  const [user, setUser] = useState(() => {
    const savedAvatar = localStorage.getItem('userAvatar')
    return {
      email: 'user@example.com',
      avatar: savedAvatar || '👤'
    }
  })

  // 监听localStorage变化（当在Settings页面修改头像后）
  useEffect(() => {
    const handleStorageChange = () => {
      const savedAvatar = localStorage.getItem('userAvatar')
      if (savedAvatar) {
        setUser(prev => ({ ...prev, avatar: savedAvatar }))
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // 标记数据 - 从localStorage加载
  const [markers, setMarkers] = useState(() => {
    try {
      const savedMarkers = localStorage.getItem('travelMarkers')
      return savedMarkers ? JSON.parse(savedMarkers) : []
    } catch (err) {
      console.error('Failed to load markers from localStorage:', err)
      return []
    }
  })

  // 添加标记模式
  const [isAddingMarker, setIsAddingMarker] = useState(false)

  // Modal状态
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // 临时位置（点击地图时的位置）
  const [tempPosition, setTempPosition] = useState(null)

  // 临时位置的地址信息
  const [tempAddress, setTempAddress] = useState(null)

  // 当前选中的标记
  const [selectedMarker, setSelectedMarker] = useState(null)

  // 待编辑的标记
  const [editingMarker, setEditingMarker] = useState(null)

  // 待删除的标记
  const [deletingMarker, setDeletingMarker] = useState(null)

  // 表单提交加载状态
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 保存标记到localStorage
  useEffect(() => {
    try {
      localStorage.setItem('travelMarkers', JSON.stringify(markers))
    } catch (err) {
      console.error('Failed to save markers to localStorage:', err)
    }
  }, [markers])

  // 处理退出登录
  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      info('已退出登录')
      setTimeout(() => {
        onLogout?.()
      }, 500)
    }
  }

  // 定位到当前位置
  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setMapCenter([latitude, longitude])
          setMapZoom(13)
          info('已定位到当前位置')
        },
        (error) => {
          info('无法获取位置信息')
          console.error('Geolocation error:', error)
        }
      )
    } else {
      info('您的浏览器不支持定位功能')
    }
  }

  // 开始添加标记
  const handleStartAddingMarker = () => {
    setIsAddingMarker(true)
    info('请在地图上点击选择位置')
  }

  // 反向地理编码 - 根据坐标获取地址
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?` +
        new URLSearchParams({
          lat: lat.toString(),
          lon: lng.toString(),
          format: 'json',
          'accept-language': 'zh-CN,zh',
          addressdetails: '1'
        }),
        {
          headers: {
            'User-Agent': 'TravelFootprintMap/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error('反向地理编码失败')
      }

      const data = await response.json()
      return data.display_name || '未知地址'
    } catch (err) {
      console.error('Reverse geocoding error:', err)
      return null
    }
  }

  // 处理地图点击
  const handleMapClick = async (latlng) => {
    setTempPosition(latlng)
    setIsAddModalOpen(true)
    setIsAddingMarker(false)

    // 获取地址信息
    const address = await reverseGeocode(latlng.lat, latlng.lng)
    setTempAddress(address)
  }

  // 打开标记详情
  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker)
    setIsDetailModalOpen(true)
  }

  // 提交标记
  const handleSubmitMarker = (markerData) => {
    setIsSubmitting(true)

    // 模拟API调用
    setTimeout(() => {
      const newMarker = {
        id: Date.now(), // 简单的ID生成
        ...markerData
      }

      setMarkers(prev => [...prev, newMarker])
      setIsSubmitting(false)
      setIsAddModalOpen(false)
      setTempPosition(null)
      success(`已添加标记："${markerData.name}"`)
    }, 1000)
  }

  // 取消添加标记
  const handleCancelAddMarker = () => {
    setIsAddModalOpen(false)
    setTempPosition(null)
    setIsAddingMarker(false)
  }

  // 关闭详情
  const handleCloseDetail = () => {
    setIsDetailModalOpen(false)
    setSelectedMarker(null)
  }

  // 开始编辑标记
  const handleStartEdit = (marker) => {
    setEditingMarker(marker)
    setIsDetailModalOpen(false) // 关闭详情Modal
    setIsEditModalOpen(true) // 打开编辑Modal
  }

  // 提交编辑
  const handleSubmitEdit = (updatedMarker) => {
    setIsSubmitting(true)

    // 模拟API调用
    setTimeout(() => {
      setMarkers(prev =>
        prev.map(m => m.id === updatedMarker.id ? updatedMarker : m)
      )
      setIsSubmitting(false)
      setIsEditModalOpen(false)
      setEditingMarker(null)
      success(`已更新标记：\"${updatedMarker.name}\"`)
    }, 1000)
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setIsEditModalOpen(false)
    setEditingMarker(null)
  }

  // 开始删除标记
  const handleStartDelete = (marker) => {
    setDeletingMarker(marker)
    setIsDetailModalOpen(false) // 关闭详情Modal
    setIsDeleteModalOpen(true) // 打开删除确认Modal
  }

  // 确认删除
  const handleConfirmDelete = () => {
    if (!deletingMarker) return

    setIsSubmitting(true)

    // 模拟API调用
    setTimeout(() => {
      setMarkers(prev => prev.filter(m => m.id !== deletingMarker.id))
      setIsSubmitting(false)
      setIsDeleteModalOpen(false)
      setDeletingMarker(null)
      success(`已删除标记：\"${deletingMarker.name}\"`)
    }, 500)
  }

  // 取消删除
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setDeletingMarker(null)
  }

  // 添加访问记录
  const handleAddVisit = (markerId, visitData) => {
    setMarkers(prev =>
      prev.map(marker => {
        if (marker.id === markerId) {
          return {
            ...marker,
            visits: [...(marker.visits || []), visitData],
            updatedAt: new Date().toISOString()
          }
        }
        return marker
      })
    )
    success('已添加访问记录')
  }

  // 编辑访问记录
  const handleEditVisit = (markerId, updatedVisit) => {
    setMarkers(prev =>
      prev.map(marker => {
        if (marker.id === markerId) {
          return {
            ...marker,
            visits: (marker.visits || []).map(visit =>
              visit.id === updatedVisit.id ? updatedVisit : visit
            ),
            updatedAt: new Date().toISOString()
          }
        }
        return marker
      })
    )
    // Update selected marker to reflect changes
    setSelectedMarker(prev => {
      if (prev && prev.id === markerId) {
        return {
          ...prev,
          visits: (prev.visits || []).map(visit =>
            visit.id === updatedVisit.id ? updatedVisit : visit
          )
        }
      }
      return prev
    })
    success('已更新访问记录')
  }

  // 删除访问记录
  const handleDeleteVisit = (markerId, visitId) => {
    if (!window.confirm('确定要删除这条访问记录吗？')) return

    setMarkers(prev =>
      prev.map(marker => {
        if (marker.id === markerId) {
          return {
            ...marker,
            visits: (marker.visits || []).filter(visit => visit.id !== visitId),
            updatedAt: new Date().toISOString()
          }
        }
        return marker
      })
    )
    // Update selected marker to reflect changes
    setSelectedMarker(prev => {
      if (prev && prev.id === markerId) {
        return {
          ...prev,
          visits: (prev.visits || []).filter(visit => visit.id !== visitId)
        }
      }
      return prev
    })
    success('已删除访问记录')
  }

  // 切换回忆录侧边栏
  const handleToggleMemorySidebar = () => {
    setIsMemorySidebarOpen(prev => !prev)
  }

  // 从侧边栏选择位置并跳转
  const handleSelectLocationFromSidebar = (marker, visit) => {
    // 关闭侧边栏
    setIsMemorySidebarOpen(false)

    // 移动地图到选中的标记位置
    setMapCenter([marker.latitude, marker.longitude])
    setMapZoom(15)

    // 打开标记详情
    setSelectedMarker(marker)
    setIsDetailModalOpen(true)

    // 提示用户
    info(`已跳转到 ${marker.name}`)
  }

  // 根据地点类型计算合适的 zoom 级别
  const getZoomLevelForLocationType = (location) => {
    const { type, placeRank } = location

    // 基于 place_rank 判断（数字越小，范围越大）
    if (placeRank) {
      if (placeRank <= 4) return 8   // 国家级别
      if (placeRank <= 8) return 10  // 州/省级别
      if (placeRank <= 12) return 12 // 大城市级别
      if (placeRank <= 16) return 14 // 城市/区级别
      if (placeRank <= 18) return 15 // 小城镇级别
      if (placeRank <= 20) return 16 // 街区级别
    }

    // 基于 type 判断（作为备选方案）
    const zoomMap = {
      'country': 8,
      'state': 10,
      'region': 11,
      'province': 11,
      'city': 13,
      'town': 14,
      'village': 15,
      'suburb': 15,
      'neighbourhood': 16,
      'road': 16,
      'building': 17,
      'amenity': 16
    }

    return zoomMap[type] || 14 // 默认城市级别
  }

  // 处理搜索地点选择
  const handleSelectSearchLocation = (location) => {
    // 根据地点类型计算合适的 zoom 级别
    const zoomLevel = getZoomLevelForLocationType(location)

    // 移动地图到搜索位置
    setMapCenter([location.latitude, location.longitude])
    setMapZoom(zoomLevel)

    // 保存搜索地址信息（以备后续添加标记时使用）
    setTempAddress(location.displayName)

    // 提示用户
    success(`已定位到 ${location.name}`)
  }

  return (
    <>
      {/* 地图页面 */}
      <div className={`${styles.mapPage} ${(showSettings || showStatistics || showMapPoster) ? styles.pageExit : styles.pageEnter}`}>
      {/* 顶部导航栏 */}
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          {/* Logo */}
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🗺️</span>
            <span className={styles.logoText}>旅行足迹</span>
          </div>
        </div>

        {/* 搜索栏 */}
        <div className={styles.navCenter}>
          <SearchBar onSelectLocation={handleSelectSearchLocation} />
        </div>

        <div className={styles.navRight}>
          {/* 定位按钮 */}
          <Button
            variant="secondary"
            size="small"
            onClick={handleLocateMe}
            className={styles.locateButton}
            aria-label="定位到当前位置"
          >
            📍 定位
          </Button>

          {/* 用户信息 */}
          <div className={styles.userInfo}>
            {user.avatar.startsWith('data:') ? (
              <img src={user.avatar} alt="用户头像" className={styles.userAvatarImage} />
            ) : (
              <span className={styles.userAvatar}>{user.avatar}</span>
            )}
            <span className={styles.userEmail}>{user.email}</span>
          </div>

          {/* 统计按钮 */}
          <Button
            variant="text"
            size="small"
            onClick={() => setShowStatistics(true)}
            className={styles.statisticsButton}
          >
            📊 统计
          </Button>

          {/* 海报按钮 */}
          <Button
            variant="text"
            size="small"
            onClick={() => setShowMapPoster(true)}
            className={styles.posterButton}
          >
            🖼️ 海报
          </Button>

          {/* 设置按钮 */}
          <Button
            variant="text"
            size="small"
            onClick={() => setShowSettings(true)}
            className={styles.settingsButton}
          >
            ⚙️ 设置
          </Button>

          {/* 退出登录 */}
          <Button
            variant="text"
            size="small"
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            退出
          </Button>
        </div>
      </nav>

      {/* 地图容器 */}
      <div className={styles.mapContainer}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className={styles.map}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          {/* OpenStreetMap 瓦片层 */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* 地图视图控制器 */}
          <MapViewController center={mapCenter} zoom={mapZoom} />

          {/* 地图点击事件处理 */}
          <MapClickHandler
            isAddingMarker={isAddingMarker}
            onMapClick={handleMapClick}
          />

          {/* 显示所有标记 */}
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={[marker.latitude, marker.longitude]}
              icon={createColoredMarkerIcon(marker.tags)}
              eventHandlers={{
                click: () => handleMarkerClick(marker)
              }}
            >
              <Popup>
                <div className={styles.markerPopup}>
                  <h3 className={styles.markerName}>{marker.name}</h3>
                  {marker.tags && marker.tags.length > 0 && (
                    <div className={styles.popupTags}>
                      {getTagsByIds(marker.tags).filter(tag => tag.id !== 'default').map(tag => (
                        <span key={tag.id} className={styles.popupTag}>
                          {tag.emoji} {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className={styles.markerDate}>
                    📅 {new Date(marker.visitDate).toLocaleDateString('zh-CN')}
                  </p>
                  <p className={styles.markerCoords}>
                    📍 {marker.latitude.toFixed(4)}°, {marker.longitude.toFixed(4)}°
                  </p>
                  <button
                    className={styles.viewDetailButton}
                    onClick={() => handleMarkerClick(marker)}
                  >
                    查看详情 →
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* 添加模式提示 */}
        {isAddingMarker && (
          <div className={styles.addModeHint}>
            🎯 点击地图选择位置
          </div>
        )}
      </div>

      {/* 浮动操作按钮 */}
      <div className={styles.fabContainer}>
        <button
          className={styles.fab}
          onClick={handleStartAddingMarker}
          aria-label="添加标记"
          title="添加标记"
        >
          <span className={styles.fabIcon}>📍</span>
          <span className={styles.fabText}>添加标记</span>
        </button>
      </div>

      {/* 添加标记Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCancelAddMarker}
        title="添加旅行标记"
        size="large"
        closeOnOverlay={false}
      >
        <AddMarkerForm
          initialPosition={tempPosition}
          initialAddress={tempAddress}
          onSubmit={handleSubmitMarker}
          onCancel={handleCancelAddMarker}
          loading={isSubmitting}
        />
      </Modal>

      {/* 标记详情Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetail}
        title="标记详情"
        size="large"
      >
        <MarkerDetail
          marker={selectedMarker}
          onClose={handleCloseDetail}
          onEdit={handleStartEdit}
          onDelete={handleStartDelete}
          onAddVisit={handleAddVisit}
          onEditVisit={handleEditVisit}
          onDeleteVisit={handleDeleteVisit}
        />
      </Modal>

      {/* 编辑标记Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCancelEdit}
        title="编辑标记"
        size="large"
        closeOnOverlay={false}
      >
        <EditMarkerForm
          marker={editingMarker}
          onSubmit={handleSubmitEdit}
          onCancel={handleCancelEdit}
          loading={isSubmitting}
        />
      </Modal>

      {/* 删除确认Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        title="确认删除"
        size="small"
      >
        <div className={styles.deleteConfirm}>
          <p className={styles.deleteMessage}>
            确定要删除标记 <strong>"{deletingMarker?.name}"</strong> 吗？
          </p>
          <p className={styles.deleteWarning}>
            此操作无法撤销，所有相关的照片和笔记都将被永久删除。
          </p>
          <div className={styles.deleteActions}>
            <Button
              variant="secondary"
              onClick={handleCancelDelete}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              loading={isSubmitting}
            >
              确认删除
            </Button>
          </div>
        </div>
      </Modal>

      {/* 开发提示 */}
      <div className={styles.devNote}>
        🎉 回忆录侧边栏已完成 · {markers.length} 个地点 · {markers.reduce((acc, m) => acc + (m.visits?.length || 0), 0)} 次访问
      </div>

      {/* 回忆录侧边栏 */}
      <MemorySidebar
        markers={markers}
        isOpen={isMemorySidebarOpen}
        onToggle={handleToggleMemorySidebar}
        onSelectLocation={handleSelectLocationFromSidebar}
      />
    </div>

    {/* 设置页面 */}
    {showSettings && (
      <div className={`${styles.settingsPage} ${styles.pageEnter}`}>
        <Settings onBack={() => setShowSettings(false)} />
      </div>
    )}

    {/* 统计页面 */}
    {showStatistics && (
      <div className={`${styles.settingsPage} ${styles.pageEnter}`}>
        <Statistics markers={markers} onBack={() => setShowStatistics(false)} />
      </div>
    )}

    {/* 海报页面 */}
    {showMapPoster && (
      <div className={`${styles.settingsPage} ${styles.pageEnter}`}>
        <MapPoster markers={markers} onBack={() => setShowMapPoster(false)} />
      </div>
    )}
    </>
  )
}

export default Map
