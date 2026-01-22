import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Memory, 
  Wifi, 
  Monitor, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Settings,
  BarChart3,
  PieChart,
  Clock,
  Zap
} from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';

export default function SystemDashboard() {
  const {
    metrics,
    realTimeData,
    loading,
    settings,
    loadAllData,
    updateSettings,
  } = useDashboard();

  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadAllData(selectedPeriod);
  }, [selectedPeriod, loadAllData]);

  const handleRefresh = () => {
    loadAllData(selectedPeriod);
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const getHealthColor = (score) => {
    if (score >= 90) return 'text-green-500 bg-green-50 border-green-200';
    if (score >= 75) return 'text-blue-500 bg-blue-50 border-blue-200';
    if (score >= 60) return 'text-yellow-500 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-500 bg-orange-50 border-orange-200';
    return 'text-red-500 bg-red-50 border-red-200';
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatUptime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const isLoading = loading.system || loading.apps || loading.health;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                System Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Real-time system monitoring and performance analytics
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Period Selector */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              {['day', 'week', 'month'].map((period) => (
                <button
                  key={period}
                  onClick={() => handlePeriodChange(period)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    selectedPeriod === period
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>

            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${
                showSettings ? 'bg-gray-100' : 'hover:bg-gray-100'
              }`}
              title="Settings"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Refresh Interval
                </label>
                <select
                  value={settings.refreshInterval / 1000}
                  onChange={(e) => updateSettings({ refreshInterval: parseInt(e.target.value) * 1000 })}
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="10">10 seconds</option>
                  <option value="30">30 seconds</option>
                  <option value="60">1 minute</option>
                  <option value="300">5 minutes</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoRefresh}
                    onChange={(e) => updateSettings({ autoRefresh: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Auto Refresh</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showNotifications}
                    onChange={(e) => updateSettings({ showNotifications: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Alerts</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPU Alert Threshold
                </label>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={settings.alertThresholds.cpu}
                  onChange={(e) => updateSettings({ 
                    alertThresholds: { 
                      ...settings.alertThresholds, 
                      cpu: parseInt(e.target.value) 
                    }
                  })}
                  className="w-full h-2 bg-gray-200 rounded-lg"
                />
                <span className="text-xs text-gray-500">{settings.alertThresholds.cpu}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* System Health */}
            <div className={`p-6 border rounded-lg ${getHealthColor(realTimeData.healthScore)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">System Health</span>
                </div>
                <div className="text-2xl font-bold">
                  {realTimeData.healthScore}
                </div>
              </div>
              <div className="text-sm opacity-75">
                {realTimeData.healthScore >= 90 ? 'Excellent' :
                 realTimeData.healthScore >= 75 ? 'Good' :
                 realTimeData.healthScore >= 60 ? 'Fair' : 'Poor'}
              </div>
              {metrics.health?.current?.issues?.length > 0 && (
                <div className="mt-2 text-xs">
                  {metrics.health.current.issues.length} active issue{metrics.health.current.issues.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            {/* CPU Usage */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-gray-900">CPU Usage</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {realTimeData.cpuUsage}%
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(realTimeData.cpuUsage)}`}
                  style={{ width: `${realTimeData.cpuUsage}%` }}
                />
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {realTimeData.cpuUsage > settings.alertThresholds.cpu ? 'High usage detected' : 'Normal'}
              </div>
            </div>

            {/* Memory Usage */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Memory className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-gray-900">Memory</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {realTimeData.memoryUsage}%
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(realTimeData.memoryUsage)}`}
                  style={{ width: `${realTimeData.memoryUsage}%` }}
                />
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {metrics.system?.browser?.heapUsed && (
                  `${formatBytes(metrics.system.browser.heapUsed * 1024 * 1024)} used`
                )}
              </div>
            </div>

            {/* Active Apps */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-purple-500" />
                  <span className="font-medium text-gray-900">Active Apps</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(realTimeData.activeApps)}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {metrics.apps?.stats?.avgTotalSessions && (
                  `${Math.round(metrics.apps.stats.avgTotalSessions)} avg sessions`
                )}
              </div>
              {metrics.apps?.stats?.avgSessionTime && (
                <div className="mt-1 text-xs text-gray-400">
                  {Math.round(metrics.apps.stats.avgSessionTime)}min avg session
                </div>
              )}
            </div>
          </div>

          {/* Network Activity & Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Network Activity */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Wifi className="w-5 h-5 text-indigo-500" />
                <span className="font-medium text-gray-900">Network</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Download</span>
                  <span className="text-sm font-medium">
                    {formatBytes(realTimeData.networkActivity.download * 1024)}/s
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Upload</span>
                  <span className="text-sm font-medium">
                    {formatBytes(realTimeData.networkActivity.upload * 1024)}/s
                  </span>
                </div>
                {metrics.system?.browser?.effectiveType && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Connection: {metrics.system.browser.effectiveType.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Score */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <span className="font-medium text-gray-900">Performance</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Responsiveness</span>
                  <span className="text-sm font-medium">
                    {metrics.health?.current?.responsiveness || 100}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Stability</span>
                  <span className="text-sm font-medium">
                    {metrics.health?.current?.stability || 100}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Efficiency</span>
                  <span className="text-sm font-medium">
                    {metrics.health?.current?.efficiency || 100}%
                  </span>
                </div>
              </div>
            </div>

            {/* Uptime */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-cyan-500" />
                <span className="font-medium text-gray-900">Uptime</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {formatUptime(metrics.health?.current?.uptime || 0)}
              </div>
              <div className="text-sm text-gray-500">
                {metrics.health?.statistics?.totalCrashes === 0 ? 'No crashes' : 
                 `${metrics.health.statistics.totalCrashes} crashes`}
              </div>
            </div>

            {/* Storage Usage */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <HardDrive className="w-5 h-5 text-orange-500" />
                <span className="font-medium text-gray-900">Storage</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cache</span>
                  <span className="text-sm font-medium">
                    {metrics.system?.browser?.heapUsed ? 
                     formatBytes(metrics.system.browser.heapUsed * 1024 * 1024) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Available</span>
                  <span className="text-sm font-medium">
                    {metrics.system?.browser?.heapTotal ? 
                     formatBytes((metrics.system.browser.heapTotal - metrics.system.browser.heapUsed) * 1024 * 1024) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Issues */}
          {metrics.health?.current?.issues && metrics.health.current.issues.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900">Active Issues</h3>
              </div>
              <div className="space-y-3">
                {metrics.health.current.issues.map((issue, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      issue.severity === 'critical' ? 'bg-red-50 border-red-200' :
                      issue.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                      issue.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 text-xs rounded ${
                            issue.severity === 'critical' ? 'bg-red-100 text-red-700' :
                            issue.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                            issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {issue.severity.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">
                            {issue.type}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {issue.message}
                        </p>
                        {issue.suggestion && (
                          <p className="text-sm text-gray-600">
                            💡 {issue.suggestion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Quick Stats
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.health?.statistics?.avgHealthScore ? 
                   Math.round(metrics.health.statistics.avgHealthScore) : 100}
                </div>
                <div className="text-sm text-gray-500">Avg Health Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {metrics.apps?.stats?.avgActiveApps ? 
                   Math.round(metrics.apps.stats.avgActiveApps) : 0}
                </div>
                <div className="text-sm text-gray-500">Avg Active Apps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {metrics.apps?.stats?.avgSessionTime ? 
                   Math.round(metrics.apps.stats.avgSessionTime) : 0}m
                </div>
                <div className="text-sm text-gray-500">Avg Session Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {metrics.health?.statistics?.avgErrorRate ? 
                   Math.round(metrics.health.statistics.avgErrorRate) : 0}
                </div>
                <div className="text-sm text-gray-500">Error Rate/Hour</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}