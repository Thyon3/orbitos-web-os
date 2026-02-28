import React from 'react';
import { motion } from 'framer-motion';
import { SunIcon } from '@heroicons/react/24/outline';

const WeatherWidget = () => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white p-8 pointer-events-none select-none drop-shadow-lg flex items-center space-x-6"
        >
            <div className="bg-white/10 backdrop-blur-xl p-4 rounded-[2rem] border border-white/10 flex items-center space-x-4">
                <SunIcon className="w-10 h-10 text-yellow-400" />
                <div>
                    <div className="text-3xl font-black">24°</div>
                    <div className="text-xs font-bold opacity-50 uppercase tracking-widest">Partly Cloudy</div>
                </div>
            </div>
        </motion.div>
    );
};

export default WeatherWidget;
