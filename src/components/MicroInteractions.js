import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

const MicroInteractions = () => {
  const { theme } = useTheme();
  const [ripples, setRipples] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadingStates, setLoadingStates] = useState({});
  const [hoverStates, setHoverStates] = useState({});
  const [progressBars, setProgressBars] = useState({});

  // Ripple effect for clicks
  useEffect(() => {
    const handleClick = (e) => {
      const button = e.target.closest('[data-ripple]');
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const ripple = {
        id: Date.now(),
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        size: Math.max(rect.width, rect.height)
      };

      setRipples(prev => [...prev, ripple]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== ripple.id));
      }, 600);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Loading states management
  const setLoading = (id, loading) => {
    setLoadingStates(prev => ({ ...prev, [id]: loading }));
  };

  const setHover = (id, hovering) => {
    setHoverStates(prev => ({ ...prev, [id]: hovering }));
  };

  const setProgress = (id, progress) => {
    setProgressBars(prev => ({ ...prev, [id]: progress }));
  };

  // Show notification
  const showNotification = (message, type = 'info', duration = 3000) => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };

    setNotifications(prev => [notification, ...prev]);

    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, duration);
    }
  };

  // Enhanced button component with ripple effect
  const EnhancedButton = ({ children, onClick, loading = false, className = '', ...props }) => {
    const [isHovered, setIsHovered] = useState(false);
    const buttonId = React.useId();

    return (
      <motion.button
        {...props}
        className={`relative overflow-hidden transition-all duration-200 ${className}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={onClick}
        data-ripple
        disabled={loading}
      >
        {/* Ripple effects */}
        <AnimatePresence>
          {ripples.map(ripple => (
            <motion.div
              key={ripple.id}
              className="absolute bg-white/30 rounded-full pointer-events-none"
              initial={{
                width: 0,
                height: 0,
                x: ripple.x,
                y: ripple.y,
                opacity: 0.5
              }}
              animate={{
                width: ripple.size * 2,
                height: ripple.size * 2,
                x: ripple.x - ripple.size,
                y: ripple.y - ripple.size,
                opacity: 0
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          ))}
        </AnimatePresence>

        {/* Loading spinner */}
        <AnimatePresence>
          {loading && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Button content */}
        <motion.span
          animate={{ opacity: loading ? 0.5 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.span>

        {/* Hover effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
          initial={{ x: '-100%' }}
          animate={{ x: isHovered ? '200%' : '-100%' }}
          transition={{ duration: 0.6 }}
        />
      </motion.button>
    );
  };

  // Progress bar component
  const ProgressBar = ({ id, value = 0, max = 100, showLabel = true, color = 'blue' }) => {
    const percentage = Math.min((value / max) * 100, 100);
    
    return (
      <div className="w-full">
        {showLabel && (
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{Math.round(percentage)}%</span>
          </div>
        )}
        <div className={`h-2 bg-gray-200 rounded-full overflow-hidden`}>
          <motion.div
            className={`h-full bg-gradient-to-r from-${color}-400 to-${color}-600 rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    );
  };

  // Floating action button
  const FloatingActionButton = ({ icon, onClick, position = 'bottom-right' }) => {
    const positions = {
      'bottom-right': 'fixed bottom-6 right-6',
      'bottom-left': 'fixed bottom-6 left-6',
      'top-right': 'fixed top-6 right-6',
      'top-left': 'fixed top-6 left-6'
    };

    return (
      <motion.button
        className={`${positions[position]} w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white`}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
      >
        <motion.span
          animate={{ rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          {icon}
        </motion.span>
      </motion.button>
    );
  };

  // Skeleton loader
  const SkeletonLoader = ({ lines = 3, className = '' }) => (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className="h-4 bg-gray-200 rounded"
          initial={{ width: '0%' }}
          animate={{ width: `${100 - (i * 10)}%` }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
        />
      ))}
    </div>
  );

  // Tooltip component
  const Tooltip = ({ children, content, position = 'top' }) => {
    const [isVisible, setIsVisible] = useState(false);

    const positions = {
      top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
    };

    return (
      <div className="relative inline-block">
        <div
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          {children}
        </div>
        
        <AnimatePresence>
          {isVisible && (
            <motion.div
              className={`absolute ${positions[position]} ${theme.app.dropdown_bg} text-white text-sm px-2 py-1 rounded shadow-lg whitespace-nowrap z-50`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {content}
              <div className={`absolute ${position === 'top' ? 'top-full left-1/2 transform -translate-x-1/2 -mt-1' : 
                              position === 'bottom' ? 'bottom-full left-1/2 transform -translate-x-1/2 -mb-1' :
                              position === 'left' ? 'left-full top-1/2 transform -translate-y-1/2 -ml-1' :
                              'right-full top-1/2 transform -translate-y-1/2 -mr-1'} 
                            w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-current`} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Badge component
  const Badge = ({ children, count, color = 'red', animated = true }) => (
    <div className="relative inline-block">
      {children}
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            className={`absolute -top-2 -right-2 w-5 h-5 bg-${color}-500 text-white text-xs rounded-full flex items-center justify-center`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {count > 99 ? '99+' : count}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Notification container
  const NotificationContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map(notification => (
          <motion.div
            key={notification.id}
            className={`${theme.notification} p-4 rounded-lg shadow-lg min-w-80`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' && '✅'}
                {notification.type === 'error' && '❌'}
                {notification.type === 'warning' && '⚠️'}
                {notification.type === 'info' && 'ℹ️'}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
                <p className="text-xs opacity-75 mt-1">
                  {notification.timestamp.toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                className="ml-3 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  // Page transition wrapper
  const PageTransition = ({ children }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );

  // Stagger animation for lists
  const StaggerContainer = ({ children, staggerDelay = 0.1 }) => (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {children}
    </motion.div>
  );

  const StaggerItem = ({ children }) => (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );

  return {
    EnhancedButton,
    ProgressBar,
    FloatingActionButton,
    SkeletonLoader,
    Tooltip,
    Badge,
    NotificationContainer,
    PageTransition,
    StaggerContainer,
    StaggerItem,
    showNotification,
    setLoading,
    setHover,
    setProgress,
    notifications
  };
};

export default MicroInteractions;
