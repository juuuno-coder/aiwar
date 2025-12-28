'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card as CardType } from '@/lib/types';
import { InventoryCard } from '@/lib/inventory-system';
import { enhanceCard, getEnhanceCost, getEnhancePreview } from '@/lib/enhance-utils';
import CyberPageLayout from '@/components/CyberPageLayout';
import EnhanceFooter from '@/components/Footer/EnhanceFooter';
import GameCard from '@/components/GameCard';
import CardRewardModal from '@/components/CardRewardModal';
import { useAlert } from '@/context/AlertContext';
import { cn } from '@/lib/utils';

export default function EnhancePage() {
    const { showAlert } = useAlert();
    const [allCards, setAllCards] = useState<InventoryCard[]>([]);
    const [targetCard, setTargetCard] = useState<InventoryCard | null>(null);
    const [materialSlots, setMaterialSlots] = useState<(InventoryCard | null)[]>(Array(10).fill(null));
    const [userTokens, setUserTokens] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [selectedRarity, setSelectedRarity] = useState<string>('all');

    // 강화 완료 모달
    const [rewardModalOpen, setRewardModalOpen] = useState(false);
    const [enhancedResult, setEnhancedResult] = useState<CardType | null>(null);

    useEffect(() => {
        loadCards();
    }, []);

    const loadCards = async () => {
        const { loadInventory } = await import('@/lib/inventory-system');
        const { getGameState } = await import('@/lib/game-state');
        const { getResearchBonus } = await import('@/lib/research-system');

        const allInventory = await loadInventory();
        // Filter out commander cards - they cannot be enhanced
        const cards = allInventory.filter(c => c.rarity !== 'commander');

        const gameState = getGameState();

        let discountVal = 0;
        if (gameState.research?.stats?.negotiation) {
            discountVal = getResearchBonus('negotiation', gameState.research.stats.negotiation.currentLevel) / 100;
        }
        setDiscount(discountVal);

        setAllCards(cards);
        setUserTokens(gameState.tokens || 0);
    };

    // 카드 드래그 시작
    const handleDragStart = (e: React.DragEvent, card: InventoryCard) => {
        e.dataTransfer.setData('application/json', JSON.stringify(card));
    };

    // 카드 클릭 (타겟이 없으면 타겟으로, 있으면 재료로)
    const handleCardClick = (card: InventoryCard) => {
        if (!targetCard) {
            setTargetCard(card);
        } else if (card.instanceId !== targetCard.instanceId) {
            // 타겟이 아닌 다른 카드면 재료로 추가
            const emptyIndex = materialSlots.findIndex(s => s === null);
            if (emptyIndex !== -1) {
                const newSlots = [...materialSlots];
                newSlots[emptyIndex] = card;
                setMaterialSlots(newSlots);
            }
        }
    };

    // 타겟 드롭
    const handleTargetDrop = (card: InventoryCard) => {
        setTargetCard(card);
    };

    // 재료 드롭
    const handleMaterialDrop = (card: InventoryCard, index: number) => {
        if (!targetCard) {
            setTargetCard(card);
            return;
        }

        if (card.instanceId !== targetCard.instanceId) {
            const newSlots = [...materialSlots];
            newSlots[index] = card;
            setMaterialSlots(newSlots);
        }
    };

    // 타겟 제거
    const handleTargetRemove = () => {
        setTargetCard(null);
    };

    // 재료 제거
    const handleMaterialRemove = (index: number) => {
        const newSlots = [...materialSlots];
        newSlots[index] = null;
        setMaterialSlots(newSlots);
    };

    // 초기화
    const handleClear = () => {
        setTargetCard(null);
        setMaterialSlots(Array(10).fill(null));
    };

    // 자동 선택 (아무 카드 10장)
    const handleAutoSelect = () => {
        if (!targetCard) return;

        // 타겟 제외한 카드 중 레벨이 낮은 순으로 10장 선택
        const available = allCards.filter(c => c.instanceId !== targetCard.instanceId);
        const sorted = available.sort((a, b) => (a.level || 1) - (b.level || 1));
        const selected = sorted.slice(0, 10);

        setMaterialSlots([...selected, ...Array(10 - selected.length).fill(null)]);
    };

    // 강화 실행
    const handleEnhance = async () => {
        if (!targetCard) return;

        const filledMaterials = materialSlots.filter((c): c is InventoryCard => c !== null);
        if (filledMaterials.length !== 10) {
            showAlert({ title: '재료 부족', message: '재료 카드 10장이 필요합니다.', type: 'warning' });
            return;
        }

        const cost = getEnhanceCost(targetCard.level || 1, discount);

        if (userTokens < cost) {
            showAlert({ title: '토큰 부족', message: `토큰이 부족합니다. (필요: ${cost})`, type: 'error' });
            return;
        }

        try {
            const { removeCardFromInventory, addCardToInventory } = await import('@/lib/inventory-system');
            const { gameStorage } = await import('@/lib/game-storage');

            // 강화 실행
            const enhancedCard = enhanceCard(targetCard as any, filledMaterials as any);

            // 1. 재료 카드 10장 삭제
            for (const mat of filledMaterials) {
                await removeCardFromInventory(mat.instanceId);
            }

            // 2. 대상 카드 삭제 후 강화된 카드 추가
            await removeCardFromInventory(targetCard.instanceId);
            await addCardToInventory(enhancedCard);

            // 3. 토큰 차감
            await gameStorage.addTokens(-cost);

            // 4. 강화 성공 모달 표시
            setEnhancedResult(enhancedCard);
            setRewardModalOpen(true);

            handleClear();
            await loadCards();
        } catch (error) {
            console.error('강화 오류:', error);
            showAlert({ title: '강화 실패', message: '강화 중 문제가 발생했습니다.', type: 'error' });
        }
    };

    const filledCount = materialSlots.filter(c => c !== null).length;
    const canEnhance = targetCard !== null && filledCount === 10;

    // 모든 카드 표시 (재료로 아무 카드나 사용 가능)
    const displayCards = allCards.filter(c =>
        c.instanceId !== targetCard?.instanceId &&
        !materialSlots.some(s => s?.instanceId === c.instanceId) &&
        (selectedRarity === 'all' || (c.rarity || 'common') === selectedRarity)
    );

    return (
        <CyberPageLayout
            title="강화 프로토콜"
            englishTitle="UNIT UPGRADE"
            description="아무 카드 10장을 소모하여 선택한 카드를 강화합니다. 스탯 +1~+3 상승!"
            color="amber"
        >
            {/* 메인 영역: 카드 목록 */}
            <div className="p-6 pb-[140px]"> {/* 푸터 높이 120px + 여유 */}
                {/* Main Cards Section - 주력카드 */}
                {allCards.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
                            <span className="text-amber-400">⭐</span>
                            주력 카드 (등급별 최고 레벨)
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 bg-gradient-to-br from-amber-900/10 to-purple-900/10 p-3 rounded-xl border border-amber-500/20">
                            {(() => {
                                const mainCards: Record<string, InventoryCard> = {};
                                const rarities = ['commander', 'unique', 'legendary', 'epic', 'rare', 'common'];

                                allCards.forEach(card => {
                                    const rarity = card.rarity || 'common';
                                    if (!mainCards[rarity] || (card.level || 1) > (mainCards[rarity].level || 1)) {
                                        mainCards[rarity] = card;
                                    }
                                });

                                return rarities.map(rarity => {
                                    const card = mainCards[rarity];
                                    if (!card) return null;

                                    if (selectedRarity !== 'all' && (card.rarity || 'common') !== selectedRarity) return null;

                                    const isSelected = card.id === targetCard?.id || materialSlots.some(s => s?.id === card.id);

                                    return (
                                        <div
                                            key={rarity}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, card)}
                                            onClick={() => handleCardClick(card)}
                                            className={cn(
                                                "cursor-grab active:cursor-grabbing transition-all hover:scale-105",
                                                isSelected && "opacity-50 ring-2 ring-cyan-500"
                                            )}
                                        >
                                            <GameCard card={card} />
                                        </div>
                                    );
                                }).filter(Boolean);
                            })()}
                        </div>
                    </div>
                )}

                {/* Commander Card Notice */}
                <div className="mb-4 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                    <p className="text-sm text-purple-300 flex items-center gap-2">
                        <span className="text-lg">ℹ️</span>
                        <span><strong>군단장 카드</strong>는 강화할 수 없습니다. 구독 친밀도에 따라 자동으로 성장합니다.</span>
                    </p>
                </div>

                <div className="mb-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white">
                            {targetCard ? `${targetCard.name} 카드 목록` : '내 카드 목록'}
                        </h2>
                        <p className="text-sm text-white/60">
                            {displayCards.length}장
                        </p>
                    </div>

                    {/* Rarity Filter Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {['all', 'common', 'rare', 'epic', 'legendary', 'unique'].map(rarity => (
                            <button
                                key={rarity}
                                onClick={() => setSelectedRarity(rarity)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all border",
                                    selectedRarity === rarity
                                        ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                                        : "bg-black/40 text-white/60 border-white/10 hover:bg-white/10 hover:border-white/30"
                                )}
                            >
                                {rarity === 'all' ? '전체' : rarity}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {displayCards.map(card => {
                        const isSelected =
                            card.id === targetCard?.id ||
                            materialSlots.some(s => s?.id === card.id);

                        return (
                            <div
                                key={card.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, card)}
                                onClick={() => handleCardClick(card)}
                                className={cn(
                                    "cursor-grab active:cursor-grabbing transition-all hover:scale-105",
                                    isSelected && "opacity-50 ring-2 ring-cyan-500"
                                )}
                            >
                                <GameCard card={card} />
                            </div>
                        );
                    })}
                </div>

                {displayCards.length === 0 && (
                    <div className="text-center py-20 text-white/40">
                        {targetCard
                            ? `${targetCard.name} 카드가 더 이상 없습니다.`
                            : '카드가 없습니다.'}
                    </div>
                )}
            </div>

            {/* 푸터: 슬롯 + 버튼 */}
            <EnhanceFooter
                targetCard={targetCard}
                materialSlots={materialSlots}
                onTargetDrop={handleTargetDrop}
                onMaterialDrop={handleMaterialDrop}
                onTargetRemove={handleTargetRemove}
                onMaterialRemove={handleMaterialRemove}
                onClear={handleClear}
                onAutoSelect={handleAutoSelect}
                onEnhance={handleEnhance}
                canEnhance={canEnhance}
            />

            {/* 강화 성공 모달 */}
            <CardRewardModal
                isOpen={rewardModalOpen}
                onClose={() => setRewardModalOpen(false)}
                cards={enhancedResult ? [enhancedResult] : []}
                title="강화 성공!"
            />
        </CyberPageLayout>
    );
}
