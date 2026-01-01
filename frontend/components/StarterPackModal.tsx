'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/custom/Button';
import { X } from 'lucide-react';
import GachaRevealModal from './GachaRevealModal';
import { Card } from '@/lib/types';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { cn } from '@/lib/utils';

export default function StarterPackModal() {
    const { starterPackAvailable, claimStarterPack, hideStarterPack } = useUser();
    useEscapeKey(starterPackAvailable, hideStarterPack);

    const [step, setStep] = useState<'welcome' | 'nickname' | 'confirm'>('welcome');
    const [nickname, setNickname] = useState('');
    const [isClaiming, setIsClaiming] = useState(false);
    const [revealedCards, setRevealedCards] = useState<Card[]>([]);
    const [showReveal, setShowReveal] = useState(false);
    const [error, setError] = useState('');

    if (!starterPackAvailable) return null;

    const handleNext = () => {
        if (step === 'welcome') setStep('nickname');
        else if (step === 'nickname') {
            if (!nickname.trim()) {
                setError('닉네임을 입력해주세요.');
                return;
            }
            if (nickname.length < 2 || nickname.length > 10) {
                setError('2~10자 사이로 입력해주세요.');
                return;
            }
            setError('');
            setStep('confirm');
        }
    };

    const handleClaim = async () => {
        if (!nickname.trim()) return;

        setIsClaiming(true);
        // "Opening" effect delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        const cards = await claimStarterPack(nickname);

        if (cards && cards.length > 0) {
            setRevealedCards(cards);
            setShowReveal(true);
        } else {
            hideStarterPack();
        }
        setIsClaiming(false);
    };

    if (showReveal) {
        return (
            <GachaRevealModal
                isOpen={true}
                onClose={hideStarterPack}
                cards={revealedCards}
                packType="starter"
                bonusReward={{ type: 'coins', amount: 1000 }}
            />
        );
    }

    return (
        <AnimatePresence mode="wait">
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                />

                <motion.div
                    key={step}
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: -20 }}
                    className="relative bg-gradient-to-b from-gray-900 via-slate-900 to-black border border-white/10 rounded-3xl p-10 max-w-lg w-full text-center shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                    {/* Background Decorative Elements */}
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />

                    <button
                        onClick={hideStarterPack}
                        className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5 z-50"
                    >
                        <X size={20} />
                    </button>

                    {step === 'welcome' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10">
                            <div className="text-7xl mb-6 relative inline-block">
                                <span className="relative z-10">🌍</span>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ repeat: Infinity, duration: 3 }}
                                    className="absolute inset-0 bg-cyan-500/40 blur-2xl rounded-full"
                                />
                            </div>
                            <h1 className="text-4xl font-black orbitron bg-gradient-to-r from-cyan-400 via-white to-amber-400 text-transparent bg-clip-text mb-4 tracking-tighter">
                                WELCOME TO AI WAR
                            </h1>
                            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                                인류의 마지막 희망, 새로운 지휘관님을 환영합니다.<br />
                                전장에서 사용할 특별 보급품이 도착했습니다.
                            </p>
                            <Button
                                onClick={handleNext}
                                className="w-full h-16 text-xl font-black orbitron bg-white text-black hover:bg-cyan-400 hover:text-black transition-all duration-300 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.2)] group"
                            >
                                <span className="group-hover:translate-x-1 transition-transform">INITIALIZE MISSION</span>
                            </Button>
                        </motion.div>
                    )}

                    {step === 'nickname' && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="relative z-10">
                            <div className="text-5xl mb-6 text-cyan-400">🆔</div>
                            <h2 className="text-2xl font-bold text-white mb-2">지휘관의 이름을 정해주세요</h2>
                            <p className="text-gray-400 text-sm mb-8 italic">이 이름은 전설적인 전공으로 역사에 기록될 것입니다.</p>

                            <div className="space-y-4 mb-8">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        placeholder="지휘관 닉네임 입력"
                                        className={cn(
                                            "w-full h-16 px-6 bg-white/5 border rounded-2xl text-center text-xl font-bold text-white focus:outline-none focus:ring-2 transition-all",
                                            error ? "border-red-500/50 focus:ring-red-500/30" : "border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                                        )}
                                        maxLength={10}
                                        autoFocus
                                    />
                                    {error && <p className="text-red-400 text-xs mt-2 absolute w-full">{error}</p>}
                                </div>
                            </div>

                            <Button
                                onClick={handleNext}
                                className="w-full h-14 font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl"
                            >
                                다음 단계로
                            </Button>
                        </motion.div>
                    )}

                    {step === 'confirm' && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10">
                            <div className="text-5xl mb-6">📦</div>
                            <h2 className="text-3xl font-black text-white mb-2 italic">"{nickname}" </h2>
                            <p className="text-gray-400 text-sm mb-6">지휘관님께 전달될 보급 목록입니다.</p>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-white/5 rounded-2xl p-5 border border-white/5 text-center">
                                    <div className="text-3xl mb-1">💰</div>
                                    <div className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Currency</div>
                                    <div className="text-yellow-400 text-xl font-black orbitron">1,000</div>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-5 border border-white/5 text-center">
                                    <div className="text-3xl mb-1">🃏</div>
                                    <div className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Units</div>
                                    <div className="text-cyan-400 text-xl font-black orbitron">5 PACK</div>
                                </div>
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8 text-left">
                                <p className="text-amber-200/80 text-xs leading-relaxed flex items-start gap-2">
                                    <span className="shrink-0 mt-0.5">💡</span>
                                    <span>
                                        보급팩에는 <strong>일반, 희귀, 에픽, 전설, 유니크</strong> 등급의 유닛이 각 1장씩 포함되어 있습니다.
                                        최고 등급인 <strong>군단장(Commander)</strong> 유닛은 AI 군단을 구독하여 획득할 수 있습니다.
                                    </span>
                                </p>
                            </div>

                            <Button
                                onClick={handleClaim}
                                disabled={isClaiming}
                                className="w-full h-16 text-xl font-black orbitron bg-gradient-to-r from-amber-600 to-amber-400 text-white rounded-2xl shadow-[0_10px_40px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                {isClaiming ? "CONNECTING..." : "DEPLOY NOW"}
                            </Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
