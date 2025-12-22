'use client';

import { useState, useEffect } from 'react';
import { Card as CardType } from '@/lib/types';
import { canCreateUniqueCard, createUniqueCard, getUniqueCreationCost, getUniqueCardTemplates } from '@/lib/unique-utils';
import { Card } from '@/components/ui/custom/Card';
import { Button } from '@/components/ui/custom/Button';
import GameCard from '@/components/GameCard';
import { HoverBorderGradient } from '@/components/ui/aceternity/hover-border-gradient';
import CyberPageLayout from '@/components/CyberPageLayout';

export default function UniqueCreatePage() {
    const [allCards, setAllCards] = useState<CardType[]>([]);
    const [materialCards, setMaterialCards] = useState<CardType[]>([]);
    const [userTokens, setUserTokens] = useState(0);
    const [legendaryCards, setLegendaryCards] = useState<CardType[]>([]);

    useEffect(() => {
        loadCards();
    }, []);

    const loadCards = async () => {
        const { gameStorage } = await import('@/lib/game-storage');
        const { getGameState } = await import('@/lib/game-state');
        const cards = await gameStorage.getCards();
        const state = getGameState();

        // 전설급 카드만 필터링
        const legendary = cards.filter(c => c.rarity === 'legendary');

        setAllCards(cards);
        setLegendaryCards(legendary);
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

    const handleCreate = async () => {
        if (!canCreateUniqueCard(materialCards)) {
            alert('전설급 카드 3장(레벨 10)이 필요합니다.');
            return;
        }

        const cost = getUniqueCreationCost();
        if (userTokens < cost.tokens) {
            alert(`토큰이 부족합니다. (필요: ${cost.tokens})`);
            return;
        }

        const { gameStorage } = await import('@/lib/game-storage');

        // 유니크 카드 생성
        const result = createUniqueCard(materialCards, 'guest');

        if (!result.success || !result.card) {
            alert(result.message);
            return;
        }

        // 재료 카드 삭제
        for (const mat of materialCards) {
            await gameStorage.deleteCard(mat.id);
        }

        // 유니크 카드 추가
        await gameStorage.addCardToInventory(result.card);

        // 토큰 차감
        await gameStorage.addTokens(-cost.tokens);

        alert(`${result.message}\n전투력: ${result.card.stats.totalPower}`);

        // 리셋
        setMaterialCards([]);
        await loadCards();
    };

    const templates = getUniqueCardTemplates();

    return (
        <CyberPageLayout
            title="UNIQUE_CREATION"
            subtitle="Ultimate Card Synthesis"
            description="전설급 카드 3장(레벨 10)을 소모하여 유니크 카드 생성"
            color="red"
        >

            <div className="grid grid-cols-2 gap-8">
                {/* 왼쪽: 재료 카드 */}
                <div>
                    <Card className="p-6 mb-6">
                        <h3 className="text-xl font-bold mb-4">재료 카드 ({materialCards.length}/3)</h3>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {materialCards.map(card => (
                                <div key={card.id} onClick={() => handleToggleMaterial(card)} className="cursor-pointer">
                                    <GameCard card={card} />
                                </div>
                            ))}
                        </div>

                        {materialCards.length === 3 && (
                            <div className="p-4 bg-red-500/10 rounded-lg mb-4">
                                <p className="text-sm text-gray-400">생성 비용</p>
                                <p className="text-lg font-bold text-yellow-400">1000 토큰</p>
                                <p className="text-sm text-gray-500">랜덤하게 유니크 카드 1장 획득</p>
                            </div>
                        )}

                        {materialCards.length === 3 && (
                            <HoverBorderGradient
                                onClick={handleCreate}
                                className="w-full py-4 h-full"
                                containerClassName="w-full"
                                duration={2}
                            >
                                <span className="font-bold text-white">유니크 생성 ✨</span>
                            </HoverBorderGradient>
                        )}
                    </Card>

                    {/* 유니크 카드 목록 */}
                    <Card className="p-6">
                        <h3 className="text-xl font-bold mb-4">생성 가능한 유니크 카드</h3>
                        <div className="space-y-3">
                            {templates.map(template => (
                                <div key={template.id} className="p-3 bg-white/5 rounded-lg">
                                    <p className="font-bold text-red-400">{template.name}</p>
                                    <p className="text-sm text-gray-400">{template.description}</p>
                                    <p className="text-xs text-purple-400 mt-1">
                                        {template.specialAbility.name}: {template.specialAbility.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* 오른쪽: 전설급 카드 목록 */}
                <div>
                    <Card className="p-6">
                        <h3 className="text-xl font-bold mb-4">전설급 카드 ({legendaryCards.length}장)</h3>
                        <div className="grid grid-cols-3 gap-2 max-h-[700px] overflow-y-auto">
                            {legendaryCards.map(card => (
                                <div
                                    key={card.id}
                                    onClick={() => handleToggleMaterial(card)}
                                    className={`cursor-pointer transition-all ${materialCards.find(c => c.id === card.id) ? 'ring-4 ring-red-500' :
                                        card.level < 10 ? 'opacity-50' :
                                            'hover:scale-105'
                                        }`}
                                >
                                    <GameCard card={card} />
                                    {card.level < 10 && (
                                        <p className="text-xs text-red-400 text-center mt-1">레벨 10 필요</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </CyberPageLayout>
    );
}
