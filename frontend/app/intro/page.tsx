'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DraggableCard } from '@/components/ui/aceternity/draggable-card';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { TextHoverEffect } from '@/components/ui/aceternity/text-hover-effect';
import { HoverBorderGradient } from '@/components/ui/aceternity/hover-border-gradient';

export default function IntroPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        // TODO: Implement actual login logic
        router.push('/main');
    };

    const handleGuestLogin = () => {
        router.push('/main');
    };

    const demoCards = [
        {
            id: '1',
            title: 'Gemini Ultra',
            description: 'Advanced AI',
            type: 'CREATIVITY',
            power: 850,
        },
        {
            id: '2',
            title: 'GPT-4',
            description: 'Language Master',
            type: 'EFFICIENCY',
            power: 920,
        },
        {
            id: '3',
            title: 'Claude 3',
            description: 'Reasoning Expert',
            type: 'COST',
            power: 880,
        },
        {
            id: '4',
            title: 'Midjourney',
            description: 'Visual Creator',
            type: 'CREATIVITY',
            power: 790,
        },
        {
            id: '5',
            title: 'Stable Diffusion',
            description: 'Image Synthesis',
            type: 'EFFICIENCY',
            power: 810,
        },
    ];

    const typeColors: Record<string, string> = {
        CREATIVITY: 'from-purple-500 to-violet-600',
        EFFICIENCY: 'from-blue-500 to-cyan-600',
        COST: 'from-amber-500 to-orange-600',
    };

    const typeIcons: Record<string, string> = {
        CREATIVITY: '🪨',
        EFFICIENCY: '✂️',
        COST: '📄',
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 overflow-hidden">
            {/* Background Effects */}
            <BackgroundBeams className="opacity-40" />

            {/* Floating Draggable Cards - Scattered Around */}
            <div className="absolute inset-0 pointer-events-none">
                {demoCards.map((card, index) => {
                    const positions = [
                        { top: '10%', left: '5%' },
                        { top: '15%', right: '8%' },
                        { bottom: '20%', left: '10%' },
                        { bottom: '15%', right: '5%' },
                        { top: '50%', left: '3%' },
                    ];
                    const pos = positions[index];

                    return (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                            animate={{
                                opacity: 0.6,
                                scale: 1,
                                rotate: 0,
                                y: [0, -20, 0],
                            }}
                            transition={{
                                delay: 0.5 + index * 0.2,
                                duration: 0.8,
                                y: {
                                    duration: 3 + index * 0.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }
                            }}
                            className="absolute pointer-events-auto"
                            style={pos}
                        >
                            <DraggableCard
                                className="w-40 h-56 bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 cursor-move hover:border-purple-500/60 hover:scale-105 transition-all shadow-2xl"
                            >
                                <div className="h-full flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-2xl">{typeIcons[card.type]}</span>
                                            <span className="text-xs text-purple-400 font-bold">LV.1</span>
                                        </div>
                                        <h3 className="text-sm font-bold text-white mb-1 truncate">{card.title}</h3>
                                        <p className="text-xs text-slate-400 truncate">{card.description}</p>
                                    </div>
                                    <div>
                                        <div className={`w-full h-1 bg-gradient-to-r ${typeColors[card.type]} rounded-full mb-2`} />
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-500">Power</span>
                                            <span className={`text-lg font-black bg-gradient-to-r ${typeColors[card.type]} bg-clip-text text-transparent`}>
                                                {card.power}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </DraggableCard>
                        </motion.div>
                    );
                })}
            </div>

            {/* Main Content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-8">
                {/* Title Section with Text Hover Effect */}
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <TextHoverEffect text="AI WAR" className="mb-4" />
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-xl text-slate-400 tracking-[0.3em] uppercase font-light"
                        style={{ fontFamily: 'Orbitron, sans-serif' }}
                    >
                        The Ultimate AI Battle Arena • 2030
                    </motion.p>
                </motion.div>

                {/* Login Form */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6 text-center tracking-wider"
                            style={{ fontFamily: 'Orbitron, sans-serif' }}>
                            ENTER THE ARENA
                        </h2>

                        <div className="space-y-4 mb-6">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-all"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-all"
                            />
                        </div>

                        <HoverBorderGradient
                            onClick={handleLogin}
                            className="w-full py-4 font-bold text-white tracking-wider"
                            containerClassName="w-full mb-4"
                            duration={2}
                        >
                            <span style={{ fontFamily: 'Orbitron, sans-serif' }}>START GAME</span>
                        </HoverBorderGradient>

                        <button
                            onClick={() => router.push('/signup')}
                            className="w-full py-3 bg-slate-800/50 border border-purple-500/20 rounded-xl text-white font-bold mb-4 hover:border-purple-500/50 hover:bg-slate-800/70 transition-all"
                            style={{ fontFamily: 'Orbitron, sans-serif' }}
                        >
                            CREATE ACCOUNT
                        </button>

                        <button
                            onClick={handleGuestLogin}
                            className="w-full py-3 text-slate-400 hover:text-white transition-all text-sm tracking-wider"
                        >
                            Continue as Guest →
                        </button>
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-16 text-center text-slate-600 text-xs tracking-widest"
                >
                    <p>© 2030 AI WAR • THE FUTURE OF GAMING</p>
                </motion.div>
            </div>
        </div>
    );
}

