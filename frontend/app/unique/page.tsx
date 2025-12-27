'use client';

import { useState, useEffect } from 'react';
import { Card as CardType } from '@/lib/types';
import { InventoryCard, addCardToInventory, removeCardFromInventory, loadInventory as loadInventorySystem } from '@/lib/inventory-system';
import CyberPageLayout from '@/components/CyberPageLayout';
import UniqueFooter from '@/components/Footer/UniqueFooter';
import GameCard from '@/components/GameCard';
import { cn } from '@/lib/utils';
import { useAlert } from '@/context/AlertContext';
import CardRewardModal from '@/components/CardRewardModal';
import { gameStorage } from '@/lib/game-storage';
import { useUser } from '@/context/UserContext';
import { useNotification } from '@/context/NotificationContext';
import { generateId } from '@/lib/utils';

export default function UniqueCreationPage() {
    const { showAlert } = useAlert();
    const { refreshData } = useUser();

    const [legendaryCards, setLegendaryCards] = useState<InventoryCard[]>([]);
    const [materialSlots, setMaterialSlots] = useState<(InventoryCard | null)[]>(Array(3).fill(null));
    const [userTokens, setUserTokens] = useState(0);

    // Reward Modal State
    const [rewardModalOpen, setRewardModalOpen] = useState(false);
    const [rewardCard, setRewardCard] = useState<CardType | null>(null);

    // Parameters
    const REQUIRED_TOKEN_COST = 5000;

    useEffect(() => {
        loadCards();
    }, []);

    const loadCards = async () => {
        const cards = await loadInventorySystem();
        const gameState = await gameStorage.loadGameState();

        // Filter only Legendary cards that are not enhanced (Level 1)
        const legendaries = cards.filter(c => c.rarity === 'legendary' && c.level === 1);

        setLegendaryCards(legendaries);
        setUserTokens(gameState.tokens || 0);
    };

    // Card Drag Start
    const handleDragStart = (e: React.DragEvent, card: InventoryCard) => {
        e.dataTransfer.setData('application/json', JSON.stringify(card));
    };

    // Card Click
    const handleCardClick = (card: InventoryCard) => {
        const emptyIndex = materialSlots.findIndex(s => s === null);
        if (emptyIndex !== -1) {
            const newSlots = [...materialSlots];
            newSlots[emptyIndex] = card;
            setMaterialSlots(newSlots);
        }
    };

    // Material Drop
    const handleMaterialDrop = (card: InventoryCard | CardType, index: number) => {
        const newSlots = [...materialSlots];
        newSlots[index] = card as InventoryCard;
        setMaterialSlots(newSlots);
    };

    // Material Remove
    const handleMaterialRemove = (index: number) => {
        const newSlots = [...materialSlots];
        newSlots[index] = null;
        setMaterialSlots(newSlots);
    };

    // Clear Slots
    const handleClear = () => {
        setMaterialSlots(Array(3).fill(null));
    };

    // Auto Select
    const handleAutoSelect = () => {
        // 이미 슬롯에 있는 것 제외하고 선택
        const selectedIds = materialSlots.filter(c => c !== null).map(c => c!.id);
        const available = legendaryCards.filter(c => !selectedIds.includes(c.id));

        if (available.length < 3) {
            showAlert({
                title: '카드 부족',
                message: '사용 가능한 전설 카드가 3장 이상 필요합니다.',
                type: 'warning'
            });
            return;
        }

        const toSelect = available.slice(0, 3);
        setMaterialSlots(toSelect);
    };

    // Create Unique Card Logic
    const createUniqueCard = (materials: InventoryCard[], userId: string): CardType => {
        // 1. Calculate Stats (Avg * 1.3)
        const avgStats = {
            efficiency: Math.floor(materials.reduce((sum, c) => sum + (c.stats.efficiency || 0), 0) / 3),
            creativity: Math.floor(materials.reduce((sum, c) => sum + (c.stats.creativity || 0), 0) / 3),
            function: Math.floor(materials.reduce((sum, c) => sum + (c.stats.function || 0), 0) / 3),
        };

        const multiplier = 1.3; // 30% bonus for Unique
        const newEfficiency = Math.floor(avgStats.efficiency * multiplier);
        const newCreativity = Math.floor(avgStats.creativity * multiplier);
        const newFunction = Math.floor(avgStats.function * multiplier);
        const newTotalPower = newEfficiency + newCreativity + newFunction;

        // 2. Determine Type (Majority)
        const typeCounts: Record<string, number> = { EFFICIENCY: 0, CREATIVITY: 0, FUNCTION: 0 };
        materials.forEach(c => {
            if (c.type) typeCounts[c.type as string] = (typeCounts[c.type as string] || 0) + 1;
        });
        const winnerType = Object.keys(typeCounts).reduce((a, b) => typeCounts[a] > typeCounts[b] ? a : b);

        return {
            id: generateId(),
            templateId: materials[0].templateId,
            name: `${materials[0].name} (Unique)`, // Or better naming logic
            ownerId: userId,
            level: 1, // Reset level
            experience: 0,
            stats: {
                efficiency: newEfficiency,
                creativity: newCreativity,
                function: newFunction,
                accuracy: 0, speed: 0, stability: 0, ethics: 0,
                totalPower: newTotalPower
            },
            rarity: 'unique',
            acquiredAt: new Date(),
            isLocked: false,
            type: winnerType as 'EFFICIENCY' | 'CREATIVITY' | 'FUNCTION',
            specialSkill: materials[0].specialSkill
        };
    };

    const { addNotification } = useNotification();

    // Submit Handler
    const handleSubmit = async () => {
        const filledMaterials = materialSlots.filter((c): c is InventoryCard => c !== null);

        if (filledMaterials.length !== 3) {
            showAlert({ title: '재료 부족', message: '전설 카드 3장이 필요합니다.', type: 'warning' });
            return;
        }

        if (userTokens < REQUIRED_TOKEN_COST) {
            showAlert({ title: '토큰 부족', message: `토큰이 부족합니다. (필요: ${REQUIRED_TOKEN_COST})`, type: 'warning' });
            return;
        }

        try {
            // 1. Create Card
            const newCard = createUniqueCard(filledMaterials, 'player'); // ownerId fetch needed but player is fine

            // 2. Remove Materials
            for (const mat of filledMaterials) {
                await removeCardFromInventory(mat.instanceId);
            }

            // 3. Add New Card
            await addCardToInventory(newCard);

            // 4. Consume Tokens
            await gameStorage.addTokens(-REQUIRED_TOKEN_COST);

            // 5. Success
            setRewardCard(newCard);
            setRewardModalOpen(true);
            handleClear();
            refreshData();
            loadCards(); // Refresh list

            addNotification('enhance', '유니크 제작 성공!', `${newCard.name} 카드를 획득했습니다.`, '/unique');

        } catch (e) {
            console.error(e);
            showAlert({ title: '오류', message: '유니크 생성 중 오류가 발생했습니다.', type: 'error' });
            addNotification('error', '제작 오류', '유니크 카드 제작 중 오류가 발생했습니다.', '/unique');
        }
    };

    const filledCount = materialSlots.filter(c => c !== null).length;
    const canSubmit = filledCount === 3;

    return (
        <CyberPageLayout
            title="유니크 제작소"
            englishTitle="UNIQUE CREATION"
            description="전설 등급 카드 3장을 희생하여 강력한 유니크 카드를 제작합니다."
            color="red" // Red theme for Unique
        >
            {/* Top Info */}
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-red-500">전설 카드 보관함</h2>
                        <p className="text-red-300/60 text-sm">보유 중인 전설 카드만 표시됩니다.</p>
                    </div>
                    <div className="bg-black/40 px-4 py-2 rounded-lg border border-red-900/50">
                        <span className="text-red-400 text-sm mr-2">제작 비용:</span>
                        <span className="text-xl font-bold text-yellow-500">{REQUIRED_TOKEN_COST.toLocaleString()} T</span>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-[220px]">
                    {legendaryCards.map(card => {
                        const isSelected = materialSlots.some(s => s?.id === card.id);
                        return (
                            <div
                                key={card.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, card)}
                                onClick={() => handleCardClick(card)}
                                className={cn(
                                    "cursor-grab active:cursor-grabbing transition-all hover:scale-105",
                                    isSelected && "opacity-50 ring-2 ring-red-500 grayscale"
                                )}
                            >
                                <GameCard card={card} />
                            </div>
                        );
                    })}
                    {legendaryCards.length === 0 && (
                        <div className="col-span-full py-20 text-center text-red-300/30">
                            보유 중인 전설 카드가 없습니다.
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <UniqueFooter
                materialSlots={materialSlots}
                onMaterialDrop={handleMaterialDrop}
                onMaterialRemove={handleMaterialRemove}
                onClear={handleClear}
                onAutoSelect={handleAutoSelect}
                onSubmit={handleSubmit}
                canSubmit={canSubmit}
            />

            {/* Reward Modal */}
            <CardRewardModal
                isOpen={rewardModalOpen}
                onClose={() => setRewardModalOpen(false)}
                cards={rewardCard ? [rewardCard] : []}
                title="유니크 제작 성공!"
            />
        </CyberPageLayout>
    );
}
