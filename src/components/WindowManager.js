import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';

const WindowManager = () => {
  const { state, dispatch } = useApp();
  const { theme } = useTheme();
  const [virtualDesktops, setVirtualDesktops] = useState([
    { id: 1, name: 'Desktop 1', windows: [], wallpaper: '/backgrounds/orbitos-default.jpg' },
    { id: 2, name: 'Desktop 2', windows: [], wallpaper: '/backgrounds/nebula.png' },
    { id: 3, name: 'Desktop 3', windows: [], wallpaper: '/backgrounds/cosmic.jpg' },
    { id: 4, name: 'Desktop 4', windows: [], wallpaper: '/backgrounds/stars.jpg' }
  ]);
  const [currentDesktop, setCurrentDesktop] = useState(1);
  const [windowGroups, setWindowGroups] = useState([]);
  const [tabGroups, setTabGroups] = useState([]);
  const [snappedWindows, setSnappedWindows] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [draggedWindow, setDraggedWindow] = useState(null);
  const [dropZone, setDropZone] = useState(null);
  
  const containerRef = useRef(null);

  // Initialize virtual desktops with current windows
  useEffect(() => {
    setVirtualDesktops(prev => {
      const updated = [...prev];
      updated[0].windows = state.openApps.map(app => app.id);
      return updated;
    });
  }, [state.openApps]);

  // Window snapping zones
  const snapZones = {
    'top-left': { x: 0, y: 0, width: '50%', height: '50%' },
    'top-right': { x: '50%', y: 0, width: '50%', height: '50%' },
    'bottom-left': { x: 0, y: '50%', width: '50%', height: '50%' },
    'bottom-right': { x: '50%', y: '50%', width: '50%', height: '50%' },
    'left': { x: 0, y: 0, width: '50%', height: '100%' },
    'right': { x: '50%', y: 0, width: '50%', height: '100%' },
    'top': { x: 0, y: 0, width: '100%', height: '50%' },
    'bottom': { x: 0, y: '50%', width: '100%', height: '50%' },
    'center': { x: '25%', y: '25%', width: '50%', height: '50%' },
    'maximize': { x: 0, y: 0, width: '100%', height: '100%' }
  };

  // Switch virtual desktop
  const switchDesktop = (desktopId) => {
    const currentDesktopData = virtualDesktops.find(d => d.id === currentDesktop);
    const newDesktopData = virtualDesktops.find(d => d.id === desktopId);
    
    // Move current windows to current desktop
    setVirtualDesktops(prev => prev.map(desktop => 
      desktop.id === currentDesktop 
        ? { ...desktop, windows: state.openApps.map(app => app.id) }
        : desktop
    ));
    
    // Restore windows from new desktop
    const windowsToRestore = newDesktopData.windows;
    windowsToRestore.forEach(windowId => {
      const app = state.openApps.find(app => app.id === windowId);
      if (app) {
        dispatch({ type: 'OPEN_APP', payload: app });
      }
    });
    
    setCurrentDesktop(desktopId);
  };

  // Create window group
  const createWindowGroup = (windowIds) => {
    const groupId = `group-${Date.now()}`;
    const group = {
      id: groupId,
      name: `Group ${windowGroups.length + 1}`,
      windows: windowIds,
      layout: 'grid',
      createdAt: new Date().toISOString()
    };
    
    setWindowGroups(prev => [...prev, group]);
    
    // Update windows with group info
    windowIds.forEach(windowId => {
      dispatch({ type: 'ADD_WINDOW_TO_GROUP', payload: { windowId, groupId } });
    });
    
    return groupId;
  };

  // Create tab group
  const createTabGroup = (windowIds) => {
    const tabGroupId = `tabs-${Date.now()}`;
    const tabGroup = {
      id: tabGroupId,
      name: 'Tab Group',
      windows: windowIds,
      activeTab: windowIds[0],
      createdAt: new Date().toISOString()
    };
    
    setTabGroups(prev => [...prev, tabGroup]);
    
    // Update windows with tab group info
    windowIds.forEach(windowId => {
      dispatch({ type: 'CREATE_TAB_GROUP', payload: { tabGroup, windowIds } });
    });
    
    return tabGroupId;
  };

  // Snap window to zone
  const snapWindow = (windowId, zone) => {
    const snapConfig = snapZones[zone];
    if (!snapConfig) return;
    
    setSnappedWindows(prev => ({
      ...prev,
      [windowId]: { zone, config: snapConfig }
    }));
    
    // Apply snap styles to window
    const windowElement = document.querySelector(`[data-window-id="${windowId}"]`);
    if (windowElement) {
      Object.assign(windowElement.style, {
        position: 'fixed',
        left: snapConfig.x,
        top: snapConfig.y,
        width: snapConfig.width,
        height: snapConfig.height,
        zIndex: 1000
      });
    }
  };

  // Unsnap window
  const unsnapWindow = (windowId) => {
    setSnappedWindows(prev => {
      const newSnapped = { ...prev };
      delete newSnapped[windowId];
      return newSnapped;
    });
    
    // Remove snap styles from window
    const windowElement = document.querySelector(`[data-window-id="${windowId}"]`);
    if (windowElement) {
      windowElement.style.position = '';
      windowElement.style.left = '';
      windowElement.style.top = '';
      windowElement.style.width = '';
      windowElement.style.height = '';
      windowElement.style.zIndex = '';
    }
  };

  // Handle window drag start
  const handleDragStart = (windowId) => {
    setIsDragging(true);
    setDraggedWindow(windowId);
  };

  // Handle window drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedWindow(null);
    setDropZone(null);
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const width = rect.width;
    const height = rect.height;
    
    // Determine drop zone
    let zone = null;
    
    if (y < height * 0.1) {
      if (x < width * 0.1) zone = 'top-left';
      else if (x > width * 0.9) zone = 'top-right';
      else zone = 'top';
    } else if (y > height * 0.9) {
      if (x < width * 0.1) zone = 'bottom-left';
      else if (x > width * 0.9) zone = 'bottom-right';
      else zone = 'bottom';
    } else if (x < width * 0.1) {
      zone = 'left';
    } else if (x > width * 0.9) {
      zone = 'right';
    } else {
      zone = 'center';
    }
    
    setDropZone(zone);
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    
    if (draggedWindow && dropZone) {
      snapWindow(draggedWindow, dropZone);
    }
    
    handleDragEnd();
  };

  // Picture-in-Picture
  const createPiPWindow = (windowId) => {
    const app = state.openApps.find(app => app.id === windowId);
    if (!app) return;
    
    // Create a small floating window
    const pipWindow = {
      id: `pip-${windowId}`,
      originalId: windowId,
      name: `PiP - ${app.name}`,
      component: app.component,
      isPiP: true,
      position: { x: window.innerWidth - 320, y: window.innerHeight - 240 },
      size: { width: 300, height: 200 },
      alwaysOnTop: true
    };
    
    dispatch({ type: 'OPEN_APP', payload: pipWindow });
  };

  // Cascade windows
  const cascadeWindows = () => {
    const windows = state.openApps.filter(app => !app.isMinimized);
    const baseX = 50;
    const baseY = 50;
    const offsetX = 30;
    const offsetY = 30;
    
    windows.forEach((app, index) => {
      const windowElement = document.querySelector(`[data-window-id="${app.id}"]`);
      if (windowElement) {
        Object.assign(windowElement.style, {
          position: 'absolute',
          left: `${baseX + (index * offsetX)}px`,
          top: `${baseY + (index * offsetY)}px`,
          width: '600px',
          height: '400px',
          zIndex: 1000 + index
        });
      }
    });
  };

  // Tile windows horizontally
  const tileWindowsHorizontal = () => {
    const windows = state.openApps.filter(app => !app.isMinimized);
    const windowCount = windows.length;
    const windowWidth = `${100 / windowCount}%`;
    
    windows.forEach((app, index) => {
      const windowElement = document.querySelector(`[data-window-id="${app.id}"]`);
      if (windowElement) {
        Object.assign(windowElement.style, {
          position: 'fixed',
          left: `${index * (100 / windowCount)}%`,
          top: '0',
          width: windowWidth,
          height: '100%',
          zIndex: 1000
        });
      }
    });
  };

  // Tile windows vertically
  const tileWindowsVertical = () => {
    const windows = state.openApps.filter(app => !app.isMinimized);
    const windowCount = windows.length;
    const windowHeight = `${100 / windowCount}%`;
    
    windows.forEach((app, index) => {
      const windowElement = document.querySelector(`[data-window-id="${app.id}"]`);
      if (windowElement) {
        Object.assign(windowElement.style, {
          position: 'fixed',
          left: '0',
          top: `${index * (100 / windowCount)}%`,
          width: '100%',
          height: windowHeight,
          zIndex: 1000
        });
      }
    });
  };

  // Grid layout
  const gridLayout = () => {
    const windows = state.openApps.filter(app => !app.isMinimized);
    const count = windows.length;
    
    if (count === 0) return;
    
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const windowWidth = `${100 / cols}%`;
    const windowHeight = `${100 / rows}%`;
    
    windows.forEach((app, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      const windowElement = document.querySelector(`[data-window-id="${app.id}"]`);
      if (windowElement) {
        Object.assign(windowElement.style, {
          position: 'fixed',
          left: `${col * (100 / cols)}%`,
          top: `${row * (100 / rows)}%`,
          width: windowWidth,
          height: windowHeight,
          zIndex: 1000
        });
      }
    });
  };

  return (
    <div className={`h-full flex flex-col ${theme.app.bg}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${theme.app.toolbar}`}>
        <h2 className="text-lg font-semibold">Window Manager</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={cascadeWindows}
            className={`px-3 py-1 rounded ${theme.app.button} text-sm`}
          >
            Cascade
          </button>
          <button
            onClick={tileWindowsHorizontal}
            className={`px-3 py-1 rounded ${theme.app.button} text-sm`}
          >
            Tile H
          </button>
          <button
            onClick={tileWindowsVertical}
            className={`px-3 py-1 rounded ${theme.app.button} text-sm`}
          >
            Tile V
          </button>
          <button
            onClick={gridLayout}
            className={`px-3 py-1 rounded ${theme.app.button} text-sm`}
          >
            Grid
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Virtual Desktops */}
        <div className="w-1/4 border-r border-gray-200 p-4">
          <h3 className="font-semibold mb-4">Virtual Desktops</h3>
          <div className="space-y-2">
            {virtualDesktops.map(desktop => (
              <div
                key={desktop.id}
                className={`p-3 rounded cursor-pointer ${
                  currentDesktop === desktop.id 
                    ? theme.app.dropdown_item_hover 
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => switchDesktop(desktop.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded bg-gray-200" />
                    <div>
                      <div className="font-medium">{desktop.name}</div>
                      <div className="text-xs text-gray-500">
                        {desktop.windows.length} windows
                      </div>
                    </div>
                  </div>
                  {currentDesktop === desktop.id && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Window Groups */}
          <h3 className="font-semibold mt-6 mb-4">Window Groups</h3>
          <div className="space-y-2">
            {windowGroups.map(group => (
              <div key={group.id} className={`p-3 rounded ${theme.app.bg} border ${theme.app.border}`}>
                <div className="font-medium">{group.name}</div>
                <div className="text-xs text-gray-500">
                  {group.windows.length} windows • {group.layout}
                </div>
              </div>
            ))}
          </div>

          {/* Tab Groups */}
          <h3 className="font-semibold mt-6 mb-4">Tab Groups</h3>
          <div className="space-y-2">
            {tabGroups.map(tabGroup => (
              <div key={tabGroup.id} className={`p-3 rounded ${theme.app.bg} border ${theme.app.border}`}>
                <div className="font-medium">{tabGroup.name}</div>
                <div className="text-xs text-gray-500">
                  {tabGroup.windows.length} tabs
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Area */}
        <div
          ref={containerRef}
          className="flex-1 relative"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Drop zone overlay */}
          <AnimatePresence>
            {isDragging && dropZone && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none"
                style={{
                  left: snapZones[dropZone].x,
                  top: snapZones[dropZone].y,
                  width: snapZones[dropZone].width,
                  height: snapZones[dropZone].height,
                  backgroundColor: '#3b82f6',
                  border: '2px dashed #1d4ed8'
                }}
              />
            )}
          </AnimatePresence>

          {/* Current windows */}
          <div className="p-4">
            <h3 className="font-semibold mb-4">
              Current Desktop Windows ({state.openApps.filter(app => !app.isMinimized).length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {state.openApps.filter(app => !app.isMinimized).map(app => (
                <div
                  key={app.id}
                  className={`p-4 rounded ${theme.app.bg} border ${theme.app.border} cursor-move`}
                  draggable
                  onDragStart={() => handleDragStart(app.id)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{app.name}</span>
                    <div className="flex space-x-1">
                      {snappedWindows[app.id] && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                          Snapped
                        </span>
                      )}
                      {app.alwaysOnTop && (
                        <span className="text-xs bg-green-100 text-green-800 px-1 rounded">
                          Always on Top
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => snapWindow(app.id, 'maximize')}
                      className={`px-2 py-1 rounded text-xs ${theme.app.button}`}
                    >
                      Maximize
                    </button>
                    <button
                      onClick={() => unsnapWindow(app.id)}
                      className={`px-2 py-1 rounded text-xs ${theme.app.button}`}
                      disabled={!snappedWindows[app.id]}
                    >
                      Unsnap
                    </button>
                    <button
                      onClick={() => createPiPWindow(app.id)}
                      className={`px-2 py-1 rounded text-xs ${theme.app.button}`}
                    >
                      PiP
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Snapped Windows */}
          {Object.entries(snappedWindows).length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <h3 className="font-semibold mb-4">Snapped Windows</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(snappedWindows).map(([windowId, snapInfo]) => {
                  const app = state.openApps.find(app => app.id === windowId);
                  if (!app) return null;
                  
                  return (
                    <div
                      key={windowId}
                      className={`p-4 rounded ${theme.app.bg} border ${theme.app.border}`}
                    >
                      <div className="font-medium">{app.name}</div>
                      <div className="text-sm text-gray-500 mb-2">
                        Zone: {snapInfo.zone}
                      </div>
                      <button
                        onClick={() => unsnapWindow(windowId)}
                        className={`px-2 py-1 rounded text-xs ${theme.app.button}`}
                      >
                        Unsnap
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className={`p-4 border-t ${theme.app.border} text-sm text-gray-500`}>
        <div className="flex justify-between">
          <span>
            Drag windows to snap zones • Right-click for more options
          </span>
          <span>
            {state.openApps.length} total windows • {Object.keys(snappedWindows).length} snapped
          </span>
        </div>
      </div>
    </div>
  );
};

export default WindowManager;
