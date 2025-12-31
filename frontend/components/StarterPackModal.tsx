'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/custom/Button';
import { X } from 'lucide-react';
import GachaRevealModal from './GachaRevealModal';
import { Card } from '@/lib/types';

export default function StarterPackModal() {
    const { starterPackAvailable, claimStarterPack, hideStarterPack } = useUser();
    const [isClaiming, setIsClaiming] = useState(false);
    const [revealedCards, setRevealedCards] = useState<Card[]>([]);
    const [showReveal, setShowReveal] = useState(false);

    if (!starterPackAvailable) return null;

    const handleClaim = async () => {
        setIsClaiming(true);
        // Simulate a small delay for "opening" effect
        await new Promise(resolve => setTimeout(resolve, 1500));
        const cards = await claimStarterPack();

        if (cards && cards.length > 0) {
            setRevealedCards(cards);
            setShowReveal(true);
        } else {
            // Fallback or error case
            hideStarterPack();
        }
        setIsClaiming(false);
    };

    // If showing reveal, render GachaRevealModal instead of the prompt
    if (showReveal) {
        return (
            <GachaRevealModal
                isOpen={true}
                cards={revealedCards}
                onClose={hideStarterPack}
                packType="premium"
                bonusReward={{ type: 'coins', amount: 1000 }}
            />
        );
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-gradient-to-b from-gray-900 to-black border border-amber-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl shadow-amber-500/20"
                >
                    <button
                        onClick={hideStarterPack}
                        className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 z-50"
                        title="닫기"
                    >
                        <X size={20} />
                    </button>
                    <div className="mb-6">
                        <div className="text-6xl mb-4 animate-bounce">🎁</div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-yellow-500 text-transparent bg-clip-text mb-2">
                            신규 유저 환영 선물!
                        </h2>
                        <p className="text-gray-400 text-sm">
                            AI 전쟁에 오신 것을 환영합니다.<br />
                            시작을 위한 특별한 선물을 준비했습니다.
                        </p>
                    </div>

                    <div className="space-y-4 bg-white/5 rounded-xl p-4 mb-8">
                        <div className="flex items-center justify-between px-4">
                            <span className="text-gray-300">💰 초기 자금</span>
                            <span className="text-yellow-400 font-bold">+1,000 코인</span>
                        </div>
                        <div className="flex items-center justify-between px-4">
                            <span className="text-gray-300">🃏 스타터 덱</span>
                            <span className="text-cyan-400 font-bold">카드 5장</span>
                        </div>
                    </div>

                    <Button
                        onClick={handleClaim}
                        disabled={isClaiming}
                        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 border-none shadow-lg shadow-amber-900/40"
                    >
                        {isClaiming ? (
                            <div className="flex items-center gap-2">
                                <span className="animate-spin">⏳</span>
                                선물 포장 뜯는 중...
                            </div>
                        ) : (
                            "🎁 선물 받기"
                        )}
                    </Button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
