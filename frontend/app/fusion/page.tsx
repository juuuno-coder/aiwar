'use client';

import { useState, useEffect } from 'react';
import { Card as CardType } from '@/lib/types';
import { canFuse, fuseCards, getFusionCost, getFusionPreview, getRarityName } from '@/lib/fusion-utils';
import { Card } from '@/components/ui/custom/Card';
import { Button } from '@/components/ui/custom/Button';
import GameCard from '@/components/GameCard';

export default function FusionPage() {
    const [allCards, setAllCards] = useState<CardType[]>([]);
    const [materialCards, setMaterialCards] = useState<CardType[]>([]);
    const [userTokens, setUserTokens] = useState(0);

    useEffect(() => {
        loadCards();
    }, []);

    const loadCards = async () => {
        const { gameStorage } = await import('@/lib/game-storage');
        const { getGameState } = await import('@/lib/game-state');
        const cards = await gameStorage.getCards();
        const state = getGameState();
        setAllCards(cards);
        setUserTokens(state.tokens || 0);
    };

    const handleToggleMaterial = (card: CardType) => {
        if (materialCards.find(c => c.id === card.id)) {
            setMaterialCards(prev => prev.filter(c => c.id !== card.id));
        } else {
            if (materialCards.length >= 3) return;
            setMaterialCards(prev => [...prev, card]);
        }
    };

    const handleFusion = async () => {
        if (materialCards.length !== 3) return;

        const check = canFuse(materialCards, userTokens);
        if (!check.canFuse) {
            alert(check.reason);
            return;
        }

        const { gameStorage } = await import('@/lib/game-storage');
        const { getGameState } = await import('@/lib/game-state');

        // 융합 실행
        const fusedCard = fuseCards(materialCards, 'guest');
        const cost = getFusionCost(materialCards[0].rarity!);

        // 재료 카드 삭제
        for (const mat of materialCards) {
            await gameStorage.deleteCard(mat.id);
        }

        // 융합된 카드 추가
        await gameStorage.addCardToInventory(fusedCard);

        // 토큰 차감
        await gameStorage.addTokens(-cost);

        alert(`융합 성공! ${fusedCard.rarity} 카드 획득!`);

        // 리셋
        setMaterialCards([]);
        await loadCards();
    };

    const preview = materialCards.length === 3 ? getFusionPreview(materialCards) : null;

    return (
        <div className="min-h-screen p-8 bg-[#050505]">
            <h1 className="text-4xl font-bold text-gradient mb-2">🔮 카드 합성</h1>
            <p className="text-gray-400 mb-8">같은 등급 카드 3장을 합성하여 상위 등급 1장 획득</p>

            <div className="grid grid-cols-2 gap-8">
                {/* 왼쪽: 재료 카드 */}
                <div>
                    <Card className="p-6">
                        <h3 className="text-xl font-bold mb-4">재료 카드 ({materialCards.length}/3)</h3>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {materialCards.map(card => (
                                <div key={card.id} onClick={() => handleToggleMaterial(card)} className="cursor-pointer">
                                    <GameCard card={card} />
                                </div>
                            ))}
                        </div>

                        {preview && (
                            <div className="p-4 bg-purple-500/10 rounded-lg mb-4">
                                <p className="text-sm text-gray-400">합성 미리보기</p>
                                <p className="text-lg font-bold">
                                    {getRarityName(preview.currentRarity)} → {preview.nextRarity ? getRarityName(preview.nextRarity) : '최고 등급'}
                                </p>
                                <p className="text-sm">전투력: {preview.currentAvgStats.totalPower} → {preview.nextStats.totalPower}</p>
                                <p className="text-sm text-yellow-400">비용: {preview.cost} 토큰</p>
                            </div>
                        )}

                        {materialCards.length === 3 && (
                            <Button
                                color="success"
                                onClick={handleFusion}
                                className="w-full"
                            >
                                합성하기 🔮
                            </Button>
                        )}
                    </Card>
                </div>

                {/* 오른쪽: 카드 목록 */}
                <div>
                    <Card className="p-6">
                        <h3 className="text-xl font-bold mb-4">카드 목록</h3>
                        <div className="grid grid-cols-3 gap-2 max-h-[700px] overflow-y-auto">
                            {allCards.map(card => (
                                <div
                                    key={card.id}
                                    onClick={() => handleToggleMaterial(card)}
                                    className={`cursor-pointer transition-all ${materialCards.find(c => c.id === card.id) ? 'ring-4 ring-purple-500' : 'hover:scale-105'
                                        }`}
                                >
                                    <GameCard card={card} />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
