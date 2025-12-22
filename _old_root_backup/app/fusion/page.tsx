'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GameCard from '@/components/GameCard';
import { Card, Rarity } from '@/lib/types';
import { storage, generateRandomStats } from '@/lib/utils';

export default function FusionPage() {
    const router = useRouter();
    const [cards, setCards] = useState<Card[]>([]);
    const [selectedCards, setSelectedCards] = useState<string[]>([]);
    const [userCoins, setUserCoins] = useState(1000);

    useEffect(() => {
        const savedCards = storage.get<Card[]>('userCards', []);
        const savedCoins = storage.get<number>('userCoins', 1000);
        setCards(savedCards);
        setUserCoins(savedCoins);
    }, []);

    const toggleCardSelection = (cardId: string) => {
        if (selectedCards.includes(cardId)) {
            setSelectedCards(selectedCards.filter(id => id !== cardId));
        } else if (selectedCards.length < 3) {
            setSelectedCards([...selectedCards, cardId]);
        }
    };

    const getCardRarity = (card: Card): Rarity => {
        // totalPower로 등급 추정
        if (card.stats.totalPower > 250) return 'legendary';
        if (card.stats.totalPower > 200) return 'epic';
        if (card.stats.totalPower > 150) return 'rare';
        return 'common';
    };

    const getNextRarity = (rarity: Rarity): Rarity | null => {
        const rarityOrder: Rarity[] = ['common', 'rare', 'epic', 'legendary'];
        const currentIndex = rarityOrder.indexOf(rarity);
        if (currentIndex < rarityOrder.length - 1) {
            return rarityOrder[currentIndex + 1];
        }
        return null;
    };

    const getFusionCost = (rarity: Rarity): number => {
        const costs: Record<Rarity, number> = {
            common: 150,
            rare: 400,
            epic: 1000,
            legendary: 0, // 레전더리는 합성 불가
        };
        return costs[rarity];
    };

    const canFuse = (): boolean => {
        if (selectedCards.length !== 3) return false;

        const selectedCardObjects = selectedCards.map(id => cards.find(c => c.id === id)!);
        const rarities = selectedCardObjects.map(getCardRarity);

        // 모두 같은 등급인지 확인
        const firstRarity = rarities[0];
        const allSameRarity = rarities.every(r => r === firstRarity);

        if (!allSameRarity) return false;

        // 레전더리는 합성 불가
        if (firstRarity === 'legendary') return false;

        // 코인 확인
        const cost = getFusionCost(firstRarity);
        if (userCoins < cost) return false;

        return true;
    };

    const performFusion = () => {
        if (!canFuse()) {
            alert('합성 조건을 만족하지 않습니다!');
            return;
        }

        const selectedCardObjects = selectedCards.map(id => cards.find(c => c.id === id)!);
        const currentRarity = getCardRarity(selectedCardObjects[0]);
        const nextRarity = getNextRarity(currentRarity);
        const cost = getFusionCost(currentRarity);

        if (!nextRarity) {
            alert('더 이상 합성할 수 없는 등급입니다!');
            return;
        }

        // 코인 차감
        const newCoins = userCoins - cost;
        setUserCoins(newCoins);
        storage.set('userCoins', newCoins);

        // 새 카드 생성
        const newStats = generateRandomStats(nextRarity);
        const newCard: Card = {
            id: `fusion-${Date.now()}`,
            templateId: `fusion-${nextRarity}-${Date.now()}`,
            ownerId: 'user-001',
            level: 1,
            experience: 0,
            stats: newStats,
            acquiredAt: new Date(),
            isLocked: false,
        };

        // 선택한 카드 제거 및 새 카드 추가
        const updatedCards = cards.filter(c => !selectedCards.includes(c.id));
        updatedCards.push(newCard);

        setCards(updatedCards);
        storage.set('userCards', updatedCards);
        setSelectedCards([]);

        alert(`합성 성공! ${nextRarity.toUpperCase()} 등급 카드를 획득했습니다! (전투력: ${newStats.totalPower})`);

        // 미션 진행도 업데이트
        if (typeof window !== 'undefined') {
            import('@/lib/mission-utils').then(({ updateMissionProgress }) => {
                updateMissionProgress('card_fusion', 1);
            });

            // 업적 진행도 업데이트
            import('@/lib/achievement-utils').then(({ updateAchievementStats }) => {
                updateAchievementStats('fusion', 1);
                if (nextRarity === 'legendary') {
                    updateAchievementStats('legendary', 1);
                }
            });
        }
    };

    const selectedCardObjects = selectedCards.map(id => cards.find(c => c.id === id)!).filter(Boolean);
    const currentRarity = selectedCardObjects.length > 0 ? getCardRarity(selectedCardObjects[0]) : null;
    const fusionCost = currentRarity ? getFusionCost(currentRarity) : 0;
    const nextRarity = currentRarity ? getNextRarity(currentRarity) : null;

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/inventory" className="text-[var(--text-secondary)] hover:text-[var(--primary-blue)] mb-2 inline-block">
                            ← 인벤토리로
                        </Link>
                        <h1 className="text-4xl font-bold text-gradient mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                            카드 합성
                        </h1>
                        <p className="text-[var(--text-secondary)]">
                            같은 등급의 카드 3장을 합성하여 상위 등급 카드를 획득하세요
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-[var(--text-secondary)] mb-1">보유 코인</p>
                        <p className="text-3xl font-bold text-gradient" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                            💰 {userCoins.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* 합성 정보 */}
                <div className="card p-6 mb-8 glow-purple">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                합성 정보
                            </h2>
                            <p className="text-sm text-[var(--text-secondary)]">
                                선택된 카드: {selectedCards.length}/3
                            </p>
                        </div>
                        {currentRarity && nextRarity && (
                            <div className="text-center">
                                <p className="text-sm text-[var(--text-secondary)] mb-1">합성 결과</p>
                                <p className="text-2xl font-bold text-gradient">
                                    {currentRarity.toUpperCase()} → {nextRarity.toUpperCase()}
                                </p>
                                <p className="text-sm text-[var(--text-secondary)] mt-1">
                                    비용: 💰 {fusionCost.toLocaleString()}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* 선택된 카드 미리보기 */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="w-32 h-48 border-2 border-dashed border-[var(--primary-purple)] rounded-lg flex items-center justify-center"
                            >
                                {selectedCardObjects[i] ? (
                                    <div className="scale-75">
                                        <GameCard card={selectedCardObjects[i]} />
                                    </div>
                                ) : (
                                    <span className="text-4xl opacity-30">?</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* 합성 버튼 */}
                    <button
                        onClick={performFusion}
                        disabled={!canFuse()}
                        className={`btn w-full ${canFuse() ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'
                            }`}
                    >
                        {selectedCards.length < 3
                            ? '카드 3장을 선택하세요'
                            : !canFuse()
                                ? '합성 불가 (등급 불일치 또는 코인 부족)'
                                : '합성하기'}
                    </button>
                </div>

                {/* 카드 목록 */}
                {cards.length === 0 ? (
                    <div className="card p-12 text-center">
                        <p className="text-xl text-[var(--text-secondary)] mb-4">
                            보유한 카드가 없습니다
                        </p>
                        <Link href="/factions" className="btn btn-primary">
                            AI 군단에서 유닛 생성하기
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center">
                        {cards.map((card) => (
                            <GameCard
                                key={card.id}
                                card={card}
                                isSelected={selectedCards.includes(card.id)}
                                onClick={() => toggleCardSelection(card.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
