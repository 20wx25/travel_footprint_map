/**
 * 旅行统计页面
 * Travel Statistics Page
 */

import { useMemo, useState } from 'react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import Button from '../../components/Button'
import { getTagsByIds } from '../../constants/tags'
import styles from './Statistics.module.css'

const Statistics = ({ markers = [], onBack }) => {
  // 计算统计数据
  const stats = useMemo(() => {
    // 地点总数
    const totalLocations = markers.length

    // 总访问次数
    const totalVisits = markers.reduce((sum, marker) => sum + (marker.visits?.length || 0), 0)

    // 计算旅行总天数（不重复计算）
    const uniqueDates = new Set()
    markers.forEach(marker => {
      marker.visits?.forEach(visit => {
        uniqueDates.add(visit.visitDate)
      })
    })
    const totalDays = uniqueDates.size

    // 提取国家和城市信息（从地址中）
    const countries = new Set()
    const cities = new Set()
    markers.forEach(marker => {
      if (marker.name) {
        cities.add(marker.name)
      }
      // 尝试从名称或其他信息中提取国家（这里简化处理）
      // 实际应用中可能需要更复杂的地理信息解析
    })

    // 标签统计
    const tagCounts = {}
    markers.forEach(marker => {
      marker.tags?.forEach(tagId => {
        tagCounts[tagId] = (tagCounts[tagId] || 0) + 1
      })
    })

    // 最常访问的地点（按访问次数排序）
    const locationsByVisits = markers
      .map(marker => ({
        name: marker.name,
        visits: marker.visits?.length || 0
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5)

    // 最近访问
    const recentVisits = markers
      .flatMap(marker =>
        marker.visits?.map(visit => ({
          name: marker.name,
          date: visit.visitDate
        })) || []
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)

    // 按月份统计
    const monthlyStats = {}
    markers.forEach(marker => {
      // 添加初始访问
      if (marker.visitDate) {
        const initialMonth = marker.visitDate.substring(0, 7) // YYYY-MM
        monthlyStats[initialMonth] = (monthlyStats[initialMonth] || 0) + 1
      }

      // 添加后续访问
      marker.visits?.forEach(visit => {
        if (visit.visitDate) {
          const month = visit.visitDate.substring(0, 7) // YYYY-MM
          monthlyStats[month] = (monthlyStats[month] || 0) + 1
        }
      })
    })

    // 按年份统计
    const yearlyStats = {}
    markers.forEach(marker => {
      // 添加初始访问
      if (marker.visitDate) {
        const initialYear = marker.visitDate.substring(0, 4) // YYYY
        yearlyStats[initialYear] = (yearlyStats[initialYear] || 0) + 1
      }

      // 添加后续访问
      marker.visits?.forEach(visit => {
        if (visit.visitDate) {
          const year = visit.visitDate.substring(0, 4) // YYYY
          yearlyStats[year] = (yearlyStats[year] || 0) + 1
        }
      })
    })

    // 准备图表数据格式
    const monthlyChartData = Object.entries(monthlyStats)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({
        month,
        visits: count,
        monthName: month
      }))

    const yearlyChartData = Object.entries(yearlyStats)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([year, count]) => ({
        year,
        visits: count
      }))

    // 标签图表数据
    const tagChartData = getTagsByIds(Object.keys(tagCounts))
      .filter(tag => tag.id !== 'default')
      .map(tag => ({
        name: tag.name,
        value: tagCounts[tag.id],
        emoji: tag.emoji
      }))
      .sort((a, b) => b.value - a.value)

    return {
      totalLocations,
      totalVisits,
      totalDays,
      countriesCount: countries.size,
      citiesCount: cities.size,
      tagCounts,
      locationsByVisits,
      recentVisits,
      monthlyStats,
      yearlyStats,
      monthlyChartData,
      yearlyChartData,
      tagChartData
    }
  }, [markers])

  // 图表颜色配置
  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7']

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 自定义 Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.chartTooltip}>
          <p className={styles.tooltipLabel}>{label}</p>
          <p className={styles.tooltipValue}>
            访问次数: <strong>{payload[0].value}</strong>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className={styles.statisticsPage}>
      {/* 头部 */}
      <div className={styles.header}>
        <Button variant="text" onClick={onBack}>
          ← 返回
        </Button>
        <h1 className={styles.title}>📊 旅行统计</h1>
        <div className={styles.subtitle}>探索你的旅行足迹</div>
      </div>

      {/* 统计卡片网格 */}
      <div className={styles.statsGrid}>
        {/* 地点总数 */}
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📍</div>
          <div className={styles.statValue}>{stats.totalLocations}</div>
          <div className={styles.statLabel}>访问地点</div>
        </div>

        {/* 总访问次数 */}
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎯</div>
          <div className={styles.statValue}>{stats.totalVisits}</div>
          <div className={styles.statLabel}>总访问次数</div>
        </div>

        {/* 旅行天数 */}
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📅</div>
          <div className={styles.statValue}>{stats.totalDays}</div>
          <div className={styles.statLabel}>旅行天数</div>
        </div>

        {/* 城市数量 */}
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🏙️</div>
          <div className={styles.statValue}>{stats.citiesCount}</div>
          <div className={styles.statLabel}>探索城市</div>
        </div>
      </div>

      {/* 最常访问的地点 */}
      {stats.locationsByVisits.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>⭐ 最常访问</h2>
          <div className={styles.rankList}>
            {stats.locationsByVisits.map((location, index) => (
              <div key={index} className={styles.rankItem}>
                <div className={styles.rankNumber}>{index + 1}</div>
                <div className={styles.rankInfo}>
                  <div className={styles.rankName}>{location.name}</div>
                  <div className={styles.rankDetail}>{location.visits} 次访问</div>
                </div>
                <div className={styles.rankBadge}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 月度访问趋势 */}
      {stats.monthlyChartData.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>📈 月度访问趋势</h2>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.monthlyChartData}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#764ba2" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="monthName" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke="#667eea"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorVisits)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 标签分布饼图 */}
      {stats.tagChartData.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>🏷️ 标签分布</h2>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.tagChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.tagChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 按年份统计 */}
      {stats.yearlyChartData.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>📊 年度统计</h2>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.yearlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="year" stroke="#666" fontSize={14} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="visits" fill="#667eea" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 最近访问 */}
      {stats.recentVisits.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>🕐 最近访问</h2>
          <div className={styles.recentList}>
            {stats.recentVisits.map((visit, index) => (
              <div key={index} className={styles.recentItem}>
                <div className={styles.recentDot} />
                <div className={styles.recentInfo}>
                  <div className={styles.recentName}>{visit.name}</div>
                  <div className={styles.recentDate}>{formatDate(visit.date)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {markers.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📊</div>
          <div className={styles.emptyTitle}>暂无统计数据</div>
          <div className={styles.emptyText}>开始添加旅行标记，即可查看统计信息</div>
        </div>
      )}
    </div>
  )
}

export default Statistics
