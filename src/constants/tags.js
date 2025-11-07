/**
 * 标签系统常量定义
 * Tag System Constants
 */

// 预定义标签
export const PREDEFINED_TAGS = [
  {
    id: 'sightseeing',
    name: '观景',
    emoji: '🏞️',
    color: '#6BA5D6', // 天空蓝
    lightColor: 'rgba(107, 165, 214, 0.15)'
  },
  {
    id: 'family',
    name: '家庭旅游',
    emoji: '👨‍👩‍👧‍👦',
    color: '#E89AC7', // 粉红色
    lightColor: 'rgba(232, 154, 199, 0.15)'
  },
  {
    id: 'friends',
    name: '与朋友之行',
    emoji: '👯‍♀️',
    color: '#FFB86C', // 橙色
    lightColor: 'rgba(255, 184, 108, 0.15)'
  },
  {
    id: 'celebrity',
    name: '追星',
    emoji: '⭐',
    color: '#FFD93D', // 金色
    lightColor: 'rgba(255, 217, 61, 0.15)'
  },
  {
    id: 'food',
    name: '美食探索',
    emoji: '🍜',
    color: '#FF6B6B', // 红色
    lightColor: 'rgba(255, 107, 107, 0.15)'
  },
  {
    id: 'culture',
    name: '文化体验',
    emoji: '🎭',
    color: '#9B59B6', // 紫色
    lightColor: 'rgba(155, 89, 182, 0.15)'
  },
  {
    id: 'adventure',
    name: '冒险活动',
    emoji: '🏔️',
    color: '#27AE60', // 绿色
    lightColor: 'rgba(39, 174, 96, 0.15)'
  },
  {
    id: 'relax',
    name: '休闲度假',
    emoji: '🏖️',
    color: '#3498DB', // 浅蓝色
    lightColor: 'rgba(52, 152, 219, 0.15)'
  },
  {
    id: 'business',
    name: '商务出行',
    emoji: '💼',
    color: '#34495E', // 深灰色
    lightColor: 'rgba(52, 73, 94, 0.15)'
  },
  {
    id: 'photography',
    name: '摄影采风',
    emoji: '📷',
    color: '#16A085', // 青色
    lightColor: 'rgba(22, 160, 133, 0.15)'
  },
  {
    id: 'shopping',
    name: '购物',
    emoji: '🛍️',
    color: '#E74C3C', // 珊瑚红
    lightColor: 'rgba(231, 76, 60, 0.15)'
  },
  {
    id: 'festival',
    name: '节日庆典',
    emoji: '🎉',
    color: '#F39C12', // 橙黄色
    lightColor: 'rgba(243, 156, 18, 0.15)'
  }
]

// 默认标签（当没有选择标签时）
export const DEFAULT_TAG = {
  id: 'default',
  name: '未分类',
  emoji: '📍',
  color: '#95A5A6', // 灰色
  lightColor: 'rgba(149, 165, 166, 0.15)'
}

// 根据ID获取标签
export const getTagById = (id) => {
  return PREDEFINED_TAGS.find(tag => tag.id === id) || DEFAULT_TAG
}

// 根据ID列表获取标签列表
export const getTagsByIds = (ids = []) => {
  if (!ids || ids.length === 0) return [DEFAULT_TAG]
  return ids.map(id => getTagById(id)).filter(Boolean)
}

// 获取标记的主要标签（第一个标签）
export const getPrimaryTag = (tags = []) => {
  if (!tags || tags.length === 0) return DEFAULT_TAG
  return getTagById(tags[0])
}
