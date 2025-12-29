'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card as CardType } from '@/lib/types';
import { useUserProfile } from '@/hooks/useUserProfile';
import { InventoryCard, addCardToInventory, removeCardFromInventory, loadInventory as loadInventorySystem } from '@/lib/inventory-system';
import CyberPageLayout from '@/components/CyberPageLayout';
import FusionFooter from '@/components/Footer/FusionFooter';
import GameCard from '@/components/GameCard';
import { canFuse, fuseCards, getFusionCost, getFusionPreview, getRarityName } from '@/lib/fusion-utils';
import { cn } from '@/lib/utils';
import { useAlert } from '@/context/AlertContext';
import CardRewardModal from '@/components/CardRewardModal';
import { gameStorage } from '@/lib/game-storage'; // Keep for tokens
import { useUser } from '@/context/UserContext';
import { useNotification } from '@/context/NotificationContext';

export default function FusionPage() {
    const { addNotification } = useNotification();
    const { showAlert } = useAlert();
    const { refreshData } = useUser(); // To refresh global data if needed
    const { profile, reload } = useUserProfile(); // Firebase profile

    const [allCards, setAllCards] = useState<InventoryCard[]>([]);
    const [materialSlots, setMaterialSlots] = useState<(InventoryCard | null)[]>(Array(3).fill(null));
    const [userTokens, setUserTokens] = useState(0);
    const [selectedRarity, setSelectedRarity] = useState<string>('all');

    // Reward Modal State
    const [rewardModalOpen, setRewardModalOpen] = useState(false);
    const [rewardCard, setRewardCard] = useState<CardType | null>(null);

    useEffect(() => {
        loadCards();
    }, [profile]); // Reload when profile changes

    const loadCards = async () => {
        // Use inventory-system for consistency
        const cards = await loadInventorySystem();
        const gameState = await gameStorage.loadGameState();

        setAllCards(cards);
        // Use profile tokens if logged in, otherwise local state
        setUserTokens(profile ? profile.tokens : (gameState.tokens || 0));
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
            // 이미 슬롯에 있는 카드는 제외해야 할 수도 있지만, 
            // 여기서는 단순하게 인벤토리 기준으로 3개 찾음
            if (group.length >= 3) {
                const selected = group.slice(0, 3);
                setMaterialSlots(selected);
                return;
            }
        }

        showAlert({
            title: '자동 선택 불가',
            message: '같은 등급의 카드가 3장 이상 필요합니다.',
            type: 'warning'
        });
    };

    // 합성 실행
    const handleFuse = async () => {
        const filledMaterials = materialSlots.filter((c): c is InventoryCard => c !== null);

        if (filledMaterials.length !== 3) {
            showAlert({ title: '재료 부족', message: '재료 카드 3장이 필요합니다.', type: 'warning' });
            return;
        }

        const check = canFuse(filledMaterials as any, userTokens);
        if (!check.canFuse) {
            showAlert({ title: '합성 불가', message: check.reason || '조건을 만족하지 못했습니다.', type: 'error' });
            return;
        }

        try {
            const fusedCard = fuseCards(filledMaterials as any, 'guest');
            const cost = getFusionCost(filledMaterials[0].rarity!);

            // 1. 재료 삭제 (DB & UI)
            for (const mat of filledMaterials) {
                await removeCardFromInventory(mat.instanceId);
            }

            // 2. 결과 저장 (DB)
            await addCardToInventory(fusedCard);

            // 3. 토큰 차감
            if (profile) {
                const { updateTokens } = await import('@/lib/firebase-db');
                await updateTokens(-cost);
                await reload(); // Refresh profile
            } else {
                await gameStorage.addTokens(-cost);
            }

            // 4. 모달 표시 및 데이터 갱신
            setRewardCard(fusedCard);
            setRewardModalOpen(true);

            handleClear();
            await loadCards(); // 인벤토리 새로고침
            refreshData(); // 유저 데이터(토큰 등) 새로고침

            addNotification('fusion', '합성 성공!', `${fusedCard.name} 카드를 획득했습니다!`, '/fusion');
        } catch (error) {
            console.error(error);
            showAlert({ title: '오류', message: '합성 중 문제가 발생했습니다.', type: 'error' });
            addNotification('error', '합성 오류', '카드 합성 중 오류가 발생했습니다.', '/fusion');
        }
    };

    const filledCount = materialSlots.filter(c => c !== null).length;
    const canFuseNow = filledCount === 3;

    const displayCards = allCards.filter(c =>
        selectedRarity === 'all' || (c.rarity || 'common') === selectedRarity
    );

    return (
        <CyberPageLayout
            title="융합 실험실"
            englishTitle="CARD SYNTHESIS"
            description="같은 등급 카드 3장을 합성하여 상위 등급 카드를 획득합니다."
            color="purple"
        >
            {/* 메인 영역: 카드 목록 */}
            <div className="p-6 pb-[140px]"> {/* 푸터 높이 120px + 여유 */}
                {/* Main Cards Section - 주력카드 */}
                {allCards.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
                            <span className="text-purple-400">⭐</span>
                            주력 카드 (등급별 최고 레벨)
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 bg-gradient-to-br from-purple-900/10 to-pink-900/10 p-3 rounded-xl border border-purple-500/20">
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

                                    const isSelected = materialSlots.some(s => s?.instanceId === card.instanceId);

                                    return (
                                        <div
                                            key={rarity}
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
                                }).filter(Boolean);
                            })()}
                        </div>
                    </div>
                )}

                <div className="mb-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white">내 카드 목록</h2>
                        <p className="text-sm text-white/60">{displayCards.length}장</p>
                    </div>

                    {/* Rarity Filter Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {['all', 'common', 'rare', 'epic', 'legendary', 'unique'].map(rarity => {
                            const rarityMap: Record<string, string> = {
                                all: '전체',
                                common: '일반',
                                rare: '희귀',
                                epic: '영웅',
                                legendary: '전설',
                                unique: '유니크'
                            };

                            return (
                                <button
                                    key={rarity}
                                    onClick={() => setSelectedRarity(rarity)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all border",
                                        selectedRarity === rarity
                                            ? "bg-purple-500 text-black border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                            : "bg-black/40 text-white/60 border-white/10 hover:bg-white/10 hover:border-white/30"
                                    )}
                                >
                                    {rarityMap[rarity] || rarity}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {displayCards.map(card => {
                        const isSelected = materialSlots.some(s => s?.instanceId === card.instanceId);

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

            {/* 결과 모달 */}
            <CardRewardModal
                isOpen={rewardModalOpen}
                onClose={() => setRewardModalOpen(false)}
                cards={rewardCard ? [rewardCard] : []}
                title="합성 성공!"
            />
        </CyberPageLayout>
    );
}
