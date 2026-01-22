import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook for playing notification sounds
 */
export function useNotificationSound(settings = {}) {
  const audioRef = useRef(null);
  const soundsRef = useRef({});

  // Default sound settings
  const {
    enabled = true,
    volume = 0.5,
    sounds = {
      info: '/sounds/notification-info.mp3',
      success: '/sounds/notification-success.mp3',
      warning: '/sounds/notification-warning.mp3',
      error: '/sounds/notification-error.mp3',
      system: '/sounds/notification-system.mp3',
    }
  } = settings;

  // Initialize audio objects
  useEffect(() => {
    if (!enabled) return;

    Object.entries(sounds).forEach(([type, url]) => {
      try {
        const audio = new Audio(url);
        audio.volume = volume;
        audio.preload = 'auto';
        
        // Handle audio loading errors gracefully
        audio.addEventListener('error', () => {
          console.warn(`Failed to load notification sound: ${url}`);
        });
        
        soundsRef.current[type] = audio;
      } catch (error) {
        console.warn(`Error creating audio for ${type}:`, error);
      }
    });

    return () => {
      // Cleanup audio objects
      Object.values(soundsRef.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
      soundsRef.current = {};
    };
  }, [enabled, volume, sounds]);

  // Update volume when settings change
  useEffect(() => {
    Object.values(soundsRef.current).forEach(audio => {
      if (audio) {
        audio.volume = volume;
      }
    });
  }, [volume]);

  const playSound = useCallback(async (type = 'info') => {
    if (!enabled) return false;

    const audio = soundsRef.current[type] || soundsRef.current.info;
    
    if (!audio) {
      console.warn(`No audio available for notification type: ${type}`);
      return false;
    }

    try {
      // Reset audio to beginning
      audio.currentTime = 0;
      
      // Play the sound
      const playPromise = audio.play();
      
      // Handle browsers that return a promise
      if (playPromise !== undefined) {
        await playPromise;
      }
      
      return true;
    } catch (error) {
      // This is common if user hasn't interacted with the page yet
      console.warn('Could not play notification sound:', error.message);
      return false;
    }
  }, [enabled]);

  // Test sound function
  const testSound = useCallback(async (type = 'info') => {
    return await playSound(type);
  }, [playSound]);

  return {
    playSound,
    testSound,
    isEnabled: enabled,
  };
}