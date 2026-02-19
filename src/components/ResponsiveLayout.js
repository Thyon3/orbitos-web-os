import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';

const ResponsiveLayout = ({ children }) => {
  const { theme } = useTheme();
  const { state } = useApp();
  const [viewportSize, setViewportSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });
  const [orientation, setOrientation] = useState('landscape');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [layoutMode, setLayoutMode] = useState('desktop');

  // Breakpoints
  const breakpoints = {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  };

  // Update viewport size
  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setViewportSize({ width, height });
      setOrientation(width > height ? 'landscape' : 'portrait');
      setIsMobile(width < breakpoints.mobile);
      setIsTablet(width >= breakpoints.mobile && width < breakpoints.tablet);
      
      // Determine layout mode
      if (width < breakpoints.mobile) {
        setLayoutMode('mobile');
      } else if (width < breakpoints.tablet) {
        setLayoutMode('tablet');
      } else {
        setLayoutMode('desktop');
      }
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  // Get window layout based on viewport
  const getWindowLayout = (window) => {
    const baseLayout = {
      position: 'absolute',
      backgroundColor: theme.app.bg,
      border: `1px solid ${theme.app.border}`,
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    };

    switch (layoutMode) {
      case 'mobile':
        return {
          ...baseLayout,
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          borderRadius: 0,
          border: 'none'
        };

      case 'tablet':
        return {
          ...baseLayout,
          width: Math.min(800, viewportSize.width - 40),
          height: Math.min(600, viewportSize.height - 100),
          top: 20,
          left: (viewportSize.width - Math.min(800, viewportSize.width - 40)) / 2
        };

      case 'desktop':
      default:
        return {
          ...baseLayout,
          width: window.width || 800,
          height: window.height || 600,
          top: window.y || 100,
          left: window.x || 200
        };
    }
  };

  // Get taskbar layout
  const getTaskbarLayout = () => {
    switch (layoutMode) {
      case 'mobile':
        return {
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          backgroundColor: theme.taskbar.bg,
          borderTop: `1px solid ${theme.app.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 10px',
          zIndex: 9999
        };

      case 'tablet':
        return {
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50px',
          backgroundColor: theme.taskbar.bg,
          borderTop: `1px solid ${theme.app.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 15px',
          zIndex: 9999
        };

      case 'desktop':
      default:
        return {
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '48px',
          backgroundColor: theme.taskbar.bg,
          borderTop: `1px solid ${theme.app.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 10px',
          zIndex: 9999
        };
    }
  };

  // Get desktop layout
  const getDesktopLayout = () => {
    switch (layoutMode) {
      case 'mobile':
        return {
          width: '100%',
          height: '100%',
          backgroundImage: theme.desktop.background,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          overflow: 'hidden'
        };

      case 'tablet':
        return {
          width: '100%',
          height: '100%',
          backgroundImage: theme.desktop.background,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: '20px'
        };

      case 'desktop':
      default:
        return {
          width: '100%',
          height: '100%',
          backgroundImage: theme.desktop.background,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          overflow: 'hidden'
        };
    }
  };

  // Render children with responsive props
  const renderChildren = () => {
    return React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          viewportSize,
          layoutMode,
          isMobile,
          isTablet,
          orientation,
          getWindowLayout,
          getTaskbarLayout,
          getDesktopLayout
        });
      }
      return child;
    });
  };

  // Mobile-specific components
  const MobileNavigation = () => {
    if (layoutMode !== 'mobile') return null;

    return (
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="fixed top-0 left-0 w-64 h-full bg-gray-900 text-white z-50"
      >
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">OrbitOS</h3>
          <nav className="space-y-2">
            {state.openApps.map(app => (
              <button
                key={app.id}
                onClick={() => {/* Handle app switch */}}
                className={`w-full text-left p-3 rounded ${
                  state.activeApp === app.id ? 'bg-blue-600' : 'hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                    {app.icon || '📱'}
                  </div>
                  <span>{app.name}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </motion.div>
    );
  };

  // Tablet-specific components
  const TabletNavigation = () => {
    if (layoutMode !== 'tablet') return null;

    return (
      <motion.div
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 h-16 bg-gray-900 text-white z-50 flex items-center justify-between px-4"
      >
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">OrbitOS</h3>
        </div>
        <div className="flex items-center space-x-2">
          {state.openApps.slice(0, 5).map(app => (
            <button
              key={app.id}
              onClick={() => {/* Handle app switch */}}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                state.activeApp === app.id ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              {app.icon || '📱'}
            </button>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Mobile/Tablet Navigation */}
      <MobileNavigation />
      <TabletNavigation />

      {/* Responsive Content */}
      <div className="w-full h-full">
        {renderChildren()}
      </div>

      {/* Viewport Info (for development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs z-50">
          <div>Layout: {layoutMode}</div>
          <div>Viewport: {viewportSize.width}x{viewportSize.height}</div>
          <div>Orientation: {orientation}</div>
          <div>Apps: {state.openApps.length}</div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveLayout;
