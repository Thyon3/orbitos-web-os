import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ClockWidget = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const dateString = time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-white p-8 pointer-events-none select-none drop-shadow-2xl"
        >
            <div className="text-9xl font-black tracking-tighter opacity-90">{timeString}</div>
            <div className="text-2xl font-medium opacity-60 ml-2 uppercase tracking-[0.2em]">{dateString}</div>
        </motion.div>
    );
};

export default ClockWidget;
