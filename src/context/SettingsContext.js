// src/context/SettingsContext.js

import { createContext, useContext, useState, useEffect } from 'react';

// A list of your default wallpapers located in /public/backgrounds
const defaultWallpapers = [
  '/backgrounds/orbit-default.jpg',
  '/backgrounds/orbit-default1.jpg',
];

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [wallpaper, setWallpaper] = useState(defaultWallpapers[0]);
  const [volume, setVolume] = useState(80);
  const [brightness, setBrightness] = useState(100);
  const [isWifiEnabled, setIsWifiEnabled] = useState(true);
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);

  useEffect(() => {
    const savedWallpaper = localStorage.getItem('orbitos_wallpaper');
    if (savedWallpaper && defaultWallpapers.includes(savedWallpaper)) {
      setWallpaper(savedWallpaper);
    }

    const savedSettings = JSON.parse(localStorage.getItem('orbitos_settings') || '{}');
    if (savedSettings.volume !== undefined) setVolume(savedSettings.volume);
    if (savedSettings.brightness !== undefined) setBrightness(savedSettings.brightness);
    if (savedSettings.wifi !== undefined) setIsWifiEnabled(savedSettings.wifi);
    if (savedSettings.bluetooth !== undefined) setIsBluetoothEnabled(savedSettings.bluetooth);
  }, []);

  const saveSettings = (newSettings) => {
    const currentSettings = JSON.parse(localStorage.getItem('orbitos_settings') || '{}');
    localStorage.setItem('orbitos_settings', JSON.stringify({ ...currentSettings, ...newSettings }));
  };

  const changeWallpaper = async (newWallpaper) => {
    localStorage.setItem('orbitos_wallpaper', newWallpaper);
    setWallpaper(newWallpaper);

    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const { user } = await response.json();
        const updatedPreferences = {
          ...user.preferences,
          wallpaper: newWallpaper
        };

        await fetch('/api/users/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preferences: updatedPreferences }),
        });
      }
    } catch (error) {
      console.error('Failed to save preferences to server:', error);
    }
  };

  const updateVolume = (val) => {
    setVolume(val);
    saveSettings({ volume: val });
  };

  const updateBrightness = (val) => {
    setBrightness(val);
    saveSettings({ brightness: val });
  };

  const toggleWifi = () => {
    setIsWifiEnabled(!isWifiEnabled);
    saveSettings({ wifi: !isWifiEnabled });
  };

  const toggleBluetooth = () => {
    setIsBluetoothEnabled(!isBluetoothEnabled);
    saveSettings({ bluetooth: !isBluetoothEnabled });
  };

  const value = {
    wallpaper,
    changeWallpaper,
    availableWallpapers: defaultWallpapers,
    volume,
    updateVolume,
    brightness,
    updateBrightness,
    isWifiEnabled,
    toggleWifi,
    isBluetoothEnabled,
    toggleBluetooth,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// Ensure the custom hook is exported and uses the correct context.
export function useSettings() {
  return useContext(SettingsContext);
}