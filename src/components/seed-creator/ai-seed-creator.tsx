// FluLink v4.0 AI 星种创建器组件

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, Button, Input, Textarea, Modal, Loading, Tag } from '@/components/ui'
import { cn, formatDate, generateId } from '@/lib/utils'
import { StarSeed, User } from '@/lib/pocketbase'
import { useContentAgent } from '@/lib/ai-agents'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  metadata?: {
    suggested_content?: string
    confidence?: number
    estimated_reach?: number
    spectral_tags?: string[]
  }
  timestamp: Date
}

interface AISeedCreatorProps {
  currentUser: User
  onSeedCreated: (seed: StarSeed) => void
  className?: string
}

export const AISeedCreator: React.FC<AISeedCreatorProps> = ({
  currentUser,
  onSeedCreated,
  className
}) => {
  const [conversation, setConversation] = useState<Message[]>([
    {
      id: generateId(),
      role: 'assistant',
      content: '你好！我是你的 AI 创作助手。你想创作什么样的星种？描述你的想法，我会帮你优化和传播。',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewSeed, setPreviewSeed] = useState<StarSeed | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { analyzeContent, generateContentVector, extractSpectralTags } = useContentAgent()

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation])

  // 处理用户输入
  const handleSubmit = async () => {
    if (!input.trim() || isGenerating) return

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setConversation(prev => [...prev, userMessage])
    setInput('')
    setIsGenerating(true)

    try {
      // AI 分析用户输入
      const analysis = await analyzeContent(input.trim())
      
      // 生成建议内容
      const suggestedContent = await generateSuggestedContent(input.trim(), analysis)
      
      // 提取光谱标签
      const spectralTags = await extractSpectralTags(suggestedContent)
      
      // 预测传播潜力
      const estimatedReach = await predictPropagationPotential(suggestedContent, analysis)
      
      // 计算置信度
      const confidence = calculateConfidence(analysis, suggestedContent)

      const aiMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: generateAIResponse(suggestedContent, analysis, confidence),
        metadata: {
          suggested_content: suggestedContent,
          confidence,
          estimated_reach: estimatedReach,
          spectral_tags: spectralTags
        },
        timestamp: new Date()
      }

      setConversation(prev => [...prev, aiMessage])
      
      // 如果置信度高，自动设置预览
      if (confidence > 0.8) {
        setPreviewSeed({
          id: generateId(),
          creator: currentUser.id,
          content: suggestedContent,
          content_type: 'text',
          location: currentUser.location,
          content_vector: [], // TODO: 生成真实向量
          spectral_tags: spectralTags,
          luminosity: Math.round(confidence * 100),
          resonance_count: 0,
          status: 'active',
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        })
        setSelectedTags(spectralTags)
      }

    } catch (error) {
      console.error('AI 生成失败:', error)
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: '抱歉，我遇到了一些问题。请稍后再试，或者尝试重新描述你的想法。',
        timestamp: new Date()
      }
      setConversation(prev => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }

  // 生成建议内容
  const generateSuggestedContent = async (userInput: string, analysis: any): Promise<string> => {
    // TODO: 调用真实的 AI 服务
    const suggestions = [
      `${userInput} - 这是一个很棒的想法！`,
      `关于"${userInput}"的思考：这让我想起了...`,
      `分享：${userInput}，希望能引起大家的共鸣`,
      `感悟：${userInput}，生活就是这样美好`
    ]
    return suggestions[Math.floor(Math.random() * suggestions.length)]
  }

  // 预测传播潜力
  const predictPropagationPotential = async (content: string, analysis: any): Promise<number> => {
    // TODO: 使用 AI 预测传播潜力
    const baseReach = Math.floor(Math.random() * 500) + 100
    const sentimentMultiplier = analysis.sentiment === 'positive' ? 1.5 : 1
    const topicMultiplier = analysis.topics.includes('生活') ? 1.3 : 1
    return Math.round(baseReach * sentimentMultiplier * topicMultiplier)
  }

  // 计算置信度
  const calculateConfidence = (analysis: any, content: string): number => {
    let confidence = 0.5
    
    // 基于内容长度
    if (content.length > 20 && content.length < 200) confidence += 0.2
    
    // 基于情感分析
    if (analysis.sentiment === 'positive') confidence += 0.2
    
    // 基于话题识别
    if (analysis.topics.length > 0) confidence += 0.1
    
    return Math.min(1, confidence)
  }

  // 生成 AI 回复
  const generateAIResponse = (suggestedContent: string, analysis: any, confidence: number): string => {
    if (confidence > 0.8) {
      return `我为你优化了这个内容："${suggestedContent}"。这个星种很有潜力，预计能传播给 ${Math.floor(Math.random() * 500) + 100} 人。你觉得怎么样？`
    } else if (confidence > 0.6) {
      return `我理解你的想法。让我为你优化一下："${suggestedContent}"。这个内容还不错，但可能需要一些调整。`
    } else {
      return `我理解你的想法，但可能需要更多信息来帮你创作。你能再详细描述一下吗？`
    }
  }

  // 创建星种
  const handleCreateSeed = async () => {
    if (!previewSeed) return

    setIsCreating(true)
    try {
      // TODO: 调用 PocketBase API 创建星种
      const newSeed: StarSeed = {
        ...previewSeed,
        spectral_tags: selectedTags,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      }

      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      onSeedCreated(newSeed)
      
      // 重置状态
      setPreviewSeed(null)
      setSelectedTags([])
      setShowPreview(false)
      
      // 添加成功消息
      const successMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: '🎉 星种创建成功！它已经开始在星空中传播了。',
        timestamp: new Date()
      }
      setConversation(prev => [...prev, successMessage])

    } catch (error) {
      console.error('创建星种失败:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // 添加自定义标签
  const handleAddTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()])
      setCustomTag('')
    }
  }

  // 移除标签
  const handleRemoveTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag))
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* 对话区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3',
                message.role === 'user'
                  ? 'bg-gradient-gold text-black'
                  : 'bg-primary-card text-text-primary'
              )}
            >
              <p className="text-sm">{message.content}</p>
              
              {/* AI 消息的元数据 */}
              {message.role === 'assistant' && message.metadata && (
                <div className="mt-2 space-y-2">
                  {message.metadata.confidence && (
                    <div className="text-xs text-text-secondary">
                      置信度: {Math.round(message.metadata.confidence * 100)}%
                    </div>
                  )}
                  
                  {message.metadata.estimated_reach && (
                    <div className="text-xs text-text-secondary">
                      预计传播: {message.metadata.estimated_reach} 人
                    </div>
                  )}
                  
                  {message.metadata.spectral_tags && message.metadata.spectral_tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {message.metadata.spectral_tags.map((tag, index) => (
                        <Tag key={index} variant="cyan" size="sm">
                          #{tag}
                        </Tag>
                      ))}
                    </div>
                  )}
                  
                  {message.metadata.suggested_content && message.metadata.confidence && message.metadata.confidence > 0.6 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setPreviewSeed({
                          id: generateId(),
                          creator: currentUser.id,
                          content: message.metadata!.suggested_content!,
                          content_type: 'text',
                          location: currentUser.location,
                          content_vector: [],
                          spectral_tags: message.metadata!.spectral_tags || [],
                          luminosity: Math.round(message.metadata!.confidence! * 100),
                          resonance_count: 0,
                          status: 'active',
                          created: new Date().toISOString(),
                          updated: new Date().toISOString()
                        })
                        setSelectedTags(message.metadata!.spectral_tags || [])
                        setShowPreview(true)
                      }}
                      className="mt-2"
                    >
                      <i className="fas fa-eye mr-1"></i>
                      预览星种
                    </Button>
                  )}
                </div>
              )}
              
              <div className="text-xs text-text-secondary mt-1">
                {formatDate(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-primary-card text-text-primary rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Loading size="sm" />
                <span className="text-sm">AI 思考中...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="border-t border-white/10 p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="描述你的想法..."
            disabled={isGenerating}
            className="flex-1 min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
          />
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isGenerating}
            className="self-end"
          >
            {isGenerating ? (
              <Loading size="sm" />
            ) : (
              <i className="fas fa-paper-plane"></i>
            )}
          </Button>
        </div>
      </div>

      {/* 星种预览模态框 */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="星种预览"
        size="lg"
      >
        {previewSeed && (
          <div className="space-y-4">
            {/* 内容预览 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                星种内容
              </label>
              <div className="bg-primary-secondary rounded-xl p-4 text-text-primary">
                {previewSeed.content}
              </div>
            </div>

            {/* 光谱标签 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                光谱标签
              </label>
              <div className="space-y-2">
                <div className="flex gap-2 flex-wrap">
                  {selectedTags.map((tag, index) => (
                    <Tag
                      key={index}
                      variant="cyan"
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      #{tag} <i className="fas fa-times ml-1"></i>
                    </Tag>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="添加自定义标签"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTag()
                      }
                    }}
                  />
                  <Button onClick={handleAddTag} variant="secondary">
                    <i className="fas fa-plus"></i>
                  </Button>
                </div>
              </div>
            </div>

            {/* 星种属性 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  光度值
                </label>
                <div className="bg-primary-secondary rounded-xl p-3 text-center">
                  <span className="text-2xl font-bold text-accent-gold">
                    {previewSeed.luminosity}°C
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  预计传播
                </label>
                <div className="bg-primary-secondary rounded-xl p-3 text-center">
                  <span className="text-2xl font-bold text-accent-red">
                    {Math.floor(Math.random() * 500) + 100}
                  </span>
                  <div className="text-sm text-text-secondary">人</div>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleCreateSeed}
                loading={isCreating}
                className="flex-1"
              >
                <i className="fas fa-rocket mr-2"></i>
                发射星种
              </Button>
              <Button
                onClick={() => setShowPreview(false)}
                variant="secondary"
              >
                取消
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
