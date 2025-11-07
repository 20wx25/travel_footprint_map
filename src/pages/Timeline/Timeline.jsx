/**
 * 旅行时间线页面
 * Travel Timeline Page
 */

import { useState, useMemo } from 'react'
import Button from '../../components/Button'
import { getTagsByIds } from '../../constants/tags'
import styles from './Timeline.module.css'

const Timeline = ({ markers = [], onBack }) => {
  const [selectedYear, setSelectedYear] = useState('all')

  // 将所有访问记录展平并按日期排序
  const timelineEvents = useMemo(() => {
    const events = []

    markers.forEach(marker => {
      // 添加初始访问
      events.push({
        id: `${marker.id}-initial`,
        markerId: marker.id,
        markerName: marker.name,
        date: marker.visitDate,
        latitude: marker.latitude,
        longitude: marker.longitude,
        tags: marker.tags,
        notes: marker.notes,
        photos: marker.photos,
        isInitialVisit: true
      })

      // 添加后续访问
      if (marker.visits && marker.visits.length > 0) {
        marker.visits.forEach(visit => {
          events.push({
            id: `${marker.id}-visit-${visit.id}`,
            markerId: marker.id,
            markerName: marker.name,
            date: visit.visitDate,
            latitude: marker.latitude,
            longitude: marker.longitude,
            tags: marker.tags,
            notes: visit.notes,
            photos: visit.photos,
            isInitialVisit: false
          })
        })
      }
    })

    // 按日期降序排序（最新的在前）
    return events.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [markers])

  // 获取所有年份
  const years = useMemo(() => {
    const yearsSet = new Set(
      timelineEvents.map(event => new Date(event.date).getFullYear())
    )
    return ['all', ...Array.from(yearsSet).sort((a, b) => b - a)]
  }, [timelineEvents])

  // 筛选后的事件
  const filteredEvents = useMemo(() => {
    if (selectedYear === 'all') return timelineEvents
    return timelineEvents.filter(event =>
      new Date(event.date).getFullYear() === selectedYear
    )
  }, [timelineEvents, selectedYear])

  // 按年月分组
  const groupedEvents = useMemo(() => {
    const groups = {}
    filteredEvents.forEach(event => {
      const date = new Date(event.date)
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!groups[yearMonth]) {
        groups[yearMonth] = []
      }
      groups[yearMonth].push(event)
    })
    return groups
  }, [filteredEvents])

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 格式化年月标题
  const formatYearMonth = (yearMonth) => {
    const [year, month] = yearMonth.split('-')
    return `${year}年${month}月`
  }

  return (
    <div className={styles.timelinePage}>
      {/* 头部 */}
      <div className={styles.header}>
        <Button variant="text" onClick={onBack}>
          ← 返回
        </Button>
        <h1 className={styles.title}>📅 旅行时间线</h1>
        <div className={styles.subtitle}>
          按时间顺序回顾您的旅行足迹
        </div>
      </div>

      {/* 年份筛选 */}
      {years.length > 1 && (
        <div className={styles.filterSection}>
          <div className={styles.filterLabel}>筛选年份：</div>
          <div className={styles.yearFilters}>
            {years.map(year => (
              <button
                key={year}
                className={`${styles.yearFilter} ${selectedYear === year ? styles.active : ''}`}
                onClick={() => setSelectedYear(year)}
              >
                {year === 'all' ? '全部' : `${year}年`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 统计信息 */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{filteredEvents.length}</span>
          <span className={styles.statLabel}>次旅行</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{new Set(filteredEvents.map(e => e.markerId)).size}</span>
          <span className={styles.statLabel}>个地点</span>
        </div>
      </div>

      {/* 时间线内容 */}
      <div className={styles.timelineContent}>
        {Object.keys(groupedEvents).length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <div className={styles.emptyTitle}>暂无旅行记录</div>
            <div className={styles.emptyText}>开始添加您的第一个旅行标记吧！</div>
          </div>
        ) : (
          Object.entries(groupedEvents).map(([yearMonth, events]) => (
            <div key={yearMonth} className={styles.monthGroup}>
              <div className={styles.monthHeader}>
                <div className={styles.monthTitle}>{formatYearMonth(yearMonth)}</div>
                <div className={styles.monthCount}>{events.length} 次</div>
              </div>

              <div className={styles.timelineItems}>
                {events.map((event, index) => (
                  <div key={event.id} className={styles.timelineItem}>
                    {/* 时间轴线条 */}
                    <div className={styles.timelineLine}>
                      <div className={styles.timelineDot} />
                      {index < events.length - 1 && <div className={styles.timelineConnector} />}
                    </div>

                    {/* 事件卡片 */}
                    <div className={styles.eventCard}>
                      <div className={styles.eventHeader}>
                        <div className={styles.eventTitle}>
                          <span className={styles.locationIcon}>📍</span>
                          <span className={styles.locationName}>{event.markerName}</span>
                        </div>
                        <div className={styles.eventDate}>
                          {formatDate(event.date)}
                        </div>
                      </div>

                      {/* 标签 */}
                      {event.tags && event.tags.length > 0 && (
                        <div className={styles.eventTags}>
                          {getTagsByIds(event.tags).filter(tag => tag.id !== 'default').map(tag => (
                            <span key={tag.id} className={styles.tag}>
                              {tag.emoji} {tag.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* 笔记 */}
                      {event.notes && (
                        <div className={styles.eventNotes}>
                          {event.notes}
                        </div>
                      )}

                      {/* 照片 */}
                      {event.photos && event.photos.length > 0 && (
                        <div className={styles.eventPhotos}>
                          {event.photos.slice(0, 3).map((photo, idx) => (
                            <div key={idx} className={styles.photoThumb}>
                              <img src={photo.url} alt={photo.description || '旅行照片'} />
                            </div>
                          ))}
                          {event.photos.length > 3 && (
                            <div className={styles.morePhotos}>
                              +{event.photos.length - 3}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 访问类型标记 */}
                      {!event.isInitialVisit && (
                        <div className={styles.revisitBadge}>
                          🔄 再次访问
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Timeline
