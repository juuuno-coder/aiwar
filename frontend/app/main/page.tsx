'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { initializeNewPlayer } from '@/lib/game-init';
import { getGameState, checkDailyReset } from '@/lib/game-state';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { Card3D, CardBody, CardItem } from '@/components/ui/aceternity/3d-card';
import { HoverBorderGradient } from '@/components/ui/aceternity/hover-border-gradient';
import { InfiniteMovingCards } from '@/components/ui/aceternity/infinite-moving-cards';

export default function MainDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({ tokens: 0, cards: 0, level: 1, exp: 0 });
    const [currentTime, setCurrentTime] = useState('');
    const [pulseIndex, setPulseIndex] = useState(0);

    useEffect(() => {
        initializeNewPlayer();
        checkDailyReset();

        const state = getGameState();
        setStats({
            tokens: state.tokens || 0,
            cards: state.inventory?.length || 0,
            level: state.level || 1,
            exp: state.experience || 0,
        });

        // Real-time clock
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
        };
        updateTime();
        const clockInterval = setInterval(updateTime, 1000);

        // Pulse animation
        const pulseInterval = setInterval(() => {
            setPulseIndex(prev => (prev + 1) % 4);
        }, 2000);

        return () => {
            clearInterval(clockInterval);
            clearInterval(pulseInterval);
        };
    }, []);

    const announcements = [
        { quote: "ALERT: Anthropic forces detected in Sector 7. Mobilize your units.", name: "INTEL_CORE", title: "PRIORITY" },
        { quote: "New legendary unit unlocked: GPT-5 OMEGA. Check your inventory.", name: "SYSTEM", title: "REWARD" },
        { quote: "Season 4 ends in 72 hours. Climb the ranks for exclusive rewards.", name: "ARENA_MASTER", title: "EVENT" },
    ];

    const statPanels = [
        { label: 'COMMANDER_LV', value: stats.level, suffix: '', icon: '◈', color: 'cyan', glow: 'shadow-cyan-500/30' },
        { label: 'TOKEN_RESERVE', value: stats.tokens.toLocaleString(), suffix: '', icon: '◆', color: 'purple', glow: 'shadow-purple-500/30' },
        { label: 'UNIT_ARCHIVE', value: stats.cards, suffix: ' UNITS', icon: '◉', color: 'pink', glow: 'shadow-pink-500/30' },
        { label: 'SYNC_RATE', value: Math.min(100, Math.floor((stats.exp / (stats.level * 100)) * 100)), suffix: '%', icon: '◊', color: 'amber', glow: 'shadow-amber-500/30' },
    ];

    const mainActions = [
        {
            title: 'CHRONICLE',
            subtitle: 'Story Archive',
            path: '/story',
            icon: '📜',
            desc: 'Uncover the hidden history of the AI war. 20 faction stories await.',
            color: 'cyan',
            bgPattern: 'radial-gradient(#0891b2_1px,transparent_1px)',
        },
        {
            title: 'WARZONE',
            subtitle: 'Combat Arena',
            path: '/battle',
            icon: '⚔️',
            desc: 'Deploy your neural army. Dominate the battlefield. Claim victory.',
            color: 'red',
            bgPattern: 'radial-gradient(#dc2626_1px,transparent_1px)',
        },
    ];

    const quickActions = [
        { label: 'FACTIONS', icon: '🤖', path: '/factions' },
        { label: 'GACHA', icon: '🎰', path: '/slots' },
        { label: 'ENHANCE', icon: '⚡', path: '/enhance' },
        { label: 'FUSION', icon: '🔮', path: '/fusion' },
        { label: 'UNIQUE', icon: '✨', path: '/unique-create' },
        { label: 'MARKET', icon: '🛒', path: '/shop' },
    ];

    return (
        <div className="relative min-h-screen bg-black text-white overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

            {/* Radial Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-cyan-500/10 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />

            {/* Scanlines */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_2px]" />

            <BackgroundBeams className="opacity-20" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">

                {/* Header Bar */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-10"
                >
                    <div>
                        <h1 className="text-3xl font-black orbitron tracking-tight text-white">
                            COMMAND_CENTER
                        </h1>
                        <p className="text-[10px] font-mono text-cyan-500/60 tracking-[0.3em] mt-1">
                            NEURAL OPERATIONS HUB // SECTOR_ALPHA
                        </p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest">System Time</p>
                            <p className="text-xl font-mono text-cyan-400 tabular-nums">{currentTime}</p>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                            <span className="text-[10px] font-mono text-white/40">ONLINE</span>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {statPanels.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="group relative"
                        >
                            <div className={`absolute inset-0 bg-${stat.color}-500/5 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                            <div className={`relative bg-black/40 backdrop-blur-sm border border-white/5 rounded-lg p-5 hover:border-${stat.color}-500/30 transition-all overflow-hidden`}>
                                {/* Pulse indicator */}
                                <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${pulseIndex === i ? 'bg-cyan-400 animate-ping' : 'bg-white/10'}`} />

                                {/* Corner decoration */}
                                <div className="absolute top-0 left-0 w-8 h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
                                <div className="absolute top-0 left-0 w-px h-8 bg-gradient-to-b from-cyan-500/50 to-transparent" />

                                <div className="text-2xl mb-3 opacity-30 group-hover:opacity-60 transition-opacity">{stat.icon}</div>
                                <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className={`text-2xl font-black orbitron text-${stat.color}-400`}>
                                    {stat.value}{stat.suffix}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Intel Feed */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-1 h-4 bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Live Intel Feed</span>
                    </div>
                    <div className="bg-black/30 border border-white/5 rounded-lg overflow-hidden">
                        <InfiniteMovingCards
                            items={announcements}
                            direction="left"
                            speed="slow"
                            className="bg-transparent"
                        />
                    </div>
                </motion.div>

                {/* Main Action Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    {mainActions.map((action, i) => (
                        <motion.div
                            key={action.title}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 + i * 0.15 }}
                            onClick={() => router.push(action.path)}
                            className="cursor-pointer"
                        >
                            <Card3D className="w-full">
                                <CardBody className="relative h-[320px] bg-black/60 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden group">
                                    {/* Background Pattern */}
                                    <div
                                        className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
                                        style={{ backgroundImage: action.bgPattern, backgroundSize: '20px 20px' }}
                                    />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

                                    {/* Large Icon */}
                                    <CardItem translateZ="30" className="absolute top-8 right-8 text-6xl opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all">
                                        {action.icon}
                                    </CardItem>

                                    {/* Content */}
                                    <div className="absolute inset-x-0 bottom-0 p-8">
                                        <CardItem translateZ="20">
                                            <span className={`inline-block px-3 py-1 bg-${action.color}-500/20 border border-${action.color}-500/40 text-${action.color}-400 text-[9px] font-mono uppercase tracking-widest rounded mb-4`}>
                                                {action.subtitle}
                                            </span>
                                        </CardItem>

                                        <CardItem translateZ="40">
                                            <h2 className={`text-4xl font-black orbitron tracking-tight text-white group-hover:text-${action.color}-400 transition-colors mb-3`}>
                                                {action.title}
                                            </h2>
                                        </CardItem>

                                        <CardItem translateZ="30" className="mb-6">
                                            <p className="text-sm text-white/50 leading-relaxed max-w-sm">
                                                {action.desc}
                                            </p>
                                        </CardItem>

                                        <CardItem translateZ="50">
                                            <div className={`inline-flex items-center gap-2 text-${action.color}-400 text-xs font-mono uppercase tracking-widest group-hover:translate-x-2 transition-transform`}>
                                                <span>INITIATE</span>
                                                <span>→</span>
                                            </div>
                                        </CardItem>
                                    </div>

                                    {/* Corner Decorations */}
                                    <div className={`absolute top-4 left-4 w-12 h-12 border-t border-l border-${action.color}-500/20 group-hover:border-${action.color}-500/50 transition-colors`} />
                                    <div className={`absolute bottom-4 right-4 w-12 h-12 border-b border-r border-${action.color}-500/20 group-hover:border-${action.color}-500/50 transition-colors`} />
                                </CardBody>
                            </Card3D>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-px bg-cyan-500/50" />
                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Quick Protocols</span>
                        <div className="flex-1 h-px bg-white/5" />
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {quickActions.map((action, i) => (
                            <motion.div
                                key={action.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 + i * 0.05 }}
                            >
                                <Link href={action.path}>
                                    <div className="group bg-black/30 border border-white/5 hover:border-cyan-500/30 rounded-lg p-4 text-center transition-all hover:bg-cyan-500/5 cursor-pointer">
                                        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{action.icon}</div>
                                        <p className="text-[9px] font-mono text-white/40 group-hover:text-cyan-400 uppercase tracking-widest transition-colors">
                                            {action.label}
                                        </p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Footer Status Bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-12 pt-6 border-t border-white/5"
                >
                    <div className="flex items-center justify-between text-[9px] font-mono text-white/20">
                        <div className="flex items-center gap-6">
                            <span>NODE_ID: ALPHA-7429</span>
                            <span>LATENCY: 12ms</span>
                            <span>UPTIME: 99.97%</span>
                        </div>
                        <div>AI_WAR v2.0.30 // PREMIUM_ACCESS</div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
