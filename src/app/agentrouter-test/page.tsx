'use client'

import { useState } from 'react'

export default function AgentRouterTest() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAgentRouter = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/agentrouter', {
        method: 'GET',
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to test AgentRouter' })
    }
    setLoading(false)
  }

  const testPropagationPath = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/agentrouter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'propagation-path',
          data: {
            seed: {
              id: 'test-seed',
              content: '这是一个测试内容',
            },
            context: {
              timeOfDay: 14,
              userActivityLevel: 0.8,
              geographicContext: {
                lat: 39.9042,
                lng: 116.4074,
                radius: 10,
              },
              socialContext: {
                activeUsers: 100,
                trendingTopics: ['科技', '生活'],
              },
            },
          },
        }),
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to calculate propagation path' })
    }
    setLoading(false)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">AgentRouter API 测试</h1>
      
      <div className="space-x-4 mb-6">
        <button
          onClick={testAgentRouter}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          测试健康检查
        </button>
        
        <button
          onClick={testPropagationPath}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
        >
          测试传播路径计算
        </button>
      </div>

      {loading && <p>加载中...</p>}

      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">结果:</h2>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}