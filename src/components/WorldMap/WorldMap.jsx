/**
 * 简易世界地图组件
 * Simple World Map Component
 */

import styles from './WorldMap.module.css'

const WorldMap = ({ markers = [], className = '' }) => {
  // 将经纬度转换为SVG坐标
  // 使用等距圆柱投影（Equirectangular Projection）- 更适合这张简化地图
  const latLngToSvg = (lat, lng) => {
    // 经度映射：-180° 到 180° 映射到 0 到 1000
    // 添加小的水平偏移以匹配地图布局
    const x = ((lng + 180) / 360) * 1000

    // 纬度映射：使用线性映射而非墨卡托投影
    // 这张简化地图看起来使用的是近似线性的投影
    // 纬度 85° 到 -60° 线性映射到 y: 30 到 470
    const clampedLat = Math.max(-60, Math.min(85, lat))

    // 线性映射：高纬度在上（小y值），低纬度在下（大y值）
    const latRange = 85 - (-60) // 145度
    const y = 30 + ((85 - clampedLat) / latRange) * 440

    return { x, y }
  }

  return (
    <div className={`${styles.worldMap} ${className}`}>
      <svg viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        {/* 使用带注释的地图作为背景 */}
        <image href="/map_ann.png" x="0" y="0" width="1000" height="500" preserveAspectRatio="xMidYMid meet" />

        {/* 标记访问过的地点 */}
        {markers.map((marker, index) => {
          const { x, y } = latLngToSvg(marker.latitude, marker.longitude)
          const markerColor = marker.color || '#FF6B6B'

          return (
            <g key={marker.id || index} className={styles.markerGroup}>
              {/* 标记点的光晕 */}
              <circle
                cx={x}
                cy={y}
                r="12"
                fill={markerColor}
                opacity="0.2"
              />
              <circle
                cx={x}
                cy={y}
                r="8"
                fill={markerColor}
                opacity="0.4"
              />
              {/* 主标记点 */}
              <circle
                cx={x}
                cy={y}
                r="5"
                fill={markerColor}
                stroke="white"
                strokeWidth="2"
              />
              {/* 中心点 */}
              <circle
                cx={x}
                cy={y}
                r="2"
                fill="white"
                opacity="0.95"
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default WorldMap
