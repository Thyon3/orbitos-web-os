import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const WallpaperContext = createContext();

export const useWallpaper = () => {
  const context = useContext(WallpaperContext);
  if (!context) {
    throw new Error('useWallpaper must be used within WallpaperProvider');
  }
  return context;
};

export const WallpaperProvider = ({ children }) => {
  const [wallpapers, setWallpapers] = useState([]);
  const [activeWallpaper, setActiveWallpaper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [slideshow, setSlideshow] = useState({
    enabled: false,
    interval: 30, // minutes
    category: 'all',
    shuffle: true,
    currentIndex: 0,
  });

  // Load wallpapers from API
  const loadWallpapers = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.tags) queryParams.append('tags', filters.tags.join(','));
      if (filters.isPublic !== undefined) queryParams.append('isPublic', filters.isPublic);
      if (filters.isFavorite !== undefined) queryParams.append('isFavorite', filters.isFavorite);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.offset) queryParams.append('offset', filters.offset);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/wallpapers?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setWallpapers(data.wallpapers || []);
        setActiveWallpaper(data.activeWallpaper);
        return data;
      }
    } catch (error) {
      console.error('Error loading wallpapers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload wallpaper
  const uploadWallpaper = useCallback(async (file, metadata = {}) => {
    try {
      const formData = new FormData();
      formData.append('wallpaper', file);
      
      if (metadata.name) formData.append('name', metadata.name);
      if (metadata.description) formData.append('description', metadata.description);
      if (metadata.category) formData.append('category', metadata.category);
      if (metadata.tags) formData.append('tags', metadata.tags.join(','));
      if (metadata.isPublic !== undefined) formData.append('isPublic', metadata.isPublic);

      // Create XMLHttpRequest for upload progress
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          setUploadProgress(0);
          if (xhr.status === 201) {
            const data = JSON.parse(xhr.responseText);
            setWallpapers(prev => [data.wallpaper, ...prev]);
            resolve(data.wallpaper);
          } else {
            reject(new Error(JSON.parse(xhr.responseText).error));
          }
        });

        xhr.addEventListener('error', () => {
          setUploadProgress(0);
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', '/api/wallpapers');
        xhr.send(formData);
      });
    } catch (error) {
      setUploadProgress(0);
      console.error('Error uploading wallpaper:', error);
      throw error;
    }
  }, []);

  // Update wallpaper
  const updateWallpaper = useCallback(async (wallpaperId, updates) => {
    try {
      const response = await fetch(`/api/wallpapers/${wallpaperId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setWallpapers(prev =>
          prev.map(w => w._id === wallpaperId ? data.wallpaper : w)
        );
        
        // Update active wallpaper if it was the one being updated
        if (activeWallpaper && activeWallpaper._id === wallpaperId) {
          setActiveWallpaper(data.wallpaper);
        }
        
        return data.wallpaper;
      } else {
        throw new Error((await response.json()).error);
      }
    } catch (error) {
      console.error('Error updating wallpaper:', error);
      throw error;
    }
  }, [activeWallpaper]);

  // Delete wallpaper
  const deleteWallpaper = useCallback(async (wallpaperId) => {
    try {
      const response = await fetch(`/api/wallpapers/${wallpaperId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWallpapers(prev => prev.filter(w => w._id !== wallpaperId));
        
        // If deleted wallpaper was active, clear active wallpaper
        if (activeWallpaper && activeWallpaper._id === wallpaperId) {
          setActiveWallpaper(null);
        }
      } else {
        throw new Error((await response.json()).error);
      }
    } catch (error) {
      console.error('Error deleting wallpaper:', error);
      throw error;
    }
  }, [activeWallpaper]);

  // Activate wallpaper
  const activateWallpaper = useCallback(async (wallpaperId) => {
    try {
      const response = await fetch('/api/wallpapers/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallpaperId }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update wallpapers list to reflect active status
        setWallpapers(prev =>
          prev.map(w => ({
            ...w,
            isActive: w._id === wallpaperId,
          }))
        );
        
        setActiveWallpaper(data.wallpaper);
        
        // Apply wallpaper to desktop
        applyWallpaperToDesktop(data.wallpaper);
        
        return data.wallpaper;
      } else {
        throw new Error((await response.json()).error);
      }
    } catch (error) {
      console.error('Error activating wallpaper:', error);
      throw error;
    }
  }, []);

  // Apply wallpaper to desktop
  const applyWallpaperToDesktop = useCallback((wallpaper) => {
    const desktop = document.querySelector('[data-desktop]') || document.body;
    
    if (wallpaper) {
      const { settings = {}, url } = wallpaper;
      
      // Build CSS for wallpaper
      let backgroundStyle = `url(${url})`;
      
      // Apply fit setting
      const backgroundSize = {
        cover: 'cover',
        contain: 'contain',
        fill: '100% 100%',
        stretch: '100% 100%',
        center: 'auto',
      }[settings.fit || 'cover'];
      
      // Apply position
      const backgroundPosition = {
        center: 'center center',
        top: 'center top',
        bottom: 'center bottom',
        left: 'left center',
        right: 'right center',
        'top-left': 'left top',
        'top-right': 'right top',
        'bottom-left': 'left bottom',
        'bottom-right': 'right bottom',
      }[settings.position || 'center'];
      
      // Build filter string
      const filters = [];
      if (settings.blur && settings.blur > 0) {
        filters.push(`blur(${settings.blur}px)`);
      }
      if (settings.brightness && settings.brightness !== 100) {
        filters.push(`brightness(${settings.brightness}%)`);
      }
      if (settings.contrast && settings.contrast !== 100) {
        filters.push(`contrast(${settings.contrast}%)`);
      }
      if (settings.saturation && settings.saturation !== 100) {
        filters.push(`saturate(${settings.saturation}%)`);
      }
      
      // Apply styles
      desktop.style.backgroundImage = backgroundStyle;
      desktop.style.backgroundSize = backgroundSize;
      desktop.style.backgroundPosition = backgroundPosition;
      desktop.style.backgroundRepeat = 'no-repeat';
      desktop.style.backgroundAttachment = 'fixed';
      
      if (filters.length > 0) {
        desktop.style.filter = filters.join(' ');
      } else {
        desktop.style.filter = '';
      }
      
      if (settings.opacity && settings.opacity !== 100) {
        desktop.style.opacity = settings.opacity / 100;
      } else {
        desktop.style.opacity = '';
      }
    } else {
      // Clear wallpaper
      desktop.style.backgroundImage = '';
      desktop.style.backgroundSize = '';
      desktop.style.backgroundPosition = '';
      desktop.style.backgroundRepeat = '';
      desktop.style.backgroundAttachment = '';
      desktop.style.filter = '';
      desktop.style.opacity = '';
    }
  }, []);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const response = await fetch('/api/wallpapers/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading wallpaper stats:', error);
    }
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback(async (wallpaperId) => {
    const wallpaper = wallpapers.find(w => w._id === wallpaperId);
    if (wallpaper) {
      return updateWallpaper(wallpaperId, { isFavorite: !wallpaper.isFavorite });
    }
  }, [wallpapers, updateWallpaper]);

  // Slideshow controls
  const startSlideshow = useCallback((config = {}) => {
    setSlideshow(prev => ({
      ...prev,
      enabled: true,
      ...config,
    }));
  }, []);

  const stopSlideshow = useCallback(() => {
    setSlideshow(prev => ({ ...prev, enabled: false }));
  }, []);

  const nextWallpaper = useCallback(async () => {
    const availableWallpapers = slideshow.category === 'all' 
      ? wallpapers 
      : wallpapers.filter(w => w.category === slideshow.category);
    
    if (availableWallpapers.length === 0) return;
    
    let nextIndex;
    if (slideshow.shuffle) {
      nextIndex = Math.floor(Math.random() * availableWallpapers.length);
    } else {
      nextIndex = (slideshow.currentIndex + 1) % availableWallpapers.length;
    }
    
    setSlideshow(prev => ({ ...prev, currentIndex: nextIndex }));
    
    const nextWallpaper = availableWallpapers[nextIndex];
    if (nextWallpaper) {
      await activateWallpaper(nextWallpaper._id);
    }
  }, [wallpapers, slideshow, activateWallpaper]);

  // Auto slideshow timer
  useEffect(() => {
    if (!slideshow.enabled) return;
    
    const interval = setInterval(() => {
      nextWallpaper();
    }, slideshow.interval * 60 * 1000); // Convert minutes to milliseconds
    
    return () => clearInterval(interval);
  }, [slideshow.enabled, slideshow.interval, nextWallpaper]);

  // Load wallpapers and stats on mount
  useEffect(() => {
    loadWallpapers();
    loadStats();
  }, [loadWallpapers, loadStats]);

  // Apply active wallpaper on load
  useEffect(() => {
    if (activeWallpaper) {
      applyWallpaperToDesktop(activeWallpaper);
    }
  }, [activeWallpaper, applyWallpaperToDesktop]);

  return (
    <WallpaperContext.Provider
      value={{
        // State
        wallpapers,
        activeWallpaper,
        loading,
        stats,
        uploadProgress,
        slideshow,
        
        // Actions
        loadWallpapers,
        uploadWallpaper,
        updateWallpaper,
        deleteWallpaper,
        activateWallpaper,
        loadStats,
        toggleFavorite,
        
        // Slideshow
        startSlideshow,
        stopSlideshow,
        nextWallpaper,
        
        // Utilities
        applyWallpaperToDesktop,
      }}
    >
      {children}
    </WallpaperContext.Provider>
  );
};