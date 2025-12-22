'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PvPPlayer, PvPMatch } from '@/lib/pvp-types';
import {
    findMatch,
    simulatePvPBattle,
    calculatePvPRewards,
    updateRating,
    updatePvPStats,
    savePvPHistory,
    savePvPStats,
    getPvPStats,
    initializePvPStats
} from '@/lib/pvp-utils';

export default function PvPPage() {
    const [gameState, setGameState] = useState<any>(null);
    const [selectedCards, setSelectedCards] = useState<string[]>([]);
    const [matchStatus, setMatchStatus] = useState<'idle' | 'searching' | 'found' | 'battling' | 'result'>('idle');
    const [currentMatch, setCurrentMatch] = useState<PvPMatch | null>(null);
    const [battleResult, setBattleResult] = useState<any>(null);
    const [pvpStats, setPvpStats] = useState(initializePvPStats());

    useEffect(() => {
        // 게임 상태 로드
        const state = localStorage.getItem('game-state');
        if (state) {
            setGameState(JSON.parse(state));
        }

        // PvP 통계 로드
        setPvpStats(getPvPStats());
    }, []);

    const handleCardSelect = (cardId: string) => {
        if (selectedCards.includes(cardId)) {
            setSelectedCards(selectedCards.filter(id => id !== cardId));
        } else if (selectedCards.length < 5) {
            setSelectedCards([...selectedCards, cardId]);
        }
    };

    const startMatchmaking = () => {
        if (selectedCards.length !== 5) {
            alert('카드를 정확히 5장 선택해주세요!');
            return;
        }

        setMatchStatus('searching');

        // 플레이어 전투력 계산
        const totalPower = selectedCards.reduce((sum, cardId) => {
            const card = gameState.inventory.find((c: any) => c.id === cardId);
            return sum + (card?.power || 0);
        }, 0);

        // 시뮬레이션: 2-5초 후 상대 찾기
        setTimeout(() => {
            // AI 상대 생성
            const opponentLevel = Math.max(1, gameState.level + Math.floor(Math.random() * 3) - 1);
            const opponentRating = pvpStats.currentRating + Math.floor(Math.random() * 200) - 100;
            const opponentPower = totalPower * (0.85 + Math.random() * 0.3); // 85% ~ 115%

            const player: PvPPlayer = {
                id: 'player',
                name: '나',
                level: gameState.level,
                rating: pvpStats.currentRating,
                selectedCards,
                totalPower
            };

            const opponent: PvPPlayer = {
                id: 'opponent',
                name: `플레이어 ${Math.floor(Math.random() * 9000) + 1000}`,
                level: opponentLevel,
                rating: opponentRating,
                selectedCards: [], // AI는 카드 정보 숨김
                totalPower: Math.round(opponentPower)
            };

            const match: PvPMatch = {
                id: `match-${Date.now()}`,
                player1: player,
                player2: opponent,
                status: 'in-progress',
                startTime: Date.now()
            };

            setCurrentMatch(match);
            setMatchStatus('found');

            // 3초 후 자동으로 대전 시작
            setTimeout(() => {
                startBattle(match);
            }, 3000);
        }, 2000 + Math.random() * 3000);
    };

    const startBattle = (match: PvPMatch) => {
        setMatchStatus('battling');

        // 대전 시뮬레이션
        setTimeout(() => {
            const result = simulatePvPBattle(match.player1, match.player2);
            const playerWon = result.winner === 'player';
            const battleOutcome: 'win' | 'lose' | 'draw' =
                result.player1Power === result.player2Power ? 'draw' :
                    playerWon ? 'win' : 'lose';

            // 레이팅 변화 계산
            const ratingChange = updateRating(
                match.player1.rating,
                match.player2.rating,
                battleOutcome
            );

            // 보상 계산
            const rewards = calculatePvPRewards(
                match.player1.level,
                match.player2.level,
                battleOutcome,
                ratingChange
            );

            // 통계 업데이트
            const newRating = pvpStats.currentRating + ratingChange;
            const newStats = updatePvPStats(pvpStats, battleOutcome, newRating);
            savePvPStats(newStats);
            setPvpStats(newStats);

            // 대전 기록 저장
            savePvPHistory(
                match.id,
                match.player2.name,
                match.player2.level,
                battleOutcome,
                ratingChange,
                rewards
            );

            // 게임 상태 업데이트 (코인, 경험치)
            const updatedState = {
                ...gameState,
                coins: gameState.coins + rewards.coins,
                experience: gameState.experience + rewards.experience
            };
            localStorage.setItem('game-state', JSON.stringify(updatedState));
            setGameState(updatedState);

            setBattleResult({
                outcome: battleOutcome,
                player1Power: result.player1Power,
                player2Power: result.player2Power,
                rewards,
                ratingChange
            });
            setMatchStatus('result');
        }, 3000);
    };

    const resetMatch = () => {
        setMatchStatus('idle');
        setCurrentMatch(null);
        setBattleResult(null);
        setSelectedCards([]);
    };

    if (!gameState) {
        return (
            <div className="h-full bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 overflow-auto bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-white text-xl">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="h-full bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 overflow-auto bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
            <div className="max-w-6xl mx-auto">
                {/* 헤더 */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-white">⚔️ PvP 대전</h1>
                    <Link href="/" className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                        메인으로
                    </Link>
                </div>

                {/* PvP 통계 */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                        <div className="text-gray-300 text-sm mb-1">레이팅</div>
                        <div className="text-2xl font-bold text-yellow-400">{pvpStats.currentRating}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                        <div className="text-gray-300 text-sm mb-1">승률</div>
                        <div className="text-2xl font-bold text-green-400">{pvpStats.winRate}%</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                        <div className="text-gray-300 text-sm mb-1">전적</div>
                        <div className="text-2xl font-bold text-blue-400">{pvpStats.wins}승 {pvpStats.losses}패</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                        <div className="text-gray-300 text-sm mb-1">연승</div>
                        <div className="text-2xl font-bold text-purple-400">{pvpStats.currentStreak}</div>
                    </div>
                </div>

                {/* 매칭 상태별 UI */}
                {matchStatus === 'idle' && (
                    <div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
                            <h2 className="text-2xl font-bold text-white mb-4">카드 선택 ({selectedCards.length}/5)</h2>
                            <div className="grid grid-cols-5 gap-4">
                                {gameState.inventory.slice(0, 20).map((card: any) => (
                                    <div
                                        key={card.id}
                                        onClick={() => handleCardSelect(card.id)}
                                        className={`cursor-pointer p-4 rounded-lg transition-all ${selectedCards.includes(card.id)
                                                ? 'bg-yellow-500 ring-4 ring-yellow-300 scale-105'
                                                : 'bg-white/20 hover:bg-white/30'
                                            }`}
                                    >
                                        <div className="text-white font-bold text-sm mb-2">{card.name}</div>
                                        <div className="text-yellow-300 text-xs">⚡ {card.power}</div>
                                        <div className="text-gray-300 text-xs">Lv.{card.level}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={startMatchmaking}
                            disabled={selectedCards.length !== 5}
                            className={`w-full py-4 rounded-lg text-xl font-bold transition-all ${selectedCards.length === 5
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            매칭 시작
                        </button>
                    </div>
                )}

                {matchStatus === 'searching' && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-12 text-center">
                        <div className="text-4xl mb-4">🔍</div>
                        <h2 className="text-2xl font-bold text-white mb-2">상대를 찾는 중...</h2>
                        <div className="text-gray-300">잠시만 기다려주세요</div>
                        <div className="mt-6">
                            <div className="animate-pulse flex justify-center space-x-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-blue-500 rounded-full animation-delay-200"></div>
                                <div className="w-3 h-3 bg-blue-500 rounded-full animation-delay-400"></div>
                            </div>
                        </div>
                    </div>
                )}

                {matchStatus === 'found' && currentMatch && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
                        <h2 className="text-3xl font-bold text-white text-center mb-8">매칭 성공! ⚔️</h2>
                        <div className="grid grid-cols-3 gap-8 items-center">
                            <div className="text-center">
                                <div className="text-6xl mb-4">👤</div>
                                <div className="text-2xl font-bold text-white mb-2">{currentMatch.player1.name}</div>
                                <div className="text-yellow-400">Lv.{currentMatch.player1.level}</div>
                                <div className="text-blue-400">⭐ {currentMatch.player1.rating}</div>
                                <div className="text-green-400 mt-2">⚡ {currentMatch.player1.totalPower}</div>
                            </div>

                            <div className="text-center">
                                <div className="text-6xl">VS</div>
                            </div>

                            <div className="text-center">
                                <div className="text-6xl mb-4">🤖</div>
                                <div className="text-2xl font-bold text-white mb-2">{currentMatch.player2.name}</div>
                                <div className="text-yellow-400">Lv.{currentMatch.player2.level}</div>
                                <div className="text-blue-400">⭐ {currentMatch.player2.rating}</div>
                                <div className="text-green-400 mt-2">⚡ ???</div>
                            </div>
                        </div>
                        <div className="text-center mt-8 text-gray-300">곧 대전이 시작됩니다...</div>
                    </div>
                )}

                {matchStatus === 'battling' && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-12 text-center">
                        <div className="text-6xl mb-4 animate-bounce">⚔️</div>
                        <h2 className="text-3xl font-bold text-white mb-2">대전 중...</h2>
                        <div className="text-gray-300">치열한 전투가 벌어지고 있습니다!</div>
                    </div>
                )}

                {matchStatus === 'result' && battleResult && currentMatch && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
                        <div className="text-center mb-8">
                            <div className="text-8xl mb-4">
                                {battleResult.outcome === 'win' ? '🏆' : battleResult.outcome === 'lose' ? '😢' : '🤝'}
                            </div>
                            <h2 className="text-4xl font-bold text-white mb-2">
                                {battleResult.outcome === 'win' ? '승리!' : battleResult.outcome === 'lose' ? '패배...' : '무승부'}
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div className="text-center">
                                <div className="text-xl text-white mb-2">{currentMatch.player1.name}</div>
                                <div className="text-4xl font-bold text-green-400">{battleResult.player1Power}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl text-white mb-2">{currentMatch.player2.name}</div>
                                <div className="text-4xl font-bold text-red-400">{battleResult.player2Power}</div>
                            </div>
                        </div>

                        <div className="bg-white/20 rounded-lg p-6 mb-6">
                            <h3 className="text-xl font-bold text-white mb-4">보상</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-yellow-400 text-2xl mb-1">💰</div>
                                    <div className="text-white">+{battleResult.rewards.coins} 코인</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-blue-400 text-2xl mb-1">⭐</div>
                                    <div className="text-white">+{battleResult.rewards.experience} 경험치</div>
                                </div>
                                <div className="text-center">
                                    <div className={`text-2xl mb-1 ${battleResult.ratingChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        📊
                                    </div>
                                    <div className="text-white">
                                        {battleResult.ratingChange >= 0 ? '+' : ''}{battleResult.ratingChange} 레이팅
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={resetMatch}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg text-xl font-bold transition-all"
                        >
                            다시 대전하기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
