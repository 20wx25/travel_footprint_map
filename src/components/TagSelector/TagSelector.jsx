/**
 * 标签选择器组件
 * Tag Selector Component
 */

import { PREDEFINED_TAGS } from '../../constants/tags'
import styles from './TagSelector.module.css'

const TagSelector = ({ selectedTags = [], onChange, maxTags = 3 }) => {
  // 切换标签选择
  const handleToggleTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      // 取消选择
      onChange(selectedTags.filter(id => id !== tagId))
    } else {
      // 添加选择（最多maxTags个）
      if (selectedTags.length < maxTags) {
        onChange([...selectedTags, tagId])
      }
    }
  }

  return (
    <div className={styles.selectorContainer}>
      <div className={styles.tagGrid}>
        {PREDEFINED_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag.id)

          return (
            <button
              key={tag.id}
              type="button"
              className={`${styles.tagButton} ${isSelected ? styles.selected : ''}`}
              onClick={() => handleToggleTag(tag.id)}
              style={{
                '--tag-color': tag.color,
                '--tag-light-color': tag.lightColor
              }}
            >
              <span className={styles.tagEmoji}>{tag.emoji}</span>
              <span className={styles.tagName}>{tag.name}</span>
              {isSelected && (
                <span className={styles.checkmark}>✓</span>
              )}
            </button>
          )
        })}
      </div>

      <div className={styles.hint}>
        {selectedTags.length > 0 ? (
          <span>
            已选择 {selectedTags.length}/{maxTags} 个标签
          </span>
        ) : (
          <span>
            💡 最多可选择 {maxTags} 个标签来分类您的旅行
          </span>
        )}
      </div>
    </div>
  )
}

export default TagSelector
