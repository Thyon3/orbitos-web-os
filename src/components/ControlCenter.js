import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import {
    SpeakerWaveIcon,
    SunIcon,
    WifiIcon,
    BluetoothIcon,
    PowerIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

const ControlCenter = ({ isOpen, onClose }) => {
    const { theme } = useTheme();
    const {
        volume, updateVolume,
        brightness, updateBrightness,
        isWifiEnabled, toggleWifi,
        isBluetoothEnabled, toggleBluetooth
    } = useSettings();

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 100, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className={`fixed bottom-20 right-4 w-80 p-6 rounded-3xl shadow-2xl backdrop-blur-2xl border border-white/20 z-[100] ${theme.id === 'dark' ? 'bg-black/60 text-white' : 'bg-white/70 text-gray-900'
                        }`}
                >
                    <div className="flex flex-col space-y-6">
                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Control Center</h2>
                            <div className="flex space-x-2">
                                <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                                    <Cog6ToothIcon className="w-5 h-5" />
                                </button>
                                <button className="p-2 rounded-full hover:bg-red-500/20 text-red-500 transition-colors">
                                    <PowerIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Quick Toggles */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={toggleWifi}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all ${isWifiEnabled
                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                        : 'bg-white/10 hover:bg-white/20'
                                    }`}
                            >
                                <WifiIcon className="w-8 h-8 mb-2" />
                                <span className="text-sm font-medium">Wi-Fi</span>
                                <span className="text-[10px] opacity-70">{isWifiEnabled ? 'On' : 'Off'}</span>
                            </button>

                            <button
                                onClick={toggleBluetooth}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all ${isBluetoothEnabled
                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                        : 'bg-white/10 hover:bg-white/20'
                                    }`}
                            >
                                <BluetoothIcon className="w-8 h-8 mb-2" />
                                <span className="text-sm font-medium">Bluetooth</span>
                                <span className="text-[10px] opacity-70">{isBluetoothEnabled ? 'On' : 'Off'}</span>
                            </button>
                        </div>

                        {/* Sliders */}
                        <div className="space-y-4">
                            {/* Brightness */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <div className="flex items-center space-x-2 opacity-70">
                                        <SunIcon className="w-4 h-4" />
                                        <span className="text-xs font-medium">Brightness</span>
                                    </div>
                                    <span className="text-xs font-bold">{brightness}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={brightness}
                                    onChange={(e) => updateBrightness(parseInt(e.target.value))}
                                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>

                            {/* Volume */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <div className="flex items-center space-x-2 opacity-70">
                                        <SpeakerWaveIcon className="w-4 h-4" />
                                        <span className="text-xs font-medium">Volume</span>
                                    </div>
                                    <span className="text-xs font-bold">{volume}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={volume}
                                    onChange={(e) => updateVolume(parseInt(e.target.value))}
                                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>
                        </div>

                        {/* Status Footer */}
                        <div className="pt-2 flex justify-center">
                            <span className="text-[10px] uppercase tracking-wider opacity-40 font-bold">OrbitOS System v1.0</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ControlCenter;
