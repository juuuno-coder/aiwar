import { useFooter } from '@/context/FooterContext';
import { Card } from '@/lib/types';
import { cn } from '@/lib/utils';
import { X, Filter, Search } from 'lucide-react';
import { useState, useCallback, useMemo } from 'react';
import GameCard from '@/components/GameCard';

interface DynamicFooterProps {
    onCardClick?: (card: Card) => void;
    onCardDragStart?: (card: Card) => void;
}

export default function DynamicFooter({ onCardClick, onCardDragStart }: DynamicFooterProps) {
    const { state, isCardSelected, setSearchFilter, setRarityFilter, clearFilters } = useFooter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRarities, setSelectedRarities] = useState<string[]>([]);

    const { inventory, visible } = state;
    const { filteredCards, selectedCardIds } = inventory;

    // 검색어 변경 핸들러 (디바운스 적용)
    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
        // 실제 필터 적용은 300ms 후
        const timer = setTimeout(() => {
            setSearchFilter(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [setSearchFilter]);

    // 등급 필터 토글
    const toggleRarityFilter = useCallback((rarity: string) => {
        setSelectedRarities(prev => {
            const newRarities = prev.includes(rarity)
                ? prev.filter(r => r !== rarity)
                : [...prev, rarity];
            setRarityFilter(newRarities);
            return newRarities;
        });
    }, [setRarityFilter]);

    // 필터 초기화
    const handleClearFilters = useCallback(() => {
        setSearchQuery('');
        setSelectedRarities([]);
        clearFilters();
    }, [clearFilters]);

    // 카드 클릭 핸들러
    const handleCardClick = useCallback((card: Card) => {
        onCardClick?.(card);
    }, [onCardClick]);

    // 드래그 시작 핸들러
    const handleDragStart = useCallback((e: React.DragEvent, card: Card) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/json', JSON.stringify(card));
        onCardDragStart?.(card);
    }, [onCardDragStart]);

    const rarities = ['Common', 'Rare', 'Epic', 'Legendary', 'Unique', 'Commander'];

    if (!visible) return null;

    return (
        <div className={cn(
            "fixed bottom-0 left-0 right-0 z-100",
            "h-[280px] max-h-[45vh]",
            "bg-gradient-to-t from-black to-zinc-900",
            "border-t-2 border-cyan-500",
            "shadow-[0_-10px_50px_rgba(6,182,212,0.3)]",
            "transition-transform duration-300 ease-out",
            visible ? "translate-y-0" : "translate-y-full"
        )}>
            {/* Filter Bar */}
            <div className="h-[60px] border-b border-white/10 px-4 flex items-center gap-4 bg-black/50 backdrop-blur-sm">
                {/* 카드 개수 */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                        내 카드 ({filteredCards.length})
                    </span>
                    {selectedCardIds.size > 0 && (
                        <span className="text-xs text-cyan-400">
                            {selectedCardIds.size}개 선택됨
                        </span>
                    )}
                </div>

                {/* 검색 */}
                <div className="flex-1 max-w-xs relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="카드 검색..."
                        className="w-full pl-10 pr-3 py-1.5 bg-white/5 border border-white/10 rounded text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50"
                    />
                </div>

                {/* 등급 필터 */}
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-white/40" />
                    {rarities.map(rarity => (
                        <button
                            key={rarity}
                            onClick={() => toggleRarityFilter(rarity)}
                            className={cn(
                                "px-2 py-1 text-xs rounded transition-colors",
                                selectedRarities.includes(rarity)
                                    ? "bg-cyan-500 text-black font-bold"
                                    : "bg-white/5 text-white/60 hover:bg-white/10"
                            )}
                        >
                            {rarity}
                        </button>
                    ))}
                </div>

                {/* 필터 초기화 */}
                {(searchQuery || selectedRarities.length > 0) && (
                    <button
                        onClick={handleClearFilters}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                        title="필터 초기화"
                    >
                        <X size={16} className="text-white/60" />
                    </button>
                )}
            </div>

            {/* Inventory Grid */}
            <div className="h-[220px] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3 p-4">
                    {filteredCards.map(card => {
                        const selected = isCardSelected(card.id);
                        return (
                            <div
                                key={card.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, card)}
                                onClick={() => handleCardClick(card)}
                                className={cn(
                                    "cursor-grab active:cursor-grabbing transition-all",
                                    "hover:scale-105 hover:z-10",
                                    selected && "opacity-50 ring-2 ring-purple-500"
                                )}
                            >
                                <GameCard card={card} />
                            </div>
                        );
                    })}
                </div>

                {/* 빈 상태 */}
                {filteredCards.length === 0 && (
                    <div className="h-full flex items-center justify-center text-white/40 text-sm">
                        {searchQuery || selectedRarities.length > 0
                            ? "검색 결과가 없습니다"
                            : "카드가 없습니다"}
                    </div>
                )}
            </div>
        </div>
    );
}
