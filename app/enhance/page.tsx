'use client';

import { useState, useEffect } from 'react';
import GameCard from '@/components/GameCard';
import { Card } from '@/lib/types';
import { getGameState } from '@/lib/game-state';
import { enhanceCard, getEnhanceCost, getEnhanceBonus } from '@/lib/enhance-utils';
import UiCard from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function EnhancePage() {
    const [cards, setCards] = useState<Card[]>([]);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const [userTokens, setUserTokens] = useState(0);

    useEffect(() => {
        const state = getGameState();
        setCards(state.inventory);
        setUserTokens(state.tokens);
    }, []);

    const getEnhanceCostLocal = (level: number): number => {
        return level * 100;
    };

    const getExpNeeded = (level: number): number => {
        return level * 100;
    };

    const canLevelUp = (card: Card): boolean => {
        if (card.level >= 10) return false;
        const expNeeded = getExpNeeded(card.level);
        const cost = getEnhanceCostLocal(card.level);
        return card.experience >= expNeeded && userTokens >= cost;
    };

    const handleEnhance = () => {
        if (!selectedCard) {
            alert('카드를 선택해주세요.');
            return;
        }

        const result = enhanceCard(selectedCard.id);

        if (result.success) {
            const state = getGameState();
            setCards(state.inventory);
            setUserTokens(state.tokens);
            setSelectedCard(result.card || null);
            alert(result.message);
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="h-full">
            {/* 헤더 */}
            <div className="mb-8 animate-slide-down">
                <h1 className="text-4xl font-bold text-gradient mb-2">
                    ⚡ 카드 강화
                </h1>
                <p className="text-lg text-gray-400">
                    경험치와 토큰을 사용하여 카드를 강화하세요
                </p>
            </div>

            {/* 상단 정보 */}
            <UiCard variant="glow" className="mb-8 animate-slide-up">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-1 text-white">
                            보유 자원
                        </h2>
                        <p className="text-sm text-gray-400">
                            강화에 필요한 자원을 확인하세요
                        </p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-400 mb-1">보유 토큰</p>
                            <p className="text-3xl font-bold text-yellow-300">
                                💰 {userTokens.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-400 mb-1">보유 카드</p>
                            <p className="text-3xl font-bold text-blue-300">
                                🎴 {cards.length}장
                            </p>
                        </div>
                    </div>
                </div>
            </UiCard>

            <div className="grid grid-cols-2 gap-8">
                {/* 카드 선택 */}
                <div>
                    <h2 className="text-2xl font-bold mb-4 text-white">
                        강화할 카드 선택
                    </h2>

                    {cards.length === 0 ? (
                        <UiCard className="p-12 text-center">
                            <p className="text-xl text-gray-400 mb-4">보유한 카드가 없습니다</p>
                            <Button variant="primary" onClick={() => window.location.href = '/shop'}>
                                상점으로 가기
                            </Button>
                        </UiCard>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                            {cards.map((card, index) => (
                                <div
                                    key={card.id}
                                    onClick={() => setSelectedCard(card)}
                                    className={`cursor-pointer transition-all animate-slide-up delay-${(index % 10) * 50} ${selectedCard?.id === card.id
                                            ? 'ring-4 ring-blue-500 scale-105'
                                            : 'hover:scale-105'
                                        }`}
                                >
                                    <GameCard card={card} />
                                    <div className="mt-2 text-center">
                                        <p className="text-xs text-gray-400">
                                            경험치: {card.experience}/{getExpNeeded(card.level)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 강화 정보 */}
                <div>
                    <h2 className="text-2xl font-bold mb-4 text-white">
                        강화 정보
                    </h2>

                    {selectedCard ? (
                        <div className="space-y-6">
                            {/* 현재 상태 */}
                            <UiCard variant="gradient">
                                <h3 className="text-xl font-bold mb-4 text-white">현재 상태</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm text-gray-400">강화 비용</span>
                                        <span className="text-lg font-bold text-yellow-300">💰 {getEnhanceCostLocal(selectedCard.level)} 토큰</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">레벨</span>
                                        <span className="text-2xl font-bold text-white">{selectedCard.level}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">경험치</span>
                                        <span className="font-bold text-white">
                                            {selectedCard.experience}/{getExpNeeded(selectedCard.level)}
                                        </span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                            style={{
                                                width: `${(selectedCard.experience / getExpNeeded(selectedCard.level)) * 100}%`,
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-gray-400">총 전투력</span>
                                        <span className="text-2xl font-bold text-gradient">
                                            {selectedCard.stats.totalPower}
                                        </span>
                                    </div>
                                </div>
                            </UiCard>

                            {/* 강화 후 예상 */}
                            {selectedCard.level < 10 && (
                                <UiCard variant="glow" className="bg-gradient-to-r from-green-500/20 to-blue-500/20">
                                    <h3 className="text-xl font-bold mb-4 text-white">강화 후 예상</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400">레벨</span>
                                            <span className="text-2xl font-bold text-green-400">
                                                {selectedCard.level} → {selectedCard.level + 1}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400">총 전투력</span>
                                            <span className="text-2xl font-bold text-green-400">
                                                {selectedCard.stats.totalPower} → {Math.floor(selectedCard.stats.totalPower * 1.05)}
                                            </span>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-purple-500">
                                            <p className="text-sm text-gray-400 mb-2">강화 비용</p>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <span>💰</span>
                                                    <span className="font-bold text-white">{getEnhanceCostLocal(selectedCard.level)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>⭐</span>
                                                    <span className="font-bold text-white">{getExpNeeded(selectedCard.level)} EXP</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </UiCard>
                            )}

                            {/* 강화 버튼 */}
                            <div>
                                {selectedCard.level >= 10 ? (
                                    <UiCard className="p-6 text-center bg-gradient-to-r from-yellow-500/20 to-orange-500/20">
                                        <p className="text-xl font-bold text-yellow-300">
                                            ✨ 최대 레벨 달성! ✨
                                        </p>
                                    </UiCard>
                                ) : canLevelUp(selectedCard) ? (
                                    <Button
                                        variant="success"
                                        size="lg"
                                        onClick={handleEnhance}
                                        className="w-full animate-pulse"
                                    >
                                        강화하기 ⚡
                                    </Button>
                                ) : (
                                    <UiCard className="p-6 text-center">
                                        <p className="text-gray-400">
                                            {selectedCard.experience < getExpNeeded(selectedCard.level)
                                                ? '경험치가 부족합니다'
                                                : '토큰이 부족합니다'}
                                        </p>
                                    </UiCard>
                                )}
                            </div>

                            {/* 안내 */}
                            <UiCard className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                                <h4 className="font-bold mb-2 text-white">💡 강화 팁</h4>
                                <ul className="text-sm text-gray-400 space-y-1">
                                    <li>• 대전에서 승리하면 경험치를 획득합니다</li>
                                    <li>• 강화 시 모든 능력치가 5% 증가합니다</li>
                                    <li>• 최대 레벨은 10입니다</li>
                                    <li>• 레벨이 높을수록 강화 비용이 증가합니다</li>
                                </ul>
                            </UiCard>
                        </div>
                    ) : (
                        <UiCard className="p-12 text-center">
                            <p className="text-xl text-gray-400">
                                강화할 카드를 선택해주세요
                            </p>
                        </UiCard>
                    )}
                </div>
            </div>
        </div>
    );
}
