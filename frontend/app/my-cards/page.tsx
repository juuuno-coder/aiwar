'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import CyberPageLayout from '@/components/CyberPageLayout';
import GameCard from '@/components/GameCard';
import { useFooter } from '@/context/FooterContext';
import { useUser } from '@/context/UserContext';
import { useAlert } from '@/context/AlertContext';
import { loadInventory, InventoryCard, filterCards, sortCards, getInventoryStats } from '@/lib/inventory-system';
import { SortAsc, SortDesc, Grid3X3, LayoutList, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/context/LanguageContext';

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
    const router = useRouter();
    const { t } = useTranslation();
    const footer = useFooter();
    const { addCoins, refreshData } = useUser();
    const { showAlert } = useAlert();

    const [cards, setCards] = useState<InventoryCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<SortOption>('rarity'); // Default by rarity
    const [sortAsc, setSortAsc] = useState(true); // Low to High (Common to Commander)
    const [filterRarity, setFilterRarity] = useState<FilterOption>('all');
    const [selectedCard, setSelectedCard] = useState<InventoryCard | null>(null);

    useEffect(() => {
        loadCards();
    }, []);

    const loadCards = async () => {
        setLoading(true);
        try {
            const inventory = await loadInventory();
            setCards(inventory);
        } catch (error) {
            console.error('Failed to load inventory:', error);
            showAlert({ title: '오류', message: '인벤토리 로드에 실패했습니다.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

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

    return (
        <CyberPageLayout
            title="보유 카드 목록"
            englishTitle="MY INVENTORY"
            subtitle="Card Inventory"
            description="Manage your generated units. Cards are sorted by rarity tier from Common to Commander."
            color="purple"
        >
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'TOTAL_UNITS', value: statsOverview.total, color: 'text-white' },
                    { label: 'COMMANDER', value: statsOverview.byRarity['commander'] || 0, color: 'text-red-500' },
                    { label: 'UNIQUE', value: statsOverview.byRarity['unique'] || 0, color: 'text-pink-500' },
                    { label: 'LEGENDARY', value: statsOverview.byRarity['legendary'] || 0, color: 'text-amber-400' },
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
            <div className="flex flex-wrap gap-3 mb-6 bg-black/20 p-3 rounded-xl border border-white/5">
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {(['all', 'common', 'rare', 'epic', 'legendary', 'unique', 'commander'] as FilterOption[]).map(rarity => (
                        <button
                            key={rarity}
                            onClick={() => setFilterRarity(rarity)}
                            className={cn(
                                "px-3 py-1.5 rounded text-[10px] font-mono uppercase tracking-widest transition-all whitespace-nowrap",
                                filterRarity === rarity
                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                                    : 'bg-white/5 text-white/40 border border-white/10 hover:border-white/20'
                            )}
                        >
                            {rarity === 'all' ? 'ALL' : rarity.toUpperCase()}
                        </button>
                    ))}
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-20">
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
                                <div className="absolute top-2 left-2 w-6 h-6 bg-amber-500/80 rounded-full flex items-center justify-center pointer-events-none">
                                    <Lock size={12} className="text-black" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Selected Card Quick Actions Overlay */}
            <AnimatePresence>
                {selectedCard && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black via-black/90 to-transparent flex justify-center pb-8 pointer-events-none"
                    >
                        <div className="bg-black/80 border border-white/20 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-6 shadow-2xl shadow-purple-500/20 pointer-events-auto max-w-2xl w-full">
                            {/* Mini Card Preview */}
                            <div className="w-16 h-20 bg-white/5 rounded border border-white/10 flex-none hidden md:block" />

                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-white text-lg truncate font-orbitron">{selectedCard.name}</p>
                                <div className="flex gap-2 mt-1">
                                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 uppercase",
                                        selectedCard.rarity === 'legendary' ? 'text-amber-400' :
                                            selectedCard.rarity === 'epic' ? 'text-purple-400' : 'text-white/60'
                                    )}>
                                        {selectedCard.rarity}
                                    </span>
                                    <span className="text-[10px] text-white/40 font-mono py-0.5">LV.{selectedCard.level || 1}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => router.push(`/enhance?cardId=${selectedCard.id}`)}
                                    className="px-4 py-3 bg-amber-500/10 border border-amber-500/40 text-amber-400 rounded-lg text-xs font-mono uppercase font-bold hover:bg-amber-500/20 transition-all"
                                >
                                    Enhance
                                </button>
                                <button
                                    onClick={() => router.push(`/fusion?cardId=${selectedCard.id}`)}
                                    className="px-4 py-3 bg-purple-500/10 border border-purple-500/40 text-purple-400 rounded-lg text-xs font-mono uppercase font-bold hover:bg-purple-500/20 transition-all"
                                >
                                    Fuse
                                </button>
                                <button
                                    onClick={() => setSelectedCard(null)}
                                    className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </CyberPageLayout>
    );
}
