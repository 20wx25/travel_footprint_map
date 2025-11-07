/**
 * 未登录首页
 * Landing Page for Unauthenticated Users
 */

import { useState } from 'react'
import Button from '../../components/Button'
import Card from '../../components/Card'
import styles from './Home.module.css'

const Home = ({ onNavigate }) => {
  // 功能特性数据
  const features = [
    {
      icon: '📍',
      title: '标记地点',
      description: '在地图上轻松标记你去过的每一个地方，自定义地点名称和访问时间'
    },
    {
      icon: '📸',
      title: '记录回忆',
      description: '为每个地点上传最多10张照片，写下500字的旅行笔记，保存珍贵回忆'
    },
    {
      icon: '🗺️',
      title: '回顾时光',
      description: '在专属的旅行地图上浏览你的足迹，随时重温那些美好的旅行时光'
    }
  ]

  return (
    <div className={styles.homePage}>
      {/* 顶部导航栏 */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          {/* Logo */}
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🗺️</span>
            <span className={styles.logoText}>旅行足迹</span>
          </div>

          {/* 导航按钮 */}
          <div className={styles.navActions}>
            <Button variant="text" onClick={() => onNavigate?.('auth')}>
              登录
            </Button>
            <Button variant="primary" onClick={() => onNavigate?.('auth')}>
              注册
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero区域 */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            记录你的旅行足迹
          </h1>
          <p className={styles.heroSubtitle}>
            用地图、照片和文字，保存每一段旅程<br />
            打造属于自己的旅行故事地图
          </p>
          <div className={styles.heroActions}>
            <Button
              variant="primary"
              size="large"
              onClick={() => onNavigate?.('auth')}
            >
              开始使用
            </Button>
            <Button
              variant="secondary"
              size="large"
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
            >
              了解更多
            </Button>
          </div>
        </div>

        {/* 装饰性元素 */}
        <div className={styles.heroDecoration}>
          <div className={styles.decorCircle1}></div>
          <div className={styles.decorCircle2}></div>
        </div>
      </section>

      {/* 功能展示区 */}
      <section className={styles.features}>
        <div className={styles.featuresContainer}>
          <h2 className={styles.featuresTitle}>核心功能</h2>
          <p className={styles.featuresSubtitle}>
            简单、私密、优雅的旅行记录工具
          </p>

          <div className={styles.featureCards}>
            {features.map((feature, index) => (
              <Card key={index} hoverable shadow="medium" className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA区域 */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>准备好开始你的旅行记录了吗？</h2>
          <p className={styles.ctaSubtitle}>
            免费注册，立即创建你的第一个旅行标记
          </p>
          <Button
            variant="primary"
            size="large"
            onClick={() => onNavigate?.('auth')}
          >
            免费注册
          </Button>
        </div>
      </section>

      {/* 页脚 */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.footerText}>
            © 2025 旅行足迹地图 - Travel Footprint Map
          </p>
          <p className={styles.footerSubtext}>
            温暖的极简主义设计 · V1.0 MVP
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home
