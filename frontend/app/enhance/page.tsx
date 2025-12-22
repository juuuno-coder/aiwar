'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card as CardType } from '@/lib/types';
import { canEnhance, enhanceCard, getEnhanceCost, getEnhancePreview } from '@/lib/enhance-utils';
import CyberPageLayout from '@/components/CyberPageLayout';
import GameCard from '@/components/GameCard';
import { HoverBorderGradient } from '@/components/ui/aceternity/hover-border-gradient';
import { cn } from '@/lib/utils';

export default function EnhancePage() {
    const [allCards, setAllCards] = useState<CardType[]>([]);
    const [targetCard, setTargetCard] = useState<CardType | null>(null);
    const [materialCards, setMaterialCards] = useState<CardType[]>([]);
    const [userTokens, setUserTokens] = useState(0);

    useEffect(() => {
        loadCards();
    }, []);

    const loadCards = async () => {
        const { gameStorage } = await import('@/lib/game-storage');
        const { getGameState } = await import('@/lib/game-state');
        const cards = await gameStorage.getCards();
        const state = getGameState();
        setAllCards(cards);
        setUserTokens(state.tokens || 0);
    };

    const handleSelectTarget = (card: CardType) => {
        setTargetCard(card);
        setMaterialCards([]);
    };

    const handleToggleMaterial = (card: CardType) => {
        if (card.id === targetCard?.id) return;
        if (materialCards.find(c => c.id === card.id)) {
            setMaterialCards(prev => prev.filter(c => c.id !== card.id));
        } else {
            if (materialCards.length >= 10) return;
            setMaterialCards(prev => [...prev, card]);
        }
    };

    const handleEnhance = async () => {
        if (!targetCard || materialCards.length !== 10) return;
        const check = canEnhance(targetCard, materialCards, userTokens);
        if (!check.canEnhance) {
            alert(check.reason);
            return;
        }

        const { gameStorage } = await import('@/lib/game-storage');
        const enhancedCard = enhanceCard(targetCard, materialCards);
        const cost = getEnhanceCost(targetCard.level);

        for (const mat of materialCards) {
            await gameStorage.deleteCard(mat.id);
        }
        await gameStorage.updateCard(enhancedCard.id, enhancedCard);
        await gameStorage.addTokens(-cost);

        alert(`강화 성공! 레벨 ${enhancedCard.level}로 상승!`);
        setTargetCard(null);
        setMaterialCards([]);
        await loadCards();
    };

    const preview = targetCard && materialCards.length === 10 ? getEnhancePreview(targetCard) : null;

    return (
        <CyberPageLayout
            title="ENHANCE_PROTOCOL"
            subtitle="Unit Upgrade"
            description="같은 유닛 카드 10장을 소모하여 레벨업합니다. 레벨이 올라갈수록 전투력이 상승합니다."
            color="amber"
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Target Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-6"
                >
                    <h3 className="text-sm font-mono text-amber-400 uppercase tracking-widest mb-4">TARGET_UNIT</h3>
                    {targetCard ? (
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <GameCard card={targetCard} />
                            </div>
                            <button
                                onClick={() => setTargetCard(null)}
                                className="w-full py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded text-[10px] font-mono uppercase tracking-widest hover:bg-red-500/30 transition-all"
                            >
                                CANCEL_SELECTION
                            </button>
                        </div>
                    ) : (
                        <div className="py-16 text-center text-white/30 font-mono text-sm">
                            SELECT_TARGET_UNIT
                        </div>
                    )}

                    {preview && (
                        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                            <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mb-2">PREVIEW</p>
                            <p className="text-lg font-bold text-white">LV.{preview.currentLevel} → LV.{preview.nextLevel}</p>
                            <p className="text-sm text-white/60">PWR: {preview.currentStats.totalPower} → {preview.nextStats.totalPower}</p>
                            <p className="text-sm text-amber-400 mt-2">COST: {preview.cost} TOKEN</p>
                        </div>
                    )}
                </motion.div>

                {/* Material Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-6"
                >
                    <h3 className="text-sm font-mono text-purple-400 uppercase tracking-widest mb-4">
                        MATERIAL_UNITS ({materialCards.length}/10)
                    </h3>
                    <div className="grid grid-cols-2 gap-2 max-h-[500px] overflow-y-auto mb-4">
                        {materialCards.map(card => (
                            <div key={card.id} onClick={() => handleToggleMaterial(card)} className="cursor-pointer hover:opacity-70 transition-opacity">
                                <GameCard card={card} />
                            </div>
                        ))}
                        {materialCards.length < 10 && (
                            <div className="aspect-[2/3] border border-dashed border-white/10 rounded-lg flex items-center justify-center text-white/20 text-sm font-mono">
                                +{10 - materialCards.length}
                            </div>
                        )}
                    </div>
                    {materialCards.length === 10 && (
                        <HoverBorderGradient
                            onClick={handleEnhance}
                            className="w-full py-3"
                            containerClassName="w-full"
                            duration={2}
                        >
                            <span className="font-bold text-white font-mono uppercase tracking-widest">EXECUTE_ENHANCE ⚡</span>
                        </HoverBorderGradient>
                    )}
                </motion.div>

                {/* Card List */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-6"
                >
                    <h3 className="text-sm font-mono text-cyan-400 uppercase tracking-widest mb-4">AVAILABLE_UNITS</h3>
                    <div className="grid grid-cols-2 gap-2 max-h-[600px] overflow-y-auto">
                        {allCards.map(card => (
                            <div
                                key={card.id}
                                onClick={() => targetCard ? handleToggleMaterial(card) : handleSelectTarget(card)}
                                className={cn(
                                    "cursor-pointer transition-all",
                                    card.id === targetCard?.id && "ring-2 ring-amber-500",
                                    materialCards.find(c => c.id === card.id) && "ring-2 ring-purple-500 opacity-50"
                                )}
                            >
                                <GameCard card={card} />
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </CyberPageLayout>
    );
}
