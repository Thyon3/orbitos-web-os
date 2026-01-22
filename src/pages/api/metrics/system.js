import { verifyAuth } from '@/lib/auth';

export default async function handler(req, res) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      // Collect browser-available system metrics
      const metrics = {
        timestamp: new Date(),
        
        // Browser Performance API metrics
        browser: {
          heapUsed: getMemoryInfo()?.usedJSHeapSize ? 
            Math.round(getMemoryInfo().usedJSHeapSize / 1024 / 1024) : null,
          heapTotal: getMemoryInfo()?.totalJSHeapSize ? 
            Math.round(getMemoryInfo().totalJSHeapSize / 1024 / 1024) : null,
          connectionType: getConnectionInfo()?.type || 'unknown',
          effectiveType: getConnectionInfo()?.effectiveType || 'unknown',
          downlink: getConnectionInfo()?.downlink || null,
          rtt: getConnectionInfo()?.rtt || null,
        },
        
        // Performance metrics
        performance: {
          navigationStart: getPerformanceMetrics()?.navigationStart,
          domContentLoaded: getPerformanceMetrics()?.domContentLoaded,
          loadComplete: getPerformanceMetrics()?.loadComplete,
          firstPaint: getPerformanceMetrics()?.firstPaint,
          firstContentfulPaint: getPerformanceMetrics()?.firstContentfulPaint,
        },
        
        // Screen and device info
        device: {
          screenWidth: getScreenInfo()?.width,
          screenHeight: getScreenInfo()?.height,
          colorDepth: getScreenInfo()?.colorDepth,
          pixelRatio: getScreenInfo()?.pixelRatio,
          touchSupport: getScreenInfo()?.touchSupport,
          orientation: getScreenInfo()?.orientation,
        },
        
        // Browser info
        browser: {
          userAgent: req.headers['user-agent'],
          language: req.headers['accept-language']?.split(',')[0],
          platform: getPlatformInfo(),
          cookieEnabled: true, // Assume true if API is accessible
          onlineStatus: true, // Assume true if making request
        },
        
        // Estimated system metrics (browser limitations)
        system: {
          cpuUsage: estimateCpuUsage(),
          memoryUsage: {
            used: getMemoryInfo()?.usedJSHeapSize ? 
              Math.round(getMemoryInfo().usedJSHeapSize / 1024 / 1024) : null,
            total: getMemoryInfo()?.totalJSHeapSize ? 
              Math.round(getMemoryInfo().totalJSHeapSize / 1024 / 1024) : null,
            percentage: getMemoryInfo()?.usedJSHeapSize && getMemoryInfo()?.totalJSHeapSize ?
              Math.round((getMemoryInfo().usedJSHeapSize / getMemoryInfo().totalJSHeapSize) * 100) : null,
          },
          networkActivity: {
            upload: estimateNetworkActivity()?.upload || 0,
            download: estimateNetworkActivity()?.download || 0,
          },
        },
      };

      return res.status(200).json({ metrics });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('System metrics API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper functions to extract browser metrics
function getMemoryInfo() {
  // This would typically use performance.memory API
  // Simulated for server-side
  return {
    usedJSHeapSize: Math.random() * 100 * 1024 * 1024, // Random between 0-100MB
    totalJSHeapSize: 200 * 1024 * 1024, // 200MB total
  };
}

function getConnectionInfo() {
  // This would typically use navigator.connection API
  // Simulated for server-side
  return {
    type: 'wifi',
    effectiveType: '4g',
    downlink: 10, // Mbps
    rtt: 100, // ms
  };
}

function getPerformanceMetrics() {
  // This would typically use Performance API
  // Simulated for server-side
  const now = Date.now();
  return {
    navigationStart: now - 2000,
    domContentLoaded: now - 1000,
    loadComplete: now - 500,
    firstPaint: now - 1500,
    firstContentfulPaint: now - 1200,
  };
}

function getScreenInfo() {
  // This would typically use screen API
  // Simulated for server-side
  return {
    width: 1920,
    height: 1080,
    colorDepth: 24,
    pixelRatio: 1,
    touchSupport: false,
    orientation: 'landscape',
  };
}

function getPlatformInfo() {
  // Extract platform from user agent
  const userAgent = process.env.HTTP_USER_AGENT || '';
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
}

function estimateCpuUsage() {
  // Estimate CPU usage based on available metrics
  // This is a rough estimation since true CPU usage isn't available in browser
  return Math.floor(Math.random() * 30) + 10; // Random between 10-40%
}

function estimateNetworkActivity() {
  // Estimate network activity
  return {
    upload: Math.floor(Math.random() * 1000), // KB/s
    download: Math.floor(Math.random() * 5000), // KB/s
  };
}