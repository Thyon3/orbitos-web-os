import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { MicrophoneIcon, XMarkIcon } from '@heroicons/react/24/solid';

const SpeechAssistant = ({ isOpen, onClose }) => {
    const { theme } = useTheme();
    const [status, setStatus] = useState('Listening...');
    const [response, setResponse] = useState('');

    useEffect(() => {
        if (isOpen) {
            setStatus('Listening...');
            setResponse('');

            const timer = setTimeout(() => {
                setStatus('Processing...');
                setTimeout(() => {
                    setStatus('Assistant');
                    setResponse("Hello! I'm your OrbitOS Assistant. How can I help you today?");
                }, 1500);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className={`fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-lg p-8 rounded-[3rem] shadow-2xl backdrop-blur-3xl border border-white/20 z-[100] ${theme.id === 'dark' ? 'bg-black/80 text-white' : 'bg-white/90 text-slate-900'
                        }`}
                >
                    <div className="flex flex-col items-center space-y-8">
                        {/* Header */}
                        <div className="w-full flex justify-between items-center px-2">
                            <span className={`text-xs font-black uppercase tracking-[0.3em] ${status === 'Listening...' ? 'text-red-500 animate-pulse' : 'opacity-40'
                                }`}>{status}</span>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5 opacity-40" />
                            </button>
                        </div>

                        {/* Waveform Animation */}
                        {status === 'Listening...' ? (
                            <div className="flex items-center space-x-1.5 h-16">
                                {[...Array(12)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            height: [10, Math.random() * 40 + 20, 10],
                                        }}
                                        transition={{
                                            duration: 0.8,
                                            repeat: Infinity,
                                            delay: i * 0.05,
                                        }}
                                        className={`w-1.5 rounded-full ${theme.id === 'dark' ? 'bg-blue-500' : 'bg-blue-600'
                                            }`}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className={`p-6 rounded-[2rem] w-full text-center ${theme.id === 'dark' ? 'bg-white/5' : 'bg-blue-50'
                                }`}>
                                <p className="text-xl font-medium leading-relaxed italic opacity-90">
                                    {response || "..."}
                                </p>
                            </div>
                        )}

                        {/* Mic Button */}
                        <button className={`p-6 rounded-full shadow-lg ${theme.id === 'dark' ? 'bg-blue-600' : 'bg-blue-500 text-white'
                            }`}>
                            <MicrophoneIcon className="w-8 h-8" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SpeechAssistant;
