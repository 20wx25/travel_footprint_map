/**
 * 访问记录卡片组件
 * Visit Record Card Component
 */

import styles from './VisitRecordCard.module.css'

const VisitRecordCard = ({ visit, onClick }) => {
  // 格式化日期
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 检查是否有内容
  const hasPhotos = visit.photos && visit.photos.length > 0
  const hasNotes = visit.notes && visit.notes.trim().length > 0
  const isEmpty = !hasPhotos && !hasNotes

  // 获取第一张照片作为预览
  const firstPhoto = hasPhotos ? visit.photos[0] : null
  const photoUrl = firstPhoto ? (typeof firstPhoto === 'string' ? firstPhoto : firstPhoto.dataUrl) : null

  return (
    <div
      className={`${styles.card} ${isEmpty ? styles.empty : ''}`}
      onClick={onClick}
    >
      {/* 卡片头部 - 日期 */}
      <div className={styles.header}>
        <span className={styles.dateIcon}>📅</span>
        <h4 className={styles.date}>{formatDate(visit.visitDate)}</h4>
      </div>

      {/* 卡片主体 */}
      <div className={styles.content}>
        {isEmpty ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📝</span>
            <p className={styles.emptyText}>暂无记录内容</p>
          </div>
        ) : (
          <>
            {/* 照片预览 */}
            {hasPhotos && (
              <div className={styles.photoPreview}>
                <img
                  src={photoUrl}
                  alt="访问记录照片"
                  className={styles.photo}
                />
                {visit.photos.length > 1 && (
                  <div className={styles.photoCount}>
                    +{visit.photos.length - 1}
                  </div>
                )}
              </div>
            )}

            {/* 笔记预览 */}
            {hasNotes && (
              <div className={styles.notesPreview}>
                <p className={styles.notesText}>
                  {visit.notes.length > 100
                    ? visit.notes.substring(0, 100) + '...'
                    : visit.notes}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* 查看详情提示 */}
      <div className={styles.footer}>
        <span className={styles.viewHint}>点击查看详情 →</span>
      </div>
    </div>
  )
}

export default VisitRecordCard
