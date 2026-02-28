import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import {
    PlayIcon,
    PauseIcon,
    ForwardIcon,
    BackwardIcon,
    MusicalNoteIcon,
    ListBulletIcon,
    HeartIcon
} from '@heroicons/react/24/solid';
import {
    HeartIcon as HeartOutlineIcon,
    EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';

const MusicPlayer = () => {
    const { theme } = useTheme();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState({
        id: 1,
        title: 'Orbiting the Sun',
        artist: 'Antigravity Beats',
        duration: '3:45',
        cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2670&auto=format&fit=crop'
    });

    const [playlist] = useState([
        { id: 1, title: 'Orbiting the Sun', artist: 'Antigravity Beats', duration: '3:45' },
        { id: 2, title: 'Deep Space', artist: 'Nebula Sounds', duration: '4:20' },
        { id: 3, title: 'Binary Star', artist: 'Digital Horizon', duration: '2:55' },
        { id: 4, title: 'Lunar Drift', artist: 'Starlight', duration: '3:12' },
        { id: 5, title: 'Pulsar Pulse', artist: 'Zenith', duration: '5:01' },
    ]);

    return (
        <div className={`h-full flex flex-col ${theme.id === 'dark' ? 'bg-zinc-950 text-white' : 'bg-gray-50 text-zinc-900'
            }`}>
            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Playlist Sidebar */}
                <div className={`w-1/3 border-r overflow-auto p-4 ${theme.id === 'dark' ? 'border-white/5' : 'border-gray-200'
                    }`}>
                    <div className="flex items-center space-x-2 mb-6 opacity-60">
                        <ListBulletIcon className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-widest">Playlist</span>
                    </div>
                    <div className="space-y-1">
                        {playlist.map((track) => (
                            <button
                                key={track.id}
                                onClick={() => setCurrentTrack(track)}
                                className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${currentTrack.id === track.id
                                        ? (theme.id === 'dark' ? 'bg-white/10' : 'bg-blue-500 text-white')
                                        : 'hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center space-x-3 overflow-hidden">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentTrack.id === track.id ? 'bg-white/20' : 'bg-zinc-800'
                                        }`}>
                                        <MusicalNoteIcon className="w-4 h-4" />
                                    </div>
                                    <div className="truncate">
                                        <div className="text-sm font-bold truncate">{track.title}</div>
                                        <div className={`text-[10px] truncate ${currentTrack.id === track.id ? 'opacity-70' : 'opacity-40'
                                            }`}>{track.artist}</div>
                                    </div>
                                </div>
                                <span className="text-[10px] opacity-40 group-hover:opacity-100 transition-opacity">{track.duration}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Now Playing Area */}
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gradient-to-b from-transparent to-black/5">
                    <motion.div
                        key={currentTrack.id}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="mb-8 relative group"
                    >
                        <div className="w-64 h-64 rounded-[3rem] overflow-hidden shadow-2xl relative">
                            <img src={currentTrack.cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2670&auto=format&fit=crop'} alt="Cover" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white">
                                    <EllipsisHorizontalIcon className="w-8 h-8" />
                                </button>
                            </div>
                        </div>
                        {/* Spinning Record Effect (Visual only) */}
                        <div className="absolute -z-10 top-4 left-4 w-64 h-64 rounded-full border-4 border-white/5 animate-spin-slow" />
                    </motion.div>

                    <div className="space-y-1 mb-8">
                        <h2 className="text-3xl font-black tracking-tight">{currentTrack.title}</h2>
                        <p className="text-lg font-medium opacity-50 tabular-nums">{currentTrack.artist}</p>
                    </div>

                    <div className="flex items-center space-x-8">
                        <button className="text-red-500">
                            <HeartIcon className="w-6 h-6" />
                        </button>
                        <div className="flex items-center space-x-6">
                            <button className="opacity-50 hover:opacity-100 transition-opacity">
                                <BackwardIcon className="w-8 h-8" />
                            </button>
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className={`p-6 rounded-full shadow-xl shadow-blue-500/20 transition-transform active:scale-95 ${theme.id === 'dark' ? 'bg-white text-black' : 'bg-blue-600 text-white'
                                    }`}
                            >
                                {isPlaying ? <PauseIcon className="w-10 h-10" /> : <PlayIcon className="w-10 h-10" />}
                            </button>
                            <button className="opacity-50 hover:opacity-100 transition-opacity">
                                <ForwardIcon className="w-8 h-8" />
                            </button>
                        </div>
                        <button className="opacity-30 hover:opacity-100 transition-opacity">
                            <MusicalNoteIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Progress Bar (Fixed at bottom) */}
            <div className={`h-2 relative group cursor-pointer ${theme.id === 'dark' ? 'bg-white/10' : 'bg-gray-200'
                }`}>
                <div className="absolute top-0 left-0 h-full bg-blue-500 w-1/3" />
                <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </div>
    );
};

export default MusicPlayer;
