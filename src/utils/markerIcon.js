/**
 * 地图标记图标工具
 * Marker Icon Utilities
 */

import L from 'leaflet'
import { getPrimaryTag } from '../constants/tags'

/**
 * 创建自定义彩色标记图标
 * @param {Array} tags - 标签ID数组
 * @returns {L.DivIcon} Leaflet DivIcon
 */
export const createColoredMarkerIcon = (tags = []) => {
  const primaryTag = getPrimaryTag(tags)

  // 创建SVG图标
  const svgIcon = `
    <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
      <!-- 阴影 -->
      <ellipse cx="16" cy="40" rx="8" ry="2" fill="rgba(0,0,0,0.2)" />

      <!-- 主标记形状 -->
      <path d="M16 0C9.373 0 4 5.373 4 12c0 8.5 12 30 12 30s12-21.5 12-30c0-6.627-5.373-12-12-12z"
            fill="${primaryTag.color}"
            stroke="white"
            stroke-width="2"/>

      <!-- 内部圆点 -->
      <circle cx="16" cy="12" r="5" fill="white" opacity="0.9"/>

      <!-- Emoji标签 -->
      <text x="16" y="14" text-anchor="middle" font-size="10" fill="${primaryTag.color}">
        ${primaryTag.emoji}
      </text>
    </svg>
  `

  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker-icon',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42]
  })
}

/**
 * 创建集群标记图标（用于多个标记聚合）
 * @param {number} count - 标记数量
 * @param {string} color - 颜色
 * @returns {L.DivIcon} Leaflet DivIcon
 */
export const createClusterIcon = (count, color = '#6BA5D6') => {
  const size = count < 10 ? 40 : count < 100 ? 50 : 60

  const svgIcon = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <!-- 外圈 -->
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}"
              fill="${color}"
              fill-opacity="0.3"
              stroke="${color}"
              stroke-width="2"/>

      <!-- 内圈 -->
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 8}"
              fill="${color}"/>

      <!-- 数字 -->
      <text x="${size/2}" y="${size/2 + 5}"
            text-anchor="middle"
            font-size="${size/3}"
            font-weight="bold"
            fill="white">
        ${count}
      </text>
    </svg>
  `

  return L.divIcon({
    html: svgIcon,
    className: 'cluster-marker-icon',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  })
}
