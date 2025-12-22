'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { TextHoverEffect } from '@/components/ui/aceternity/text-hover-effect';
import { HoverBorderGradient } from '@/components/ui/aceternity/hover-border-gradient';
import { DraggableCard } from '@/components/ui/aceternity/draggable-card';

export default function IntroPage() {
    const router = useRouter();
    const [isLoaded, setIsLoaded] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [glitchText, setGlitchText] = useState('INITIALIZING');
    const [systemStatus, setSystemStatus] = useState<string[]>([]);

    // Boot sequence animation
    useEffect(() => {
        const bootSequence = [
            'NEURAL_LINK::ESTABLISHING...',
            'QUANTUM_CORE::ACTIVATED',
            'FACTION_DATABASE::SYNCHRONIZED',
            'COMBAT_PROTOCOLS::LOADED',
            'AI_WAR_NETWORK::ONLINE',
        ];

        let index = 0;
        const interval = setInterval(() => {
            if (index < bootSequence.length) {
                setSystemStatus(prev => [...prev, bootSequence[index]]);
                index++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    setIsLoaded(true);
                    setGlitchText('ENTER_THE_NETWORK');
                }, 500);
            }
        }, 400);

        return () => clearInterval(interval);
    }, []);

    // Glitch effect
    useEffect(() => {
        if (!isLoaded) return;
        const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const originalText = 'ENTER_THE_NETWORK';

        const interval = setInterval(() => {
            if (Math.random() > 0.9) {
                const glitched = originalText.split('').map((char, i) =>
                    Math.random() > 0.8 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char
                ).join('');
                setGlitchText(glitched);
                setTimeout(() => setGlitchText(originalText), 100);
            }
        }, 200);

        return () => clearInterval(interval);
    }, [isLoaded]);

    const floatingCards = [
        { id: 1, name: 'GPT-4', faction: 'OpenAI', power: 95, x: 15, y: 20 },
        { id: 2, name: 'Claude', faction: 'Anthropic', power: 92, x: 75, y: 15 },
        { id: 3, name: 'Gemini', faction: 'DeepMind', power: 94, x: 85, y: 60 },
        { id: 4, name: 'Llama', faction: 'Meta AI', power: 88, x: 10, y: 70 },
    ];

    return (
        <div className="fixed inset-0 bg-black overflow-hidden">
            {/* Animated Grid Background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,217,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,217,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
            </div>

            {/* Radial Glow */}
            <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-3xl" />
            </div>

            {/* Scanlines */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.015] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_2px]" />

            {/* Background Beams */}
            <BackgroundBeams className="opacity-40" />

            {/* Floating Hologram Cards */}
            <div className="absolute inset-0 pointer-events-none">
                {floatingCards.map((card, i) => (
                    <motion.div
                        key={card.id}
                        className="absolute pointer-events-auto"
                        style={{ left: `${card.x}%`, top: `${card.y}%` }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{
                            opacity: isLoaded ? 0.6 : 0,
                            scale: isLoaded ? 1 : 0.5,
                            y: [0, -10, 0],
                        }}
                        transition={{
                            delay: i * 0.2 + 2,
                            y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                        }}
                    >
                        <DraggableCard className="w-40">
                            <div className="bg-black/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-4 hover:border-cyan-400/60 transition-all group">
                                <div className="h-20 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg mb-3 flex items-center justify-center">
                                    <span className="text-3xl opacity-50">🤖</span>
                                </div>
                                <div className="text-xs font-mono text-cyan-400/80 mb-1">{card.faction}</div>
                                <div className="text-sm font-bold text-white orbitron">{card.name}</div>
                                <div className="mt-2 flex items-center justify-between text-[10px]">
                                    <span className="text-white/40">PWR</span>
                                    <span className="text-cyan-400 font-bold">{card.power}</span>
                                </div>
                            </div>
                        </DraggableCard>
                    </motion.div>
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">

                {/* Boot Sequence Terminal */}
                <AnimatePresence>
                    {!isLoaded && (
                        <motion.div
                            className="absolute top-8 left-8 font-mono text-[10px] text-cyan-500/70"
                            exit={{ opacity: 0 }}
                        >
                            {systemStatus.map((status, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="mb-1"
                                >
                                    <span className="text-green-500">✓</span> {status}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Logo Section */}
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 2.5 }}
                    className="text-center mb-12"
                >
                    {/* Decorative Line */}
                    <motion.div
                        className="flex items-center justify-center gap-4 mb-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 3 }}
                    >
                        <div className="h-px w-20 bg-gradient-to-r from-transparent to-cyan-500" />
                        <div className="w-2 h-2 bg-cyan-500 rotate-45" />
                        <div className="h-px w-20 bg-gradient-to-l from-transparent to-cyan-500" />
                    </motion.div>

                    {/* Main Title */}
                    <TextHoverEffect text="AI WAR" className="text-[120px] md:text-[180px]" />

                    {/* Subtitle */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 3.5 }}
                        className="mt-4"
                    >
                        <p className="text-xs md:text-sm font-mono tracking-[0.5em] text-cyan-400/60 uppercase">
                            Neural Network Conflict Simulation
                        </p>
                        <p className="text-[10px] font-mono tracking-[0.3em] text-white/30 mt-2">
                            Version 2.0.30 // Year 2030
                        </p>
                    </motion.div>
                </motion.div>

                {/* Enter Button */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
                    transition={{ delay: 3.8 }}
                    className="mb-16"
                >
                    <HoverBorderGradient
                        onClick={() => setShowLogin(true)}
                        containerClassName="rounded-none"
                        className="bg-black/80 text-white px-12 py-4 font-mono text-sm tracking-[0.3em] uppercase"
                    >
                        {glitchText}
                    </HoverBorderGradient>
                </motion.div>

                {/* Login Modal */}
                <AnimatePresence>
                    {showLogin && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                            onClick={() => setShowLogin(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="relative w-full max-w-md"
                            >
                                {/* Terminal Window */}
                                <div className="bg-black border border-cyan-500/30 rounded-lg overflow-hidden">
                                    {/* Title Bar */}
                                    <div className="bg-cyan-500/10 px-4 py-2 flex items-center justify-between border-b border-cyan-500/20">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                            <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                        </div>
                                        <span className="text-[10px] font-mono text-cyan-400/60">AUTHENTICATION_TERMINAL</span>
                                    </div>

                                    {/* Content */}
                                    <div className="p-8">
                                        <div className="text-center mb-8">
                                            <h2 className="text-xl font-bold orbitron text-white mb-2">COMMANDER_ACCESS</h2>
                                            <p className="text-[10px] font-mono text-white/40">Enter credentials to access the network</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-mono text-cyan-400/60 mb-2 uppercase tracking-widest">
                                                    User_ID
                                                </label>
                                                <input
                                                    type="email"
                                                    className="w-full bg-black/50 border border-cyan-500/30 rounded px-4 py-3 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors"
                                                    placeholder="commander@ai-war.net"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-mono text-cyan-400/60 mb-2 uppercase tracking-widest">
                                                    Access_Key
                                                </label>
                                                <input
                                                    type="password"
                                                    className="w-full bg-black/50 border border-cyan-500/30 rounded px-4 py-3 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors"
                                                    placeholder="••••••••••••"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-8 space-y-3">
                                            <HoverBorderGradient
                                                onClick={() => router.push('/main')}
                                                containerClassName="w-full rounded"
                                                className="w-full bg-cyan-500/10 text-cyan-400 py-3 font-mono text-sm tracking-widest uppercase"
                                            >
                                                AUTHENTICATE
                                            </HoverBorderGradient>

                                            <button
                                                onClick={() => router.push('/signup')}
                                                className="w-full py-3 text-white/40 hover:text-white font-mono text-xs tracking-widest uppercase transition-colors"
                                            >
                                                REQUEST_NEW_ACCESS
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Decorative Corners */}
                                <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-500" />
                                <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-500" />
                                <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-500" />
                                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-500" />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Status */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isLoaded ? 0.5 : 0 }}
                    transition={{ delay: 4 }}
                    className="absolute bottom-8 left-0 right-0 text-center"
                >
                    <div className="inline-flex items-center gap-4 text-[9px] font-mono text-white/30">
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            NETWORK_STABLE
                        </span>
                        <span>|</span>
                        <span>NODES_ACTIVE: 2,847</span>
                        <span>|</span>
                        <span>CONFLICTS_TODAY: 12,493</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
