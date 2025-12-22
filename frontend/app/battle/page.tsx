'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GameCard from '@/components/GameCard';
import { Card as CardType, BattleGenre } from '@/lib/types';
import { storage } from '@/lib/utils';
import { analyzeDeckSynergy, getFactionDisplayName } from '@/lib/synergy-utils';
import gameBalanceData from '@/data/game-balance.json';
import { Card } from '@/components/ui/custom/Card';
import { Button } from '@/components/ui/custom/Button';
import { HoverBorderGradient } from '@/components/ui/aceternity/hover-border-gradient';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';

export default function BattlePage() {
    const router = useRouter();
    const [cards, setCards] = useState<any[]>([]);
    const [selectedCards, setSelectedCards] = useState<string[]>([]);
    const [battleGenre, setBattleGenre] = useState<BattleGenre | null>(null);

    useEffect(() => {
        const savedCards = storage.get<CardType[]>('userCards', []);
        setCards(savedCards);

        const genres = gameBalanceData.battleGenres;
        const randomGenre = genres[Math.floor(Math.random() * genres.length)];
        setBattleGenre(randomGenre as BattleGenre);
    }, []);

    const toggleCardSelection = (cardId: string) => {
        if (selectedCards.includes(cardId)) {
            setSelectedCards(selectedCards.filter(id => id !== cardId));
        } else if (selectedCards.length < 5) {
            setSelectedCards([...selectedCards, cardId]);
        }
    };

    const startBattle = () => {
        if (selectedCards.length !== 5) {
            alert('5장의 카드를 선택해주세요!');
            return;
        }

        const cardIds = selectedCards.join(',');
        router.push(`/battle/fight?cards=${cardIds}&genre=${battleGenre?.id}`);
    };

    const selectedCardObjects = selectedCards.map(id => cards.find(c => c.id === id)).filter(Boolean) as CardType[];
    const synergy = selectedCards.length > 0 ? analyzeDeckSynergy(selectedCardObjects) : null;

    return (
        <div className="relative min-h-screen p-8 bg-slate-950 overflow-hidden">
            <BackgroundBeams className="opacity-20" />
            <div className="relative z-10">
                {/* 헤더 */}
                <div className="mb-8 animate-slide-down">
                    <h1 className="text-4xl font-bold text-gradient mb-2">
                        ⚔️ 대전
                    </h1>
                    <p className="text-lg text-gray-400">
                        5장의 카드를 선택하여 5전 3선승제 대전을 시작하세요
                    </p>
                </div>

                {/* 대전 장르 */}
                {battleGenre && (
                    <Card variant="glow" className="mb-8 text-center animate-slide-up">
                        <h2 className="text-2xl font-bold mb-2">
                            오늘의 대전 장르
                        </h2>
                        <p className="text-3xl font-bold text-gradient mb-2">
                            {battleGenre.name}
                        </p>
                        <p className="text-sm text-gray-400">
                            {battleGenre.description}
                        </p>
                    </Card>
                )}

                {/* 선택 상태 & 시작 버튼 */}
                <div className="mb-6 flex items-center justify-between animate-slide-up delay-100">
                    <div className="flex items-center gap-4">
                        <div className="text-lg">
                            선택된 카드: <span className="font-bold text-blue-400">{selectedCards.length}/5</span>
                        </div>
                        {selectedCards.length > 0 && (
                            <Button
                                color="secondary"
                                size="sm"
                                onClick={() => setSelectedCards([])}
                            >
                                선택 초기화
                            </Button>
                        )}
                    </div>
                    <div className="flex-1 max-w-xs">
                        {selectedCards.length === 5 ? (
                            <HoverBorderGradient
                                onClick={startBattle}
                                className="w-full py-3 h-full px-8"
                                containerClassName="w-full"
                                duration={2}
                            >
                                <span className="font-bold text-white whitespace-nowrap">대전 시작 ⚔️</span>
                            </HoverBorderGradient>
                        ) : (
                            <Button
                                color="primary"
                                onClick={startBattle}
                                disabled={true}
                                size="lg"
                                className="w-full opacity-50 cursor-not-allowed"
                            >
                                대전 시작 ⚔️
                            </Button>
                        )}
                    </div>
                </div>

                {/* 시너지 정보 */}
                {synergy && synergy.activeSynergies.length > 0 && (
                    <Card variant="glow" className="mb-6 animate-fade-in">
                        <h3 className="text-xl font-bold mb-4">
                            ✨ 시너지 보너스
                        </h3>
                        <div className="space-y-3">
                            {synergy.activeSynergies.map((s, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🤖</span>
                                        <div>
                                            <p className="font-bold text-white">{getFactionDisplayName(s.faction)}</p>
                                            <p className="text-sm text-gray-400">
                                                {s.count}장 사용 중
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-green-400">
                                            +{((s.bonus - 1) * 100).toFixed(0)}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-purple-500">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-white">총 보너스</span>
                                <span className="text-2xl font-bold text-gradient">
                                    +{((synergy.totalBonus - 1) * 100).toFixed(0)}%
                                </span>
                            </div>
                        </div>
                    </Card>
                )}

                {/* 카드 그리드 */}
                {cards.length === 0 ? (
                    <Card className="p-12 text-center">
                        <p className="text-xl text-gray-400 mb-4">보유한 카드가 없습니다</p>
                        <Button
                            color="primary"
                            onClick={() => router.push('/shop')}
                        >
                            상점으로 가기 🛒
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {cards.map((card, index) => (
                            <div
                                key={card.id}
                                onClick={() => toggleCardSelection(card.id)}
                                className={`cursor-pointer transition-all transform hover:scale-105 animate-slide-up delay-${(index % 10) * 50} ${selectedCards.includes(card.id)
                                    ? 'ring-4 ring-blue-500 scale-105'
                                    : ''
                                    }`}
                            >
                                <GameCard card={card} />
                                {selectedCards.includes(card.id) && (
                                    <div className="mt-2 text-center">
                                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                            선택됨 ✓
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
