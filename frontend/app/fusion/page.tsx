'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card as CardType } from '@/lib/types';
import { InventoryCard } from '@/lib/inventory-system';
import CyberPageLayout from '@/components/CyberPageLayout';
import FusionFooter from '@/components/Footer/FusionFooter';
import GameCard from '@/components/GameCard';
import { canFuse, fuseCards, getFusionCost, getFusionPreview, getRarityName } from '@/lib/fusion-utils';
import { cn } from '@/lib/utils';

export default function FusionPage() {
    const [allCards, setAllCards] = useState<InventoryCard[]>([]);
    const [materialSlots, setMaterialSlots] = useState<(InventoryCard | null)[]>(Array(3).fill(null));
    const [userTokens, setUserTokens] = useState(0);

    useEffect(() => {
        loadCards();
    }, []);

    const loadCards = async () => {
        const { loadInventory } = await import('@/lib/inventory-system');
        const { getGameState } = await import('@/lib/game-state');

        const cards = await loadInventory();
        const gameState = getGameState();

        setAllCards(cards);
        setUserTokens(gameState.tokens || 0);
    };

    // 카드 드래그 시작
    const handleDragStart = (e: React.DragEvent, card: InventoryCard) => {
        e.dataTransfer.setData('application/json', JSON.stringify(card));
    };

    // 카드 클릭
    const handleCardClick = (card: InventoryCard) => {
        const emptyIndex = materialSlots.findIndex(s => s === null);
        if (emptyIndex !== -1) {
            const newSlots = [...materialSlots];
            newSlots[emptyIndex] = card;
            setMaterialSlots(newSlots);
        }
    };

    // 재료 드롭
    const handleMaterialDrop = (card: InventoryCard, index: number) => {
        const newSlots = [...materialSlots];
        newSlots[index] = card;
        setMaterialSlots(newSlots);
    };

    // 재료 제거
    const handleMaterialRemove = (index: number) => {
        const newSlots = [...materialSlots];
        newSlots[index] = null;
        setMaterialSlots(newSlots);
    };

    // 초기화
    const handleClear = () => {
        setMaterialSlots(Array(3).fill(null));
    };

    // 자동 선택 (같은 등급 3개)
    const handleAutoSelect = async () => {
        const rarityGroups: Record<string, InventoryCard[]> = {};
        allCards.forEach(card => {
            const rarity = card.rarity || 'Common';
            if (!rarityGroups[rarity]) {
                rarityGroups[rarity] = [];
            }
            rarityGroups[rarity].push(card);
        });

        for (const [rarity, group] of Object.entries(rarityGroups)) {
            if (group.length >= 3) {
                const selected = group.slice(0, 3);
                setMaterialSlots(selected);
                return;
            }
        }

        alert('같은 등급의 카드가 3장 이상 필요합니다.');
    };

    // 합성 실행
    const handleFuse = async () => {
        const filledMaterials = materialSlots.filter((c): c is InventoryCard => c !== null);

        if (filledMaterials.length !== 3) {
            alert('재료 카드 3장이 필요합니다.');
            return;
        }

        const check = canFuse(filledMaterials as any, userTokens);
        if (!check.canFuse) {
            alert(check.reason);
            return;
        }

        const { gameStorage } = await import('@/lib/game-storage');
        const fusedCard = fuseCards(filledMaterials as any, 'guest');
        const cost = getFusionCost(filledMaterials[0].rarity!);

        for (const mat of filledMaterials) {
            await gameStorage.deleteCard(mat.id);
        }

        await gameStorage.addCardToInventory(fusedCard);
        await gameStorage.addTokens(-cost);

        alert(`합성 성공! ${fusedCard.rarity} 카드 획득!`);

        handleClear();
        await loadCards();
    };

    const filledCount = materialSlots.filter(c => c !== null).length;
    const canFuseNow = filledCount === 3;

    return (
        <CyberPageLayout
            title="융합 실험실"
            englishTitle="CARD SYNTHESIS"
            description="같은 등급 카드 3장을 합성하여 상위 등급 카드를 획득합니다."
            color="purple"
        >
            {/* 메인 영역: 카드 목록 */}
            <div className="p-6 pb-[140px]"> {/* 푸터 높이 120px + 여유 */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">내 카드 목록</h2>
                    <p className="text-sm text-white/60">{allCards.length}장</p>
                </div>

                <div className="grid grid-cols-5 gap-4">
                    {allCards.map(card => {
                        const isSelected = materialSlots.some(s => s?.id === card.id);

                        return (
                            <div
                                key={card.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, card)}
                                onClick={() => handleCardClick(card)}
                                className={cn(
                                    "cursor-grab active:cursor-grabbing transition-all hover:scale-105",
                                    isSelected && "opacity-50 ring-2 ring-purple-500"
                                )}
                            >
                                <GameCard card={card} />
                            </div>
                        );
                    })}
                </div>

                {allCards.length === 0 && (
                    <div className="text-center py-20 text-white/40">
                        카드가 없습니다.
                    </div>
                )}
            </div>

            {/* 푸터: 슬롯 + 버튼 */}
            <FusionFooter
                materialSlots={materialSlots}
                onMaterialDrop={handleMaterialDrop}
                onMaterialRemove={handleMaterialRemove}
                onClear={handleClear}
                onAutoSelect={handleAutoSelect}
                onFuse={handleFuse}
                canFuse={canFuseNow}
            />
        </CyberPageLayout>
    );
}
