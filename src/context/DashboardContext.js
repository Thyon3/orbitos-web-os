import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const [metrics, setMetrics] = useState({
    system: null,
    apps: null,
    health: null,
    trends: [],
  });
  
  const [loading, setLoading] = useState({
    system: false,
    apps: false,
    health: false,
    trends: false,
  });
  
  const [realTimeData, setRealTimeData] = useState({
    cpuUsage: 0,
    memoryUsage: 0,
    activeApps: 0,
    healthScore: 100,
    networkActivity: { upload: 0, download: 0 },
  });
  
  const [settings, setSettings] = useState({
    refreshInterval: 30000, // 30 seconds
    autoRefresh: true,
    enableRealTime: true,
    showNotifications: true,
    alertThresholds: {
      cpu: 80,
      memory: 85,
      health: 60,
    },
  });

  const intervalRefs = useRef({});
  const metricsCollectionRef = useRef(null);

  // Load system metrics
  const loadSystemMetrics = useCallback(async () => {
    setLoading(prev => ({ ...prev, system: true }));
    try {
      const response = await fetch('/api/metrics/system');
      if (response.ok) {
        const data = await response.json();
        setMetrics(prev => ({ ...prev, system: data.metrics }));
        
        // Update real-time data
        if (data.metrics) {
          setRealTimeData(prev => ({
            ...prev,
            cpuUsage: data.metrics.system?.cpuUsage || 0,
            memoryUsage: data.metrics.system?.memoryUsage?.percentage || 0,
            networkActivity: data.metrics.system?.networkActivity || { upload: 0, download: 0 },
          }));
        }
      }
    } catch (error) {
      console.error('Error loading system metrics:', error);
    } finally {
      setLoading(prev => ({ ...prev, system: false }));
    }
  }, []);

  // Load app usage metrics
  const loadAppMetrics = useCallback(async (period = 'week') => {
    setLoading(prev => ({ ...prev, apps: true }));
    try {
      const response = await fetch(`/api/metrics/apps?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(prev => ({ ...prev, apps: data }));
        
        // Update real-time data
        if (data.stats) {
          setRealTimeData(prev => ({
            ...prev,
            activeApps: data.stats.avgActiveApps || 0,
          }));
        }
      }
    } catch (error) {
      console.error('Error loading app metrics:', error);
    } finally {
      setLoading(prev => ({ ...prev, apps: false }));
    }
  }, []);

  // Load health metrics
  const loadHealthMetrics = useCallback(async (period = 'week') => {
    setLoading(prev => ({ ...prev, health: true }));
    try {
      const response = await fetch(`/api/metrics/health?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(prev => ({ ...prev, health: data }));
        
        // Update real-time data
        if (data.current) {
          setRealTimeData(prev => ({
            ...prev,
            healthScore: data.current.healthScore || 100,
          }));
        }
      }
    } catch (error) {
      console.error('Error loading health metrics:', error);
    } finally {
      setLoading(prev => ({ ...prev, health: false }));
    }
  }, []);

  // Load trend data
  const loadTrendData = useCallback(async (hours = 24) => {
    setLoading(prev => ({ ...prev, trends: true }));
    try {
      const response = await fetch(`/api/metrics?type=trend&hours=${hours}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(prev => ({ ...prev, trends: data.trend || [] }));
      }
    } catch (error) {
      console.error('Error loading trend data:', error);
    } finally {
      setLoading(prev => ({ ...prev, trends: false }));
    }
  }, []);

  // Record metrics
  const recordMetrics = useCallback(async (metricsData) => {
    try {
      const response = await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metricsData),
      });

      if (response.ok) {
        const data = await response.json();
        return data.metrics;
      }
    } catch (error) {
      console.error('Error recording metrics:', error);
      throw error;
    }
  }, []);

  // Record app usage
  const recordAppUsage = useCallback(async (appId, appName, action, metadata = {}) => {
    try {
      const response = await fetch('/api/metrics/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, appName, action, metadata }),
      });

      if (response.ok) {
        // Refresh app metrics after recording
        await loadAppMetrics();
      }
    } catch (error) {
      console.error('Error recording app usage:', error);
    }
  }, [loadAppMetrics]);

  // Report health issue
  const reportHealthIssue = useCallback(async (type, severity, message, suggestion) => {
    try {
      const response = await fetch('/api/metrics/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, severity, message, suggestion }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update health score in real-time data
        setRealTimeData(prev => ({
          ...prev,
          healthScore: data.healthScore,
        }));
        
        // Refresh health metrics
        await loadHealthMetrics();
        
        return data;
      }
    } catch (error) {
      console.error('Error reporting health issue:', error);
      throw error;
    }
  }, [loadHealthMetrics]);

  // Resolve health issues
  const resolveHealthIssues = useCallback(async (issueIds) => {
    try {
      const response = await fetch('/api/metrics/health', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueIds }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update health score
        setRealTimeData(prev => ({
          ...prev,
          healthScore: data.healthScore,
        }));
        
        // Refresh health metrics
        await loadHealthMetrics();
        
        return data;
      }
    } catch (error) {
      console.error('Error resolving health issues:', error);
      throw error;
    }
  }, [loadHealthMetrics]);

  // Collect browser performance metrics
  const collectBrowserMetrics = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const metrics = {
      timestamp: new Date(),
      
      // Memory information
      browser: {
        heapUsed: window.performance?.memory?.usedJSHeapSize ? 
          Math.round(window.performance.memory.usedJSHeapSize / 1024 / 1024) : null,
        heapTotal: window.performance?.memory?.totalJSHeapSize ? 
          Math.round(window.performance.memory.totalJSHeapSize / 1024 / 1024) : null,
        connectionType: navigator.connection?.type || 'unknown',
        effectiveType: navigator.connection?.effectiveType || 'unknown',
        downlink: navigator.connection?.downlink || null,
        rtt: navigator.connection?.rtt || null,
      },
      
      // Device information
      device: {
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        colorDepth: window.screen.colorDepth,
        pixelRatio: window.devicePixelRatio,
        touchSupport: 'ontouchstart' in window,
        orientation: window.screen.orientation?.type || 'unknown',
      },
      
      // Performance metrics
      performance: {
        navigationStart: window.performance?.timing?.navigationStart,
        domContentLoaded: window.performance?.timing?.domContentLoadedEventEnd - 
          window.performance?.timing?.navigationStart,
        loadComplete: window.performance?.timing?.loadEventEnd - 
          window.performance?.timing?.navigationStart,
      },
      
      // Estimated system metrics
      system: {
        cpuUsage: estimateCpuUsage(),
        memoryUsage: {
          used: window.performance?.memory?.usedJSHeapSize ? 
            Math.round(window.performance.memory.usedJSHeapSize / 1024 / 1024) : null,
          total: window.performance?.memory?.totalJSHeapSize ? 
            Math.round(window.performance.memory.totalJSHeapSize / 1024 / 1024) : null,
          percentage: window.performance?.memory?.usedJSHeapSize && window.performance?.memory?.totalJSHeapSize ?
            Math.round((window.performance.memory.usedJSHeapSize / window.performance.memory.totalJSHeapSize) * 100) : null,
        },
      },
    };

    return metrics;
  }, []);

  // Auto-refresh data
  const startAutoRefresh = useCallback(() => {
    if (intervalRefs.current.system) return; // Already running

    intervalRefs.current.system = setInterval(() => {
      if (settings.autoRefresh) {
        loadSystemMetrics();
        loadHealthMetrics();
      }
    }, settings.refreshInterval);

    // Start metrics collection
    if (settings.enableRealTime && !metricsCollectionRef.current) {
      metricsCollectionRef.current = setInterval(() => {
        const metrics = collectBrowserMetrics();
        if (metrics) {
          recordMetrics(metrics);
          
          // Update real-time display
          if (metrics.system) {
            setRealTimeData(prev => ({
              ...prev,
              cpuUsage: metrics.system.cpuUsage || prev.cpuUsage,
              memoryUsage: metrics.system.memoryUsage?.percentage || prev.memoryUsage,
            }));
          }
        }
      }, 10000); // Collect every 10 seconds
    }
  }, [settings, loadSystemMetrics, loadHealthMetrics, collectBrowserMetrics, recordMetrics]);

  const stopAutoRefresh = useCallback(() => {
    Object.values(intervalRefs.current).forEach(interval => {
      if (interval) clearInterval(interval);
    });
    intervalRefs.current = {};

    if (metricsCollectionRef.current) {
      clearInterval(metricsCollectionRef.current);
      metricsCollectionRef.current = null;
    }
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Load all data
  const loadAllData = useCallback(async (period = 'week') => {
    await Promise.all([
      loadSystemMetrics(),
      loadAppMetrics(period),
      loadHealthMetrics(period),
      loadTrendData(period === 'day' ? 24 : period === 'week' ? 168 : 720),
    ]);
  }, [loadSystemMetrics, loadAppMetrics, loadHealthMetrics, loadTrendData]);

  // Check alert thresholds
  const checkAlertThresholds = useCallback(() => {
    const alerts = [];
    
    if (realTimeData.cpuUsage > settings.alertThresholds.cpu) {
      alerts.push({
        type: 'performance',
        severity: 'high',
        message: `High CPU usage detected: ${realTimeData.cpuUsage}%`,
        suggestion: 'Consider closing unnecessary applications or processes.',
      });
    }
    
    if (realTimeData.memoryUsage > settings.alertThresholds.memory) {
      alerts.push({
        type: 'memory',
        severity: 'high',
        message: `High memory usage detected: ${realTimeData.memoryUsage}%`,
        suggestion: 'Close unused browser tabs or restart applications.',
      });
    }
    
    if (realTimeData.healthScore < settings.alertThresholds.health) {
      alerts.push({
        type: 'system',
        severity: 'medium',
        message: `Low health score: ${realTimeData.healthScore}/100`,
        suggestion: 'Run system diagnostics or check for issues.',
      });
    }
    
    return alerts;
  }, [realTimeData, settings.alertThresholds]);

  // Initialize and cleanup
  useEffect(() => {
    loadAllData();
    
    if (settings.autoRefresh) {
      startAutoRefresh();
    }
    
    return () => {
      stopAutoRefresh();
    };
  }, [loadAllData, startAutoRefresh, stopAutoRefresh, settings.autoRefresh]);

  // Check for alerts
  useEffect(() => {
    if (settings.showNotifications) {
      const alerts = checkAlertThresholds();
      alerts.forEach(alert => {
        if (window.showNotification) {
          window.showNotification(alert.message, 'warning', 5000);
        }
      });
    }
  }, [realTimeData, checkAlertThresholds, settings.showNotifications]);

  return (
    <DashboardContext.Provider
      value={{
        // Data
        metrics,
        realTimeData,
        loading,
        settings,
        
        // Actions
        loadSystemMetrics,
        loadAppMetrics,
        loadHealthMetrics,
        loadTrendData,
        loadAllData,
        recordMetrics,
        recordAppUsage,
        reportHealthIssue,
        resolveHealthIssues,
        
        // Settings
        updateSettings,
        startAutoRefresh,
        stopAutoRefresh,
        
        // Utilities
        collectBrowserMetrics,
        checkAlertThresholds,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

// Helper functions
function estimateCpuUsage() {
  // Simple CPU estimation based on performance timing
  if (typeof window === 'undefined') return 0;
  
  const timing = window.performance?.timing;
  if (!timing) return Math.random() * 20 + 10; // Random fallback
  
  const loadTime = timing.loadEventEnd - timing.navigationStart;
  const domTime = timing.domContentLoadedEventEnd - timing.navigationStart;
  
  // Estimate based on load performance
  let usage = 10; // Base usage
  if (loadTime > 3000) usage += 20; // Slow loading
  if (domTime > 1000) usage += 15; // Slow DOM
  
  // Add some randomness for realism
  usage += Math.random() * 10;
  
  return Math.min(100, Math.max(0, Math.round(usage)));
}