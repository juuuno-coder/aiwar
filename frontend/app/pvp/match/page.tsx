'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { gameStorage } from '@/lib/game-storage';
import { Card } from '@/lib/types';
import { getPvPStats } from '@/lib/pvp-utils';
import { isFirebaseConfigured } from '@/lib/firebase';
import {
    joinMatchmaking,
    leaveMatchmaking,
    findMatch,
    createMatch,
    subscribeToMatchmaking,
    MatchmakingPlayer
} from '@/lib/realtime-pvp';
import { Card as Card } from '@/components/ui/custom/Card';
import { Button } from '@/components/ui/custom/Button';
import { Chip } from '@/components/ui/custom/Chip';
import { Progress } from '@/components/ui/custom/Progress';
import { motion, AnimatePresence } from 'framer-motion';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { Users, Bot, Swords, Clock, X, Wifi, WifiOff, Zap } from 'lucide-react';
import botData from '@/data/pvp-bots.json';
import { getCurrentUser } from '@/lib/auth-utils';
import { useAlert } from '@/context/AlertContext';

type MatchMode = 'selecting' | 'searching_real' | 'searching_bot' | 'found';

export default function PvPMatchPage() {
    const router = useRouter();
    const { showAlert } = useAlert();
    const [mode, setMode] = useState<MatchMode>('selecting');
    const [searchTime, setSearchTime] = useState(0);
    const [playerDeck, setPlayerDeck] = useState<Card[]>([]);
    const [opponent, setOpponent] = useState<any>(null);
    const [isOnline, setIsOnline] = useState(false);
    const [matchmakingStatus, setMatchmakingStatus] = useState<MatchmakingPlayer | null>(null);

    // 초기화
    useEffect(() => {
        loadPlayerDeck();
        setIsOnline(isFirebaseConfigured);
    }, []);

    const loadPlayerDeck = async () => {
        const cards = await gameStorage.getCards();
        const deck = cards.sort((a, b) => b.stats.totalPower - a.stats.totalPower).slice(0, 5);
        setPlayerDeck(deck);
    };

    // 실시간 매칭 상태 구독
    useEffect(() => {
        if (mode !== 'searching_real') return;

        const unsubscribe = subscribeToMatchmaking((status) => {
            setMatchmakingStatus(status);

            if (status?.status === 'matched' && status.matchId) {
                // 매칭됨!
                setMode('found');
                setOpponent({
                    id: 'real_player',
                    name: '실시간 플레이어',
                    isRealPlayer: true,
                    matchId: status.matchId
                });
            }
        });

        return () => unsubscribe();
    }, [mode]);

    // 검색 타이머
    useEffect(() => {
        if (mode !== 'searching_real' && mode !== 'searching_bot') return;

        const interval = setInterval(() => {
            setSearchTime(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [mode]);

    // 실시간 매칭 시작
    const startRealMatch = async () => {
        const user = getCurrentUser();
        if (!user) {
            showAlert({
                title: 'ACCESS DENIED',
                message: '로그인이 필요합니다.',
                type: 'error',
                onConfirm: () => router.push('/login')
            });
            return;
        }

        setMode('searching_real');
        setSearchTime(0);

        // 매칭 대기열에 등록
        await joinMatchmaking(playerDeck);

        // 주기적으로 상대 검색
        const searchInterval = setInterval(async () => {
            const foundOpponent = await findMatch();

            if (foundOpponent) {
                clearInterval(searchInterval);

                // 매치 생성
                const matchId = await createMatch(foundOpponent, playerDeck);

                if (matchId) {
                    setMode('found');
                    setOpponent({
                        id: foundOpponent.odId,
                        name: foundOpponent.odkname,
                        rating: foundOpponent.rating,
                        isRealPlayer: true,
                        matchId
                    });

                    setTimeout(() => {
                        router.push(`/pvp/fight?matchId=${matchId}&type=real`);
                    }, 2000);
                }
            }
        }, 3000);

        // 60초 후 타임아웃 - 봇 매칭으로 전환
        setTimeout(() => {
            clearInterval(searchInterval);
            if (mode === 'searching_real') {
                leaveMatchmaking();
                startBotMatch();
            }
        }, 60000);
    };

    // 봇 매칭 시작
    const startBotMatch = () => {
        setMode('searching_bot');
        setSearchTime(0);

        const stats = getPvPStats();
        const myRating = stats.currentRating;

        // 비슷한 레이팅의 봇 찾기
        const eligibleBots = botData.bots.filter(
            bot => Math.abs(bot.rating - myRating) < 300
        );

        const delay = 2000 + Math.random() * 2000;

        setTimeout(() => {
            const selectedBot = eligibleBots.length > 0
                ? eligibleBots[Math.floor(Math.random() * eligibleBots.length)]
                : botData.bots[Math.floor(Math.random() * botData.bots.length)];

            setOpponent(selectedBot);
            setMode('found');

            setTimeout(() => {
                router.push(`/pvp/fight?opponentId=${selectedBot.id}`);
            }, 1500);
        }, delay);
    };

    // 검색 취소
    const cancelSearch = async () => {
        if (mode === 'searching_real') {
            await leaveMatchmaking();
        }
        setMode('selecting');
        setSearchTime(0);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen py-8 px-4 bg-[#050505] relative overflow-hidden flex flex-col items-center justify-center">
            <BackgroundBeams className="opacity-35" />

            <div className="max-w-lg w-full relative z-10">
                <AnimatePresence mode="wait">
                    {/* 모드 선택 */}
                    {mode === 'selecting' && (
                        <motion.div
                            key="selecting"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center mb-8">
                                <Swords size={48} className="mx-auto text-blue-500 mb-4" />
                                <h1 className="text-3xl font-black text-white orbitron italic">매칭 모드 선택</h1>
                                <p className="text-gray-500 text-sm mt-2">대전 상대를 선택하세요</p>
                            </div>

                            {/* 실시간 매칭 */}
                            <Card
                                isPressable
                                onPress={isOnline ? startRealMatch : undefined}
                                className={`p-6 border transition-all ${isOnline
                                    ? 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50'
                                    : 'bg-gray-500/10 border-gray-500/20 opacity-50'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-4 rounded-xl ${isOnline ? 'bg-blue-500/20' : 'bg-gray-500/20'}`}>
                                        {isOnline ? <Wifi size={32} className="text-blue-400" /> : <WifiOff size={32} className="text-gray-500" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-black text-white orbitron">실시간 대전</h3>
                                            {isOnline ? (
                                                <Chip size="sm" color="success" variant="flat" className="text-[8px] orbitron font-bold">ONLINE</Chip>
                                            ) : (
                                                <Chip size="sm" color="danger" variant="flat" className="text-[8px] orbitron font-bold">OFFLINE</Chip>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {isOnline ? '전 세계 플레이어와 실시간 대전' : 'Firebase 연결 필요'}
                                        </p>
                                    </div>
                                    <Users size={20} className="text-gray-600" />
                                </div>
                            </Card>

                            {/* AI 봇 매칭 */}
                            <Card
                                isPressable
                                onPress={startBotMatch}
                                className="p-6 bg-purple-500/10 border border-purple-500/30 hover:border-purple-500/50 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-4 rounded-xl bg-purple-500/20">
                                        <Bot size={32} className="text-purple-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-black text-white orbitron">AI 대전</h3>
                                            <Chip size="sm" color="secondary" variant="flat" className="text-[8px] orbitron font-bold">INSTANT</Chip>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">비슷한 레이팅의 AI 봇과 대전</p>
                                    </div>
                                    <Zap size={20} className="text-purple-400" />
                                </div>
                            </Card>

                            {/* 뒤로가기 */}
                            <Button
                                fullWidth
                                variant="flat"
                                onPress={() => router.push('/pvp')}
                                className="h-12 font-bold orbitron text-xs text-gray-500"
                            >
                                뒤로가기
                            </Button>
                        </motion.div>
                    )}

                    {/* 검색 중 */}
                    {(mode === 'searching_real' || mode === 'searching_bot') && (
                        <motion.div
                            key="searching"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="text-center"
                        >
                            <div className="relative w-32 h-32 mx-auto mb-8">
                                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-ping" />
                                <div className="absolute inset-2 border-4 border-blue-500/40 rounded-full animate-pulse" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {mode === 'searching_real' ? (
                                        <Users size={40} className="text-blue-400" />
                                    ) : (
                                        <Bot size={40} className="text-purple-400" />
                                    )}
                                </div>
                            </div>

                            <h2 className="text-2xl font-black text-white orbitron italic mb-2">
                                {mode === 'searching_real' ? '플레이어 검색 중...' : 'AI 매칭 중...'}
                            </h2>

                            <div className="flex items-center justify-center gap-2 text-gray-500 mb-6">
                                <Clock size={16} />
                                <span className="font-bold orbitron">{formatTime(searchTime)}</span>
                            </div>

                            {mode === 'searching_real' && (
                                <p className="text-xs text-gray-600 mb-6">60초 후 AI 매칭으로 전환됩니다</p>
                            )}

                            <Button
                                variant="flat"
                                color="danger"
                                onPress={cancelSearch}
                                startContent={<X size={16} />}
                                className="h-12 px-8 font-bold orbitron text-xs"
                            >
                                취소
                            </Button>
                        </motion.div>
                    )}

                    {/* 매칭 완료 */}
                    {mode === 'found' && opponent && (
                        <motion.div
                            key="found"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: 3, duration: 0.3 }}
                                className="text-6xl mb-6"
                            >
                                ⚔️
                            </motion.div>

                            <h2 className="text-3xl font-black text-green-400 orbitron italic mb-4">매칭 완료!</h2>

                            <Card className="bg-black/40 border border-green-500/30 p-6 mb-4">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    {opponent.isRealPlayer ? (
                                        <Users size={16} className="text-blue-400" />
                                    ) : (
                                        <Bot size={16} className="text-purple-400" />
                                    )}
                                    <span className="text-[10px] text-gray-500 orbitron uppercase">
                                        {opponent.isRealPlayer ? 'REAL PLAYER' : 'AI OPPONENT'}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-black text-white orbitron">{opponent.name}</h3>
                                {opponent.rating && (
                                    <p className="text-yellow-400 font-bold orbitron">{opponent.rating} MMR</p>
                                )}
                            </Card>

                            <p className="text-gray-500 text-sm animate-pulse">전투 준비 중...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
