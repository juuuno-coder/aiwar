'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card as CardType } from '@/lib/types';
import { gameStorage } from '@/lib/game-storage';
import { updatePvPStats, savePvPStats, getPvPStats, savePvPHistory, calculatePvPRewards } from '@/lib/pvp-utils';
import { Button } from '@/components/ui/custom/Button';
import { Progress } from '@/components/ui/custom/Progress';
import { Chip } from '@/components/ui/custom/Chip';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Shuffle, ChevronUp, ChevronDown, Swords, Trophy, XCircle, Zap, Shield, Sword } from 'lucide-react';
import botData from '@/data/pvp-bots.json';
import { generateCard, cn } from '@/lib/utils';
import { Suspense } from 'react';
import { useUser } from '@/context/UserContext';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { useTranslation } from '@/context/LanguageContext';
import { hasTypeAdvantage, TYPE_ADVANTAGE_MULTIPLIER } from '@/lib/type-system';

export const dynamic = 'force-dynamic';

const STRATEGY_TIME = 20; // 20초로 상향
const RATING_CHANGE = 50;

interface BattleRound {
    playerCard: CardType;
    enemyCard: CardType;
    winner: 'player' | 'enemy' | 'draw';
    reason: string;
    playerPower: number;
    enemyPower: number;
}

interface BattleLog {
    id: string;
    message: string;
    type: 'system' | 'player' | 'enemy' | 'winner' | 'draw' | 'advantage';
}

function PvPFightContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const opponentId = searchParams.get('opponentId');
    const { addCoins, addExperience } = useUser();
    const { t } = useTranslation();

    // Game State
    const [status, setStatus] = useState<'loading' | 'strategy' | 'battling' | 'finished'>('loading');
    const [timer, setTimer] = useState(STRATEGY_TIME);
    const [playerDeck, setPlayerDeck] = useState<CardType[]>([]);
    const [enemyDeck, setEnemyDeck] = useState<CardType[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<number[]>([0, 1, 2, 3, 4]);
    const [opponent, setOpponent] = useState<any>(null);

    // Battle Animation State
    const [currentRound, setCurrentRound] = useState(0);
    const [rounds, setRounds] = useState<BattleRound[]>([]);
    const [playerWins, setPlayerWins] = useState(0);
    const [enemyWins, setEnemyWins] = useState(0);
    const [showingBattle, setShowingBattle] = useState(false);
    const [battleResult, setBattleResult] = useState<any>(null);
    const [battleLogs, setBattleLogs] = useState<BattleLog[]>([]);

    // 카드 상태
    const [alivePlayerCards, setAlivePlayerCards] = useState<boolean[]>([true, true, true, true, true]);
    const [aliveEnemyCards, setAliveEnemyCards] = useState<boolean[]>([true, true, true, true, true]);
    const [currentBattleCards, setCurrentBattleCards] = useState<{ player: number, enemy: number } | null>(null);

    // 로그 추가 함수
    const addBattleLog = useCallback((message: string, type: BattleLog['type'] = 'system') => {
        const id = Math.random().toString(36).substring(2, 9);
        setBattleLogs(prev => [...prev, { id, message, type }]);

        // 6초 후 자동 제거
        setTimeout(() => {
            setBattleLogs(prev => prev.filter(log => log.id !== id));
        }, 6000);
    }, []);

    useEffect(() => {
        if (!opponentId) {
            router.push('/pvp');
            return;
        }
        initializeBattle(opponentId);
    }, [opponentId]);

    const initializeBattle = async (botId: string) => {
        const allCards = await gameStorage.getCards();
        let pDeck = allCards.sort((a, b) => (b.stats?.totalPower || 0) - (a.stats?.totalPower || 0)).slice(0, 5);

        while (pDeck.length < 5) {
            pDeck.push(generateCard());
        }

        const bot = botData.bots.find(b => b.id === botId);
        if (!bot) {
            router.back();
            return;
        }

        setOpponent(bot);

        const eDeck = bot.selectedCards.map(() => {
            const card = generateCard();
            if (card.stats) card.stats.totalPower += bot.level * 5;
            return card;
        });

        setPlayerDeck(pDeck);
        setEnemyDeck(eDeck);
        setStatus('strategy');
    };

    // 타이머
    useEffect(() => {
        if (status !== 'strategy') return;
        if (timer <= 0) {
            startBattle();
            return;
        }
        const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [status, timer]);

    const moveCardUp = (index: number) => {
        if (index === 0) return;
        const newOrder = [...selectedOrder];
        [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
        setSelectedOrder(newOrder);
    };

    const moveCardDown = (index: number) => {
        if (index === 4) return;
        const newOrder = [...selectedOrder];
        [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        setSelectedOrder(newOrder);
    };

    const shuffleOrder = () => {
        setSelectedOrder([...selectedOrder].sort(() => Math.random() - 0.5));
    };

    // 가위바위보 로직으로 승자 결정 (Daejeon Rule: 1.3배 보너스 적용)
    const determineWinner = (playerCard: CardType, enemyCard: CardType): { winner: 'player' | 'enemy' | 'draw', reason: string, pFinal: number, eFinal: number } => {
        const pType = playerCard.type;
        const eType = enemyCard.type;
        const pBase = playerCard.stats?.totalPower || 0;
        const eBase = enemyCard.stats?.totalPower || 0;

        let pMultiplier = 1.0;
        let eMultiplier = 1.0;

        if (hasTypeAdvantage(pType, eType)) {
            pMultiplier = TYPE_ADVANTAGE_MULTIPLIER;
        } else if (hasTypeAdvantage(eType, pType)) {
            eMultiplier = TYPE_ADVANTAGE_MULTIPLIER;
        }

        const pFinal = Math.floor(pBase * pMultiplier);
        const eFinal = Math.floor(eBase * eMultiplier);

        if (pFinal > eFinal) {
            return { winner: 'player', reason: pMultiplier > 1 ? 'ADVANTAGE' : 'STRENGTH', pFinal, eFinal };
        } else if (eFinal > pFinal) {
            return { winner: 'enemy', reason: eMultiplier > 1 ? 'ADVANTAGE' : 'STRENGTH', pFinal, eFinal };
        }

        return { winner: 'draw', reason: 'DRAW', pFinal, eFinal };
    };

    const startBattle = async () => {
        setStatus('battling');

        const orderedPlayerDeck = selectedOrder.map(i => playerDeck[i]);
        const battleRounds: BattleRound[] = [];

        for (let i = 0; i < 5; i++) {
            const playerCard = orderedPlayerDeck[i];
            const enemyCard = enemyDeck[i];
            const { winner, reason, pFinal, eFinal } = determineWinner(playerCard, enemyCard);
            battleRounds.push({ playerCard, enemyCard, winner, reason, playerPower: pFinal, enemyPower: eFinal });
        }

        setRounds(battleRounds);

        for (let i = 0; i < 5; i++) {
            await playRoundAnimation(i, battleRounds[i]);
        }

        const pWins = battleRounds.filter(r => r.winner === 'player').length;
        const eWins = battleRounds.filter(r => r.winner === 'enemy').length;
        const isWin = pWins > eWins;

        const stats = getPvPStats();
        const ratingChange = isWin ? RATING_CHANGE : -RATING_CHANGE;
        const newRating = Math.max(0, stats.currentRating + ratingChange);

        const rewards = {
            coins: isWin ? 100 : 20,
            experience: isWin ? 50 : 10,
            ratingChange
        };

        const newStats = updatePvPStats(stats, isWin ? 'win' : 'lose', newRating);
        savePvPStats(newStats);
        savePvPHistory(`match-${Date.now()}`, opponent?.name || 'Unknown', opponent?.level || 1, isWin ? 'win' : 'lose', ratingChange, rewards);

        await addCoins(rewards.coins);
        await addExperience(rewards.experience);

        setBattleResult({
            isWin,
            playerWins: pWins,
            enemyWins: eWins,
            ratingChange,
            rewards
        });
        setStatus('finished');

        // 최종 로그
        addBattleLog(t('pvp.log.finalResult')
            .replace('{pWins}', pWins.toString())
            .replace('{eWins}', eWins.toString())
            .replace('{winner}', isWin ? 'PLAYER' : (opponent?.name || 'ENEMY')),
            isWin ? 'winner' : 'enemy'
        );
    };

    const playRoundAnimation = async (roundIndex: number, round: BattleRound) => {
        return new Promise<void>((resolve) => {
            setCurrentRound(roundIndex + 1);
            setCurrentBattleCards({ player: roundIndex, enemy: roundIndex });
            setShowingBattle(true);

            // 라운드 시작 로그
            addBattleLog(t('pvp.log.roundStart').replace('{n}', (roundIndex + 1).toString()), 'system');

            // 상성 로그
            if (round.reason === 'ADVANTAGE') {
                const advName = round.winner === 'player' ? round.playerCard.name : round.enemyCard.name;
                addBattleLog(t('pvp.log.advantage').replace('{name}', advName).replace('{m}', '1.3'), 'advantage');
            }

            // 충돌 로그
            addBattleLog(t('pvp.log.clash')
                .replace('{pName}', round.playerCard.name)
                .replace('{pPower}', round.playerPower.toString())
                .replace('{eName}', round.enemyCard.name)
                .replace('{ePower}', round.enemyPower.toString()),
                'system'
            );

            setTimeout(() => {
                if (round.winner === 'player') {
                    setPlayerWins(prev => prev + 1);
                    setAliveEnemyCards(prev => {
                        const next = [...prev];
                        next[roundIndex] = false;
                        return next;
                    });
                } else if (round.winner === 'enemy') {
                    setEnemyWins(prev => prev + 1);
                    setAlivePlayerCards(prev => {
                        const next = [...prev];
                        next[roundIndex] = false;
                        return next;
                    });
                }

                setShowingBattle(false);
                setCurrentBattleCards(null);

                // 결과 로그
                if (round.winner === 'player') {
                    addBattleLog(t('pvp.log.roundWinner').replace('{name}', round.playerCard.name), 'winner');
                } else if (round.winner === 'enemy') {
                    addBattleLog(t('pvp.log.roundWinner').replace('{name}', round.enemyCard.name), 'enemy');
                } else {
                    addBattleLog(t('pvp.log.roundDraw'), 'draw');
                }

                setTimeout(resolve, 500);
            }, 1500);
        });
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'EFFICIENCY': return 'rgba(239, 68, 68, 0.6)'; // EFFICIENCY (Rock) - Red
            case 'COST': return 'rgba(245, 158, 11, 0.6)'; // COST (Scissors) - Yellow
            case 'CREATIVITY': return 'rgba(59, 130, 246, 0.6)'; // CREATIVITY (Paper) - Blue
            default: return 'rgba(255, 255, 255, 0.2)';
        }
    };

    const getTypeGlow = (type: string) => {
        switch (type) {
            case 'EFFICIENCY': return 'shadow-[0_0_20px_rgba(239,68,68,0.5)] border-red-500/50';
            case 'COST': return 'shadow-[0_0_20px_rgba(245,158,11,0.5)] border-amber-500/50';
            case 'CREATIVITY': return 'shadow-[0_0_20px_rgba(59,130,246,0.5)] border-blue-500/50';
            default: return 'border-white/10';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'EFFICIENCY': return '✊';
            case 'COST': return '✌️';
            case 'CREATIVITY': return '✋';
            default: return '❓';
        }
    };

    // 전투 로그 표시 컴포넌트
    const CombatLogDisplay = () => (
        <div className="fixed bottom-32 left-8 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
            <AnimatePresence mode="popLayout">
                {battleLogs.map((log) => (
                    <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.8, filter: 'blur(10px)' }}
                        className={cn(
                            "px-4 py-2 rounded-xl backdrop-blur-md border shadow-lg text-[11px] font-bold orbitron tracking-tight",
                            log.type === 'system' ? "bg-black/60 border-white/10 text-gray-300" :
                                log.type === 'advantage' ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400" :
                                    log.type === 'player' ? "bg-blue-500/20 border-blue-500/40 text-blue-400" :
                                        log.type === 'enemy' ? "bg-red-500/20 border-red-500/40 text-red-400" :
                                            log.type === 'winner' ? "bg-green-500/20 border-green-500/40 text-green-400" :
                                                "bg-gray-500/20 border-gray-500/40 text-gray-400"
                        )}
                    >
                        {log.message}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}>
                    <Swords size={64} className="text-purple-500" />
                </motion.div>
            </div>
        );
    }

    if (status === 'strategy') {
        return (
            <div className="h-screen py-2 px-4 bg-[#050505] relative overflow-hidden flex flex-col">
                <BackgroundBeams className="opacity-35" />
                <CombatLogDisplay />

                <div className="max-w-6xl mx-auto w-full relative z-10 flex-1 flex flex-col pt-2">
                    {/* 타이머 */}
                    <div className="text-center mb-1">
                        <div className="flex items-center justify-center gap-2">
                            <Clock size={20} className={timer <= 5 ? 'text-red-500 animate-pulse' : 'text-blue-400'} />
                            <span className={`text-4xl font-black orbitron ${timer <= 5 ? 'text-red-500' : 'text-white'}`}>{timer}</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white orbitron italic tracking-widest leading-none">{t('page.pvp.title')}</h1>
                            <p className="text-gray-500 text-[10px] orbitron uppercase tracking-[0.3em] mt-1">{t('pvp.strategy.hint')}</p>
                        </div>
                    </div>

                    {/* 상대 카드 - 위 */}
                    <div className="mb-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-3 bg-red-500"></div>
                            <h2 className="text-[10px] font-black text-white orbitron tracking-tighter uppercase">{t('pvp.battle.enemyArchitecture')}</h2>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            {enemyDeck.map((card, index) => {
                                const glow = getTypeGlow(card.type);
                                return (
                                    <motion.div
                                        key={card.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={cn(
                                            "bg-black/40 border rounded-xl p-2 text-center transition-all duration-300",
                                            glow
                                        )}
                                    >
                                        <div className="text-lg mb-0.5 filter drop-shadow-md">{getTypeIcon(card.type)}</div>
                                        <div className="text-[8px] font-bold text-gray-400 truncate mb-0.5">{card.name}</div>
                                        <div className="text-base font-black text-red-500 orbitron leading-none">{(card.stats?.totalPower || 0)}</div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* VS 표시 */}
                    <div className="py-1 flex items-center justify-center">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full group-hover:bg-yellow-500/30 transition-all duration-500" />
                            <div className="relative flex flex-col items-center">
                                <Swords size={24} className="text-yellow-500" />
                                <div className="text-[8px] font-black text-white orbitron tracking-[0.5em] mt-0.5 -mr-[0.5em]">{t('pvp.battle.systemClash')}</div>
                            </div>
                        </div>
                    </div>

                    {/* 내 카드 - 아래 */}
                    <div className="mt-1 text-center flex-1 flex flex-col justify-end">
                        <div className="flex items-center justify-between mb-1 px-2">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                <span className="text-[10px] font-bold text-blue-400 orbitron uppercase tracking-widest">{t('pvp.battle.formation')}</span>
                            </div>
                            <Button size="sm" variant="flat" onPress={shuffleOrder} startContent={<Shuffle size={12} />} className="bg-white/5 hover:bg-white/10 text-[9px] orbitron h-7">
                                {t('pvp.battle.randomize')}
                            </Button>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            {selectedOrder.map((cardIndex, position) => {
                                const card = playerDeck[cardIndex];
                                const glow = getTypeGlow(card.type);
                                return (
                                    <motion.div
                                        key={card.id}
                                        layout
                                        className={cn(
                                            "bg-black/40 border rounded-xl p-2 text-center relative group overflow-hidden transition-all duration-300",
                                            glow
                                        )}
                                    >
                                        <div className="absolute top-1 left-1 flex flex-col gap-0.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => moveCardUp(position)} disabled={position === 0} className="w-5 h-5 bg-white/10 rounded text-white text-[9px] disabled:opacity-20 hover:bg-white/20 flex items-center justify-center">
                                                <ChevronUp size={12} />
                                            </button>
                                            <button onClick={() => moveCardDown(position)} disabled={position === 4} className="w-5 h-5 bg-white/10 rounded text-white text-[9px] disabled:opacity-20 hover:bg-white/20 flex items-center justify-center">
                                                <ChevronDown size={12} />
                                            </button>
                                        </div>
                                        <div className="text-lg mb-0.5 filter drop-shadow-md">{getTypeIcon(card.type)}</div>
                                        <div className="text-[8px] font-bold text-gray-400 truncate mb-0.5">{card.name}</div>
                                        <div className="text-base font-black text-blue-500 orbitron leading-none">{(card.stats?.totalPower || 0)}</div>
                                        <div className="absolute bottom-0.5 right-1 text-[7px] font-black orbitron text-white/20">#{position + 1}</div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 시작 버튼 */}
                    <div className="mt-2 text-center pb-2">
                        <Button
                            size="md"
                            onPress={startBattle}
                            className="h-10 px-12 font-black orbitron text-sm bg-white text-black hover:bg-gray-200 transition-all shadow-xl rounded-xl"
                            startContent={<Zap size={16} fill="currentColor" />}
                        >
                            {t('pvp.battle.initiate')}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'battling') {
        const orderedPlayerDeck = selectedOrder.map(i => playerDeck[i]);

        return (
            <div className="h-screen py-2 px-4 bg-[#050505] relative overflow-hidden flex flex-col">
                <BackgroundBeams className="opacity-35" />
                <CombatLogDisplay />

                <div className="max-w-6xl mx-auto w-full relative z-10 flex-1 flex flex-col">
                    <div className="text-center mb-4 pt-2">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl inline-flex items-center gap-8 shadow-2xl mx-auto"
                        >
                            <div className="text-center">
                                <p className="text-[8px] text-gray-500 font-bold orbitron uppercase tracking-[0.2em] mb-0.5">{t('pvp.battle.round')}</p>
                                <p className="text-2xl font-black text-white orbitron italic">{currentRound}/5</p>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-[8px] text-blue-400 font-bold orbitron uppercase tracking-widest">{t('pvp.battle.playerScore')}</p>
                                    <p className="text-3xl font-black text-white orbitron">{playerWins}</p>
                                </div>
                                <div className="text-lg font-black text-gray-700 font-mono">VS</div>
                                <div className="text-left">
                                    <p className="text-[8px] text-red-500 font-bold orbitron uppercase tracking-widest">{t('pvp.battle.enemyScore')}</p>
                                    <p className="text-3xl font-black text-white orbitron">{enemyWins}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* 상대 카드 (관찰 영역) */}
                    <div className="grid grid-cols-5 gap-2 h-16">
                        {enemyDeck.map((card, index) => (
                            <AnimatePresence key={card.id}>
                                {aliveEnemyCards[index] && (
                                    <motion.div
                                        initial={{ opacity: 1, scale: 1 }}
                                        animate={{
                                            opacity: 1,
                                            scale: currentBattleCards?.enemy === index ? 1.05 : 1,
                                            y: currentBattleCards?.enemy === index && showingBattle ? 30 : 0,
                                            filter: currentBattleCards?.enemy === index ? 'drop-shadow(0 0 10px rgba(239,68,68,0.3))' : 'none'
                                        }}
                                        exit={{ opacity: 0, scale: 0.5, rotate: 15, filter: 'blur(8px)' }}
                                        className={cn(
                                            "bg-black/40 border border-red-500/20 rounded-xl flex flex-col items-center justify-center p-1 relative overflow-hidden",
                                            currentBattleCards?.enemy === index ? "border-red-500 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.15)]" : "opacity-40"
                                        )}
                                    >
                                        <div className="text-lg">{getTypeIcon(card.type)}</div>
                                        <div className="text-[9px] font-black text-red-400 orbitron">{(card.stats?.totalPower || 0)}</div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        ))}
                    </div>

                    {/* 전투 시뮬레이션 영역 */}
                    <div className="flex-1 flex items-center justify-center py-4">
                        <AnimatePresence>
                            {showingBattle && currentBattleCards !== null && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.1, filter: 'blur(15px)' }}
                                    className="flex items-center gap-6"
                                >
                                    {/* 아군 */}
                                    <motion.div
                                        animate={{ x: [0, 30, 0], scale: [1, 1.05, 1] }}
                                        transition={{ duration: 0.6, repeat: 2 }}
                                        className={cn(
                                            "relative p-6 rounded-[2rem] border-2 bg-black/60 backdrop-blur-3xl min-w-[160px] text-center",
                                            getTypeGlow(orderedPlayerDeck[currentBattleCards.player].type)
                                        )}
                                    >
                                        <div className="text-4xl mb-3 filter drop-shadow-xl">{getTypeIcon(orderedPlayerDeck[currentBattleCards.player].type)}</div>
                                        <div className="text-[10px] font-bold text-gray-400 mb-0.5 truncate max-w-[120px] mx-auto">{orderedPlayerDeck[currentBattleCards.player].name}</div>
                                        <div className="text-2xl font-black text-blue-500 orbitron">
                                            {rounds[currentBattleCards.player]?.playerPower || 0}
                                        </div>
                                        <h2 className="text-[7px] font-black text-white/20 orbitron mt-1 tracking-[0.2em]">{t('pvp.battle.commanderUnit')}</h2>
                                    </motion.div>

                                    {/* vs */}
                                    <div className="relative">
                                        <motion.div
                                            animate={{ scale: [1, 1.3, 1], rotate: [0, 5, -5, 0] }}
                                            transition={{ duration: 0.4, repeat: Infinity }}
                                            className="w-12 h-12 rounded-full bg-white flex items-center justify-center z-10 relative"
                                        >
                                            <Zap size={24} fill="black" className="text-black" />
                                        </motion.div>
                                        <motion.div
                                            animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                            className="absolute inset-0 bg-white/20 blur-xl rounded-full"
                                        />
                                    </div>

                                    {/* 적군 */}
                                    <motion.div
                                        animate={{ x: [0, -30, 0], scale: [1, 1.05, 1] }}
                                        transition={{ duration: 0.6, repeat: 2 }}
                                        className={cn(
                                            "relative p-6 rounded-[2rem] border-2 bg-black/60 backdrop-blur-3xl min-w-[160px] text-center",
                                            getTypeGlow(enemyDeck[currentBattleCards.enemy].type)
                                        )}
                                    >
                                        <div className="text-4xl mb-3 filter drop-shadow-xl">{getTypeIcon(enemyDeck[currentBattleCards.enemy].type)}</div>
                                        <div className="text-[10px] font-bold text-gray-400 mb-0.5 truncate max-w-[120px] mx-auto">{enemyDeck[currentBattleCards.enemy].name}</div>
                                        <div className="text-2xl font-black text-red-500 orbitron">
                                            {rounds[currentBattleCards.enemy]?.enemyPower || 0}
                                        </div>
                                        <h2 className="text-[7px] font-black text-white/20 orbitron mt-1 tracking-[0.2em]">{t('pvp.battle.enemyModel')}</h2>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 플레이어 카드 (관찰 영역) */}
                    <div className="grid grid-cols-5 gap-2 h-16 mb-4">
                        {orderedPlayerDeck.map((card, index) => (
                            <AnimatePresence key={card.id}>
                                {alivePlayerCards[index] && (
                                    <motion.div
                                        initial={{ opacity: 1, scale: 1 }}
                                        animate={{
                                            opacity: 1,
                                            scale: currentBattleCards?.player === index ? 1.05 : 1,
                                            y: currentBattleCards?.player === index && showingBattle ? -30 : 0,
                                            filter: currentBattleCards?.player === index ? 'drop-shadow(0 0 10px rgba(59,130,246,0.3))' : 'none'
                                        }}
                                        exit={{ opacity: 0, scale: 0.5, rotate: -15, filter: 'blur(8px)' }}
                                        className={cn(
                                            "bg-black/40 border border-blue-500/20 rounded-xl flex flex-col items-center justify-center p-1 relative overflow-hidden",
                                            currentBattleCards?.player === index ? "border-blue-500 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.15)]" : "opacity-40"
                                        )}
                                    >
                                        <div className="text-lg">{getTypeIcon(card.type)}</div>
                                        <div className="text-[9px] font-black text-blue-400 orbitron">{(card.stats?.totalPower || 0)}</div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // 결과 화면 (동일)
    if (status === 'finished' && battleResult) {
        const playerScore = battleResult.playerWins;
        const enemyScore = battleResult.enemyWins;
        return (
            <div className="h-screen flex items-center justify-center bg-[#050505] p-2 overflow-hidden">
                <BackgroundBeams className="opacity-35" />
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 w-full max-w-sm text-center"
                >
                    <motion.div
                        animate={{ scale: [1, 1.05, 1], rotate: [0, 3, -3, 0] }}
                        transition={{ repeat: 3, duration: 0.8 }}
                        className="mb-4"
                    >
                        {battleResult.isWin ? (
                            <div className="relative inline-block">
                                <Trophy size={80} className="mx-auto text-yellow-500" />
                                <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full" />
                            </div>
                        ) : (
                            <XCircle size={80} className="mx-auto text-red-500 opacity-60" />
                        )}
                    </motion.div>

                    <h1 className={cn(
                        "text-4xl font-black orbitron italic mb-1 tracking-[0.1em]",
                        battleResult.isWin ? 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'text-red-500/60'
                    )}>
                        {battleResult.isWin ? t('pvp.battle.victory') : t('pvp.battle.defeat')}
                    </h1>
                    <p className="text-[8px] font-black orbitron text-gray-500 tracking-[0.3em] mb-4">ARENA_CONTRACT_SUCCESS</p>

                    <div className="text-2xl text-white orbitron font-black mb-4 p-3 bg-white/5 rounded-2xl border border-white/5 inline-block px-8">
                        {battleResult.playerWins} <span className="text-gray-600 px-2">-</span> {battleResult.enemyWins}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-6">
                        <div className="bg-black/40 backdrop-blur-xl rounded-xl p-3 border border-white/5">
                            <div className="text-[8px] text-gray-500 orbitron uppercase mb-0.5">Rating</div>
                            <div className={cn("text-lg font-black orbitron", battleResult.ratingChange >= 0 ? 'text-green-400' : 'text-red-400')}>
                                {battleResult.ratingChange >= 0 ? '+' : ''}{battleResult.ratingChange}
                            </div>
                        </div>
                        <div className="bg-black/40 backdrop-blur-xl rounded-xl p-3 border border-white/5">
                            <div className="text-[8px] text-gray-500 orbitron uppercase mb-0.5">Coins</div>
                            <div className="text-lg font-black orbitron text-yellow-400">+{battleResult.rewards.coins}</div>
                        </div>
                        <div className="bg-black/40 backdrop-blur-xl rounded-xl p-3 border border-white/5">
                            <div className="text-[8px] text-gray-500 orbitron uppercase mb-0.5">EXP</div>
                            <div className="text-lg font-black orbitron text-purple-400">+{battleResult.rewards.experience}</div>
                        </div>
                    </div>

                    <Button
                        fullWidth
                        size="md"
                        onPress={() => router.push('/pvp')}
                        className="h-12 font-black orbitron text-sm bg-white text-black hover:bg-gray-200 rounded-xl shadow-lg"
                    >
                        {t('pvp.battle.return')}
                    </Button>
                </motion.div>
            </div>
        );
    }

    return null;
}

export default function PvPFightPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
            <PvPFightContent />
        </Suspense>
    );
}
