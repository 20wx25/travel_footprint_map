/**
 * 地点搜索组件
 * Location Search Bar Component
 */

import { useState, useEffect, useRef } from 'react'
import styles from './SearchBar.module.css'

const SearchBar = ({ onSelectLocation, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState(null)
  const searchTimeoutRef = useRef(null)
  const searchBarRef = useRef(null)

  // 点击外部关闭搜索结果
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 搜索地点（使用 Nominatim API）
  const searchLocation = async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // 使用 OpenStreetMap Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          q: query,
          format: 'json',
          limit: '8',
          'accept-language': 'zh-CN,zh',
          addressdetails: '1'
        }),
        {
          headers: {
            'User-Agent': 'TravelFootprintMap/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error('搜索服务暂时不可用')
      }

      const data = await response.json()
      setSearchResults(data)
      setIsOpen(true)
    } catch (err) {
      console.error('Search error:', err)
      setError('搜索失败，请稍后重试')
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  // 处理搜索输入（带防抖）
  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)

    // 清除之前的定时器
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // 设置新的定时器（500ms 防抖）
    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(query)
    }, 500)
  }

  // 处理选择搜索结果
  const handleSelectResult = (result) => {
    const location = {
      name: result.display_name.split(',')[0], // 取第一部分作为地点名称
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      displayName: result.display_name,
      address: result.address,
      type: result.type, // 地点类型（如 city, town, village）
      class: result.class, // 地点类别
      placeRank: result.place_rank // 地点等级（用于判断zoom级别）
    }

    onSelectLocation?.(location)
    setSearchQuery('')
    setSearchResults([])
    setIsOpen(false)
  }

  // 格式化地址显示
  const formatAddress = (result) => {
    const parts = result.display_name.split(',')
    // 显示前3个部分
    return parts.slice(0, 3).join(', ')
  }

  // 获取地点类型图标
  const getLocationIcon = (type) => {
    const iconMap = {
      city: '🏙️',
      town: '🏘️',
      village: '🏡',
      country: '🌏',
      state: '🗺️',
      administrative: '📍',
      tourism: '🎭',
      amenity: '🏢',
      natural: '🏞️',
      building: '🏛️',
      highway: '🛣️',
      railway: '🚂',
      aeroway: '✈️',
      waterway: '🌊'
    }

    return iconMap[type] || '📍'
  }

  return (
    <div className={styles.searchBar} ref={searchBarRef}>
      <div className={styles.searchInputContainer}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="搜索地点（例如：北京天安门、东京塔、巴黎铁塔）"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => searchResults.length > 0 && setIsOpen(true)}
        />
        {searchQuery && (
          <button
            className={styles.clearButton}
            onClick={() => {
              setSearchQuery('')
              setSearchResults([])
              setIsOpen(false)
            }}
            aria-label="清除搜索"
          >
            ✕
          </button>
        )}
        {isLoading && (
          <div className={styles.loadingSpinner}>⏳</div>
        )}
      </div>

      {/* 搜索结果下拉列表 */}
      {isOpen && searchResults.length > 0 && (
        <div className={styles.searchResults}>
          <div className={styles.resultsHeader}>
            <span className={styles.resultsCount}>
              找到 {searchResults.length} 个结果
            </span>
          </div>
          <div className={styles.resultsList}>
            {searchResults.map((result, index) => (
              <button
                key={`${result.place_id}-${index}`}
                className={styles.resultItem}
                onClick={() => handleSelectResult(result)}
              >
                <div className={styles.resultIcon}>
                  {getLocationIcon(result.type)}
                </div>
                <div className={styles.resultContent}>
                  <div className={styles.resultName}>
                    {result.display_name.split(',')[0]}
                  </div>
                  <div className={styles.resultAddress}>
                    {formatAddress(result)}
                  </div>
                </div>
                <div className={styles.resultAction}>→</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 空状态或错误提示 */}
      {isOpen && !isLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
        <div className={styles.searchResults}>
          <div className={styles.emptyState}>
            {error ? (
              <>
                <span className={styles.emptyIcon}>⚠️</span>
                <p className={styles.emptyText}>{error}</p>
              </>
            ) : (
              <>
                <span className={styles.emptyIcon}>🔍</span>
                <p className={styles.emptyText}>未找到相关地点</p>
                <p className={styles.emptyHint}>试试其他关键词</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar
