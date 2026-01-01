'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import CyberPageLayout from '@/components/CyberPageLayout';
import GameCard from '@/components/GameCard';
import { useFooter } from '@/context/FooterContext';
import { useUser } from '@/context/UserContext';
import { useAlert } from '@/context/AlertContext';
import { loadInventory, InventoryCard, filterCards, sortCards, getInventoryStats, updateInventoryCard } from '@/lib/inventory-system';
import { SortAsc, SortDesc, Grid3X3, LayoutList, Lock } from 'lucide-react';
import { cn, storage } from '@/lib/utils';
import { useTranslation } from '@/context/LanguageContext';
// rerollCardStats import removed
import { useFirebase } from '@/components/FirebaseProvider';
import { CARD_DATABASE } from '@/data/card-database';
import { gameStorage } from '@/lib/game-storage';
import { getCardName } from '@/data/card-translations';
import { useCardModal } from '@/components/CardModalContext';

type SortOption = 'power' | 'rarity' | 'name' | 'acquiredAt';
type FilterOption = 'all' | 'common' | 'rare' | 'epic' | 'legendary' | 'unique' | 'commander';

// Requested Order: Common -> Rare -> Hero(Epic) -> Legend -> Unique -> Commander
const rarityOrder = {
    common: 1,
    rare: 2,
    epic: 3,
    legendary: 4,
    unique: 5,
    commander: 6
};


export default function MyCardsPage() {
    const { user } = useFirebase();
    const router = useRouter();
    const { t, language } = useTranslation();
    const footer = useFooter();
    const { inventory: globalInventory, loading: globalLoading, refreshData } = useUser();
    const { showAlert } = useAlert();
    const { openCardModal } = useCardModal();

    const [mounted, setMounted] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<SortOption>('rarity'); // Default by rarity
    const [sortAsc, setSortAsc] = useState(true); // Low to High (Common to Commander)
    const [filterRarity, setFilterRarity] = useState<FilterOption>('all');

    useEffect(() => {
        setMounted(true);
        // refreshData is called internally by UserContext, but we can call it here if we want absolute fresh data on mount
        refreshData();
    }, []);

    // Inventory processing (Moved filter/sort logic to use globalInventory)
    const cards = globalInventory;
    const loading = globalLoading;

    const filteredAndSortedCards = useMemo(() => {
        let result = [...cards];

        // Filter by rarity
        if (filterRarity !== 'all') {
            result = filterCards(result, { rarity: [filterRarity] });
        }

        // Sort
        result = sortCards(result, sortBy, sortAsc);

        return result;
    }, [cards, filterRarity, sortBy, sortAsc]);

    const statsOverview = useMemo(() => {
        return getInventoryStats(cards);
    }, [cards]);

    if (!mounted) {
        return <div className="min-h-screen bg-black" />;
    }

    return (
        <CyberPageLayout
            title={language === 'ko' ? '보유 카드 목록' : 'Card Inventory'}
            englishTitle="MY INVENTORY"
            subtitle={language === 'ko' ? '카드 인벤토리' : 'Card Inventory'}
            description={language === 'ko' ? '생성된 유닛을 관리하세요.' : 'Manage your generated units.'}
            color="purple"
        >
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: '전체 보유량', value: statsOverview.total, color: 'text-white' },
                    { label: '군단장', value: statsOverview.byRarity['commander'] || 0, color: 'text-red-500' },
                    { label: '유니크', value: statsOverview.byRarity['unique'] || 0, color: 'text-pink-500' },
                    { label: '전설', value: statsOverview.byRarity['legendary'] || 0, color: 'text-amber-400' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="bg-white/5 border border-white/10 rounded-lg p-4 text-center"
                    >
                        <p className={cn("text-2xl font-black orbitron", stat.color)}>{stat.value}</p>
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Dev Buttons Removed */}

            {/* Main Cards Section - 주력카드 */}
            {!loading && cards.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-amber-400">⭐</span>
                        {language === 'ko' ? '주력 카드' : 'Main Cards'}
                        <span className="text-xs text-white/40 font-normal">
                            ({language === 'ko' ? '등급별 최고 레벨' : 'Highest level per rarity'})
                        </span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 bg-gradient-to-br from-amber-900/10 to-purple-900/10 p-4 rounded-xl border border-amber-500/20">
                        {(() => {
                            // Get highest level card per rarity
                            const mainCards: Record<string, InventoryCard> = {};
                            const rarities = ['commander', 'unique', 'legendary', 'epic', 'rare', 'common'];

                            cards.forEach(card => {
                                const rarity = card.rarity || 'common';
                                if (!mainCards[rarity] || (card.level || 1) > (mainCards[rarity].level || 1)) {
                                    mainCards[rarity] = card;
                                }
                            });

                            return rarities.map(rarity => {
                                const card = mainCards[rarity];
                                if (!card) return null;

                                return (
                                    <motion.div
                                        key={rarity}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="cursor-pointer relative"
                                        onClick={() => openCardModal(card)}
                                    >
                                        <GameCard card={card} isSelected={false} />
                                        {/* Rarity Label */}
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/80 border border-white/20 rounded text-[8px] font-bold text-white/60 whitespace-nowrap">
                                            {rarity === 'commander' ? '군단장' :
                                                rarity === 'unique' ? '유니크' :
                                                    rarity === 'legendary' ? '전설' :
                                                        rarity === 'epic' ? '영웅' :
                                                            rarity === 'rare' ? '희귀' : '일반'}
                                        </div>
                                    </motion.div>
                                );
                            }).filter(Boolean);
                        })()}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6 bg-black/20 p-3 rounded-xl border border-white/5">
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {(['all', 'common', 'rare', 'epic', 'legendary', 'unique', 'commander'] as FilterOption[]).map(rarity => {
                        const labelMap: Record<string, string> = {
                            all: '전체',
                            common: '일반',
                            rare: '희귀',
                            epic: '영웅',
                            legendary: '전설',
                            unique: '유니크',
                            commander: '군단장'
                        };
                        return (
                            <button
                                key={rarity}
                                onClick={() => setFilterRarity(rarity)}
                                className={cn(
                                    "px-3 py-1.5 rounded text-[10px] font-mono font-bold transition-all whitespace-nowrap",
                                    filterRarity === rarity
                                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                                        : 'bg-white/5 text-white/40 border border-white/10 hover:border-white/20'
                                )}
                            >
                                {labelMap[rarity]}
                            </button>
                        );
                    })}
                </div>

                <div className="flex-1 min-w-[20px]" />

                <div className="flex gap-2">
                    {(['rarity', 'power', 'name', 'acquiredAt'] as SortOption[]).map(option => (
                        <button
                            key={option}
                            onClick={() => {
                                if (sortBy === option) setSortAsc(!sortAsc);
                                else { setSortBy(option); setSortAsc(true); }
                            }}
                            className={cn(
                                "px-3 py-1.5 rounded text-[10px] font-mono uppercase tracking-widest transition-all flex items-center gap-1",
                                sortBy === option
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                                    : 'bg-white/5 text-white/40 border border-white/10 hover:border-white/20'
                            )}
                        >
                            {option === 'acquiredAt' ? 'DATE' : option.toUpperCase()}
                            {sortBy === option && (sortAsc ? <SortAsc size={12} /> : <SortDesc size={12} />)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cards Grid */}
            {loading ? (
                <div className="text-center py-20 text-white/30 font-mono">LOADING_INVENTORY_DATA...</div>
            ) : filteredAndSortedCards.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10 border-dashed">
                    <p className="text-white/30 mb-4 font-mono">NO_UNITS_FOUND</p>
                    <button
                        onClick={() => router.push('/factions')}
                        className="px-6 py-3 bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded-lg text-sm font-mono uppercase tracking-widest hover:bg-purple-500/30 transition-all"
                    >
                        GO_TO_GENERATION
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-20">
                    {filteredAndSortedCards.map((card, i) => (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className="cursor-pointer"
                            onClick={() => openCardModal(card)}
                        >
                            <GameCard card={card} isSelected={false} />
                            {card.isLocked && (
                                <div className="absolute top-2 left-2 w-6 h-6 bg-amber-500/80 rounded-full flex items-center justify-center pointer-events-none">
                                    <Lock size={12} className="text-black" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}


        </CyberPageLayout>
    );
}
