/**
 * 标记详情组件（重构版 - 支持多个访问记录）
 * Marker Detail Component (Refactored - Multiple Visit Records)
 */

import { useState } from 'react'
import Button from '../Button'
import VisitRecordCard from '../VisitRecordCard'
import VisitRecordDetail from '../VisitRecordDetail'
import VisitRecordForm from '../VisitRecordForm'
import { getTagsByIds } from '../../constants/tags'
import styles from './MarkerDetail.module.css'

const MarkerDetail = ({
  marker,
  onClose,
  onEdit,
  onDelete,
  onAddVisit,
  onEditVisit,
  onDeleteVisit
}) => {
  // 视图状态：'list' | 'detail' | 'add' | 'edit'
  const [view, setView] = useState('list')
  const [selectedVisit, setSelectedVisit] = useState(null)

  if (!marker) return null

  // 标签数据
  const tags = getTagsByIds(marker.tags)

  // 访问记录列表（按日期倒序排列，最新的在前）
  const visits = (marker.visits || []).sort((a, b) =>
    new Date(b.visitDate) - new Date(a.visitDate)
  )

  // 查看访问记录详情
  const handleViewVisit = (visit) => {
    setSelectedVisit(visit)
    setView('detail')
  }

  // 添加访问记录
  const handleAddVisit = () => {
    setView('add')
  }

  // 编辑访问记录
  const handleEditVisit = (visit) => {
    setSelectedVisit(visit)
    setView('edit')
  }

  // 保存新的访问记录
  const handleSubmitAdd = (visitData) => {
    onAddVisit?.(marker.id, visitData)
    setView('list')
  }

  // 保存编辑的访问记录
  const handleSubmitEdit = (visitData) => {
    onEditVisit?.(marker.id, visitData)
    setView('detail')
    setSelectedVisit(visitData)
  }

  // 删除访问记录
  const handleDeleteVisit = (visit) => {
    onDeleteVisit?.(marker.id, visit.id)
    setView('list')
    setSelectedVisit(null)
  }

  // 返回到列表视图
  const handleBackToList = () => {
    setView('list')
    setSelectedVisit(null)
  }

  // 渲染访问记录详情视图
  if (view === 'detail' && selectedVisit) {
    return (
      <VisitRecordDetail
        visit={selectedVisit}
        markerName={marker.name}
        onClose={onClose}
        onBack={handleBackToList}
        onEdit={handleEditVisit}
        onDelete={handleDeleteVisit}
      />
    )
  }

  // 渲染添加访问记录表单
  if (view === 'add') {
    return (
      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <button
            className={styles.backButton}
            onClick={handleBackToList}
          >
            ← 返回
          </button>
          <h3 className={styles.formTitle}>添加访问记录</h3>
          <button
            className={styles.closeButton}
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <VisitRecordForm
          markerName={marker.name}
          onSubmit={handleSubmitAdd}
          onCancel={handleBackToList}
        />
      </div>
    )
  }

  // 渲染编辑访问记录表单
  if (view === 'edit' && selectedVisit) {
    return (
      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <button
            className={styles.backButton}
            onClick={() => setView('detail')}
          >
            ← 返回
          </button>
          <h3 className={styles.formTitle}>编辑访问记录</h3>
          <button
            className={styles.closeButton}
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <VisitRecordForm
          visit={selectedVisit}
          markerName={marker.name}
          onSubmit={handleSubmitEdit}
          onCancel={() => setView('detail')}
        />
      </div>
    )
  }

  // 默认：渲染访问记录列表视图
  return (
    <div className={styles.detailContainer}>
      {/* 头部 */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>{marker.name}</h2>
          <p className={styles.visitCount}>
            📍 共 {visits.length} 次访问
          </p>
        </div>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="关闭"
        >
          ✕
        </button>
      </div>

      {/* 标签显示 */}
      {tags.length > 0 && tags[0].id !== 'default' && (
        <div className={styles.tagsSection}>
          <div className={styles.tagsList}>
            {tags.map((tag) => (
              <span
                key={tag.id}
                className={styles.tag}
                style={{
                  '--tag-color': tag.color,
                  '--tag-light-color': tag.lightColor
                }}
              >
                <span className={styles.tagEmoji}>{tag.emoji}</span>
                <span className={styles.tagName}>{tag.name}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 位置信息 */}
      <div className={styles.locationSection}>
        <h3 className={styles.sectionTitle}>📍 位置信息</h3>
        <div className={styles.coordinates}>
          <div className={styles.coordItem}>
            <span className={styles.coordLabel}>纬度</span>
            <span className={styles.coordValue}>
              {marker.latitude.toFixed(6)}°
            </span>
          </div>
          <div className={styles.coordItem}>
            <span className={styles.coordLabel}>经度</span>
            <span className={styles.coordValue}>
              {marker.longitude.toFixed(6)}°
            </span>
          </div>
        </div>
      </div>

      {/* 访问记录列表 */}
      <div className={styles.visitsSection}>
        <div className={styles.visitsSectionHeader}>
          <h3 className={styles.sectionTitle}>📅 访问记录</h3>
          <Button
            variant="primary"
            size="small"
            onClick={handleAddVisit}
          >
            + 添加记录
          </Button>
        </div>

        {visits.length > 0 ? (
          <div className={styles.visitsGrid}>
            {visits.map((visit) => (
              <VisitRecordCard
                key={visit.id}
                visit={visit}
                onClick={() => handleViewVisit(visit)}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyVisits}>
            <span className={styles.emptyIcon}>📝</span>
            <p className={styles.emptyText}>还没有访问记录</p>
            <p className={styles.emptyHint}>点击"添加记录"按钮开始记录您的旅行</p>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className={styles.actions}>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => onEdit?.(marker)}
        >
          ⚙️ 编辑地点信息
        </Button>
        <Button
          variant="danger"
          fullWidth
          onClick={() => onDelete?.(marker)}
        >
          🗑️ 删除此地点
        </Button>
      </div>
    </div>
  )
}

export default MarkerDetail
