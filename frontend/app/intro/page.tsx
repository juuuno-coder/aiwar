'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { TextHoverEffect } from '@/components/ui/aceternity/text-hover-effect';
import { HoverBorderGradient } from '@/components/ui/aceternity/hover-border-gradient';
import { DraggableCard } from '@/components/ui/aceternity/draggable-card';
import GoogleLoginButton from '@/components/GoogleLoginButton';

import { login, signInAsGuest, loginAsTestCommander } from '@/lib/auth-utils';

export default function IntroPage() {
    const router = useRouter();
    const [isLoaded, setIsLoaded] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [glitchText, setGlitchText] = useState('INITIALIZING');
    const [systemStatus, setSystemStatus] = useState<string[]>([]);

    // Login State
    const [loginId, setLoginId] = useState('');
    const [loginKey, setLoginKey] = useState('');
    const [loginError, setLoginError] = useState('');

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

            {/* Floating Hologram Cards - Background Layer */}
            <div className="absolute inset-0 pointer-events-none">
                {floatingCards.map((card, i) => (
                    <motion.div
                        key={card.id}
                        className="absolute pointer-events-auto cursor-grab active:cursor-grabbing"
                        style={{ left: `${card.x}%`, top: `${card.y}%` }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{
                            opacity: isLoaded ? 0.8 : 0,
                            scale: isLoaded ? 1 : 0.5,
                            y: [0, -15, 0],
                        }}
                        transition={{
                            delay: i * 0.2 + 2,
                            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                        }}
                    >
                        <DraggableCard className="w-48 transform hover:scale-110 transition-transform duration-300">
                            <div className="bg-black/20 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-4 hover:border-cyan-400/60 hover:bg-black/40 transition-all group shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]">
                                <div className="h-24 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-lg mb-3 flex items-center justify-center border border-white/5 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-cyan-500/5 animate-pulse" />
                                    <span className="text-4xl opacity-70 filter drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">🤖</span>
                                </div>
                                <div className="flex justify-between items-end mb-1">
                                    <div className="text-xs font-mono text-cyan-400/80">{card.faction}</div>
                                    <div className="text-[9px] font-mono text-white/30">ID: {card.id.toString().padStart(3, '0')}</div>
                                </div>
                                <div className="text-lg font-bold text-white orbitron tracking-wide">{card.name}</div>
                                <div className="mt-3 flex items-center justify-between text-[10px]">
                                    <span className="text-white/40 font-mono">POWER</span>
                                    <div className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                        <span className="text-cyan-400 font-bold text-base font-orbitron">{card.power}</span>
                                    </div>
                                </div>
                            </div>
                        </DraggableCard>
                    </motion.div>
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pointer-events-none">

                {/* Boot Sequence Terminal */}
                <AnimatePresence>
                    {!isLoaded && (
                        <motion.div
                            className="absolute top-8 left-8 font-mono text-[10px] text-cyan-500/70 pointer-events-auto"
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
                    className="text-center mb-16 relative pointer-events-auto"
                >
                    {/* Decorative Line */}
                    <motion.div
                        className="flex items-center justify-center gap-4 mb-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 3 }}
                    >
                        <div className="h-px w-24 bg-gradient-to-r from-transparent to-cyan-500/80" />
                        <div className="w-3 h-3 border border-cyan-500 rotate-45 flex items-center justify-center">
                            <div className="w-1 h-1 bg-cyan-500" />
                        </div>
                        <div className="h-px w-24 bg-gradient-to-l from-transparent to-cyan-500/80" />
                    </motion.div>

                    {/* Main Title - Using Optimized TextHoverEffect */}
                    <div className="relative z-20 select-none">
                        <TextHoverEffect text="AI WAR" className="text-[100px] md:text-[150px] lg:text-[180px]" />
                    </div>

                    {/* Subtitle */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 3.5 }}
                        className="mt-6 space-y-2 relative z-20"
                    >
                        <p className="text-sm md:text-base font-mono tracking-[0.6em] text-cyan-400 font-bold uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                            Neural Network Conflict
                        </p>
                        <p className="text-[10px] font-mono tracking-[0.3em] text-white/40">
                            SYSTEM_VERSION: 2.0.30 // YEAR: 2030
                        </p>
                    </motion.div>
                </motion.div>

                {/* Enter Button */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
                    transition={{ delay: 3.8 }}
                    className="mb-16 relative z-30 pointer-events-auto"
                >
                    <HoverBorderGradient
                        onClick={() => setShowLogin(true)}
                        containerClassName="rounded-full"
                        className="bg-black/90 text-white px-16 py-6 font-mono text-base tracking-[0.4em] uppercase font-bold border border-white/10"
                        duration={1.5}
                    >
                        <span className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            {glitchText}
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        </span>
                    </HoverBorderGradient>
                </motion.div>

                {/* Login Modal */}
                <AnimatePresence>
                    {showLogin && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto"
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

                                    <form
                                        className="p-8"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            setLoginError('');

                                            // Validate
                                            if (!loginId || !loginKey) {
                                                setLoginError('CREDENTIALS_REQUIRED');
                                                return;
                                            }

                                            // Attempt Login
                                            const result = login(loginId, loginKey);
                                            if (result.success) {
                                                // Success animation then redirect
                                                setSystemStatus(prev => [...prev, 'ACCESS_GRANTED', 'REDIRECTING...']);
                                                // Redirect to Factions (Main Hub)
                                                // setTimeout(() => router.replace('/factions'), 800);
                                                // Changed to hard reload via window.location for session safety if needed
                                                setTimeout(() => window.location.href = '/', 800);
                                            } else {
                                                setLoginError(result.message);
                                            }
                                        }}
                                    >

                                        <div className="text-center mb-8">
                                            <h2 className="text-xl font-bold orbitron text-white mb-2">지휘관 인증</h2>
                                            <p className="text-[10px] font-mono text-white/40">네트워크 접속을 위한 인증 정보를 입력하세요</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-mono text-cyan-400/60 mb-2 uppercase tracking-widest">
                                                    이메일
                                                </label>
                                                <input
                                                    type="text"
                                                    value={loginId}
                                                    onChange={(e) => setLoginId(e.target.value)}
                                                    className="w-full bg-black/50 border border-cyan-500/30 rounded px-4 py-3 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors"
                                                    placeholder="이메일을 입력하세요"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-mono text-cyan-400/60 mb-2 uppercase tracking-widest">
                                                    비밀번호
                                                </label>
                                                <input
                                                    type="password"
                                                    value={loginKey}
                                                    onChange={(e) => setLoginKey(e.target.value)}
                                                    className="w-full bg-black/50 border border-cyan-500/30 rounded px-4 py-3 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors"
                                                    placeholder="비밀번호를 입력하세요"
                                                />
                                            </div>

                                            {/* Error Message Display */}
                                            {loginError && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="text-red-500 text-[10px] font-mono border border-red-500/30 bg-red-500/10 p-2 rounded text-center"
                                                >
                                                    ⚠ {loginError}
                                                </motion.div>
                                            )}
                                        </div>

                                        <div className="mt-8 space-y-3">
                                            <HoverBorderGradient
                                                as="button"
                                                type="submit"
                                                containerClassName="w-full rounded"
                                                className="w-full bg-cyan-500/10 text-cyan-400 py-3 font-mono text-sm tracking-widest uppercase"
                                            >
                                                로그인
                                            </HoverBorderGradient>

                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => router.push('/signup')}
                                                    className="flex-1 py-3 text-white/40 hover:text-white font-mono text-xs tracking-widest uppercase transition-colors border border-white/5 rounded hover:bg-white/5"
                                                >
                                                    회원가입
                                                </button>
                                            </div>

                                            <div className="pt-2 border-t border-white/5 space-y-2">
                                                <GoogleLoginButton />

                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const result = signInAsGuest();
                                                            if (result.success) {
                                                                setSystemStatus(prev => [...prev, 'GUEST_ACCESS_GRANTED', 'REDIRECTING...']);
                                                                // Force hard reload to ensure all contexts pick up the new session
                                                                setTimeout(() => window.location.href = '/', 500);
                                                            }
                                                        }}
                                                        className="py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded border border-white/10 font-mono text-[10px] uppercase tracking-wider transition-colors"
                                                    >
                                                        GUEST_LOGIN
                                                        <br />
                                                        (익명 접속)
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const result = loginAsTestCommander();
                                                            if (result.success) {
                                                                setSystemStatus(prev => [...prev, 'TEST_COMMANDER_ACCESS', 'OVERRIDING_RESOURCES...', 'REDIRECTING...']);
                                                                // Force hard reload to ensure all contexts pick up the new session
                                                                setTimeout(() => window.location.href = '/', 800);
                                                            }
                                                        }}
                                                        className="py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500/70 hover:text-yellow-400 rounded border border-yellow-500/20 font-mono text-[10px] uppercase tracking-wider transition-colors"
                                                    >
                                                        TEST_MODE
                                                        <br />
                                                        (테스트 계정)
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
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
