'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import CyberPageLayout from '@/components/CyberPageLayout';
import GameCard from '@/components/GameCard';
import { Card as CardType, BattleGenre } from '@/lib/types';
import { storage } from '@/lib/utils';
import { analyzeDeckSynergy, getFactionDisplayName } from '@/lib/synergy-utils';
import gameBalanceData from '@/data/game-balance.json';
import { HoverBorderGradient } from '@/components/ui/aceternity/hover-border-gradient';
import { cn } from '@/lib/utils';

export default function BattlePage() {
    const router = useRouter();
    const [cards, setCards] = useState<any[]>([]);
    const [selectedCards, setSelectedCards] = useState<string[]>([]);
    const [battleGenre, setBattleGenre] = useState<BattleGenre | null>(null);

    useEffect(() => {
        const savedCards = storage.get<CardType[]>('userCards', []);
        setCards(savedCards);
        const genres = gameBalanceData.battleGenres;
        const randomGenre = genres[Math.floor(Math.random() * genres.length)];
        setBattleGenre(randomGenre as BattleGenre);
    }, []);

    const toggleCardSelection = (cardId: string) => {
        if (selectedCards.includes(cardId)) {
            setSelectedCards(selectedCards.filter(id => id !== cardId));
        } else if (selectedCards.length < 5) {
            setSelectedCards([...selectedCards, cardId]);
        }
    };

    const startBattle = () => {
        if (selectedCards.length !== 5) {
            alert('5장의 카드를 선택해주세요!');
            return;
        }
        const cardIds = selectedCards.join(',');
        router.push(`/battle/fight?cards=${cardIds}&genre=${battleGenre?.id}`);
    };

    const selectedCardObjects = selectedCards.map(id => cards.find(c => c.id === id)).filter(Boolean) as CardType[];
    const synergy = selectedCards.length > 0 ? analyzeDeckSynergy(selectedCardObjects) : null;

    return (
        <CyberPageLayout
            title="COMBAT_ARENA"
            subtitle="Battle Protocol"
            description="5장의 유닛 카드를 선택하여 5전 3선승제 전투를 시작하세요. 시너지 보너스를 활용하면 승률이 높아집니다."
            color="red"
        >
            {/* Battle Genre */}
            {battleGenre && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-6 mb-8 text-center"
                >
                    <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mb-2">TODAY'S_GENRE</p>
                    <h2 className="text-2xl font-black orbitron text-red-400 mb-2">{battleGenre.name}</h2>
                    <p className="text-sm text-white/50">{battleGenre.description}</p>
                </motion.div>
            )}

            {/* Selection Status & Start Button */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-mono text-white/60">
                        SELECTED: <span className={cn("font-bold", selectedCards.length === 5 ? "text-green-400" : "text-cyan-400")}>{selectedCards.length}/5</span>
                    </span>
                    {selectedCards.length > 0 && (
                        <button
                            onClick={() => setSelectedCards([])}
                            className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest bg-white/5 border border-white/10 text-white/40 rounded hover:text-white hover:border-white/20 transition-all"
                        >
                            RESET
                        </button>
                    )}
                </div>
                <div className="w-48">
                    {selectedCards.length === 5 ? (
                        <HoverBorderGradient
                            onClick={startBattle}
                            className="w-full py-3"
                            containerClassName="w-full"
                        >
                            <span className="font-mono text-sm uppercase tracking-widest text-white">ENGAGE ⚔️</span>
                        </HoverBorderGradient>
                    ) : (
                        <button disabled className="w-full py-3 bg-white/5 border border-white/10 text-white/30 rounded text-sm font-mono uppercase tracking-widest cursor-not-allowed">
                            SELECT 5 UNITS
                        </button>
                    )}
                </div>
            </div>

            {/* Synergy Info */}
            {synergy && synergy.activeSynergies.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 mb-8"
                >
                    <h3 className="text-sm font-mono text-purple-400 uppercase tracking-widest mb-4">SYNERGY_BONUS</h3>
                    <div className="space-y-3">
                        {synergy.activeSynergies.map((s, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">🤖</span>
                                    <div>
                                        <p className="font-bold text-white">{getFactionDisplayName(s.faction)}</p>
                                        <p className="text-[10px] text-white/40 font-mono">{s.count} UNITS</p>
                                    </div>
                                </div>
                                <span className="text-xl font-bold text-green-400">+{((s.bonus - 1) * 100).toFixed(0)}%</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                        <span className="font-mono text-white/60">TOTAL_BONUS</span>
                        <span className="text-2xl font-black orbitron text-green-400">+{((synergy.totalBonus - 1) * 100).toFixed(0)}%</span>
                    </div>
                </motion.div>
            )}

            {/* Card Grid */}
            {cards.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-white/30 mb-4 font-mono">NO_UNITS_AVAILABLE</p>
                    <button
                        onClick={() => router.push('/shop')}
                        className="px-6 py-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm font-mono uppercase tracking-widest hover:bg-red-500/30 transition-all"
                    >
                        VISIT_MARKET 🛒
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {cards.map((card, i) => (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                            onClick={() => toggleCardSelection(card.id)}
                            className={cn(
                                "cursor-pointer transition-all",
                                selectedCards.includes(card.id) && "ring-2 ring-red-500 scale-105"
                            )}
                        >
                            <GameCard card={card} />
                            {selectedCards.includes(card.id) && (
                                <div className="mt-2 text-center">
                                    <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-400 rounded text-[10px] font-mono uppercase">
                                        SELECTED ✓
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </CyberPageLayout>
    );
}
