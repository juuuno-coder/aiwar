'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import CyberPageLayout from '@/components/CyberPageLayout';
import GameCard from '@/components/GameCard';
import { Card } from '@/lib/types';
import { InventoryCard, loadInventory } from '@/lib/inventory-system';
import { getGameState } from '@/lib/game-state';
import {
    getBattleRoom,
    updatePlayerState,
    updateBattleRoom,
    listenToBattleRoom,
    sendHeartbeat,
    cleanupBattleRoom,
    leaveMatchmaking
} from '@/lib/realtime-pvp-service';
import { BattleRoom, PlayerState, BattlePhase } from '@/lib/realtime-pvp-types';
import { applyBattleResult, BattleResult, PVP_REWARDS } from '@/lib/pvp-battle-system'; // [NEW] Imports
import { useAlert } from '@/context/AlertContext';
import { cn } from '@/lib/utils';
import { Loader2, Swords, Clock, Trophy, XCircle, CheckCircle, Shuffle } from 'lucide-react';

export default function RealtimeBattleRoomPage() {
    const router = useRouter();
    const params = useParams();
    const roomId = params?.roomId as string;
    const { showAlert } = useAlert();

    const [room, setRoom] = useState<BattleRoom | null>(null);
    const [phase, setPhase] = useState<BattlePhase>('waiting');
    const [myCards, setMyCards] = useState<InventoryCard[]>([]);
    const [selectedCards, setSelectedCards] = useState<Card[]>([]);
    const [countdown, setCountdown] = useState(30);
    const [currentRound, setCurrentRound] = useState(0);
    const [roundResult, setRoundResult] = useState<'win' | 'lose' | 'draw' | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isReady, setIsReady] = useState(false);

    const state = getGameState();
    const playerId = state.userId || 'guest';

    // 내 플레이어 정보
    const getMyPlayer = useCallback(() => {
        if (!room) return null;
        return room.player1.playerId === playerId ? room.player1 : room.player2;
    }, [room, playerId]);

    const getOpponent = useCallback(() => {
        if (!room) return null;
        return room.player1.playerId === playerId ? room.player2 : room.player1;
    }, [room, playerId]);

    // 카드 로드
    useEffect(() => {
        const loadCards = async () => {
            const cards = await loadInventory();
            setMyCards(cards);
        };
        loadCards();
    }, []);

    // 방 연결 및 리스너
    useEffect(() => {
        if (!roomId) {
            showAlert({ title: '오류', message: '유효하지 않은 방입니다.', type: 'error' });
            router.push('/pvp');
            return;
        }

        let unsubscribe: (() => void) | null = null;
        let heartbeatInterval: NodeJS.Timeout | null = null;

        const initRoom = async () => {
            // 방 정보 가져오기
            const roomData = await getBattleRoom(roomId);
            if (!roomData) {
                showAlert({ title: '오류', message: '방을 찾을 수 없습니다.', type: 'error' });
                router.push('/pvp');
                return;
            }

            setRoom(roomData);
            setPhase(roomData.phase);
            setIsConnected(true);

            // 실시간 리스너 설정
            unsubscribe = listenToBattleRoom(roomId, (updatedRoom) => {
                setRoom(updatedRoom);
                setPhase(updatedRoom.phase);
                setCurrentRound(updatedRoom.currentRound);
            });

            // 하트비트 시작 (5초마다)
            heartbeatInterval = setInterval(() => {
                sendHeartbeat(roomId, playerId);
            }, 5000);

            // 연결 상태 업데이트
            await updatePlayerState(roomId, playerId, {
                playerName: state.nickname || `Player_${state.level}`,
                playerLevel: state.level,
                connected: true,
                lastHeartbeat: Date.now()
            });
        };

        initRoom();

        return () => {
            if (unsubscribe) unsubscribe();
            if (heartbeatInterval) clearInterval(heartbeatInterval);
        };
    }, [roomId]);

    // 카운트다운 타이머
    useEffect(() => {
        if (phase !== 'deck-select' && phase !== 'ordering') return;

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    if (phase === 'deck-select') handleAutoSelect();
                    if (phase === 'ordering') handleReady();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [phase]);

    // 양쪽 준비 완료 시 전투 시작
    useEffect(() => {
        if (!room) return;

        const myPlayer = getMyPlayer();
        const opponent = getOpponent();

        if (myPlayer?.ready && opponent?.ready && phase === 'ordering') {
            startBattle();
        }
    }, [room, phase]);

    // 카드 선택
    const handleCardClick = (card: InventoryCard) => {
        const isSelected = selectedCards.find(c => c.id === card.id);
        if (isSelected) {
            setSelectedCards(prev => prev.filter(c => c.id !== card.id));
        } else if (selectedCards.length < 5) {
            setSelectedCards(prev => [...prev, card as Card]);
        }
    };

    // 자동 선택
    const handleAutoSelect = () => {
        const topCards = [...myCards]
            .sort((a, b) => (b.stats?.totalPower || 0) - (a.stats?.totalPower || 0))
            .slice(0, 5) as Card[];
        setSelectedCards(topCards);
    };

    // 덱 확정
    const handleConfirmDeck = async () => {
        if (selectedCards.length !== 5) {
            showAlert({ title: '오류', message: '카드 5장을 선택해주세요.', type: 'warning' });
            return;
        }

        await updatePlayerState(roomId, playerId, {
            selectedCards: selectedCards,
            cardOrder: [0, 1, 2, 3, 4]
        });

        // phase를 ordering으로 변경 (처음 확정한 플레이어만)
        if (phase === 'deck-select') {
            await updateBattleRoom(roomId, { phase: 'ordering' });
        }

        setCountdown(20);
        setPhase('ordering');
    };

    // 준비 완료
    const handleReady = async () => {
        setIsReady(true);
        await updatePlayerState(roomId, playerId, { ready: true });
    };

    // 전투 시작
    const startBattle = async () => {
        await updateBattleRoom(roomId, {
            phase: 'battle',
            currentRound: 1
        });
        setPhase('battle');
        runBattle();
    };

    // 전투 진행
    const runBattle = async () => {
        if (!room) return;

        const myPlayer = getMyPlayer();
        const opponent = getOpponent();
        if (!myPlayer || !opponent) return;

        const maxRounds = room.winsNeeded * 2 - 1; // 3선승이면 최대 5라운드
        let myWins = 0;
        let opponentWins = 0;

        for (let round = 0; round < maxRounds; round++) {
            if (myWins >= room.winsNeeded || opponentWins >= room.winsNeeded) break;

            setCurrentRound(round + 1);
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 라운드 결과 계산 (간단한 로직)
            const myCard = myPlayer.selectedCards[round];
            const oppCard = opponent.selectedCards[round];

            let result: 'win' | 'lose' | 'draw';

            if (myCard && oppCard) {
                const myPower = myCard.stats?.totalPower || 0;
                const oppPower = oppCard.stats?.totalPower || 0;

                // 타입 상성 적용
                const typeAdvantage = getTypeAdvantage(myCard.type, oppCard.type);
                const adjustedMyPower = myPower * typeAdvantage;

                if (adjustedMyPower > oppPower) {
                    result = 'win';
                    myWins++;
                } else if (adjustedMyPower < oppPower) {
                    result = 'lose';
                    opponentWins++;
                } else {
                    result = 'draw';
                }
            } else {
                result = 'draw';
            }

            setRoundResult(result);

            // 상태 업데이트
            await updatePlayerState(roomId, playerId, {
                wins: myWins,
                roundResults: [...(myPlayer.roundResults || []), result]
            });
        }

        // 전투 종료
        await new Promise(resolve => setTimeout(resolve, 1000));

        const winnerId = myWins >= room.winsNeeded ? playerId :
            opponentWins >= room.winsNeeded ? opponent.playerId : null;

        const isWinner = winnerId === playerId;
        const resultType = isWinner ? 'player' : (winnerId ? 'opponent' : 'draw');

        await updateBattleRoom(roomId, {
            phase: 'result',
            winner: winnerId ?? undefined,
            finished: true
        });

        // [NEW] Apply Battle Result for Ranking & Rewards (Local Update + Firestore Sync)
        if (myPlayer && opponent) {
            const isGhost = (room as any).isGhost || false;

            // Show alert for ghost match
            if (isGhost) {
                alert("고스트 매칭입니다. 레이팅 및 보상이 50%만 지급됩니다.");
            }

            const battleResult: BattleResult = {
                winner: resultType,
                rounds: [],
                playerWins: myWins,
                opponentWins: opponentWins,
                rewards: {
                    coins: isWinner ? ((PVP_REWARDS[room.battleMode as keyof typeof PVP_REWARDS] as any)?.win || 100) : PVP_REWARDS.loss.coins,
                    experience: isWinner ? ((PVP_REWARDS[room.battleMode as keyof typeof PVP_REWARDS] as any)?.exp || 50) : PVP_REWARDS.loss.exp,
                    ratingChange: isWinner ? ((PVP_REWARDS[room.battleMode as keyof typeof PVP_REWARDS] as any)?.rating || 20) : PVP_REWARDS.loss.rating
                }
            };

            console.log("🏆 Updating Ranked Stats:", battleResult);
            // Pass isRanked = true, and isGhost from room
            await applyBattleResult(
                battleResult,
                myPlayer.selectedCards,
                opponent.selectedCards,
                true,
                isGhost
            );
        }

        setPhase('result');
    };

    // 타입 상성
    const getTypeAdvantage = (myType?: string, oppType?: string): number => {
        if (!myType || !oppType) return 1;

        // 가위바위보 상성
        if ((myType === 'EFFICIENCY' && oppType === 'CREATIVITY') ||
            (myType === 'CREATIVITY' && oppType === 'FUNCTION') ||
            (myType === 'FUNCTION' && oppType === 'EFFICIENCY')) {
            return 1.3; // 30% 보너스
        }
        if ((myType === 'EFFICIENCY' && oppType === 'FUNCTION') ||
            (myType === 'CREATIVITY' && oppType === 'EFFICIENCY') ||
            (myType === 'FUNCTION' && oppType === 'CREATIVITY')) {
            return 0.7; // 30% 패널티
        }
        return 1;
    };

    // 나가기
    const handleLeave = async () => {
        if (room) {
            await leaveMatchmaking(room.battleMode, playerId);
            if (room.finished) {
                await cleanupBattleRoom(roomId);
            }
        }
        router.push('/pvp');
    };

    const myPlayer = getMyPlayer();
    const opponent = getOpponent();
    const isWinner = room?.winner === playerId;

    return (
        <CyberPageLayout
            title="실시간 대전"
            englishTitle="REALTIME BATTLE"
            description={`방 ID: ${roomId?.slice(0, 8)}...`}
            color="red"
            showBack={false}
        >
            <div className="max-w-5xl mx-auto">
                <AnimatePresence mode="wait">
                    {/* 대기 중 */}
                    {phase === 'waiting' && (
                        <motion.div
                            key="waiting"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-20"
                        >
                            <Loader2 className="w-16 h-16 mx-auto mb-6 text-cyan-400 animate-spin" />
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {isConnected ? '상대방을 기다리는 중...' : '전투방 연결 중...'}
                            </h2>
                            <p className="text-white/60">잠시만 기다려주세요</p>

                            {opponent && (
                                <div className="mt-8 p-4 bg-green-500/10 border border-green-500/30 rounded-xl inline-block">
                                    <p className="text-green-400">✅ {opponent.playerName} 연결됨!</p>
                                </div>
                            )}

                            <button
                                onClick={handleLeave}
                                className="mt-8 px-6 py-2 bg-white/10 text-white/60 rounded-lg hover:bg-white/20 transition"
                            >
                                나가기
                            </button>
                        </motion.div>
                    )}

                    {/* 덱 선택 */}
                    {phase === 'deck-select' && (
                        <motion.div
                            key="deck-select"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">덱 선택 ({selectedCards.length}/5)</h2>
                                <div className="flex items-center gap-2 text-amber-400">
                                    <Clock size={20} />
                                    <span className="text-2xl font-black orbitron">{countdown}</span>
                                </div>
                            </div>

                            {/* 카드 그리드 */}
                            <div className="grid grid-cols-5 md:grid-cols-7 gap-3 mb-6 pb-[180px]">
                                {myCards.map(card => {
                                    const isSelected = selectedCards.find(c => c.id === card.id);
                                    return (
                                        <div
                                            key={card.instanceId}
                                            onClick={() => handleCardClick(card)}
                                            className={cn(
                                                "cursor-pointer transition-all",
                                                isSelected && "ring-2 ring-cyan-400 scale-105"
                                            )}
                                        >
                                            <GameCard card={card} isSelected={!!isSelected} />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* 푸터 */}
                            <div className="fixed bottom-0 left-0 right-0 bg-black/90 border-t border-white/10 p-4">
                                <div className="max-w-5xl mx-auto flex items-center justify-between">
                                    <div className="flex gap-2">
                                        {selectedCards.map((card, i) => (
                                            <div key={i} className="w-12 h-16">
                                                <GameCard card={card} showDetails={false} />
                                            </div>
                                        ))}
                                        {Array(5 - selectedCards.length).fill(null).map((_, i) => (
                                            <div key={`empty-${i}`} className="w-12 h-16 border-2 border-dashed border-white/20 rounded-lg" />
                                        ))}
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleAutoSelect}
                                            className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg flex items-center gap-2 hover:bg-cyan-500/30 transition"
                                        >
                                            <Shuffle size={18} />
                                            자동 선택
                                        </button>
                                        <button
                                            onClick={handleConfirmDeck}
                                            disabled={selectedCards.length !== 5}
                                            className={cn(
                                                "px-6 py-2 font-bold rounded-lg flex items-center gap-2 transition",
                                                selectedCards.length === 5
                                                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500"
                                                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                                            )}
                                        >
                                            <CheckCircle size={18} />
                                            확정
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* 순서 정하기 / 준비 대기 */}
                    {phase === 'ordering' && (
                        <motion.div
                            key="ordering"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-10"
                        >
                            <div className="flex items-center justify-center gap-2 text-amber-400 mb-8">
                                <Clock size={24} />
                                <span className="text-4xl font-black orbitron">{countdown}</span>
                            </div>

                            {/* VS 표시 */}
                            <div className="flex items-center justify-center gap-12 mb-8">
                                <div className={cn(
                                    "text-center p-6 rounded-xl border-2 transition-all",
                                    isReady
                                        ? "border-green-500 bg-green-500/10"
                                        : "border-white/20 bg-white/5"
                                )}>
                                    <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <span className="text-2xl">🎮</span>
                                    </div>
                                    <p className="text-white font-bold">{myPlayer?.playerName}</p>
                                    <p className="text-cyan-400 text-sm">Lv.{myPlayer?.playerLevel}</p>
                                    {isReady && <p className="text-green-400 text-sm mt-2">✅ 준비 완료</p>}
                                </div>

                                <Swords className="text-red-500" size={48} />

                                <div className={cn(
                                    "text-center p-6 rounded-xl border-2 transition-all",
                                    opponent?.ready
                                        ? "border-green-500 bg-green-500/10"
                                        : "border-white/20 bg-white/5"
                                )}>
                                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <span className="text-2xl">👤</span>
                                    </div>
                                    <p className="text-white font-bold">{opponent?.playerName || '상대방'}</p>
                                    <p className="text-red-400 text-sm">Lv.{opponent?.playerLevel}</p>
                                    {opponent?.ready && <p className="text-green-400 text-sm mt-2">✅ 준비 완료</p>}
                                </div>
                            </div>

                            <p className="text-white/60 mb-6">양쪽 모두 준비되면 전투가 시작됩니다</p>

                            {!isReady ? (
                                <button
                                    onClick={handleReady}
                                    className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xl font-bold rounded-xl hover:from-green-500 hover:to-emerald-500 transition transform hover:scale-105"
                                >
                                    준비 완료!
                                </button>
                            ) : (
                                <div className="text-green-400 text-xl font-bold">
                                    상대방을 기다리는 중...
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* 전투 진행 */}
                    {phase === 'battle' && (
                        <motion.div
                            key="battle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* 스코어보드 */}
                            <div className="flex items-center justify-between mb-8 p-4 bg-black/50 rounded-xl border border-white/10">
                                <div className="text-center">
                                    <p className="text-sm text-white/60">{myPlayer?.playerName}</p>
                                    <p className="text-4xl font-black text-cyan-400">{myPlayer?.wins || 0}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-white/40">라운드</p>
                                    <p className="text-2xl font-bold text-white">{currentRound}/{room?.maxRounds}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-white/60">{opponent?.playerName}</p>
                                    <p className="text-4xl font-black text-red-400">{opponent?.wins || 0}</p>
                                </div>
                            </div>

                            {/* 현재 라운드 카드 대결 */}
                            <div className="flex items-center justify-center gap-8 mb-8">
                                {myPlayer?.selectedCards[currentRound - 1] && (
                                    <motion.div
                                        initial={{ x: -100, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                    >
                                        <GameCard card={myPlayer.selectedCards[currentRound - 1]} />
                                    </motion.div>
                                )}

                                <motion.div
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                >
                                    <Swords className="text-red-500" size={48} />
                                </motion.div>

                                {opponent?.selectedCards[currentRound - 1] && (
                                    <motion.div
                                        initial={{ x: 100, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                    >
                                        <GameCard card={opponent.selectedCards[currentRound - 1]} />
                                    </motion.div>
                                )}
                            </div>

                            {/* 라운드 결과 */}
                            {roundResult && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className={cn(
                                        "text-center text-4xl font-black mb-4",
                                        roundResult === 'win' ? "text-green-400" :
                                            roundResult === 'lose' ? "text-red-400" : "text-gray-400"
                                    )}
                                >
                                    {roundResult === 'win' ? '승리!' : roundResult === 'lose' ? '패배' : '무승부'}
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* 결과 화면 */}
                    {phase === 'result' && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-10"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', bounce: 0.5 }}
                            >
                                {isWinner ? (
                                    <Trophy className="w-32 h-32 mx-auto text-yellow-400 mb-4" />
                                ) : (
                                    <XCircle className="w-32 h-32 mx-auto text-red-400 mb-4" />
                                )}
                            </motion.div>

                            <h2 className={cn(
                                "text-4xl font-black mb-4",
                                isWinner ? "text-yellow-400" : "text-red-400"
                            )}>
                                {isWinner ? '승리!' : myPlayer?.wins === opponent?.wins ? '무승부' : '패배'}
                            </h2>

                            <div className="flex items-center justify-center gap-8 mb-8">
                                <div className="text-center">
                                    <p className="text-6xl font-black text-cyan-400">{myPlayer?.wins || 0}</p>
                                    <p className="text-white/60">{myPlayer?.playerName}</p>
                                </div>
                                <p className="text-2xl text-white/40">vs</p>
                                <div className="text-center">
                                    <p className="text-6xl font-black text-red-400">{opponent?.wins || 0}</p>
                                    <p className="text-white/60">{opponent?.playerName}</p>
                                </div>
                            </div>

                            {isWinner && (
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8 inline-block">
                                    <p className="text-yellow-400 font-bold">🎉 보상: +500 코인, +50 레이팅</p>
                                </div>
                            )}

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => router.push('/pvp')}
                                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-500 hover:to-pink-500 transition"
                                >
                                    다시 매칭
                                </button>
                                <button
                                    onClick={() => router.push('/main')}
                                    className="px-8 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition"
                                >
                                    메인으로
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </CyberPageLayout>
    );
}
