'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import GameCard from '@/components/GameCard';
import { Card, BattleGenre } from '@/lib/types';
import { storage, generateCard } from '@/lib/utils';
import { analyzeDeckSynergy } from '@/lib/synergy-utils';
import gameBalanceData from '@/data/game-balance.json';
import { getGameState, addTokens, addExperience, recordBattleResult } from '@/lib/game-state';
import UiCard from '@/components/ui/Card';
import Button from '@/components/ui/Button';

function BattleFightContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [playerCards, setPlayerCards] = useState<Card[]>([]);
    const [opponentCards, setOpponentCards] = useState<Card[]>([]);
    const [battleGenre, setBattleGenre] = useState<BattleGenre | null>(null);
    const [currentRound, setCurrentRound] = useState(0);
    const [playerWins, setPlayerWins] = useState(0);
    const [opponentWins, setOpponentWins] = useState(0);
    const [roundResult, setRoundResult] = useState<'player' | 'opponent' | null>(null);
    const [battleEnded, setBattleEnded] = useState(false);
    const [showPowers, setShowPowers] = useState(false);

    useEffect(() => {
        const cardIds = searchParams.get('cards')?.split(',') || [];
        const genreId = searchParams.get('genre');

        if (cardIds.length !== 5 || !genreId) {
            router.push('/battle');
            return;
        }

        const allCards = storage.get<Card[]>('userCards', []);
        const selectedCards = cardIds.map(id => allCards.find(c => c.id === id)).filter(Boolean) as Card[];
        setPlayerCards(selectedCards);

        const aiCards = generateAICards(5);
        setOpponentCards(aiCards);

        const genre = gameBalanceData.battleGenres.find(g => g.id === genreId);
        setBattleGenre(genre as BattleGenre);
    }, [searchParams, router]);

    const generateAICards = (count: number): Card[] => {
        const cards: Card[] = [];
        for (let i = 0; i < count; i++) {
            const baseStats = 20 + Math.floor(Math.random() * 20);

            const creativity = baseStats + Math.floor(Math.random() * 10);
            const accuracy = baseStats + Math.floor(Math.random() * 10);
            const speed = baseStats + Math.floor(Math.random() * 10);
            const stability = baseStats + Math.floor(Math.random() * 10);
            const ethics = baseStats + Math.floor(Math.random() * 10);

            const totalPower = creativity + accuracy + speed + stability + ethics;

            cards.push({
                id: `ai-card-${i}`,
                templateId: `ai-template-${i}`,
                ownerId: 'ai',
                level: 1 + Math.floor(Math.random() * 5),
                experience: 0,
                stats: {
                    creativity,
                    accuracy,
                    speed,
                    stability,
                    ethics,
                    totalPower,
                },
                acquiredAt: new Date(),
                isLocked: false,
            });
        }
        return cards;
    };

    const calculatePower = (card: Card, applySynergy: boolean = true): number => {
        if (!battleGenre) return card.stats.totalPower;

        const weights = battleGenre.statWeights;
        let power = Math.floor(
            (card.stats.creativity || 0) * weights.creativity +
            (card.stats.accuracy || 0) * weights.accuracy +
            (card.stats.speed || 0) * weights.speed +
            (card.stats.stability || 0) * weights.stability +
            (card.stats.ethics || 0) * weights.ethics
        );

        if (applySynergy) {
            const synergy = analyzeDeckSynergy(playerCards);
            power = Math.floor(power * synergy.totalBonus);
        }

        return power;
    };

    const playRound = () => {
        if (currentRound >= 5 || battleEnded) return;

        setShowPowers(true);

        const playerCard = playerCards[currentRound];
        const opponentCard = opponentCards[currentRound];

        const playerPower = calculatePower(playerCard, true);
        const opponentPower = calculatePower(opponentCard, false);

        const playerLastDigit = playerPower % 10;
        const opponentLastDigit = opponentPower % 10;

        let winner: 'player' | 'opponent';
        if (playerLastDigit > opponentLastDigit) {
            winner = 'player';
            setPlayerWins(prev => prev + 1);
            setRoundResult('player');
        } else if (opponentLastDigit > playerLastDigit) {
            winner = 'opponent';
            setOpponentWins(prev => prev + 1);
            setRoundResult('opponent');
        } else {
            if (playerPower > opponentPower) {
                winner = 'player';
                setPlayerWins(prev => prev + 1);
                setRoundResult('player');
            } else {
                winner = 'opponent';
                setOpponentWins(prev => prev + 1);
                setRoundResult('opponent');
            }
        }

        setTimeout(() => {
            setRoundResult(null);
            setShowPowers(false);
            const newRound = currentRound + 1;
            setCurrentRound(newRound);

            const newPlayerWins = winner === 'player' ? playerWins + 1 : playerWins;
            const newOpponentWins = winner === 'opponent' ? opponentWins + 1 : opponentWins;

            if (newPlayerWins === 3 || newOpponentWins === 3 || newRound === 5) {
                setBattleEnded(true);
                completeBattle(newPlayerWins, newOpponentWins);
            }
        }, 2500);
    };

    const completeBattle = async (finalPlayerWins: number, finalOpponentWins: number) => {
        const won = finalPlayerWins > finalOpponentWins;

        recordBattleResult(won);

        if (won) {
            const state = getGameState();
            let coinReward = 300;
            const expReward = 50;

            const winStreak = state.stats.currentStreak;
            if (winStreak >= 3) {
                coinReward += 100 * Math.floor(winStreak / 3);
            }

            // Firebase 통합 저장소 사용
            const { gameStorage } = await import('@/lib/game-storage');
            await gameStorage.addCoins(coinReward);
            const expResult = await gameStorage.addExperience(expReward);

            // 레벨업 알림
            if (expResult.leveledUp) {
                console.log(`🎉 레벨업! Lv.${expResult.level}`);
            }

            let bonusCard = null;
            if (Math.random() < 0.1) {
                bonusCard = generateCard();
                await gameStorage.addCardToInventory(bonusCard);
            }

            import('@/lib/mission-utils').then(({ updateMissionProgress }) => {
                updateMissionProgress('battle_win', 1);
            });

            import('@/lib/achievement-utils').then(({ updateAchievementStats }) => {
                updateAchievementStats('totalBattles', 1);
                updateAchievementStats('totalWins', 1);
                if (winStreak >= 3) {
                    updateAchievementStats('winStreak', winStreak);
                }
            });
        } else {
            const coinReward = 90;
            const expReward = 15;

            // Firebase 통합 저장소 사용
            const { gameStorage } = await import('@/lib/game-storage');
            await gameStorage.addCoins(coinReward);
            await gameStorage.addExperience(expReward);

            import('@/lib/achievement-utils').then(({ updateAchievementStats }) => {
                updateAchievementStats('totalBattles', 1);
            });
        }
    };

    if (playerCards.length === 0 || !battleGenre) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-2xl text-white">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="h-full">
            {/* 헤더 */}
            <div className="mb-8 text-center animate-slide-down">
                <h1 className="text-3xl font-bold text-gradient mb-2">
                    {battleGenre.name}
                </h1>
                <p className="text-gray-400">{battleGenre.description}</p>
            </div>

            {/* 스코어 보드 */}
            <UiCard variant="glow" className="mb-8 animate-slide-up">
                <div className="flex items-center justify-center gap-12">
                    <div className="text-center">
                        <p className="text-sm text-gray-400 mb-2">플레이어</p>
                        <div className="flex gap-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-6 h-6 rounded-full transition-all duration-300 ${i < playerWins
                                        ? 'bg-green-500 animate-scale-in'
                                        : 'bg-gray-700'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="text-5xl font-bold text-gradient">
                        VS
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-400 mb-2">AI 상대</p>
                        <div className="flex gap-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-6 h-6 rounded-full transition-all duration-300 ${i < opponentWins
                                        ? 'bg-red-500 animate-scale-in'
                                        : 'bg-gray-700'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </UiCard>

            {/* 대전 화면 */}
            {!battleEnded ? (
                <>
                    <div className="text-center mb-6">
                        <p className="text-2xl font-bold text-white">라운드 {currentRound + 1} / 5</p>
                        <div className="w-full max-w-md mx-auto mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500"
                                style={{ width: `${((currentRound + 1) / 5) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-16 mb-8">
                        {/* 플레이어 카드 */}
                        <div className="text-center">
                            <p className="text-sm text-gray-400 mb-4">내 카드</p>
                            <div className={`transition-all duration-500 ${roundResult === 'player' ? 'scale-110 animate-glow' : roundResult === 'opponent' ? 'scale-90 opacity-50' : ''}`}>
                                <GameCard card={playerCards[currentRound]} />
                            </div>
                            {showPowers && (
                                <div className="mt-4 animate-slide-up">
                                    <p className="text-lg font-bold text-white">
                                        전투력: {calculatePower(playerCards[currentRound], true)}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        끝자리: {calculatePower(playerCards[currentRound], true) % 10}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* VS */}
                        <div className={`text-6xl font-bold text-gradient ${roundResult ? 'animate-pulse' : ''}`}>
                            VS
                        </div>

                        {/* 상대 카드 */}
                        <div className="text-center">
                            <p className="text-sm text-gray-400 mb-4">상대 카드</p>
                            <div className={`transition-all duration-500 ${roundResult === 'opponent' ? 'scale-110 animate-glow' : roundResult === 'player' ? 'scale-90 opacity-50' : ''}`}>
                                <GameCard card={opponentCards[currentRound]} />
                            </div>
                            {showPowers && (
                                <div className="mt-4 animate-slide-up">
                                    <p className="text-lg font-bold text-white">
                                        전투력: {calculatePower(opponentCards[currentRound], false)}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        끝자리: {calculatePower(opponentCards[currentRound], false) % 10}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 결과 표시 */}
                    {roundResult && (
                        <div className="text-center mb-6 animate-scale-in">
                            <p className={`text-4xl font-bold ${roundResult === 'player' ? 'text-green-400' : 'text-red-400'}`}>
                                {roundResult === 'player' ? '🎉 승리!' : '💔 패배!'}
                            </p>
                        </div>
                    )}

                    {/* 액션 버튼 */}
                    {!roundResult && (
                        <div className="text-center">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={playRound}
                                className="animate-bounce"
                            >
                                카드 공개 🎴
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                /* 최종 결과 */
                <UiCard variant="glow" className="p-12 text-center animate-scale-in">
                    <h2 className="text-5xl font-bold mb-6">
                        {playerWins > opponentWins ? (
                            <span className="text-green-400 animate-bounce">🎉 승리! 🎉</span>
                        ) : playerWins < opponentWins ? (
                            <span className="text-red-400">😢 패배...</span>
                        ) : (
                            <span className="text-blue-400">🤝 무승부</span>
                        )}
                    </h2>

                    <p className="text-3xl mb-8 text-white">
                        최종 스코어: <span className="font-bold text-gradient">{playerWins} - {opponentWins}</span>
                    </p>

                    {playerWins > opponentWins && (
                        <div className="mb-8">
                            <p className="text-xl mb-4 text-white">🎁 보상</p>
                            <div className="flex items-center justify-center gap-6">
                                <UiCard variant="gradient">
                                    <p className="text-sm text-gray-400">토큰</p>
                                    <p className="text-2xl font-bold text-yellow-300">+300</p>
                                </UiCard>
                                <UiCard variant="gradient">
                                    <p className="text-sm text-gray-400">경험치</p>
                                    <p className="text-2xl font-bold text-blue-300">+50</p>
                                </UiCard>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 justify-center">
                        <Button variant="primary" onClick={() => router.push('/battle')}>
                            다시 대전하기
                        </Button>
                        <Button variant="secondary" onClick={() => router.push('/')}>
                            메인으로
                        </Button>
                    </div>
                </UiCard>
            )}
        </div>
    );
}

export default function BattleFightPage() {
    return (
        <Suspense fallback={<div className="h-full flex items-center justify-center"><div className="text-2xl text-white">로딩 중...</div></div>}>
            <BattleFightContent />
        </Suspense>
    );
}
