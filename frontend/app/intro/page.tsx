'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DraggableCardContainer } from '@/components/ui/aceternity/draggable-card';
import DraggableGameCard from '@/components/game/DraggableGameCard';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';

// Sample cards for demonstration
const DEMO_CARDS = [
    {
        id: 'demo-1',
        name: 'AI Strategist',
        type: 'EFFICIENCY' as const,
        level: 5,
        stats: {
            function: 85,
            efficiency: 92,
            creativity: 78,
            totalPower: 255,
        },
        templateId: 'demo-1',
        ownerId: 'demo',
        experience: 0,
        acquiredAt: new Date(),
        isLocked: false,
    },
    {
        id: 'demo-2',
        name: 'Creative AI',
        type: 'CREATIVITY' as const,
        level: 7,
        stats: {
            function: 78,
            efficiency: 75,
            creativity: 95,
            totalPower: 248,
        },
        templateId: 'demo-2',
        ownerId: 'demo',
        experience: 0,
        acquiredAt: new Date(),
        isLocked: false,
    },
    {
        id: 'demo-3',
        name: 'Efficient AI',
        type: 'COST' as const,
        level: 6,
        stats: {
            function: 88,
            efficiency: 90,
            creativity: 72,
            totalPower: 250,
        },
        templateId: 'demo-3',
        ownerId: 'demo',
        experience: 0,
        acquiredAt: new Date(),
        isLocked: false,
    },
];

export default function IntroPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement Firebase login
        router.push('/main');
    };

    const handleSignUp = () => {
        router.push('/signup');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 relative overflow-hidden">
            {/* Background Effects */}
            <BackgroundBeams />

            {/* Content */}
            <div className="relative z-10 container mx-auto px-6 py-20">
                {/* Hero Title */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-8xl font-black mb-6">
                        <span className="bg-gradient-to-r from-purple-200 via-violet-300 to-indigo-200 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                            AI WAR
                        </span>
                    </h1>
                    <p className="text-xl text-purple-300/60 font-light tracking-wide">
                        The Ultimate Card Battle Experience
                    </p>
                </motion.div>

                {/* Draggable Cards Demo */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-20"
                >
                    <div className="text-center mb-8">
                        <p className="text-lg text-purple-300/80 font-medium">
                            드래그하여 카드를 움직여보세요
                        </p>
                    </div>

                    <DraggableCardContainer className="flex items-center justify-center gap-8 min-h-[400px]">
                        {DEMO_CARDS.map((card, index) => (
                            <motion.div
                                key={card.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                            >
                                <DraggableGameCard card={card} />
                            </motion.div>
                        ))}
                    </DraggableCardContainer>
                </motion.div>

                {/* Login Form */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="max-w-md mx-auto"
                >
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">
                            로그인
                        </h2>

                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    이메일
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-400/50 transition-colors"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    비밀번호
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-400/50 transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            {/* Buttons */}
                            <div className="space-y-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-500/20"
                                >
                                    로그인
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    onClick={handleSignUp}
                                    className="w-full py-3 bg-slate-800/50 border border-purple-500/20 hover:bg-slate-700/50 text-white font-medium rounded-xl transition-all"
                                >
                                    회원가입
                                </motion.button>
                            </div>
                        </form>

                        {/* Guest Login */}
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => router.push('/main')}
                                className="text-sm text-purple-300/60 hover:text-purple-300 transition-colors"
                            >
                                게스트로 시작하기 →
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
