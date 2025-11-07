/**
 * 海报专用地图组件
 * Poster Map Component
 */

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import styles from './PosterMap.module.css'

// 修复 Leaflet 默认图标问题
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const PosterMap = ({ markers = [], className = '' }) => {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    if (!mapContainerRef.current || markers.length === 0) return

    // 清理旧地图实例
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
    }

    // 创建地图实例
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      tap: false,
      touchZoom: false
    })

    mapInstanceRef.current = map

    // 添加瓦片层
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    // 添加标记点
    const bounds = L.latLngBounds()
    markers.forEach(marker => {
      const latlng = [marker.latitude, marker.longitude]
      bounds.extend(latlng)

      // 创建自定义图标
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 16px;
          height: 16px;
          background-color: ${marker.color || '#FF6B6B'};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })

      L.marker(latlng, { icon: customIcon }).addTo(map)
    })

    // 自动调整视图以显示所有标记
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 4 // 限制最大缩放级别，确保能看到大洲
      })
    }

    // 清理函数
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [markers])

  return (
    <div
      ref={mapContainerRef}
      className={`${styles.mapContainer} ${className}`}
    />
  )
}

export default PosterMap
