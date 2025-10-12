// src/client/components/monitoring/MonitoringDashboard.tsx
// 基于《德道经》"无为而无不为"的监控仪表板组件

import { createSignal, createEffect, onMount } from 'solid-js';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorBoundary from '../ui/ErrorBoundary';

interface MonitoringData {
  overview: {
    performance: any;
    errors: any;
    users: any;
    strains: any;
    infections: any;
  };
  health: {
    overall: boolean;
    performance: boolean;
    errors: boolean;
    database: boolean;
  };
  alerts: any[];
}

export default function MonitoringDashboard() {
  const [data, setData] = createSignal<MonitoringData | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [timeRange, setTimeRange] = createSignal('24h');
  const [autoRefresh, setAutoRefresh] = createSignal(true);

  // 获取监控数据
  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/monitoring/dashboard?timeRange=${timeRange()}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || '获取监控数据失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setLoading(false);
    }
  };

  // 自动刷新
  createEffect(() => {
    if (autoRefresh()) {
      const interval = setInterval(fetchMonitoringData, 30000); // 30秒刷新
      return () => clearInterval(interval);
    }
  });

  onMount(() => {
    fetchMonitoringData();
  });

  // 手动刷新
  const handleRefresh = () => {
    fetchMonitoringData();
  };

  // 切换时间范围
  const handleTimeRangeChange = (newRange: string) => {
    setTimeRange(newRange);
    fetchMonitoringData();
  };

  // 切换自动刷新
  const handleAutoRefreshToggle = () => {
    setAutoRefresh(!autoRefresh());
  };

  return (
    <ErrorBoundary>
      <div class="monitoring-dashboard">
        <div class="dashboard-header">
          <div class="header-left">
            <h1>📊 系统监控仪表板</h1>
            <p>实时监控FluLink系统性能和健康状况</p>
          </div>
          <div class="header-controls">
            <div class="time-range-selector">
              <label>时间范围:</label>
              <select 
                value={timeRange()} 
                onChange={(e) => handleTimeRangeChange(e.currentTarget.value)}
              >
                <option value="1h">最近1小时</option>
                <option value="24h">最近24小时</option>
                <option value="7d">最近7天</option>
                <option value="30d">最近30天</option>
              </select>
            </div>
            <div class="refresh-controls">
              <label>
                <input 
                  type="checkbox" 
                  checked={autoRefresh()} 
                  onChange={handleAutoRefreshToggle}
                />
                自动刷新
              </label>
              <button onClick={handleRefresh} class="refresh-btn">
                🔄 刷新
              </button>
            </div>
          </div>
        </div>

        <Show when={loading()}>
          <div class="loading-container">
            <LoadingSpinner text="正在加载监控数据..." />
          </div>
        </Show>

        <Show when={error()}>
          <div class="error-container">
            <div class="error-content">
              <h3>❌ 加载失败</h3>
              <p>{error()}</p>
              <button onClick={handleRefresh} class="retry-btn">
                重试
              </button>
            </div>
          </div>
        </Show>

        <Show when={data() && !loading()}>
          <div class="dashboard-content">
            {/* 系统健康状态 */}
            <div class="health-section">
              <h2>🏥 系统健康状态</h2>
              <div class="health-grid">
                <div class={`health-card ${data()?.health.overall ? 'healthy' : 'unhealthy'}`}>
                  <div class="health-icon">
                    {data()?.health.overall ? '✅' : '❌'}
                  </div>
                  <div class="health-info">
                    <h3>整体状态</h3>
                    <p>{data()?.health.overall ? '健康' : '异常'}</p>
                  </div>
                </div>
                <div class={`health-card ${data()?.health.performance ? 'healthy' : 'unhealthy'}`}>
                  <div class="health-icon">
                    {data()?.health.performance ? '⚡' : '🐌'}
                  </div>
                  <div class="health-info">
                    <h3>性能状态</h3>
                    <p>{data()?.health.performance ? '正常' : '缓慢'}</p>
                  </div>
                </div>
                <div class={`health-card ${data()?.health.errors ? 'healthy' : 'unhealthy'}`}>
                  <div class="health-icon">
                    {data()?.health.errors ? '✅' : '⚠️'}
                  </div>
                  <div class="health-info">
                    <h3>错误状态</h3>
                    <p>{data()?.health.errors ? '正常' : '异常'}</p>
                  </div>
                </div>
                <div class={`health-card ${data()?.health.database ? 'healthy' : 'unhealthy'}`}>
                  <div class="health-icon">
                    {data()?.health.database ? '🗄️' : '💥'}
                  </div>
                  <div class="health-info">
                    <h3>数据库状态</h3>
                    <p>{data()?.health.database ? '正常' : '异常'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 性能指标 */}
            <div class="metrics-section">
              <h2>📈 性能指标</h2>
              <div class="metrics-grid">
                <div class="metric-card">
                  <h3>API响应时间</h3>
                  <div class="metric-value">
                    {data()?.overview.performance?.averageResponseTime?.toFixed(2) || '0'}ms
                  </div>
                  <div class="metric-trend">
                    平均响应时间
                  </div>
                </div>
                <div class="metric-card">
                  <h3>错误率</h3>
                  <div class="metric-value">
                    {data()?.overview.performance?.errorRate?.toFixed(2) || '0'}%
                  </div>
                  <div class="metric-trend">
                    API错误率
                  </div>
                </div>
                <div class="metric-card">
                  <h3>总请求数</h3>
                  <div class="metric-value">
                    {data()?.overview.performance?.totalRequests || '0'}
                  </div>
                  <div class="metric-trend">
                    请求总数
                  </div>
                </div>
                <div class="metric-card">
                  <h3>最大响应时间</h3>
                  <div class="metric-value">
                    {data()?.overview.performance?.maxResponseTime?.toFixed(2) || '0'}ms
                  </div>
                  <div class="metric-trend">
                    峰值响应时间
                  </div>
                </div>
              </div>
            </div>

            {/* 错误统计 */}
            <div class="errors-section">
              <h2>🚨 错误统计</h2>
              <div class="errors-grid">
                <div class="error-stat-card">
                  <h3>总错误数</h3>
                  <div class="error-count">
                    {data()?.overview.errors?.totalErrors || '0'}
                  </div>
                </div>
                <div class="error-stat-card">
                  <h3>严重错误</h3>
                  <div class="error-count error-critical">
                    {data()?.overview.errors?.errorLevels?.error || '0'}
                  </div>
                </div>
                <div class="error-stat-card">
                  <h3>警告</h3>
                  <div class="error-count error-warning">
                    {data()?.overview.errors?.errorLevels?.warning || '0'}
                  </div>
                </div>
                <div class="error-stat-card">
                  <h3>信息</h3>
                  <div class="error-count error-info">
                    {data()?.overview.errors?.errorLevels?.info || '0'}
                  </div>
                </div>
              </div>
            </div>

            {/* 业务指标 */}
            <div class="business-section">
              <h2>📊 业务指标</h2>
              <div class="business-grid">
                <div class="business-card">
                  <h3>用户统计</h3>
                  <div class="business-stats">
                    <div class="stat-item">
                      <span class="stat-label">总用户:</span>
                      <span class="stat-value">{data()?.overview.users?.total || '0'}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">新用户:</span>
                      <span class="stat-value">{data()?.overview.users?.new || '0'}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">增长率:</span>
                      <span class="stat-value">{data()?.overview.users?.growth?.toFixed(2) || '0'}%</span>
                    </div>
                  </div>
                </div>
                <div class="business-card">
                  <h3>毒株统计</h3>
                  <div class="business-stats">
                    <div class="stat-item">
                      <span class="stat-label">总毒株:</span>
                      <span class="stat-value">{data()?.overview.strains?.total || '0'}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">新毒株:</span>
                      <span class="stat-value">{data()?.overview.strains?.new || '0'}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">活跃毒株:</span>
                      <span class="stat-value">{data()?.overview.strains?.active || '0'}</span>
                    </div>
                  </div>
                </div>
                <div class="business-card">
                  <h3>感染统计</h3>
                  <div class="business-stats">
                    <div class="stat-item">
                      <span class="stat-label">总感染:</span>
                      <span class="stat-value">{data()?.overview.infections?.total || '0'}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">新感染:</span>
                      <span class="stat-value">{data()?.overview.infections?.new || '0'}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">活跃感染:</span>
                      <span class="stat-value">{data()?.overview.infections?.active || '0'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 告警信息 */}
            <Show when={data()?.alerts && data()?.alerts.length > 0}>
              <div class="alerts-section">
                <h2>⚠️ 系统告警</h2>
                <div class="alerts-list">
                  {data()?.alerts.map((alert, index) => (
                    <div class={`alert-item alert-${alert.type}`} key={index}>
                      <div class="alert-icon">
                        {alert.type === 'error' ? '❌' : '⚠️'}
                      </div>
                      <div class="alert-content">
                        <h4>{alert.message}</h4>
                        <p>当前值: {alert.value} | 阈值: {alert.threshold}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Show>
          </div>
        </Show>
      </div>
    </ErrorBoundary>
  );
}

function Show(props: { when: boolean; children: any }) {
  return props.when ? props.children : null;
}
