'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TimelineEvent {
    year: number;
    title: string;
    event: string;
}

interface TimelineViewProps {
    events: TimelineEvent[];
    className?: string;
}

export default function TimelineView({ events, className }: TimelineViewProps) {
    return (
        <div className={cn("relative", className)}>
            {/* 가로 스크롤 컨테이너 */}
            <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                <div className="flex gap-6 min-w-max px-4">
                    {events.map((event, index) => (
                        <motion.div
                            key={event.year}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative flex-shrink-0 w-64"
                        >
                            {/* 연결선 */}
                            {index < events.length - 1 && (
                                <div className="absolute top-6 left-[50%] w-[calc(100%+24px)] h-0.5 bg-gradient-to-r from-cyan-500/50 to-purple-500/50" />
                            )}

                            {/* 연도 포인트 */}
                            <div className="relative z-10 flex justify-center mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                                    <span className="text-white font-bold text-sm orbitron">{event.year}</span>
                                </div>
                            </div>

                            {/* 이벤트 카드 */}
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-cyan-500/50 transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                                <h4 className="text-white font-bold mb-2">{event.title}</h4>
                                <p className="text-white/60 text-sm leading-relaxed">{event.event}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* 스크롤 힌트 */}
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#050505] to-transparent pointer-events-none" />
        </div>
    );
}
