import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

const SystemMonitor = () => {
  const { theme } = useTheme();
  const [systemData, setSystemData] = useState({
    cpu: { usage: 0, cores: 4, temperature: 45 },
    memory: { used: 0, total: 8192, available: 8192 },
    disk: { used: 0, total: 500, available: 500 },
    network: { upload: 0, download: 0, latency: 0 },
    processes: [],
    uptime: 0,
    loadAverage: [0, 0, 0]
  });
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(1000);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const canvasRef = useRef(null);

  // Simulate system data updates
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      // Simulate CPU usage
      const cpuUsage = Math.random() * 100;
      const cpuCores = 4;
      const cpuTemp = 35 + Math.random() * 30;

      // Simulate memory usage
      const memoryUsed = Math.random() * 6000;
      const memoryTotal = 8192;
      const memoryAvailable = memoryTotal - memoryUsed;

      // Simulate disk usage
      const diskUsed = 200 + Math.random() * 100;
      const diskTotal = 500;
      const diskAvailable = diskTotal - diskUsed;

      // Simulate network
      const networkUpload = Math.random() * 10;
      const networkDownload = Math.random() * 50;
      const networkLatency = 10 + Math.random() * 40;

      // Simulate processes
      const processes = [
        { pid: 1234, name: 'chrome', cpu: Math.random() * 20, memory: Math.random() * 1000, status: 'Running' },
        { pid: 5678, name: 'node', cpu: Math.random() * 15, memory: Math.random() * 500, status: 'Running' },
        { pid: 9012, name: 'firefox', cpu: Math.random() * 25, memory: Math.random() * 800, status: 'Running' },
        { pid: 3456, name: 'vscode', cpu: Math.random() * 10, memory: Math.random() * 600, status: 'Running' },
        { pid: 7890, name: 'spotify', cpu: Math.random() * 5, memory: Math.random() * 300, status: 'Running' },
        { pid: 2345, name: 'slack', cpu: Math.random() * 8, memory: Math.random() * 400, status: 'Running' },
        { pid: 6789, name: 'docker', cpu: Math.random() * 12, memory: Math.random() * 700, status: 'Running' },
        { pid: parseInt('0123', 10), name: 'nginx', cpu: Math.random() * 3, memory: Math.random() * 200, status: 'Running' }
      ];

      // Simulate uptime and load average
      const uptime = Date.now() - performance.timing.navigationStart;
      const loadAverage = [
        Math.random() * 2,
        Math.random() * 2,
        Math.random() * 2
      ];

      setSystemData({
        cpu: { usage: cpuUsage, cores: cpuCores, temperature: cpuTemp },
        memory: { used: memoryUsed, total: memoryTotal, available: memoryAvailable },
        disk: { used: diskUsed, total: diskTotal, available: diskAvailable },
        network: { upload: networkUpload, download: networkDownload, latency: networkLatency },
        processes: processes.sort((a, b) => b.cpu - a.cpu),
        uptime,
        loadAverage
      });
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isMonitoring, refreshInterval]);

  // Kill process
  const killProcess = (pid) => {
    setSystemData(prev => ({
      ...prev,
      processes: prev.processes.filter(p => p.pid !== pid)
    }));
    setSelectedProcess(null);
  };

  // Format bytes
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format time
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  // Draw performance chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = theme === 'dark' ? '#374151' : '#e5e7eb';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 10; i++) {
      const y = (height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw CPU usage line
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const cpuHistory = Array.from({ length: 50 }, () => Math.random() * 100);
    cpuHistory.forEach((usage, index) => {
      const x = (width / 50) * index;
      const y = height - (usage / 100) * height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw memory usage line
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const memoryHistory = Array.from({ length: 50 }, () => Math.random() * 100);
    memoryHistory.forEach((usage, index) => {
      const x = (width / 50) * index;
      const y = height - (usage / 100) * height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  }, [theme, systemData.cpu.usage]);

  return (
    <div className={`h-full flex flex-col ${theme.app.bg}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${theme.app.toolbar}`}>
        <h2 className="text-lg font-semibold">System Monitor</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`px-3 py-1 rounded ${isMonitoring ? 'bg-red-500 text-white' : theme.app.button
              }`}
          >
            {isMonitoring ? 'Stop' : 'Start'}
          </button>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className={`px-3 py-1 rounded ${theme.app.input}`}
          >
            <option value={500}>0.5s</option>
            <option value={1000}>1s</option>
            <option value={2000}>2s</option>
            <option value={5000}>5s</option>
          </select>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-4 gap-4 p-4">
        {/* CPU */}
        <div className={`p-4 rounded-lg ${theme.app.bg} border ${theme.app.border}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">CPU</h3>
            <span className="text-2xl">💻</span>
          </div>
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Usage</span>
              <span>{systemData.cpu.usage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${systemData.cpu.usage}%` }}
              />
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {systemData.cpu.cores} cores • {systemData.cpu.temperature.toFixed(1)}°C
          </div>
        </div>

        {/* Memory */}
        <div className={`p-4 rounded-lg ${theme.app.bg} border ${theme.app.border}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Memory</h3>
            <span className="text-2xl">🧠</span>
          </div>
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Usage</span>
              <span>{((systemData.memory.used / systemData.memory.total) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(systemData.memory.used / systemData.memory.total) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {formatBytes(systemData.memory.used)} / {formatBytes(systemData.memory.total)}
          </div>
        </div>

        {/* Disk */}
        <div className={`p-4 rounded-lg ${theme.app.bg} border ${theme.app.border}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Disk</h3>
            <span className="text-2xl">💾</span>
          </div>
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Usage</span>
              <span>{((systemData.disk.used / systemData.disk.total) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(systemData.disk.used / systemData.disk.total) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {systemData.disk.used.toFixed(1)} GB / {systemData.disk.total} GB
          </div>
        </div>

        {/* Network */}
        <div className={`p-4 rounded-lg ${theme.app.bg} border ${theme.app.border}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Network</h3>
            <span className="text-2xl">🌐</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>↑ Upload</span>
              <span>{systemData.network.upload.toFixed(1)} MB/s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>↓ Download</span>
              <span>{systemData.network.download.toFixed(1)} MB/s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Latency</span>
              <span>{systemData.network.latency.toFixed(0)} ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="px-4 pb-4">
        <div className={`p-4 rounded-lg ${theme.app.bg} border ${theme.app.border}`}>
          <h3 className="font-semibold mb-2">Performance History</h3>
          <canvas
            ref={canvasRef}
            width={600}
            height={200}
            className="w-full h-48"
          />
          <div className="flex items-center justify-center space-x-4 mt-2 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-1" />
              <span>CPU</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1" />
              <span>Memory</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Info and Processes */}
      <div className="flex-1 flex px-4 pb-4 space-x-4">
        {/* System Info */}
        <div className={`w-1/3 p-4 rounded-lg ${theme.app.bg} border ${theme.app.border}`}>
          <h3 className="font-semibold mb-4">System Information</h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium">Uptime</div>
              <div className="text-xs text-gray-500">{formatTime(systemData.uptime)}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Load Average</div>
              <div className="text-xs text-gray-500">
                {systemData.loadAverage.map(load => load.toFixed(2)).join(', ')}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Processes</div>
              <div className="text-xs text-gray-500">{systemData.processes.length} running</div>
            </div>
            <div>
              <div className="text-sm font-medium">CPU Temperature</div>
              <div className="text-xs text-gray-500">{systemData.cpu.temperature.toFixed(1)}°C</div>
            </div>
            <div>
              <div className="text-sm font-medium">Available Memory</div>
              <div className="text-xs text-gray-500">{formatBytes(systemData.memory.available)}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Available Disk</div>
              <div className="text-xs text-gray-500">{systemData.disk.available.toFixed(1)} GB</div>
            </div>
          </div>
        </div>

        {/* Processes */}
        <div className={`flex-1 p-4 rounded-lg ${theme.app.bg} border ${theme.app.border}`}>
          <h3 className="font-semibold mb-4">Processes</h3>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">PID</th>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">CPU %</th>
                  <th className="text-left p-2">Memory</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {systemData.processes.map(process => (
                  <tr
                    key={process.pid}
                    className={`border-b cursor-pointer ${theme.app.button_subtle_hover}`}
                    onClick={() => setSelectedProcess(process)}
                  >
                    <td className="p-2">{process.pid}</td>
                    <td className="p-2 font-medium">{process.name}</td>
                    <td className="p-2">
                      <div className="flex items-center">
                        <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${process.cpu}%` }}
                          />
                        </div>
                        <span>{process.cpu.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="p-2">{formatBytes(process.memory)}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${process.status === 'Running' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {process.status}
                      </span>
                    </td>
                    <td className="p-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          killProcess(process.pid);
                        }}
                        className="px-2 py-1 rounded bg-red-500 text-white text-xs"
                      >
                        Kill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Process Details Modal */}
      <AnimatePresence>
        {selectedProcess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setSelectedProcess(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${theme.app.bg} rounded-lg shadow-xl p-6 max-w-md w-full`}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Process Details</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium">Process ID</div>
                  <div className="text-sm">{selectedProcess.pid}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Name</div>
                  <div className="text-sm">{selectedProcess.name}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">CPU Usage</div>
                  <div className="text-sm">{selectedProcess.cpu.toFixed(2)}%</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Memory Usage</div>
                  <div className="text-sm">{formatBytes(selectedProcess.memory)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Status</div>
                  <div className="text-sm">{selectedProcess.status}</div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => {
                    killProcess(selectedProcess.pid);
                    setSelectedProcess(null);
                  }}
                  className="px-4 py-2 rounded bg-red-500 text-white"
                >
                  Kill Process
                </button>
                <button
                  onClick={() => setSelectedProcess(null)}
                  className={`px-4 py-2 rounded ${theme.app.button}`}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SystemMonitor;
