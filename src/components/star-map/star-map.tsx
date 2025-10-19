// FluLink v4.0 星空图谱组件

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, Loading, Tag } from '@/components/ui/index'
import { cn, formatDate, formatNumber, calculateDistance } from '@/lib/utils'
import { StarSeed, User } from '@/lib/pocketbase'
import { useVectorDB } from '@/lib/vector-db'

interface StarPosition {
  x: number
  y: number
  seed: StarSeed
  luminosity: number
  distance: number
}

export interface StarMapProps {
  currentUser: User
  onStarClick: (star: StarSeed) => void
  className?: string
}

export const StarMap: React.FC<StarMapProps> = ({
  currentUser,
  onStarClick,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [starSeeds, setStarSeeds] = useState<StarSeed[]>([])
  const [starPositions, setStarPositions] = useState<StarPosition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStar, setSelectedStar] = useState<StarSeed | null>(null)
  const [viewMode, setViewMode] = useState<'similarity' | 'distance' | 'time'>('similarity')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const { findSimilarContent } = useVectorDB()

  // 获取星种数据
  useEffect(() => {
    const fetchStarSeeds = async () => {
      try {
        setIsLoading(true)
        // TODO: 从 PocketBase 获取星种数据
        const mockSeeds: StarSeed[] = [
          {
            id: '1',
            creator: 'user1',
            content: '今天天气真好，适合出去走走',
            content_type: 'text',
            location: { lat: 39.9042, lng: 116.4074, precision: 'high' },
            content_vector: [0.1, 0.2, 0.3, 0.4, 0.5],
            spectral_tags: ['生活', '天气', '心情'],
            luminosity: 85,
            resonance_count: 128,
            status: 'active',
            created: new Date().toISOString(),
            updated: new Date().toISOString()
          },
          {
            id: '2',
            creator: 'user2',
            content: '分享一张美丽的日落照片',
            content_type: 'image',
            location: { lat: 39.9142, lng: 116.4174, precision: 'high' },
            content_vector: [0.2, 0.3, 0.4, 0.5, 0.6],
            spectral_tags: ['摄影', '风景', '日落'],
            luminosity: 92,
            resonance_count: 256,
            status: 'active',
            created: new Date().toISOString(),
            updated: new Date().toISOString()
          }
        ]
        setStarSeeds(mockSeeds)
      } catch (error) {
        console.error('获取星种数据失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStarSeeds()
  }, [])

  // 计算星种位置
  const calculateStarPositions = useCallback(async (seeds: StarSeed[]) => {
    if (!currentUser.interest_vector || seeds.length === 0) return []

    const positions: StarPosition[] = []
    const centerX = 400 // 画布中心 X
    const centerY = 300 // 画布中心 Y
    const maxRadius = 250 // 最大半径

    for (const seed of seeds) {
      let x: number, y: number, distance: number

      if (viewMode === 'similarity' && seed.content_vector) {
        // 基于向量相似度计算位置
        try {
          const similarResults = await findSimilarContent(seed.content_vector, { limit: 1 })
          const similarity = similarResults[0]?.distance || 0
          distance = (1 - similarity) * maxRadius
        } catch {
          distance = Math.random() * maxRadius
        }
      } else if (viewMode === 'distance' && seed.location && currentUser.location) {
        // 基于地理距离计算位置
        const geoDistance = calculateDistance(
          currentUser.location.lat,
          currentUser.location.lng,
          seed.location.lat,
          seed.location.lng
        )
        distance = Math.min(geoDistance * 10, maxRadius) // 缩放地理距离
      } else {
        // 基于时间计算位置
        const age = Date.now() - new Date(seed.created).getTime()
        const maxAge = 7 * 24 * 60 * 60 * 1000 // 7天
        distance = (age / maxAge) * maxRadius
      }

      // 随机角度
      const angle = Math.random() * 2 * Math.PI
      x = centerX + Math.cos(angle) * distance
      y = centerY + Math.sin(angle) * distance

      positions.push({
        x,
        y,
        seed,
        luminosity: seed.luminosity,
        distance
      })
    }

    return positions
  }, [currentUser, viewMode, findSimilarContent])

  // 更新星种位置
  useEffect(() => {
    if (starSeeds.length > 0) {
      calculateStarPositions(starSeeds).then(setStarPositions)
    }
  }, [starSeeds, calculateStarPositions])

  // 绘制星空
  const drawStars = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 绘制背景渐变
    const gradient = ctx.createRadialGradient(400, 300, 0, 400, 300, 400)
    gradient.addColorStop(0, 'rgba(26, 26, 46, 0.8)')
    gradient.addColorStop(1, 'rgba(10, 10, 26, 0.9)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制星种
    starPositions.forEach(({ x, y, seed, luminosity }) => {
      const size = Math.max(4, Math.min(20, luminosity / 5))
      const alpha = Math.min(1, luminosity / 100)

      // 绘制光晕
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3)
      glowGradient.addColorStop(0, `rgba(255, 215, 0, ${alpha * 0.8})`)
      glowGradient.addColorStop(0.5, `rgba(255, 215, 0, ${alpha * 0.3})`)
      glowGradient.addColorStop(1, 'rgba(255, 215, 0, 0)')
      
      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(x, y, size * 3, 0, 2 * Math.PI)
      ctx.fill()

      // 绘制星种
      const starGradient = ctx.createRadialGradient(x, y, 0, x, y, size)
      starGradient.addColorStop(0, `rgba(255, 215, 0, ${alpha})`)
      starGradient.addColorStop(1, `rgba(255, 170, 0, ${alpha * 0.7})`)
      
      ctx.fillStyle = starGradient
      ctx.beginPath()
      ctx.arc(x, y, size, 0, 2 * Math.PI)
      ctx.fill()

      // 绘制边框
      ctx.strokeStyle = `rgba(255, 215, 0, ${alpha * 0.5})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(x, y, size, 0, 2 * Math.PI)
      ctx.stroke()

      // 绘制选中状态
      if (selectedStar?.id === seed.id) {
        ctx.strokeStyle = 'rgba(255, 215, 0, 1)'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(x, y, size + 5, 0, 2 * Math.PI)
        ctx.stroke()
      }
    })

    // 绘制连接线（相似星种）
    if (selectedStar) {
      const selectedPos = starPositions.find(p => p.seed.id === selectedStar.id)
      if (selectedPos) {
        starPositions.forEach(({ x, y, seed }) => {
          if (seed.id !== selectedStar.id) {
            // 计算相似度
            const similarity = Math.random() // TODO: 使用真实相似度计算
            if (similarity > 0.7) {
              ctx.strokeStyle = `rgba(255, 215, 0, ${similarity * 0.3})`
              ctx.lineWidth = 1
              ctx.beginPath()
              ctx.moveTo(selectedPos.x, selectedPos.y)
              ctx.lineTo(x, y)
              ctx.stroke()
            }
          }
        })
      }
    }
  }, [starPositions, selectedStar])

  // 画布尺寸调整
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      drawStars()
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [drawStars])

  // 绘制星空
  useEffect(() => {
    drawStars()
  }, [drawStars])

  // 处理画布点击
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // 查找点击的星种
    const clickedStar = starPositions.find(({ x: starX, y: starY, seed }) => {
      const distance = Math.sqrt((x - starX) ** 2 + (y - starY) ** 2)
      return distance <= 25 // 点击区域
    })

    if (clickedStar) {
      setSelectedStar(clickedStar.seed)
      onStarClick(clickedStar.seed)
    } else {
      setSelectedStar(null)
    }
  }

  // 处理拖拽
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setDragStart({ x: event.clientX, y: event.clientY })
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return

    const deltaX = event.clientX - dragStart.x
    const deltaY = event.clientY - dragStart.y

    setPan(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }))

    setDragStart({ x: event.clientX, y: event.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // 处理滚轮缩放
  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault()
    const delta = event.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)))
  }

  if (isLoading) {
    return (
      <Card className={cn('h-96 flex items-center justify-center', className)}>
        <Loading text="加载星空中..." />
      </Card>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* 控制面板 */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <div className="glass-effect rounded-xl p-2">
          <div className="flex gap-1">
            {[
              { key: 'similarity', label: '相似度', icon: 'fas fa-brain' },
              { key: 'distance', label: '距离', icon: 'fas fa-map-marker-alt' },
              { key: 'time', label: '时间', icon: 'fas fa-clock' }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setViewMode(key as any)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300',
                  viewMode === key
                    ? 'bg-accent-gold text-black'
                    : 'text-text-secondary hover:text-accent-gold hover:bg-primary-card'
                )}
              >
                <i className={cn(icon, 'mr-1')}></i>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 缩放控制 */}
      <div className="absolute top-4 right-4 z-10">
        <div className="glass-effect rounded-xl p-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
              className="p-1 rounded text-text-secondary hover:text-accent-gold"
            >
              <i className="fas fa-minus"></i>
            </button>
            <span className="text-sm text-text-primary min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
              className="p-1 rounded text-text-secondary hover:text-accent-gold"
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </div>

      {/* 画布容器 */}
      <div ref={containerRef} className="relative w-full h-96 rounded-2xl overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />
      </div>

      {/* 星种详情面板 */}
      {selectedStar && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <Card className="glass-effect">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {selectedStar.content}
                  </h3>
                  <Tag variant="gold" size="sm">
                    {selectedStar.luminosity}°C
                  </Tag>
                </div>
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  <span>
                    <i className="fas fa-heart mr-1"></i>
                    {formatNumber(selectedStar.resonance_count)} 共鸣
                  </span>
                  <span>
                    <i className="fas fa-clock mr-1"></i>
                    {formatDate(selectedStar.created)}
                  </span>
                  <span>
                    <i className="fas fa-user mr-1"></i>
                    {selectedStar.creator}
                  </span>
                </div>
                <div className="flex gap-1 mt-2">
                  {selectedStar.spectral_tags?.map((tag, index) => (
                    <Tag key={index} variant="cyan" size="sm">
                      #{tag}
                    </Tag>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-xl text-text-secondary hover:text-accent-gold hover:bg-primary-card transition-all duration-300">
                  <i className="fas fa-heart"></i>
                </button>
                <button className="p-2 rounded-xl text-text-secondary hover:text-accent-gold hover:bg-primary-card transition-all duration-300">
                  <i className="fas fa-share"></i>
                </button>
                <button className="p-2 rounded-xl text-text-secondary hover:text-accent-gold hover:bg-primary-card transition-all duration-300">
                  <i className="fas fa-comment"></i>
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 统计信息 */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="glass-effect rounded-xl p-3">
          <div className="text-sm text-text-secondary">
            <div className="flex items-center gap-2 mb-1">
              <i className="fas fa-star text-accent-gold"></i>
              <span>{starSeeds.length} 个星种</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-fire text-accent-red"></i>
              <span>总共鸣 {formatNumber(starSeeds.reduce((sum, seed) => sum + seed.resonance_count, 0))}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
