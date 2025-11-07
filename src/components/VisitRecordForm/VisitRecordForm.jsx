/**
 * 访问记录表单组件
 * Visit Record Form Component
 */

import { useState } from 'react'
import Input from '../Input'
import Button from '../Button'
import PhotoUpload from '../PhotoUpload'
import styles from './VisitRecordForm.module.css'

const VisitRecordForm = ({ visit, markerName, onSubmit, onCancel, loading = false }) => {
  // 表单数据
  const [formData, setFormData] = useState({
    visitDate: visit?.visitDate || new Date().toISOString().split('T')[0],
    notes: visit?.notes || ''
  })

  // 照片数据
  const [photos, setPhotos] = useState(
    visit?.photos ? visit.photos.map((photo, index) => {
      const photoData = typeof photo === 'string' ? { dataUrl: photo, caption: '' } : photo
      return {
        dataUrl: photoData.dataUrl,
        caption: photoData.caption || '',
        originalName: `photo-${index + 1}.jpg`,
        size: Math.round((photoData.dataUrl.length * 3) / 4),
        width: 1920,
        height: 1080
      }
    }) : []
  )

  // 表单错误
  const [errors, setErrors] = useState({})

  // 验证表单
  const validateForm = () => {
    const newErrors = {}

    if (!formData.visitDate) {
      newErrors.visitDate = '请选择访问日期'
    }

    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = '笔记内容不能超过500个字符'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 提交表单
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) return

    // 传递完整的访问记录数据
    onSubmit?.({
      id: visit?.id || `visit_${Date.now()}`,
      visitDate: formData.visitDate,
      notes: formData.notes.trim() || '',
      photos: photos.map(p => ({ dataUrl: p.dataUrl, caption: p.caption || '' })),
      createdAt: visit?.createdAt || new Date().toISOString()
    })
  }

  // 清除单个字段错误
  const clearError = (field) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }

  // 阻止Enter键自动提交表单
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault()
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      {/* 地点名称提示 */}
      <div className={styles.locationHint}>
        <span className={styles.locationIcon}>📍</span>
        <span className={styles.locationName}>{markerName}</span>
      </div>

      {/* 访问日期 */}
      <Input
        type="date"
        label="访问日期"
        value={formData.visitDate}
        onChange={(e) => {
          setFormData({ ...formData, visitDate: e.target.value })
          clearError('visitDate')
        }}
        error={errors.visitDate}
        max={new Date().toISOString().split('T')[0]}
        required
        autoFocus
      />

      {/* 照片上传 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>📸 上传照片（可选）</h3>
        <PhotoUpload photos={photos} onChange={setPhotos} maxPhotos={10} />
      </div>

      {/* 旅行笔记 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>📝 旅行笔记（可选）</h3>
        <Input
          multiline
          label="旅行笔记"
          placeholder="记录下这次旅行的感受和回忆..."
          value={formData.notes}
          onChange={(e) => {
            setFormData({ ...formData, notes: e.target.value })
            clearError('notes')
          }}
          error={errors.notes}
          maxLength={500}
          rows={4}
        />
      </div>

      {/* 按钮组 */}
      <div className={styles.buttonGroup}>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          取消
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
        >
          {visit ? '保存修改' : '添加记录'}
        </Button>
      </div>
    </form>
  )
}

export default VisitRecordForm
