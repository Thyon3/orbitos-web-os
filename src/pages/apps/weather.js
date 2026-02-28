import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import {
    CloudIcon,
    SunIcon,
    CloudIcon as CloudRainIcon, // Simplified for now
    MapPinIcon,
    CalendarDaysIcon
} from '@heroicons/react/24/outline';

const WeatherApp = () => {
    const { theme } = useTheme();
    const [weatherData, setWeatherData] = useState({
        temp: 24,
        condition: 'Partly Cloudy',
        location: 'Orbit City',
        humidity: 45,
        wind: 12,
        forecast: [
            { day: 'Mon', temp: 25, condition: 'Sun' },
            { day: 'Tue', temp: 22, condition: 'Cloud' },
            { day: 'Wed', temp: 20, condition: 'Rain' },
            { day: 'Thu', temp: 24, condition: 'Sun' },
            { day: 'Fri', temp: 26, condition: 'Sun' },
        ]
    });

    // Simulated weather icon mapping
    const getWeatherIcon = (condition) => {
        switch (condition) {
            case 'Sun': return <SunIcon className="w-8 h-8 text-yellow-400" />;
            case 'Cloud': return <CloudIcon className="w-8 h-8 text-gray-400" />;
            case 'Rain': return <CloudRainIcon className="w-8 h-8 text-blue-400" />;
            default: return <SunIcon className="w-8 h-8 text-yellow-400" />;
        }
    };

    return (
        <div className={`h-full flex flex-col p-6 overflow-auto ${theme.id === 'dark' ? 'bg-slate-900 text-white' : 'bg-blue-50 text-slate-900'
            }`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-10">
                <div>
                    <div className="flex items-center space-x-2 text-blue-500 mb-1">
                        <MapPinIcon className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase tracking-widest">{weatherData.location}</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight">Weather Forecast</h1>
                </div>
                <div className={`p-3 rounded-2xl ${theme.id === 'dark' ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
                    <CalendarDaysIcon className="w-6 h-6 opacity-50" />
                </div>
            </div>

            {/* Hero Weather */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`relative overflow-hidden rounded-[2.5rem] p-8 flex flex-col justify-between h-64 shadow-2xl ${theme.id === 'dark' ? 'bg-gradient-to-br from-blue-600 to-indigo-900' : 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
                        }`}
                >
                    <div className="z-10">
                        <span className="text-8xl font-black">{weatherData.temp}°</span>
                        <div className="text-xl font-medium opacity-90">{weatherData.condition}</div>
                    </div>
                    <div className="flex space-x-6 z-10">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold opacity-60">Humidity</span>
                            <span className="font-bold">{weatherData.humidity}%</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold opacity-60">Wind</span>
                            <span className="font-bold">{weatherData.wind} km/h</span>
                        </div>
                    </div>
                    {/* Decorative Background Element */}
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                    <SunIcon className="absolute top-4 right-8 w-32 h-32 text-white/10" />
                </motion.div>

                <div className="space-y-4 flex flex-col justify-center">
                    <h3 className="text-lg font-bold opacity-70">Today's Details</h3>
                    <div className={`p-6 rounded-[2rem] border transition-all ${theme.id === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:shadow-lg'
                        }`}>
                        <p className="text-sm leading-relaxed opacity-80">
                            Mainly clear. Low 18°C. Winds variable at 10 to 15 km/h. UV index 8 of 10. Tomorrow will be slightly warmer with a high of 26°C.
                        </p>
                    </div>
                </div>
            </div>

            {/* 5-Day Forecast */}
            <div>
                <h3 className="text-xl font-bold mb-6">5-Day Forecast</h3>
                <div className="grid grid-cols-5 gap-4">
                    {weatherData.forecast.map((item, idx) => (
                        <motion.div
                            key={item.day}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`flex flex-col items-center p-6 rounded-[2rem] border transition-all ${theme.id === 'dark'
                                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                    : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
                                }`}
                        >
                            <span className="text-xs font-bold uppercase tracking-tighter opacity-50 mb-4">{item.day}</span>
                            <div className="mb-4">
                                {getWeatherIcon(item.condition)}
                            </div>
                            <span className="text-xl font-black">{item.temp}°</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WeatherApp;
