'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card as CardType } from '@/lib/types';
import { InventoryCard } from '@/lib/inventory-system';
import { enhanceCard, getEnhanceCost, getEnhancePreview } from '@/lib/enhance-utils';
import CyberPageLayout from '@/components/CyberPageLayout';
import EnhanceFooter from '@/components/Footer/EnhanceFooter';
import GameCard from '@/components/GameCard';
import { cn } from '@/lib/utils';

export default function EnhancePage() {
    const [allCards, setAllCards] = useState<InventoryCard[]>([]);
    const [targetCard, setTargetCard] = useState<InventoryCard | null>(null);
    const [materialSlots, setMaterialSlots] = useState<(InventoryCard | null)[]>(Array(10).fill(null));
    const [userTokens, setUserTokens] = useState(0);
    const [discount, setDiscount] = useState(0);

    useEffect(() => {
        loadCards();
    }, []);

    const loadCards = async () => {
        const { loadInventory } = await import('@/lib/inventory-system');
        const { getGameState } = await import('@/lib/game-state');
        const { getResearchBonus } = await import('@/lib/research-system');

        const cards = await loadInventory();
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
        } else if (card.name === targetCard.name && card.id !== targetCard.id) {
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

        if (card.name === targetCard.name && card.id !== targetCard.id) {
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

    // 자동 선택
    const handleAutoSelect = () => {
        if (!targetCard) return;

        const sameName = allCards.filter(c =>
            c.name === targetCard.name && c.id !== targetCard.id
        );
        const sorted = sameName.sort((a, b) => (a.level || 1) - (b.level || 1));
        const selected = sorted.slice(0, 10);

        setMaterialSlots([...selected, ...Array(10 - selected.length).fill(null)]);
    };

    // 강화 실행
    const handleEnhance = async () => {
        if (!targetCard) return;

        const filledMaterials = materialSlots.filter((c): c is InventoryCard => c !== null);
        if (filledMaterials.length !== 10) {
            alert('재료 카드 10장이 필요합니다.');
            return;
        }

        const cost = getEnhanceCost(targetCard.level || 1, discount);

        if (userTokens < cost) {
            alert(`토큰이 부족합니다. (필요: ${cost})`);
            return;
        }

        const { gameStorage } = await import('@/lib/game-storage');
        // InventoryCard를 Card로 캐스팅
        const enhancedCard = enhanceCard(targetCard as any, filledMaterials as any);

        for (const mat of filledMaterials) {
            await gameStorage.deleteCard(mat.id);
        }
        await gameStorage.updateCard(enhancedCard.id, enhancedCard as any);
        await gameStorage.addTokens(-cost);

        alert(`강화 성공! 레벨 ${enhancedCard.level}로 상승! (비용: ${cost}T)`);

        handleClear();
        await loadCards();
    };

    const filledCount = materialSlots.filter(c => c !== null).length;
    const canEnhance = targetCard !== null && filledCount === 10;

    // 필터링: 타겟이 선택되면 같은 이름의 카드만 표시
    const displayCards = targetCard
        ? allCards.filter(c => c.name === targetCard.name && c.id !== targetCard.id)
        : allCards;

    return (
        <CyberPageLayout
            title="강화 프로토콜"
            englishTitle="UNIT UPGRADE"
            description="같은 유닛 카드 10장을 소모하여 레벨업합니다."
            color="amber"
        >
            {/* 메인 영역: 카드 목록 */}
            <div className="p-6 pb-[140px]"> {/* 푸터 높이 120px + 여유 */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">
                        {targetCard ? `${targetCard.name} 카드 목록` : '내 카드 목록'}
                    </h2>
                    <p className="text-sm text-white/60">
                        {displayCards.length}장
                    </p>
                </div>

                <div className="grid grid-cols-5 gap-4">
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
        </CyberPageLayout>
    );
}
