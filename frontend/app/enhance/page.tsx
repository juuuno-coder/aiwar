'use client';

import { useState, useEffect } from 'react';
import { Card as CardType } from '@/lib/types';
import { canEnhance, enhanceCard, getEnhanceCost, getEnhancePreview } from '@/lib/enhance-utils';
import { Card } from '@/components/ui/custom/Card';
import { Button } from '@/components/ui/custom/Button';
import GameCard from '@/components/GameCard';

export default function EnhancePage() {
    const [allCards, setAllCards] = useState<CardType[]>([]);
    const [targetCard, setTargetCard] = useState<CardType | null>(null);
    const [materialCards, setMaterialCards] = useState<CardType[]>([]);
    const [userTokens, setUserTokens] = useState(0);

    useEffect(() => {
        loadCards();
    }, []);

    const loadCards = async () => {
        const { gameStorage } = await import('@/lib/game-storage');
        const cards = await gameStorage.getCards();
        const profile = await gameStorage.getUserProfile();
        setAllCards(cards);
        setUserTokens(profile.tokens);
    };

    const handleSelectTarget = (card: CardType) => {
        setTargetCard(card);
        setMaterialCards([]);
    };

    const handleToggleMaterial = (card: CardType) => {
        if (card.id === targetCard?.id) return;

        if (materialCards.find(c => c.id === card.id)) {
            setMaterialCards(prev => prev.filter(c => c.id !== card.id));
        } else {
            if (materialCards.length >= 10) return;
            setMaterialCards(prev => [...prev, card]);
        }
    };

    const handleEnhance = async () => {
        if (!targetCard || materialCards.length !== 10) return;

        const check = canEnhance(targetCard, materialCards, userTokens);
        if (!check.canEnhance) {
            alert(check.reason);
            return;
        }

        const { gameStorage } = await import('@/lib/game-storage');

        // 강화 실행
        const enhancedCard = enhanceCard(targetCard, materialCards);
        const cost = getEnhanceCost(targetCard.level);

        // 재료 카드 삭제
        for (const mat of materialCards) {
            await gameStorage.deleteCard(mat.id);
        }

        // 강화된 카드 업데이트
        await gameStorage.updateCard(enhancedCard.id, enhancedCard);

        // 토큰 차감
        await gameStorage.addTokens(-cost);

        alert(`강화 성공! 레벨 ${enhancedCard.level}로 상승!`);

        // 리셋
        setTargetCard(null);
        setMaterialCards([]);
        await loadCards();
    };

    const preview = targetCard && materialCards.length === 10 ? getEnhancePreview(targetCard) : null;

    return (
        <div className="min-h-screen p-8 bg-[#050505]">
            <h1 className="text-4xl font-bold text-gradient mb-2">⚡ 카드 강화</h1>
            <p className="text-gray-400 mb-8">같은 카드 10장을 소모하여 레벨업</p>

            <div className="grid grid-cols-12 gap-8">
                {/* 왼쪽: 대상 카드 */}
                <div className="col-span-4">
                    <Card className="p-6">
                        <h3 className="text-xl font-bold mb-4">강화 대상</h3>
                        {targetCard ? (
                            <div>
                                <GameCard card={targetCard} />
                                <Button
                                    color="danger"
                                    size="sm"
                                    onClick={() => setTargetCard(null)}
                                    className="w-full mt-4"
                                >
                                    취소
                                </Button>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-12">대상 카드를 선택하세요</p>
                        )}

                        {preview && (
                            <div className="mt-6 p-4 bg-blue-500/10 rounded-lg">
                                <p className="text-sm text-gray-400">미리보기</p>
                                <p className="text-lg font-bold">Lv.{preview.currentLevel} → Lv.{preview.nextLevel}</p>
                                <p className="text-sm">전투력: {preview.currentStats.totalPower} → {preview.nextStats.totalPower}</p>
                                <p className="text-sm text-yellow-400">비용: {preview.cost} 토큰</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* 중앙: 재료 카드 */}
                <div className="col-span-4">
                    <Card className="p-6">
                        <h3 className="text-xl font-bold mb-4">재료 카드 ({materialCards.length}/10)</h3>
                        <div className="grid grid-cols-2 gap-2 max-h-[600px] overflow-y-auto">
                            {materialCards.map(card => (
                                <div key={card.id} onClick={() => handleToggleMaterial(card)} className="cursor-pointer">
                                    <GameCard card={card} />
                                </div>
                            ))}
                        </div>
                        {materialCards.length === 10 && (
                            <Button
                                color="success"
                                onClick={handleEnhance}
                                className="w-full mt-4"
                            >
                                강화하기 ⚡
                            </Button>
                        )}
                    </Card>
                </div>

                {/* 오른쪽: 카드 목록 */}
                <div className="col-span-4">
                    <Card className="p-6">
                        <h3 className="text-xl font-bold mb-4">카드 목록</h3>
                        <div className="grid grid-cols-2 gap-2 max-h-[600px] overflow-y-auto">
                            {allCards.map(card => (
                                <div
                                    key={card.id}
                                    onClick={() => targetCard ? handleToggleMaterial(card) : handleSelectTarget(card)}
                                    className={`cursor-pointer transition-all ${card.id === targetCard?.id ? 'ring-4 ring-blue-500' :
                                            materialCards.find(c => c.id === card.id) ? 'ring-4 ring-red-500' :
                                                'hover:scale-105'
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
