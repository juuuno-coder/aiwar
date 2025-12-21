'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NewsItem {
    id: string;
    text: string;
    type: 'success' | 'alert' | 'info';
}

const DEFAULT_NEWS: NewsItem[] = [
    { id: '1', text: 'NOTICE: SYSTEM STABILITY AT 99.9% - ALL NODES OPERATIONAL', type: 'info' },
    { id: '2', text: 'ALER: USER-038 RECENTLY EXTRACTED A [UNIQUE] GAIA CORE!', type: 'success' },
    { id: '3', text: 'BATTLE NET: SEASON 4 COMPETITIVE INTEGRATION COMPLETE', type: 'info' },
    { id: '4', text: 'WARNING: QUANTUM LEAK DETECTED IN SECTOR 7 - PROCEED WITH CAUTION', type: 'alert' },
    { id: '5', text: 'CONGRATULATIONS: [UNIQUE] QUANTUM GHOST CREATED BY USER-992', type: 'success' },
];

export default function NewsTicker({ className }: { className?: string }) {
    return (
        <div className={cn("w-full bg-black/40 border-y border-white/5 py-2 overflow-hidden whitespace-nowrap relative group", className)}>
            {/* Gradient Mask for Fade Effect */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black/80 to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black/80 to-transparent z-10" />

            <motion.div
                className="inline-flex gap-16"
                animate={{ x: [0, -1035] }} // -1035 is total width of one set of news
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear"
                }}
            >
                {/* Double the news for continuous loop */}
                {[...DEFAULT_NEWS, ...DEFAULT_NEWS].map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="flex items-center gap-3">
                        <span className={cn(
                            "w-2 h-2 rounded-full animate-pulse",
                            item.type === 'success' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' :
                                item.type === 'alert' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' :
                                    'bg-cyan-500 shadow-[0_0_8px_#06b6d4]'
                        )} />
                        <span className={cn(
                            "text-xs font-black orbitron tracking-wider",
                            item.type === 'success' ? 'text-green-400' :
                                item.type === 'alert' ? 'text-red-400' :
                                    'text-cyan-400'
                        )}>
                            {item.text}
                        </span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
