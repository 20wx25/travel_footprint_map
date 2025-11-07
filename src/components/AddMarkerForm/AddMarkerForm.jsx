/**
 * 添加标记表单组件
 * Add Marker Form Component
 */

import { useState } from 'react'
import Input from '../Input'
import Button from '../Button'
import PhotoUpload from '../PhotoUpload'
import TagSelector from '../TagSelector'
import styles from './AddMarkerForm.module.css'

const AddMarkerForm = ({ initialPosition, initialAddress, onSubmit, onCancel, loading = false }) => {
  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    visitDate: new Date().toISOString().split('T')[0], // 默认今天
    latitude: initialPosition?.lat?.toFixed(6) || '',
    longitude: initialPosition?.lng?.toFixed(6) || '',
    notes: ''
  })

  // 照片数据
  const [photos, setPhotos] = useState([])

  // 标签数据
  const [selectedTags, setSelectedTags] = useState([])

  // 表单错误
  const [errors, setErrors] = useState({})

  // 验证表单
  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = '请输入地点名称'
    } else if (formData.name.length > 50) {
      newErrors.name = '地点名称不能超过50个字符'
    }

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

    // 创建初始访问记录
    const initialVisit = {
      id: `visit_${Date.now()}`,
      visitDate: formData.visitDate,
      notes: formData.notes.trim() || '',
      photos: photos.map(p => ({ dataUrl: p.dataUrl, caption: p.caption || '' })),
      createdAt: new Date().toISOString()
    }

    // 传递完整的标记数据（新数据结构：包含visits数组）
    onSubmit?.({
      name: formData.name.trim(),
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      tags: selectedTags,
      visits: [initialVisit], // 初始访问记录数组
      createdAt: new Date().toISOString()
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
      {/* 地点名称 */}
      <Input
        label="地点名称"
        placeholder="例如：东京塔、巴黎埃菲尔铁塔"
        value={formData.name}
        onChange={(e) => {
          setFormData({ ...formData, name: e.target.value })
          clearError('name')
        }}
        error={errors.name}
        maxLength={50}
        required
        autoFocus
      />

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
        max={new Date().toISOString().split('T')[0]} // 不能选择未来日期
        required
      />

      {/* 标签选择 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>🏷️ 选择标签（可选）</h3>
        <TagSelector
          selectedTags={selectedTags}
          onChange={setSelectedTags}
          maxTags={3}
        />
      </div>

      {/* 照片上传 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>📸 上传照片（可选）</h3>
        <PhotoUpload photos={photos} onChange={setPhotos} maxPhotos={10} />
      </div>

      {/* 旅行笔记 - 多行文本输入 */}
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

      {/* 位置信息（只读） */}
      <div className={styles.locationSection}>
        <div className={styles.coordinateLabel}>📍 位置信息</div>

        {/* 地址信息 */}
        {initialAddress && (
          <div className={styles.addressInfo}>
            <span className={styles.addressLabel}>地址</span>
            <span className={styles.addressValue}>{initialAddress}</span>
          </div>
        )}

        {/* 坐标信息 */}
        <div className={styles.coordinates}>
          <div className={styles.coordinateItem}>
            <span className={styles.coordinateType}>纬度</span>
            <span className={styles.coordinateValue}>{formData.latitude}°</span>
          </div>
          <div className={styles.coordinateItem}>
            <span className={styles.coordinateType}>经度</span>
            <span className={styles.coordinateValue}>{formData.longitude}°</span>
          </div>
        </div>
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
          添加标记
        </Button>
      </div>
    </form>
  )
}

export default AddMarkerForm
