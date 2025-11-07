/**
 * 访问记录详情组件
 * Visit Record Detail Component
 */

import { useState } from 'react'
import Button from '../Button'
import styles from './VisitRecordDetail.module.css'

const VisitRecordDetail = ({ visit, markerName, onClose, onEdit, onDelete, onBack }) => {
  // 当前查看的照片索引
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  if (!visit) return null

  // 照片数据 - 兼容旧格式和新格式
  const photos = (visit.photos || []).map(photo => {
    if (typeof photo === 'string') {
      return { dataUrl: photo, caption: '' }
    }
    return photo
  })
  const hasPhotos = photos.length > 0

  // 格式化日期
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 上一张照片
  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? photos.length - 1 : prev - 1
    )
  }

  // 下一张照片
  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === photos.length - 1 ? 0 : prev + 1
    )
  }

  return (
    <div className={styles.detailContainer}>
      {/* 头部 */}
      <div className={styles.header}>
        <button
          className={styles.backButton}
          onClick={onBack}
          aria-label="返回"
        >
          ← 返回
        </button>
        <div className={styles.headerContent}>
          <div className={styles.locationName}>
            <span className={styles.locationIcon}>📍</span>
            {markerName}
          </div>
          <h2 className={styles.visitDate}>
            📅 {formatDate(visit.visitDate)}
          </h2>
        </div>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="关闭"
        >
          ✕
        </button>
      </div>

      {/* 照片轮播区 */}
      <div className={styles.photoSection}>
        {hasPhotos ? (
          <>
            <div className={styles.photoCarousel}>
              <img
                src={photos[currentPhotoIndex].dataUrl}
                alt={`访问记录照片 ${currentPhotoIndex + 1}`}
                className={styles.photo}
              />

              {/* 轮播控制 */}
              {photos.length > 1 && (
                <>
                  <button
                    className={`${styles.carouselButton} ${styles.prevButton}`}
                    onClick={handlePrevPhoto}
                    aria-label="上一张"
                  >
                    ‹
                  </button>
                  <button
                    className={`${styles.carouselButton} ${styles.nextButton}`}
                    onClick={handleNextPhoto}
                    aria-label="下一张"
                  >
                    ›
                  </button>
                  <div className={styles.photoIndicator}>
                    {currentPhotoIndex + 1} / {photos.length}
                  </div>
                </>
              )}
            </div>

            {/* 照片标注 */}
            {photos[currentPhotoIndex].caption && (
              <div className={styles.photoCaption}>
                {photos[currentPhotoIndex].caption}
              </div>
            )}
          </>
        ) : (
          <div className={styles.photoPlaceholder}>
            <div className={styles.placeholderIcon}>🖼️</div>
            <p className={styles.placeholderText}>暂无照片</p>
          </div>
        )}
      </div>

      {/* 文字笔记区 */}
      <div className={styles.notesSection}>
        <h3 className={styles.sectionTitle}>📝 旅行笔记</h3>
        {visit.notes ? (
          <div className={styles.notes}>
            <p className={styles.notesText}>{visit.notes}</p>
            <div className={styles.notesCount}>
              {visit.notes.length} / 500 字
            </div>
          </div>
        ) : (
          <div className={styles.notesPlaceholder}>
            <p>暂无笔记内容</p>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className={styles.actions}>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => onEdit?.(visit)}
        >
          ✏️ 编辑记录
        </Button>
        <Button
          variant="danger"
          fullWidth
          onClick={() => onDelete?.(visit)}
        >
          🗑️ 删除记录
        </Button>
      </div>
    </div>
  )
}

export default VisitRecordDetail
