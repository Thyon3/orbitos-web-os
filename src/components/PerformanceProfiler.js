import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

const PerformanceProfiler = () => {
  const { theme } = useTheme();
  const [isProfiling, setIsProfiling] = useState(false);
  const [profileData, setProfileData] = useState({
    cpu: [],
    memory: [],
    network: [],
    render: [],
    interactions: []
  });
  const [currentMetrics, setCurrentMetrics] = useState({
    fps: 60,
    memoryUsage: 0,
    cpuUsage: 0,
    networkLatency: 0,
    renderTime: 0
  });
  const [performanceIssues, setPerformanceIssues] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('cpu');
  const [timeRange, setTimeRange] = useState(60); // seconds
  
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const lastFrameTimeRef = useRef(Date.now());
  const frameCountRef = useRef(0);

  // Performance monitoring
  const startProfiling = useCallback(() => {
    setIsProfiling(true);
    startTimeRef.current = Date.now();
    frameCountRef.current = 0;
    lastFrameTimeRef.current = Date.now();
    
    // Start monitoring loop
    monitorPerformance();
  }, []);

  const stopProfiling = useCallback(() => {
    setIsProfiling(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Analyze performance data
    analyzePerformance();
  }, []);

  const monitorPerformance = useCallback(() => {
    if (!isProfiling) return;

    const currentTime = Date.now();
    const deltaTime = currentTime - lastFrameTimeRef.current;
    const fps = Math.round(1000 / deltaTime);
    
    frameCountRef.current++;
    lastFrameTimeRef.current = currentTime;

    // Collect metrics
    const metrics = {
      timestamp: currentTime,
      fps: fps,
      memoryUsage: getMemoryUsage(),
      cpuUsage: getCpuUsage(),
      networkLatency: getNetworkLatency(),
      renderTime: getRenderTime()
    };

    setCurrentMetrics(metrics);

    // Store historical data
    setProfileData(prev => {
      const newData = { ...prev };
      Object.keys(metrics).forEach(key => {
        if (key !== 'timestamp') {
          if (!newData[key]) newData[key] = [];
          newData[key].push({ timestamp: metrics.timestamp, value: metrics[key] });
          
          // Keep only last N data points
          if (newData[key].length > timeRange) {
            newData[key].shift();
          }
        }
      });
      return newData;
    });

    // Check for performance issues
    checkPerformanceIssues(metrics);

    animationFrameRef.current = requestAnimationFrame(monitorPerformance);
  }, [isProfiling, timeRange]);

  // Get memory usage (simulated)
  const getMemoryUsage = () => {
    if (performance.memory) {
      return Math.round((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100);
    }
    return Math.random() * 100;
  };

  // Get CPU usage (simulated)
  const getCpuUsage = () => {
    return Math.random() * 100;
  };

  // Get network latency (simulated)
  const getNetworkLatency = () => {
    return 10 + Math.random() * 40;
  };

  // Get render time (simulated)
  const getRenderTime = () => {
    return Math.random() * 16; // milliseconds
  };

  // Check for performance issues
  const checkPerformanceIssues = (metrics) => {
    const issues = [];

    if (metrics.fps < 30) {
      issues.push({
        type: 'low_fps',
        severity: 'high',
        message: `Low FPS detected: ${metrics.fps}`,
        timestamp: metrics.timestamp
      });
    }

    if (metrics.memoryUsage > 80) {
      issues.push({
        type: 'high_memory',
        severity: 'medium',
        message: `High memory usage: ${metrics.memoryUsage}%`,
        timestamp: metrics.timestamp
      });
    }

    if (metrics.cpuUsage > 90) {
      issues.push({
        type: 'high_cpu',
        severity: 'high',
        message: `High CPU usage: ${metrics.cpuUsage}%`,
        timestamp: metrics.timestamp
      });
    }

    if (metrics.renderTime > 16) {
      issues.push({
        type: 'slow_render',
        severity: 'medium',
        message: `Slow render time: ${metrics.renderTime.toFixed(2)}ms`,
        timestamp: metrics.timestamp
      });
    }

    if (issues.length > 0) {
      setPerformanceIssues(prev => [...prev.slice(-9), ...issues]);
    }
  };

  // Analyze performance and generate recommendations
  const analyzePerformance = () => {
    const recommendations = [];

    // Analyze FPS
    const avgFps = profileData.cpu.reduce((sum, point) => sum + point.value, 0) / profileData.cpu.length;
    if (avgFps < 45) {
      recommendations.push({
        type: 'fps',
        priority: 'high',
        title: 'Optimize Rendering',
        description: 'Consider reducing animations, optimizing images, or using virtual scrolling.',
        action: 'Review rendering performance'
      });
    }

    // Analyze memory
    const avgMemory = profileData.memory.reduce((sum, point) => sum + point.value, 0) / profileData.memory.length;
    if (avgMemory > 70) {
      recommendations.push({
        type: 'memory',
        priority: 'medium',
        title: 'Memory Optimization',
        description: 'Implement object pooling, reduce memory allocations, or clear unused objects.',
        action: 'Check memory leaks'
      });
    }

    // Analyze CPU
    const avgCpu = profileData.cpu.reduce((sum, point) => sum + point.value, 0) / profileData.cpu.length;
    if (avgCpu > 80) {
      recommendations.push({
        type: 'cpu',
        priority: 'high',
        title: 'CPU Optimization',
        description: 'Optimize algorithms, reduce computational complexity, or use web workers.',
        action: 'Profile CPU usage'
      });
    }

    setRecommendations(recommendations);
  };

  // Clear data
  const clearData = () => {
    setProfileData({
      cpu: [],
      memory: [],
      network: [],
      render: [],
      interactions: []
    });
    setPerformanceIssues([]);
    setRecommendations([]);
  };

  // Export data
  const exportData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      duration: timeRange,
      metrics: currentMetrics,
      profileData,
      issues: performanceIssues,
      recommendations
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-profile-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get metric color based on value
  const getMetricColor = (metric, value) => {
    const thresholds = {
      fps: { good: 55, warning: 30, bad: 0 },
      memory: { good: 50, warning: 80, bad: 100 },
      cpu: { good: 50, warning: 80, bad: 100 },
      network: { good: 50, warning: 100, bad: 200 },
      render: { good: 8, warning: 16, bad: 32 }
    };

    const threshold = thresholds[metric];
    if (value <= threshold.good) return 'text-green-500';
    if (value <= threshold.warning) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Render chart
  const renderChart = (data, metric) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(point => point.value));
    const minValue = Math.min(...data.map(point => point.value));
    const range = maxValue - minValue || 1;

    return (
      <div className="relative h-32">
        <svg className="w-full h-full">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(percent => (
            <line
              key={percent}
              x1="0"
              y1={`${percent}%`}
              x2="100%"
              y2={`${percent}%`}
              stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
              strokeWidth="1"
            />
          ))}
          
          {/* Data line */}
          <polyline
            points={data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((point.value - minValue) / range) * 100;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((point.value - minValue) / range) * 100;
            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={`${y}%`}
                r="2"
                fill="#3b82f6"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className={`h-full flex flex-col ${theme.app.bg}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${theme.app.toolbar}`}>
        <h2 className="text-lg font-semibold">Performance Profiler</h2>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className={`px-3 py-1 rounded ${theme.app.input}`}
          >
            <option value={30}>30s</option>
            <option value={60}>1m</option>
            <option value={300}>5m</option>
            <option value={600}>10m</option>
          </select>
          
          <button
            onClick={isProfiling ? stopProfiling : startProfiling}
            className={`px-4 py-2 rounded ${
              isProfiling 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isProfiling ? 'Stop' : 'Start'} Profiling
          </button>
          
          <button
            onClick={clearData}
            className={`px-3 py-1 rounded ${theme.app.button}`}
          >
            Clear
          </button>
          
          <button
            onClick={exportData}
            disabled={profileData.cpu.length === 0}
            className={`px-3 py-1 rounded ${theme.app.button} disabled:opacity-50`}
          >
            Export
          </button>
        </div>
      </div>

      {/* Current Metrics */}
      <div className="grid grid-cols-5 gap-4 p-4">
        <div className={`p-3 rounded-lg border ${theme.app.border}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">FPS</span>
            <span className={`text-lg font-bold ${getMetricColor('fps', currentMetrics.fps)}`}>
              {currentMetrics.fps}
            </span>
          </div>
          <div className="text-xs text-gray-500">Frames per second</div>
        </div>
        
        <div className={`p-3 rounded-lg border ${theme.app.border}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Memory</span>
            <span className={`text-lg font-bold ${getMetricColor('memory', currentMetrics.memoryUsage)}`}>
              {currentMetrics.memoryUsage}%
            </span>
          </div>
          <div className="text-xs text-gray-500">Heap usage</div>
        </div>
        
        <div className={`p-3 rounded-lg border ${theme.app.border}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">CPU</span>
            <span className={`text-lg font-bold ${getMetricColor('cpu', currentMetrics.cpuUsage)}`}>
              {currentMetrics.cpuUsage}%
            </span>
          </div>
          <div className="text-xs text-gray-500">Processor usage</div>
        </div>
        
        <div className={`p-3 rounded-lg border ${theme.app.border}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Network</span>
            <span className={`text-lg font-bold ${getMetricColor('network', currentMetrics.networkLatency)}`}>
              {currentMetrics.networkLatency}ms
            </span>
          </div>
          <div className="text-xs text-gray-500">Latency</div>
        </div>
        
        <div className={`p-3 rounded-lg border ${theme.app.border}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Render</span>
            <span className={`text-lg font-bold ${getMetricColor('render', currentMetrics.renderTime)}`}>
              {currentMetrics.renderTime.toFixed(1)}ms
            </span>
          </div>
          <div className="text-xs text-gray-500">Frame time</div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Charts */}
        <div className="flex-1 p-4">
          <div className="flex space-x-2 mb-4">
            {['cpu', 'memory', 'network', 'render'].map(metric => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-3 py-1 rounded ${
                  selectedMetric === metric 
                    ? theme.app.dropdown_item_hover 
                    : theme.app.button_subtle_hover
                }`}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>
          
          <div className={`p-4 rounded-lg border ${theme.app.border} h-64`}>
            <h3 className="font-semibold mb-3">
              {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Performance
            </h3>
            {renderChart(profileData[selectedMetric], selectedMetric)}
          </div>
        </div>

        {/* Issues and Recommendations */}
        <div className="w-80 border-l border-gray-200 p-4 space-y-4">
          {/* Performance Issues */}
          <div>
            <h3 className="font-semibold mb-3">Performance Issues</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {performanceIssues.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  <p>No issues detected</p>
                </div>
              ) : (
                performanceIssues.map((issue, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-2 rounded border ${
                      issue.severity === 'high' ? 'border-red-500 bg-red-50' :
                      issue.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{issue.message}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(issue.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        issue.severity === 'high' ? 'bg-red-500' :
                        issue.severity === 'medium' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`} />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="font-semibold mb-3">Recommendations</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recommendations.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  <p>Start profiling to get recommendations</p>
                </div>
              ) : (
                recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded border ${theme.app.border}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-sm">{rec.title}</div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">{rec.description}</div>
                    <button className={`text-xs px-2 py-1 rounded ${theme.app.button}`}>
                      {rec.action}
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceProfiler;
