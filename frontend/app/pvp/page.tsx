'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CyberPageLayout from '@/components/CyberPageLayout';
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
import { cn } from '@/lib/utils';

export default function PvPPage() {
    const [gameState, setGameState] = useState<any>(null);
    const [selectedCards, setSelectedCards] = useState<string[]>([]);
    const [matchStatus, setMatchStatus] = useState<'idle' | 'searching' | 'found' | 'battling' | 'result'>('idle');
    const [currentMatch, setCurrentMatch] = useState<PvPMatch | null>(null);
    const [battleResult, setBattleResult] = useState<any>(null);
    const [pvpStats, setPvpStats] = useState(initializePvPStats());

    useEffect(() => {
        const state = localStorage.getItem('game-state');
        if (state) setGameState(JSON.parse(state));
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
        if (selectedCards.length !== 5) { alert('카드를 정확히 5장 선택해주세요!'); return; }
        setMatchStatus('searching');
        const totalPower = selectedCards.reduce((sum, cardId) => {
            const card = gameState.inventory.find((c: any) => c.id === cardId);
            return sum + (card?.power || 0);
        }, 0);

        setTimeout(() => {
            const player: PvPPlayer = { id: 'player', name: '나', level: gameState.level, rating: pvpStats.currentRating, selectedCards, totalPower };
            const opponent: PvPPlayer = { id: 'opponent', name: `플레이어 ${Math.floor(Math.random() * 9000) + 1000}`, level: Math.max(1, gameState.level + Math.floor(Math.random() * 3) - 1), rating: pvpStats.currentRating + Math.floor(Math.random() * 200) - 100, selectedCards: [], totalPower: Math.round(totalPower * (0.85 + Math.random() * 0.3)) };
            const match: PvPMatch = { id: `match-${Date.now()}`, player1: player, player2: opponent, status: 'in-progress', startTime: Date.now() };
            setCurrentMatch(match);
            setMatchStatus('found');
            setTimeout(() => startBattle(match), 3000);
        }, 2000 + Math.random() * 3000);
    };

    const startBattle = (match: PvPMatch) => {
        setMatchStatus('battling');
        setTimeout(() => {
            const result = simulatePvPBattle(match.player1, match.player2);
            const playerWon = result.winner === 'player';
            const battleOutcome: 'win' | 'lose' | 'draw' = result.player1Power === result.player2Power ? 'draw' : playerWon ? 'win' : 'lose';
            const ratingChange = updateRating(match.player1.rating, match.player2.rating, battleOutcome);
            const rewards = calculatePvPRewards(match.player1.level, match.player2.level, battleOutcome, ratingChange);
            const newStats = updatePvPStats(pvpStats, battleOutcome, pvpStats.currentRating + ratingChange);
            savePvPStats(newStats);
            setPvpStats(newStats);
            savePvPHistory(match.id, match.player2.name, match.player2.level, battleOutcome, ratingChange, rewards);
            const updatedState = { ...gameState, coins: gameState.coins + rewards.coins, experience: gameState.experience + rewards.experience };
            localStorage.setItem('game-state', JSON.stringify(updatedState));
            setGameState(updatedState);
            setBattleResult({ outcome: battleOutcome, player1Power: result.player1Power, player2Power: result.player2Power, rewards, ratingChange });
            setMatchStatus('result');
        }, 3000);
    };

    const resetMatch = () => { setMatchStatus('idle'); setCurrentMatch(null); setBattleResult(null); setSelectedCards([]); };

    if (!gameState) {
        return (
            <CyberPageLayout title="PVP_ARENA" subtitle="Matchmaking" description="로딩 중..." color="purple">
                <div className="text-center py-20 text-white/30 font-mono">LOADING_DATA...</div>
            </CyberPageLayout>
        );
    }

    return (
        <CyberPageLayout
            title="PVP_ARENA"
            subtitle="Matchmaking"
            description="다른 플레이어와 1:1 전투를 펼치세요. 승리하면 레이팅과 보상을 획득합니다."
            color="purple"
        >
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'RATING', value: pvpStats.currentRating, color: 'text-amber-400' },
                    { label: 'WIN_RATE', value: `${pvpStats.winRate}%`, color: 'text-green-400' },
                    { label: 'RECORD', value: `${pvpStats.wins}W ${pvpStats.losses}L`, color: 'text-cyan-400' },
                    { label: 'STREAK', value: pvpStats.currentStreak, color: 'text-purple-400' },
                ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                        <p className={cn("text-2xl font-black orbitron", stat.color)}>{stat.value}</p>
                        <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-1">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Matchmaking UI */}
            {matchStatus === 'idle' && (
                <div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                        <h2 className="text-sm font-mono text-purple-400 uppercase tracking-widest mb-4">SELECT_UNITS ({selectedCards.length}/5)</h2>
                        <div className="grid grid-cols-5 gap-4">
                            {gameState.inventory?.slice(0, 20).map((card: any) => (
                                <div key={card.id} onClick={() => handleCardSelect(card.id)} className={cn("cursor-pointer p-3 rounded-lg transition-all text-center", selectedCards.includes(card.id) ? "bg-purple-500/30 ring-2 ring-purple-500" : "bg-white/5 hover:bg-white/10")}>
                                    <div className="text-white font-bold text-xs mb-1">{card.name}</div>
                                    <div className="text-amber-400 text-[10px]">⚡ {card.power}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button onClick={startMatchmaking} disabled={selectedCards.length !== 5} className={cn("w-full py-4 rounded-lg text-lg font-bold orbitron transition-all", selectedCards.length === 5 ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90" : "bg-white/5 text-white/30 cursor-not-allowed")}>
                        {selectedCards.length === 5 ? 'START_MATCHMAKING ⚔️' : `SELECT ${5 - selectedCards.length} MORE UNITS`}
                    </button>
                </div>
            )}

            {matchStatus === 'searching' && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                    <div className="text-4xl mb-4 animate-pulse">🔍</div>
                    <h2 className="text-xl font-bold orbitron text-white mb-2">SEARCHING_OPPONENT...</h2>
                    <p className="text-white/40 font-mono">PLEASE_WAIT</p>
                </div>
            )}

            {matchStatus === 'found' && currentMatch && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-8">
                    <h2 className="text-2xl font-bold orbitron text-white text-center mb-8">MATCH_FOUND ⚔️</h2>
                    <div className="grid grid-cols-3 gap-8 items-center">
                        <div className="text-center"><div className="text-5xl mb-3">👤</div><p className="font-bold text-white">{currentMatch.player1.name}</p><p className="text-amber-400 text-sm">LV.{currentMatch.player1.level}</p><p className="text-cyan-400 text-sm">⭐ {currentMatch.player1.rating}</p></div>
                        <div className="text-center text-5xl orbitron text-purple-400">VS</div>
                        <div className="text-center"><div className="text-5xl mb-3">🤖</div><p className="font-bold text-white">{currentMatch.player2.name}</p><p className="text-amber-400 text-sm">LV.{currentMatch.player2.level}</p><p className="text-cyan-400 text-sm">⭐ {currentMatch.player2.rating}</p></div>
                    </div>
                    <p className="text-center mt-6 text-white/40 font-mono">BATTLE_STARTING...</p>
                </div>
            )}

            {matchStatus === 'battling' && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                    <div className="text-5xl mb-4 animate-bounce">⚔️</div>
                    <h2 className="text-2xl font-bold orbitron text-white mb-2">BATTLE_IN_PROGRESS</h2>
                </div>
            )}

            {matchStatus === 'result' && battleResult && currentMatch && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-8">
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4">{battleResult.outcome === 'win' ? '🏆' : battleResult.outcome === 'lose' ? '😢' : '🤝'}</div>
                        <h2 className={cn("text-3xl font-bold orbitron", battleResult.outcome === 'win' ? "text-green-400" : battleResult.outcome === 'lose' ? "text-red-400" : "text-white")}>
                            {battleResult.outcome === 'win' ? 'VICTORY!' : battleResult.outcome === 'lose' ? 'DEFEAT...' : 'DRAW'}
                        </h2>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {[
                            { icon: '💰', label: 'COINS', value: `+${battleResult.rewards.coins}`, color: 'text-amber-400' },
                            { icon: '⭐', label: 'EXP', value: `+${battleResult.rewards.experience}`, color: 'text-cyan-400' },
                            { icon: '📊', label: 'RATING', value: `${battleResult.ratingChange >= 0 ? '+' : ''}${battleResult.ratingChange}`, color: battleResult.ratingChange >= 0 ? 'text-green-400' : 'text-red-400' }
                        ].map(r => (
                            <div key={r.label} className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                                <div className="text-2xl mb-1">{r.icon}</div>
                                <p className={cn("text-xl font-bold orbitron", r.color)}>{r.value}</p>
                                <p className="text-[9px] text-white/40 font-mono">{r.label}</p>
                            </div>
                        ))}
                    </div>
                    <button onClick={resetMatch} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold orbitron hover:opacity-90 transition-all">
                        REMATCH ⚔️
                    </button>
                </div>
            )}
        </CyberPageLayout>
    );
}
