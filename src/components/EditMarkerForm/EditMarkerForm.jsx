/**
 * 编辑标记表单组件
 * Edit Marker Form Component
 */

import { useState } from 'react'
import Input from '../Input'
import Button from '../Button'
import PhotoUpload from '../PhotoUpload'
import TagSelector from '../TagSelector'
import styles from './EditMarkerForm.module.css'

const EditMarkerForm = ({ marker, onSubmit, onCancel, loading = false }) => {
  // 表单数据 - 使用现有标记数据初始化
  const [formData, setFormData] = useState({
    name: marker?.name || '',
    visitDate: marker?.visitDate || new Date().toISOString().split('T')[0],
    latitude: marker?.latitude?.toFixed(6) || '',
    longitude: marker?.longitude?.toFixed(6) || '',
    notes: marker?.notes || ''
  })

  // 照片数据 - 转换回PhotoUpload需要的格式
  const [photos, setPhotos] = useState(
    (marker?.photos || []).map((photo, index) => {
      // 兼容旧格式（只有dataUrl字符串）和新格式（包含dataUrl和caption的对象）
      const photoData = typeof photo === 'string' ? { dataUrl: photo, caption: '' } : photo
      return {
        dataUrl: photoData.dataUrl,
        caption: photoData.caption || '',
        originalName: `photo-${index + 1}.jpg`,
        size: Math.round((photoData.dataUrl.length * 3) / 4),
        width: 1920,
        height: 1080
      }
    })
  )

  // 标签数据
  const [selectedTags, setSelectedTags] = useState(marker?.tags || [])

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

    // 传递完整的标记数据
    onSubmit?.({
      id: marker.id, // 保留原ID
      name: formData.name.trim(),
      visitDate: formData.visitDate,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      notes: formData.notes.trim() || null,
      photos: photos.map(p => ({ dataUrl: p.dataUrl, caption: p.caption || '' })), // 传递dataUrl和caption
      tags: selectedTags, // 添加标签数据
      createdAt: marker.createdAt, // 保留创建时间
      updatedAt: new Date().toISOString() // 更新修改时间
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
        <h3 className={styles.sectionTitle}>📸 照片管理</h3>
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

      {/* 位置坐标（只读） */}
      <div className={styles.coordinateGroup}>
        <div className={styles.coordinateLabel}>位置坐标</div>
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
          保存修改
        </Button>
      </div>
    </form>
  )
}

export default EditMarkerForm
