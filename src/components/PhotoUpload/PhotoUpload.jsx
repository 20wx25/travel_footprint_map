/**
 * 照片上传组件
 * Photo Upload Component
 */

import { useState, useRef } from 'react'
import { useToast } from '../Toast'
import Button from '../Button'
import Loading from '../Loading'
import styles from './PhotoUpload.module.css'

const PhotoUpload = ({ photos = [], onChange, maxPhotos = 10 }) => {
  const { error, info } = useToast()
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)

  // 压缩图片
  const compressImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          // 计算缩放比例
          let width = img.width
          let height = img.height

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width = width * ratio
            height = height * ratio
          }

          // 创建canvas进行压缩
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          // 转换为base64
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)

          resolve({
            dataUrl: compressedDataUrl,
            originalName: file.name,
            size: Math.round((compressedDataUrl.length * 3) / 4), // 估算大小
            width,
            height,
            caption: '' // 新增：照片标注
          })
        }

        img.onerror = reject
        img.src = e.target.result
      }

      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // 处理文件选择
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)

    if (files.length === 0) return

    // 检查数量限制
    const remainingSlots = maxPhotos - photos.length
    if (files.length > remainingSlots) {
      error(`最多只能上传${maxPhotos}张照片，当前还可以上传${remainingSlots}张`)
      return
    }

    // 检查文件类型
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        error(`"${file.name}" 不是有效的图片文件`)
        return false
      }
      // 检查文件大小（10MB限制）
      if (file.size > 10 * 1024 * 1024) {
        error(`"${file.name}" 文件过大（超过10MB）`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    setIsUploading(true)
    info(`正在处理${validFiles.length}张照片...`)

    try {
      // 压缩所有照片
      const compressedPhotos = await Promise.all(
        validFiles.map(file => compressImage(file))
      )

      // 添加到照片列表
      onChange([...photos, ...compressedPhotos])
      info(`成功添加${compressedPhotos.length}张照片`)
    } catch (err) {
      error('照片处理失败，请重试')
      console.error('Photo compression error:', err)
    } finally {
      setIsUploading(false)
      // 重置input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // 删除照片
  const handleRemovePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    onChange(newPhotos)
    info('已删除照片')
  }

  // 更新照片标注
  const handleCaptionChange = (index, caption) => {
    const newPhotos = [...photos]
    newPhotos[index] = { ...newPhotos[index], caption }
    onChange(newPhotos)
  }

  // 触发文件选择
  const handleClickUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={styles.uploadContainer}>
      {/* 照片预览网格 */}
      <div className={styles.photoGrid}>
        {photos.map((photo, index) => (
          <div key={index} className={styles.photoItem}>
            <div className={styles.photoPreviewContainer}>
              <img
                src={photo.dataUrl}
                alt={`照片 ${index + 1}`}
                className={styles.photoPreview}
              />
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => handleRemovePhoto(index)}
                aria-label="删除照片"
              >
                ✕
              </button>
              <div className={styles.photoInfo}>
                {index + 1}/{maxPhotos}
              </div>
            </div>
            <input
              type="text"
              placeholder="添加照片说明（可选）"
              value={photo.caption || ''}
              onChange={(e) => handleCaptionChange(index, e.target.value)}
              className={styles.captionInput}
              maxLength={100}
            />
          </div>
        ))}

        {/* 上传按钮 */}
        {photos.length < maxPhotos && (
          <button
            type="button"
            className={styles.uploadButton}
            onClick={handleClickUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loading size="small" />
                <span className={styles.uploadText}>处理中...</span>
              </>
            ) : (
              <>
                <span className={styles.uploadIcon}>📷</span>
                <span className={styles.uploadText}>添加照片</span>
                <span className={styles.uploadHint}>
                  {photos.length}/{maxPhotos}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className={styles.fileInput}
      />

      {/* 提示信息 */}
      <div className={styles.hints}>
        <p className={styles.hint}>
          💡 支持批量选择，最多上传{maxPhotos}张照片
        </p>
        <p className={styles.hint}>
          📏 照片将自动压缩至1920x1080以节省空间
        </p>
        <p className={styles.hint}>
          📦 单张照片不超过10MB
        </p>
      </div>
    </div>
  )
}

export default PhotoUpload
