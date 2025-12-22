'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { Meteors } from '@/components/ui/aceternity/effects';
import PageHeader from '@/components/PageHeader';
import GameCard from '@/components/GameCard';
import { Card, CardBody } from '@/components/ui/custom/Card';
import { Button } from '@/components/ui/custom/Button';
import { Chip } from '@/components/ui/custom/Chip';
import { useTranslation } from '@/context/LanguageContext';
import { useFooter } from '@/context/FooterContext';
import { useUser } from '@/context/UserContext';
import { useAlert } from '@/context/AlertContext';
import { gameStorage } from '@/lib/game-storage';
import {
    Filter,
    SortAsc,
    SortDesc,
    Grid3X3,
    LayoutList,
    Sparkles,
    Zap,
    Shield,
    Lock,
    Unlock,
    Trash2,
    Coins
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SortOption = 'power' | 'rarity' | 'name';
type FilterOption = 'all' | 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4, mythic: 5 };
const rarityColors: Record<string, string> = {
    common: 'from-gray-500 to-gray-600',
    rare: 'from-blue-500 to-blue-600',
    epic: 'from-purple-500 to-purple-600',
    legendary: 'from-yellow-500 to-orange-600',
    mythic: 'from-pink-500 to-rose-600',
};

export default function MyCardsPage() {
    const { t, language } = useTranslation();
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

    // 푸터 선택 모드 설정
    useEffect(() => {
        if (isMultiSelectMode) {
            footer.setSelectionMode(10, '카드 선택');
            footer.setLeftNav({ type: 'custom', label: '취소', onClick: () => setIsMultiSelectMode(false) });
        } else {
            footer.exitSelectionMode();
            footer.setAction(undefined);
            footer.setSecondaryAction(undefined);
        }

        return () => {
            footer.exitSelectionMode();
            footer.setAction(undefined);
            footer.setSecondaryAction(undefined);
        };
    }, [isMultiSelectMode]);

    // 선택된 카드에 따른 푸터 액션 업데이트
    useEffect(() => {
        if (isMultiSelectMode && footer.state.selectionSlots.length > 0) {
            const selectedCount = footer.state.selectionSlots.length;
            const sellValue = footer.state.selectionSlots.reduce((sum, c) => {
                const base = c.rarity === 'legendary' ? 100 : c.rarity === 'epic' ? 50 : c.rarity === 'rare' ? 25 : 10;
                return sum + base;
            }, 0);

            footer.setAction({
                label: `판매 (+${sellValue}💰)`,
                color: 'warning',
                onClick: handleBatchSell
            });
            footer.setSecondaryAction({
                label: `잠금 (${selectedCount})`,
                color: 'default',
                onClick: handleBatchLock
            });
            footer.setInfo([
                { label: '선택됨', value: `${selectedCount}장`, color: 'text-cyan-400' }
            ]);
        } else if (isMultiSelectMode) {
            footer.setAction(undefined);
            footer.setSecondaryAction(undefined);
            footer.setInfo([{ label: '안내', value: '카드를 선택하세요', color: 'text-white/50' }]);
        }
    }, [footer.state.selectionSlots, isMultiSelectMode]);

    // 카드 선택/해제 토글
    const toggleCardSelection = (card: any) => {
        if (!isMultiSelectMode) {
            // 단일 선택 모드 - 기존 동작 유지
            return;
        }

        const isSelected = footer.state.selectionSlots.find(c => c.id === card.id);
        if (isSelected) {
            footer.removeFromSelection(card.id);
        } else {
            footer.addToSelection(card);
        }
    };

    // 일괄 판매
    const handleBatchSell = async () => {
        const toSell = footer.state.selectionSlots.filter(c => !c.isLocked);
        if (toSell.length === 0) {
            showAlert({ title: '판매 불가', message: '선택한 카드가 모두 잠금 상태입니다.', type: 'warning' });
            return;
        }

        const sellValue = toSell.reduce((sum, c) => {
            const base = c.rarity === 'legendary' ? 100 : c.rarity === 'epic' ? 50 : c.rarity === 'rare' ? 25 : 10;
            return sum + base;
        }, 0);

        // 카드 삭제
        for (const card of toSell) {
            await gameStorage.deleteCard(card.id);
        }

        await addCoins(sellValue);
        await refreshData();
        await loadCards();

        showAlert({
            title: '판매 완료',
            message: `${toSell.length}장의 카드를 판매하여 ${sellValue} 코인을 획득했습니다!`,
            type: 'success'
        });

        setIsMultiSelectMode(false);
    };

    // 일괄 잠금
    const handleBatchLock = async () => {
        const toToggle = footer.state.selectionSlots;
        const allLocked = toToggle.every(c => c.isLocked);

        for (const card of toToggle) {
            await gameStorage.updateCard(card.id, { isLocked: !allLocked });
        }

        await loadCards();

        showAlert({
            title: allLocked ? '잠금 해제됨' : '잠금 설정됨',
            message: `${toToggle.length}장의 카드가 ${allLocked ? '잠금 해제' : '잠금 설정'}되었습니다.`,
            type: 'info'
        });

        setIsMultiSelectMode(false);
    };

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

        // 필터
        if (filterRarity !== 'all') {
            result = result.filter(c => c.rarity === filterRarity);
        }

        // 정렬
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
        <div className="min-h-screen py-12 px-6 lg:px-12 bg-[#050505] relative overflow-hidden">
            <BackgroundBeams className="opacity-35" />
            <Meteors number={8} />

            <div className="max-w-7xl mx-auto relative z-10">
                <PageHeader
                    title="내 카드"
                    englishTitle="MY CARDS"
                    description="보유 중인 모든 카드를 확인하고 관리하세요"
                    color="blue"
                />

                {/* 통계 요약 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-white/5 border-white/10">
                        <CardBody className="p-4 text-center">
                            <p className="text-3xl font-black text-white">{statsOverview.total}</p>
                            <p className="text-xs text-white/50">총 카드</p>
                        </CardBody>
                    </Card>
                    <Card className="bg-white/5 border-white/10">
                        <CardBody className="p-4 text-center">
                            <p className="text-3xl font-black text-yellow-400">{statsOverview.byRarity['legendary'] || 0}</p>
                            <p className="text-xs text-white/50">전설 등급</p>
                        </CardBody>
                    </Card>
                    <Card className="bg-white/5 border-white/10">
                        <CardBody className="p-4 text-center">
                            <p className="text-3xl font-black text-purple-400">{statsOverview.byRarity['epic'] || 0}</p>
                            <p className="text-xs text-white/50">영웅 등급</p>
                        </CardBody>
                    </Card>
                    <Card className="bg-white/5 border-white/10">
                        <CardBody className="p-4 text-center">
                            <p className="text-3xl font-black text-cyan-400">{statsOverview.avgPower}</p>
                            <p className="text-xs text-white/50">평균 파워</p>
                        </CardBody>
                    </Card>
                </div>

                {/* 필터 및 정렬 */}
                <div className="flex flex-wrap gap-3 mb-6">
                    {/* 등급 필터 */}
                    <div className="flex gap-2">
                        {(['all', 'legendary', 'epic', 'rare', 'common'] as FilterOption[]).map(rarity => (
                            <Button
                                key={rarity}
                                size="sm"
                                variant={filterRarity === rarity ? 'solid' : 'flat'}
                                color={filterRarity === rarity ? 'primary' : 'default'}
                                onPress={() => setFilterRarity(rarity)}
                                className="text-xs"
                            >
                                {rarity === 'all' ? '전체' :
                                    rarity === 'legendary' ? '전설' :
                                        rarity === 'epic' ? '영웅' :
                                            rarity === 'rare' ? '희귀' : '일반'}
                            </Button>
                        ))}
                    </div>

                    <div className="flex-1" />

                    {/* 정렬 */}
                    <div className="flex gap-2">
                        {(['power', 'rarity', 'name'] as SortOption[]).map(option => (
                            <Button
                                key={option}
                                size="sm"
                                variant={sortBy === option ? 'solid' : 'flat'}
                                color={sortBy === option ? 'secondary' : 'default'}
                                onPress={() => {
                                    if (sortBy === option) {
                                        setSortAsc(!sortAsc);
                                    } else {
                                        setSortBy(option);
                                        setSortAsc(false);
                                    }
                                }}
                                className="text-xs"
                                endContent={sortBy === option ? (sortAsc ? <SortAsc size={14} /> : <SortDesc size={14} />) : null}
                            >
                                {option === 'power' ? '파워' : option === 'rarity' ? '등급' : '이름'}
                            </Button>
                        ))}
                    </div>

                    {/* 뷰 모드 */}
                    <div className="flex gap-1">
                        <Button
                            size="sm"
                            variant={viewMode === 'grid' ? 'solid' : 'flat'}
                            className="px-3 min-w-0"
                            onPress={() => setViewMode('grid')}
                        >
                            <Grid3X3 size={16} />
                        </Button>
                        <Button
                            size="sm"
                            variant={viewMode === 'list' ? 'solid' : 'flat'}
                            className="px-3 min-w-0"
                            onPress={() => setViewMode('list')}
                        >
                            <LayoutList size={16} />
                        </Button>
                    </div>

                    {/* 다중 선택 토글 */}
                    <Button
                        size="sm"
                        variant={isMultiSelectMode ? 'solid' : 'flat'}
                        color={isMultiSelectMode ? 'warning' : 'default'}
                        onPress={() => setIsMultiSelectMode(!isMultiSelectMode)}
                        className="text-xs gap-1"
                        startContent={isMultiSelectMode ? <Unlock size={14} /> : <Lock size={14} />}
                    >
                        {isMultiSelectMode ? '선택 취소' : '다중 선택'}
                    </Button>
                </div>

                {/* 카드 그리드 */}
                {loading ? (
                    <div className="text-center py-20 text-white/50">로딩 중...</div>
                ) : filteredAndSortedCards.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-white/50 mb-4">
                            {filterRarity === 'all' ? '보유 카드가 없습니다' : `${filterRarity} 등급 카드가 없습니다`}
                        </p>
                        <Button color="primary" onPress={() => window.location.href = '/slots'}>
                            카드 생성하기
                        </Button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredAndSortedCards.map((card, i) => {
                            const isSelectedInFooter = footer.state.selectionSlots.some(c => c.id === card.id);
                            return (
                                <motion.div
                                    key={card.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.02 }}
                                    className={cn(
                                        "cursor-pointer relative",
                                        isMultiSelectMode && isSelectedInFooter && "ring-2 ring-cyan-500 rounded-xl"
                                    )}
                                    onClick={() => {
                                        if (isMultiSelectMode) {
                                            toggleCardSelection(card);
                                        } else {
                                            setSelectedCard(card);
                                        }
                                    }}
                                >
                                    <GameCard
                                        card={card}
                                        isSelected={isMultiSelectMode ? isSelectedInFooter : selectedCard?.id === card.id}
                                    />
                                    {isMultiSelectMode && isSelectedInFooter && (
                                        <div className="absolute top-2 right-2 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center z-10">
                                            <span className="text-xs font-bold text-black">✓</span>
                                        </div>
                                    )}
                                    {card.isLocked && (
                                        <div className="absolute top-2 left-2 w-6 h-6 bg-yellow-500/80 rounded-full flex items-center justify-center z-10">
                                            <Lock size={12} className="text-black" />
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredAndSortedCards.map((card, i) => (
                            <motion.div
                                key={card.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.02 }}
                            >
                                <Card
                                    className={cn(
                                        "bg-white/5 border-white/10 hover:border-white/20 transition-all cursor-pointer",
                                        selectedCard?.id === card.id && "border-cyan-500/50 bg-cyan-900/20"
                                    )}
                                    isPressable
                                    onPress={() => setSelectedCard(card)}
                                >
                                    <CardBody className="p-3 flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br text-xl",
                                            rarityColors[card.rarity || 'common']
                                        )}>
                                            {card.templateId?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-white">{card.name}</p>
                                            <p className="text-xs text-white/50">{card.templateId}</p>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="text-center">
                                                <p className="font-bold text-cyan-400">{card.stats?.totalPower || 0}</p>
                                                <p className="text-[10px] text-white/40">PWR</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-bold text-red-400">{card.stats?.efficiency || 0}</p>
                                                <p className="text-[10px] text-white/40">EFF</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-bold text-green-400">{card.stats?.creativity || 0}</p>
                                                <p className="text-[10px] text-white/40">CRE</p>
                                            </div>
                                            <Chip
                                                size="sm"
                                                className={cn(
                                                    "bg-gradient-to-r text-white text-[10px]",
                                                    rarityColors[card.rarity || 'common']
                                                )}
                                            >
                                                {card.rarity?.toUpperCase()}
                                            </Chip>
                                        </div>
                                    </CardBody>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* 선택된 카드 상세 */}
                {selectedCard && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50"
                    >
                        <Card className="bg-black/90 border-white/20 backdrop-blur-xl">
                            <CardBody className="p-4 flex items-center gap-4">
                                <div className="text-center">
                                    <p className="font-bold text-white">{selectedCard.name}</p>
                                    <p className="text-xs text-white/50">Lv.{selectedCard.level || 1}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" color="secondary" onPress={() => window.location.href = '/enhance'}>
                                        강화
                                    </Button>
                                    <Button size="sm" color="primary" onPress={() => window.location.href = '/fusion'}>
                                        합성
                                    </Button>
                                    <Button size="sm" variant="flat" onPress={() => setSelectedCard(null)}>
                                        닫기
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
