'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import CyberPageLayout from '@/components/CyberPageLayout';
import GameCard from '@/components/GameCard';
import { Button } from '@/components/ui/custom/Button';
import { useFooter } from '@/context/FooterContext';
import { useUser } from '@/context/UserContext';
import { useAlert } from '@/context/AlertContext';
import { gameStorage } from '@/lib/game-storage';
import { SortAsc, SortDesc, Grid3X3, LayoutList, Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';

type SortOption = 'power' | 'rarity' | 'name';
type FilterOption = 'all' | 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4, mythic: 5 };

export default function MyCardsPage() {
    const footer = useFooter();
    const { addCoins, refreshData } = useUser();
    const { showAlert } = useAlert();

    const [cards, setCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<SortOption>('power');
    const [sortAsc, setSortAsc] = useState(false);
    const [filterRarity, setFilterRarity] = useState<FilterOption>('all');
    const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
    const [selectedCard, setSelectedCard] = useState<any | null>(null);

    useEffect(() => {
        loadCards();
    }, []);

    const loadCards = async () => {
        setLoading(true);
        const userCards = await gameStorage.getCards();
        setCards(userCards);
        setLoading(false);
    };

    const filteredAndSortedCards = useMemo(() => {
        let result = [...cards];
        if (filterRarity !== 'all') {
            result = result.filter(c => c.rarity === filterRarity);
        }
        result.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'power':
                    comparison = (b.stats?.totalPower || 0) - (a.stats?.totalPower || 0);
                    break;
                case 'rarity':
                    comparison = (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0) -
                        (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0);
                    break;
                case 'name':
                    comparison = (a.name || '').localeCompare(b.name || '');
                    break;
            }
            return sortAsc ? -comparison : comparison;
        });
        return result;
    }, [cards, filterRarity, sortBy, sortAsc]);

    const statsOverview = useMemo(() => {
        const total = cards.length;
        const byRarity: Record<string, number> = {};
        cards.forEach(c => {
            byRarity[c.rarity || 'common'] = (byRarity[c.rarity || 'common'] || 0) + 1;
        });
        const avgPower = cards.length > 0
            ? Math.round(cards.reduce((sum, c) => sum + (c.stats?.totalPower || 0), 0) / cards.length)
            : 0;
        return { total, byRarity, avgPower };
    }, [cards]);

    return (
        <CyberPageLayout
            title="UNIT_ARCHIVE"
            subtitle="Card Management"
            description="보유 중인 모든 유닛 카드를 확인하고 관리하세요. 강화, 합성, 판매가 가능합니다."
            color="purple"
        >
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'TOTAL_UNITS', value: statsOverview.total, color: 'text-white' },
                    { label: 'LEGENDARY', value: statsOverview.byRarity['legendary'] || 0, color: 'text-amber-400' },
                    { label: 'EPIC', value: statsOverview.byRarity['epic'] || 0, color: 'text-purple-400' },
                    { label: 'AVG_POWER', value: statsOverview.avgPower, color: 'text-cyan-400' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="bg-white/5 border border-white/10 rounded-lg p-4 text-center"
                    >
                        <p className={cn("text-2xl font-black orbitron", stat.color)}>{stat.value}</p>
                        <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-1">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex gap-2">
                    {(['all', 'legendary', 'epic', 'rare', 'common'] as FilterOption[]).map(rarity => (
                        <button
                            key={rarity}
                            onClick={() => setFilterRarity(rarity)}
                            className={cn(
                                "px-3 py-1.5 rounded text-[10px] font-mono uppercase tracking-widest transition-all",
                                filterRarity === rarity
                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                                    : 'bg-white/5 text-white/40 border border-white/10 hover:border-white/20'
                            )}
                        >
                            {rarity === 'all' ? '전체' : rarity === 'legendary' ? '전설' : rarity === 'epic' ? '영웅' : rarity === 'rare' ? '희귀' : '일반'}
                        </button>
                    ))}
                </div>

                <div className="flex-1" />

                <div className="flex gap-2">
                    {(['power', 'rarity', 'name'] as SortOption[]).map(option => (
                        <button
                            key={option}
                            onClick={() => {
                                if (sortBy === option) setSortAsc(!sortAsc);
                                else { setSortBy(option); setSortAsc(false); }
                            }}
                            className={cn(
                                "px-3 py-1.5 rounded text-[10px] font-mono uppercase tracking-widest transition-all flex items-center gap-1",
                                sortBy === option
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                                    : 'bg-white/5 text-white/40 border border-white/10 hover:border-white/20'
                            )}
                        >
                            {option === 'power' ? '파워' : option === 'rarity' ? '등급' : '이름'}
                            {sortBy === option && (sortAsc ? <SortAsc size={12} /> : <SortDesc size={12} />)}
                        </button>
                    ))}
                </div>

                <div className="flex gap-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn("p-2 rounded transition-all", viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white')}
                    >
                        <Grid3X3 size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn("p-2 rounded transition-all", viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white')}
                    >
                        <LayoutList size={16} />
                    </button>
                </div>
            </div>

            {/* Cards Grid */}
            {loading ? (
                <div className="text-center py-20 text-white/30 font-mono">LOADING_DATA...</div>
            ) : filteredAndSortedCards.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-white/30 mb-4 font-mono">NO_UNITS_FOUND</p>
                    <button
                        onClick={() => window.location.href = '/slots'}
                        className="px-6 py-3 bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded-lg text-sm font-mono uppercase tracking-widest hover:bg-purple-500/30 transition-all"
                    >
                        GENERATE_UNITS
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredAndSortedCards.map((card, i) => (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className="cursor-pointer"
                            onClick={() => setSelectedCard(card)}
                        >
                            <GameCard card={card} isSelected={selectedCard?.id === card.id} />
                            {card.isLocked && (
                                <div className="absolute top-2 left-2 w-6 h-6 bg-amber-500/80 rounded-full flex items-center justify-center">
                                    <Lock size={12} className="text-black" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Selected Card Actions */}
            {selectedCard && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
                >
                    <div className="bg-black/90 border border-white/20 backdrop-blur-xl rounded-lg p-4 flex items-center gap-4">
                        <div className="text-center">
                            <p className="font-bold text-white text-sm">{selectedCard.name}</p>
                            <p className="text-[10px] text-white/40 font-mono">LV.{selectedCard.level || 1}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => window.location.href = '/enhance'}
                                className="px-4 py-2 bg-amber-500/20 border border-amber-500/50 text-amber-400 rounded text-[10px] font-mono uppercase tracking-widest hover:bg-amber-500/30 transition-all"
                            >
                                ENHANCE
                            </button>
                            <button
                                onClick={() => window.location.href = '/fusion'}
                                className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded text-[10px] font-mono uppercase tracking-widest hover:bg-purple-500/30 transition-all"
                            >
                                FUSION
                            </button>
                            <button
                                onClick={() => setSelectedCard(null)}
                                className="px-4 py-2 bg-white/5 border border-white/10 text-white/40 rounded text-[10px] font-mono uppercase tracking-widest hover:text-white transition-all"
                            >
                                CLOSE
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </CyberPageLayout>
    );
}
