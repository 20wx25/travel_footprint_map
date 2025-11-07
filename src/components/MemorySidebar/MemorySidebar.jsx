/**
 * 回忆录侧边栏组件
 * Memory Sidebar Component
 */

import { useState, useMemo } from 'react'
import Button from '../Button'
import { getTagsByIds, PREDEFINED_TAGS } from '../../constants/tags'
import styles from './MemorySidebar.module.css'

const MemorySidebar = ({ markers, isOpen, onToggle, onSelectLocation }) => {
  // 视图模式：'timeline' | 'tags'
  const [viewMode, setViewMode] = useState('timeline')

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 格式化相对时间
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '昨天'
    if (diffDays < 7) return `${diffDays}天前`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`
    return `${Math.floor(diffDays / 365)}年前`
  }

  // 获取所有访问记录（时间轴视图）
  const timelineMemories = useMemo(() => {
    const memories = []
    markers.forEach(marker => {
      if (marker.visits && marker.visits.length > 0) {
        marker.visits.forEach(visit => {
          memories.push({
            marker,
            visit,
            date: new Date(visit.visitDate)
          })
        })
      }
    })
    // 按日期倒序排列（最新的在前）
    return memories.sort((a, b) => b.date - a.date)
  }, [markers])

  // 按标签分组的访问记录
  const tagGroupedMemories = useMemo(() => {
    const grouped = {}

    // 初始化所有预定义标签
    PREDEFINED_TAGS.forEach(tag => {
      if (tag.id !== 'default') {
        grouped[tag.id] = {
          tag,
          memories: []
        }
      }
    })

    // 分组访问记录
    markers.forEach(marker => {
      if (marker.visits && marker.visits.length > 0) {
        const markerTags = marker.tags || ['default']
        const primaryTag = markerTags[0] || 'default'

        if (primaryTag !== 'default' && grouped[primaryTag]) {
          marker.visits.forEach(visit => {
            grouped[primaryTag].memories.push({
              marker,
              visit,
              date: new Date(visit.visitDate)
            })
          })
        }
      }
    })

    // 过滤掉没有记录的标签，并按日期排序每个标签下的记录
    const result = {}
    Object.keys(grouped).forEach(tagId => {
      if (grouped[tagId].memories.length > 0) {
        result[tagId] = {
          ...grouped[tagId],
          memories: grouped[tagId].memories.sort((a, b) => b.date - a.date)
        }
      }
    })

    return result
  }, [markers])

  // 处理点击记录
  const handleMemoryClick = (marker, visit) => {
    onSelectLocation?.(marker, visit)
  }

  // 渲染访问记录卡片
  const renderMemoryCard = (memory) => {
    const { marker, visit } = memory
    const hasPhoto = visit.photos && visit.photos.length > 0
    const hasNotes = visit.notes && visit.notes.trim().length > 0
    const tags = getTagsByIds(marker.tags)
    const primaryTag = tags[0]
    // 获取首张照片URL（支持多种格式：dataUrl, url, 或直接字符串）
    const firstPhoto = hasPhoto ? (visit.photos[0].dataUrl || visit.photos[0].url || visit.photos[0]) : null

    return (
      <div
        key={`${marker.id}-${visit.id}`}
        className={styles.memoryCard}
        onClick={() => handleMemoryClick(marker, visit)}
      >
        {/* 首张照片（如果有） */}
        {firstPhoto && (
          <div className={styles.memoryPhotoContainer}>
            <img
              src={firstPhoto}
              alt={visit.photos[0].caption || visit.photos[0].description || marker.name}
              className={styles.memoryPhoto}
            />
            {visit.photos.length > 1 && (
              <div className={styles.photoCount}>
                📷 {visit.photos.length}
              </div>
            )}
          </div>
        )}

        {/* 日期和地点 */}
        <div className={styles.memoryHeader}>
          <div className={styles.memoryDate}>
            <span className={styles.dateMain}>{formatDate(visit.visitDate)}</span>
            <span className={styles.dateRelative}>{getRelativeTime(visit.visitDate)}</span>
          </div>
        </div>

        <div className={styles.memoryContent}>
          {/* 地点名称 */}
          <div className={styles.locationName}>
            <span className={styles.locationIcon}>📍</span>
            <span className={styles.locationText}>{marker.name}</span>
          </div>

          {/* 标签 */}
          {primaryTag && primaryTag.id !== 'default' && (
            <div className={styles.memoryTag} style={{
              '--tag-color': primaryTag.color,
              '--tag-light-color': primaryTag.lightColor
            }}>
              <span className={styles.tagEmoji}>{primaryTag.emoji}</span>
              <span className={styles.tagName}>{primaryTag.name}</span>
            </div>
          )}

          {/* 缩略信息 */}
          {hasNotes && (
            <div className={styles.memoryPreview}>
              <div className={styles.notesPreview}>
                {visit.notes.length > 50
                  ? visit.notes.substring(0, 50) + '...'
                  : visit.notes}
              </div>
            </div>
          )}
        </div>

        <div className={styles.viewHint}>点击查看详情 →</div>
      </div>
    )
  }

  return (
    <>
      {/* 折叠按钮 */}
      <button
        className={`${styles.toggleButton} ${isOpen ? styles.toggleButtonOpen : ''}`}
        onClick={onToggle}
        aria-label={isOpen ? '收起侧边栏' : '展开侧边栏'}
      >
        {isOpen ? '◀' : '▶'}
      </button>

      {/* 侧边栏 */}
      <div className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        {/* 侧边栏头部 */}
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>📖 回忆录</h2>
          <div className={styles.viewModeSwitch}>
            <button
              className={`${styles.viewModeButton} ${viewMode === 'timeline' ? styles.viewModeButtonActive : ''}`}
              onClick={() => setViewMode('timeline')}
            >
              ⏱️ 时间轴
            </button>
            <button
              className={`${styles.viewModeButton} ${viewMode === 'tags' ? styles.viewModeButtonActive : ''}`}
              onClick={() => setViewMode('tags')}
            >
              🏷️ 标签
            </button>
          </div>
        </div>

        {/* 侧边栏内容 */}
        <div className={styles.sidebarContent}>
          {/* 时间轴视图 */}
          {viewMode === 'timeline' && (
            <div className={styles.timelineView}>
              {timelineMemories.length > 0 ? (
                <div className={styles.memoriesList}>
                  {timelineMemories.map(memory => renderMemoryCard(memory))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📝</div>
                  <p className={styles.emptyText}>还没有旅行记录</p>
                  <p className={styles.emptyHint}>点击地图添加您的第一个标记</p>
                </div>
              )}
            </div>
          )}

          {/* 标签分组视图 */}
          {viewMode === 'tags' && (
            <div className={styles.tagsView}>
              {Object.keys(tagGroupedMemories).length > 0 ? (
                Object.entries(tagGroupedMemories).map(([tagId, group]) => (
                  <div key={tagId} className={styles.tagGroup}>
                    <div className={styles.tagGroupHeader}>
                      <span className={styles.tagGroupIcon}>{group.tag.emoji}</span>
                      <span className={styles.tagGroupName}>{group.tag.name}</span>
                      <span className={styles.tagGroupCount}>
                        {group.memories.length}
                      </span>
                    </div>
                    <div className={styles.tagGroupMemories}>
                      {group.memories.map(memory => renderMemoryCard(memory))}
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🏷️</div>
                  <p className={styles.emptyText}>还没有标签分类</p>
                  <p className={styles.emptyHint}>添加标记时选择标签进行分类</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 统计信息 */}
        <div className={styles.sidebarFooter}>
          <div className={styles.statsItem}>
            <span className={styles.statsIcon}>📍</span>
            <span className={styles.statsText}>{markers.length} 个地点</span>
          </div>
          <div className={styles.statsItem}>
            <span className={styles.statsIcon}>📅</span>
            <span className={styles.statsText}>{timelineMemories.length} 次访问</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default MemorySidebar
