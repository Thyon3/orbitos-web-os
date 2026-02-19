import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { usePWA } from '@/hooks/usePWA';

const OfflineIndicator = () => {
  const { theme } = useTheme();
  const { isOnline, syncData } = usePWA();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <div className="bg-orange-500 text-white px-4 py-3 text-center">
            <div className="flex items-center justify-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="font-medium">Offline Mode</span>
              </div>
              <span className="text-sm opacity-90">
                Some features may be limited
              </span>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Back online notification */}
      {isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <div className="bg-green-500 text-white px-4 py-2 text-center">
            <div className="flex items-center justify-center space-x-2">
              <span className="font-medium">Back Online</span>
              <button
                onClick={syncData}
                className="bg-white text-green-600 px-3 py-1 rounded text-sm font-medium hover:bg-green-50 transition-colors"
              >
                Sync Now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;
