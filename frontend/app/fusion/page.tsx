'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CyberPageLayout from '@/components/CyberPageLayout';
import GameCard from '@/components/GameCard';
import { Card as CardType } from '@/lib/types';
import { canFuse, fuseCards, getFusionCost, getFusionPreview, getRarityName } from '@/lib/fusion-utils';
import { HoverBorderGradient } from '@/components/ui/aceternity/hover-border-gradient';
import { cn } from '@/lib/utils';

export default function FusionPage() {
    const [allCards, setAllCards] = useState<CardType[]>([]);
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

    const handleToggleMaterial = (card: CardType) => {
        if (materialCards.find(c => c.id === card.id)) {
            setMaterialCards(prev => prev.filter(c => c.id !== card.id));
        } else {
            if (materialCards.length >= 3) return;
            setMaterialCards(prev => [...prev, card]);
        }
    };

    const handleFusion = async () => {
        if (materialCards.length !== 3) return;
        const check = canFuse(materialCards, userTokens);
        if (!check.canFuse) {
            alert(check.reason);
            return;
        }

        const { gameStorage } = await import('@/lib/game-storage');
        const fusedCard = fuseCards(materialCards, 'guest');
        const cost = getFusionCost(materialCards[0].rarity!);

        for (const mat of materialCards) {
            await gameStorage.deleteCard(mat.id);
        }
        await gameStorage.addCardToInventory(fusedCard);
        await gameStorage.addTokens(-cost);

        alert(`융합 성공! ${fusedCard.rarity} 카드 획득!`);
        setMaterialCards([]);
        await loadCards();
    };

    const preview = materialCards.length === 3 ? getFusionPreview(materialCards) : null;

    return (
        <CyberPageLayout
            title="FUSION_LAB"
            subtitle="Card Synthesis"
            description="같은 등급 카드 3장을 합성하여 상위 등급 카드 1장을 획득합니다. 합성 확률은 100%입니다."
            color="purple"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Materials */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-6"
                >
                    <h3 className="text-sm font-mono text-purple-400 uppercase tracking-widest mb-4">
                        MATERIAL_UNITS ({materialCards.length}/3)
                    </h3>

                    <div className="grid grid-cols-3 gap-4 mb-6 min-h-[200px]">
                        {materialCards.map(card => (
                            <div key={card.id} onClick={() => handleToggleMaterial(card)} className="cursor-pointer hover:opacity-70 transition-opacity">
                                <GameCard card={card} />
                            </div>
                        ))}
                        {Array.from({ length: 3 - materialCards.length }).map((_, i) => (
                            <div key={i} className="aspect-[2/3] border border-dashed border-white/10 rounded-lg flex items-center justify-center text-white/20 text-sm font-mono">
                                SLOT_{i + materialCards.length + 1}
                            </div>
                        ))}
                    </div>

                    {preview && (
                        <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg mb-4">
                            <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mb-2">SYNTHESIS_PREVIEW</p>
                            <p className="text-lg font-bold text-white">
                                {getRarityName(preview.currentRarity)} → {preview.nextRarity ? getRarityName(preview.nextRarity) : 'MAX_RARITY'}
                            </p>
                            <p className="text-sm text-white/60">PWR: {preview.currentAvgStats.totalPower} → {preview.nextStats.totalPower}</p>
                            <p className="text-sm text-amber-400 mt-2">COST: {preview.cost} TOKEN</p>
                        </div>
                    )}

                    {materialCards.length === 3 && (
                        <HoverBorderGradient
                            onClick={handleFusion}
                            className="w-full py-3"
                            containerClassName="w-full"
                            duration={2}
                        >
                            <span className="font-bold text-white font-mono uppercase tracking-widest">EXECUTE_FUSION 🔮</span>
                        </HoverBorderGradient>
                    )}
                </motion.div>

                {/* Card List */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-6"
                >
                    <h3 className="text-sm font-mono text-cyan-400 uppercase tracking-widest mb-4">AVAILABLE_UNITS</h3>
                    <div className="grid grid-cols-3 gap-2 max-h-[600px] overflow-y-auto">
                        {allCards.map(card => (
                            <div
                                key={card.id}
                                onClick={() => handleToggleMaterial(card)}
                                className={cn(
                                    "cursor-pointer transition-all",
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
