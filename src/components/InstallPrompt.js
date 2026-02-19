import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { usePWA } from '@/hooks/usePWA';

const InstallPrompt = () => {
  const { theme } = useTheme();
  const { showInstallButton, installApp, isInstalled, isOnline } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Don't show if already installed, dismissed, or offline
  if (isInstalled || dismissed || !showInstallButton || !isOnline) {
    return null;
  }

  const handleInstall = async () => {
    await installApp();
    setDismissed(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Store dismissal in localStorage
    localStorage.setItem('orbitos-install-dismissed', Date.now());
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        >
          <div className={`${theme.app.bg} rounded-lg shadow-2xl border ${theme.app.border} p-4`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">🚀</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Install OrbitOS</h3>
                  <p className={`text-sm ${theme.text.secondary}`}>
                    Get the full desktop experience
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className={`p-1 rounded ${theme.app.button_subtle_hover}`}
              >
                ✕
              </button>
            </div>

            {/* Features */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm">Works offline</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm">Faster loading</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm">Desktop shortcuts</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm">Push notifications</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={handleInstall}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Install App
              </button>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className={`px-4 py-2 rounded-lg ${theme.app.button}`}
              >
                {showDetails ? 'Hide' : 'Details'}
              </button>
            </div>

            {/* Details */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <div className={`text-sm ${theme.text.secondary} space-y-2`}>
                    <p>
                      <strong>OrbitOS</strong> is a Progressive Web App that can be installed on your device for a native app experience.
                    </p>
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium mb-2">Installation benefits:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Access from your app drawer/home screen</li>
                        <li>• Works offline without internet connection</li>
                        <li>• Faster startup and better performance</li>
                        <li>• Receive push notifications</li>
                        <li>• Full-screen experience</li>
                      </ul>
                    </div>
                    <p className="text-xs mt-2">
                      No download required - just tap "Install App" to add OrbitOS to your device.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;
