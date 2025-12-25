'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import CyberPageLayout from '@/components/CyberPageLayout';
import GameCard from '@/components/GameCard';
import { Card } from '@/lib/types';
import { getGameState } from '@/lib/game-state';
import { useAlert } from '@/context/AlertContext';
import { useFooter } from '@/context/FooterContext';
import { gameStorage } from '@/lib/game-storage';
import { loadInventory } from '@/lib/inventory-system';
import {
    BattleMode,
    MatchType,
    BattleParticipant,
    BattleResult,
    getPVPStats,
    checkPVPRequirements,
    PVP_REQUIREMENTS,
    PVP_REWARDS,
    generateAIOpponent,
    simulateBattle,
    applyBattleResult,
    getTypeEmoji,
    getTypeName,
} from '@/lib/pvp-battle-system';
import {
    Trophy, Swords, Shield, Eye, Zap, Clock, Target, Users,
    CheckCircle, XCircle, Award, Coins, TrendingUp, ArrowRight,
    Shuffle, Play
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Phase =
    | 'stats'
    | 'mode-select'
    | 'deck-select'
    | 'match-type'
    | 'deck-reveal'
    | 'card-order'
    | 'battle'
    | 'result';

export default function PVPArenaPage() {
    const router = useRouter();
    const { showAlert } = useAlert();
    const footer = useFooter();

    const [phase, setPhase] = useState<Phase>('stats');
    const [selectedMode, setSelectedMode] = useState<BattleMode>('tactics');
    const [selectedMatchType, setSelectedMatchType] = useState<MatchType>('ai-training');
    const [playerDeck, setPlayerDeck] = useState<Card[]>([]);
    const [opponentDeck, setOpponentDeck] = useState<Card[]>([]);
    const [cardOrder, setCardOrder] = useState<number[]>([0, 1, 2, 3, 4]);
    const [revealTimer, setRevealTimer] = useState(20);
    const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
    const [currentRound, setCurrentRound] = useState(0);
    const [animating, setAnimating] = useState(false);

    const [inventory, setInventory] = useState<Card[]>([]);

    const stats = getPVPStats();
    const state = getGameState();

    // Load real cards on mount
    useEffect(() => {
        const loadCards = async () => {
            const cards = await gameStorage.getCards();
            setInventory(cards as unknown as Card[]);
        };
        loadCards();
    }, []);

    // 모드 정보
    const modes = [
        {
            id: 'sudden-death' as BattleMode,
            name: '단판 승부',
            nameEn: 'Sudden Death',
            description: '1선승제 - 빠르고 강렬한 승부',
            icon: Zap,
            color: 'from-yellow-500 to-orange-500',
            rounds: '1선승',
            reward: `${PVP_REWARDS['sudden-death'].win} 코인`,
        },
        {
            id: 'tactics' as BattleMode,
            name: '전술 승부',
            nameEn: 'Tactical Duel',
            description: '3선승제 - 카드 배치와 상성을 활용한 정공법',
            icon: Shield,
            color: 'from-blue-500 to-cyan-500',
            rounds: '3선승',
            reward: `${PVP_REWARDS.tactics.win} 코인`,
        },
        {
            id: 'ambush' as BattleMode,
            name: '전략 승부',
            nameEn: 'Strategic Duel',
            description: '3선승제 - 변수 창출과 심리전을 통한 지략 대결',
            icon: Eye,
            color: 'from-purple-500 to-pink-500',
            rounds: '3선승',
            reward: `${PVP_REWARDS.ambush.win} 코인`,
        },
    ];

    // 덱 선택 단계 - 푸터 연동 및 지속
    useEffect(() => {
        if (phase === 'stats') {
            // stats 단계에서 덱이 선택되어 있으면 유지하고 전투 시작 버튼 표시
            if (playerDeck.length === 5) {
                footer.setSelectionMode(5, '선택된 덱');
                // 이미 선택된 덱을 푸터에 표시
                playerDeck.forEach(card => {
                    if (!footer.state.selectionSlots.find(c => c?.id === card.id)) {
                        footer.addToSelection(card);
                    }
                });
                footer.setAction({
                    label: '⚔️ 전투 시작',
                    isDisabled: false,
                    color: 'success',
                    onClick: () => handleStartPVP(selectedMode),
                });
            }
        } else if (phase === 'deck-select') {
            footer.setSelectionMode(5, '5장 선택');
            footer.setAction({
                label: '덱 확정',
                isDisabled: footer.state.selectionSlots.length !== 5,
                color: 'success',
                onClick: handleDeckConfirm,
            });
        } else {
            footer.exitSelectionMode();
            footer.setAction(undefined);
        }

        return () => {
            // stats 단계가 아닐 때만 정리
            if (phase !== 'stats') {
                footer.exitSelectionMode();
                footer.setAction(undefined);
            }
        };
    }, [phase, footer.state.selectionSlots.length, playerDeck.length]);

    // 덱 공개 타이머
    useEffect(() => {
        if (phase === 'deck-reveal' && revealTimer > 0) {
            const timer = setInterval(() => {
                setRevealTimer(prev => {
                    if (prev <= 1) {
                        // 타이머 종료 - 다음 단계로
                        if (selectedMode === 'sudden-death') {
                            // 단판승부는 순서 배치 없이 바로 전투
                            handleStartBattle();
                        } else {
                            setPhase('card-order');
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [phase, revealTimer, selectedMode]);

    // 전투 모드 선택
    const handleModeSelect = (mode: BattleMode) => {
        setSelectedMode(mode);
    };

    // 전투 시작 (참가 조건 확인)
    const handleStartPVP = async (mode: BattleMode) => {
        try {
            const rawInventory = await loadInventory();
            // Timestamp -> Date 변환 및 타입 캐스팅
            const mappedInventory = rawInventory.map(c => ({
                ...c,
                acquiredAt: c.acquiredAt && typeof (c.acquiredAt as any).toDate === 'function'
                    ? (c.acquiredAt as any).toDate()
                    : new Date(c.acquiredAt as any)
            })) as unknown as Card[];

            setInventory(mappedInventory);

            // Corrected: checkPVPRequirements takes only inventory, returns canJoin
            const check = await checkPVPRequirements(mappedInventory);

            if (!check.canJoin) {
                showAlert({
                    title: '참가 불가',
                    message: check.reason || '입장 조건을 만족하지 못했습니다.',
                    type: 'error'
                });
                return;
            }

            setSelectedMode(mode);
            setPhase('deck-select');
        } catch (e) {
            console.error("PVP Start Error", e);
            showAlert({ title: '오류', message: '데이터를 불러오는 중 문제가 발생했습니다.', type: 'error' });
        }
    };

    // 덱 확정
    const handleDeckConfirm = () => {
        const selected = footer.state.selectionSlots;
        if (selected.length !== 5) {
            showAlert({ title: '덱 미완성', message: '5장의 카드를 선택해주세요.', type: 'warning' });
            return;
        }

        setPlayerDeck(selected);
        setPhase('match-type');
    };

    // 대전 방식 선택
    const handleMatchTypeSelect = (type: MatchType) => {
        setSelectedMatchType(type);

        if (type === 'ai-training') {
            // AI 상대 생성
            const aiOpponent = generateAIOpponent(state.level);
            setOpponentDeck(aiOpponent.deck);
        }

        // 덱 공개 단계로
        setRevealTimer(20);
        setPhase('deck-reveal');
    };

    // 카드 순서 확정
    const handleOrderConfirm = () => {
        handleStartBattle();
    };

    // 전투 시작
    const handleStartBattle = () => {
        const player: BattleParticipant = {
            name: `Player_${state.level}`,
            level: state.level,
            deck: playerDeck,
            cardOrder,
        };

        const opponent: BattleParticipant = {
            name: selectedMatchType === 'ai-training' ? `AI 훈련봇 Lv.${state.level}` : 'Opponent',
            level: state.level,
            deck: opponentDeck,
            cardOrder: [0, 1, 2, 3, 4], // AI는 기본 순서
        };

        const result = simulateBattle(player, opponent, selectedMode);
        setBattleResult(result);
        setCurrentRound(0);
        setPhase('battle');
        runBattleAnimation(result);
    };

    // 전투 애니메이션
    const runBattleAnimation = async (result: BattleResult) => {
        for (let i = 0; i < result.rounds.length; i++) {
            setCurrentRound(i);
            setAnimating(true);
            await new Promise(resolve => setTimeout(resolve, 3000));
            setAnimating(false);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // 전투 종료 - 결과 화면으로
        await applyBattleResult(result, playerDeck, opponentDeck);
        setPhase('result');
    };

    // 다시 하기
    const handlePlayAgain = () => {
        setPhase('stats');
        setPlayerDeck([]);
        setOpponentDeck([]);
        setCardOrder([0, 1, 2, 3, 4]);
        setBattleResult(null);
        setCurrentRound(0);
        // Refresh cards
        gameStorage.getCards().then(cards => setInventory(cards as unknown as Card[]));
    };

    return (
        <CyberPageLayout
            title="PVP 아레나"
            englishTitle="PVP ARENA"
            description="실시간 플레이어 대전 - 최강자를 가리자!"
            color="red"
        >
            <div className="max-w-6xl mx-auto">
                <AnimatePresence mode="wait">
                    {/* 1단계: 성적 확인 */}
                    {phase === 'stats' && (
                        <motion.div
                            key="stats"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {/* 전적 표시 */}
                            <div className="grid grid-cols-5 gap-4 mb-8">
                                <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-xl p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Award className="text-amber-400" size={20} />
                                        <h3 className="text-sm text-white/60">레이팅</h3>
                                    </div>
                                    <p className="text-3xl font-black text-amber-400">{stats.rating || 1000}</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Trophy className="text-green-400" size={20} />
                                        <h3 className="text-sm text-white/60">승리</h3>
                                    </div>
                                    <p className="text-3xl font-black text-green-400">{stats.wins}</p>
                                </div>
                                <div className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/30 rounded-xl p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <XCircle className="text-red-400" size={20} />
                                        <h3 className="text-sm text-white/60">패배</h3>
                                    </div>
                                    <p className="text-3xl font-black text-red-400">{stats.losses}</p>
                                </div>
                                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="text-cyan-400" size={20} />
                                        <h3 className="text-sm text-white/60">승률</h3>
                                    </div>
                                    <p className="text-3xl font-black text-cyan-400">{stats.winRate}%</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Swords className="text-purple-400" size={20} />
                                        <h3 className="text-sm text-white/60">총 전투</h3>
                                    </div>
                                    <p className="text-3xl font-black text-purple-400">{stats.totalBattles}</p>
                                </div>
                            </div>

                            {/* 참가 조건 */}
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8">
                                <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
                                    <Award size={20} />
                                    참가 조건
                                </h3>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className={cn(
                                            state.level >= PVP_REQUIREMENTS.minLevel ? 'text-green-400' : 'text-red-400'
                                        )} size={16} />
                                        <span className="text-white/80">레벨 {PVP_REQUIREMENTS.minLevel} 이상</span>
                                        <span className="text-cyan-400 font-bold ml-auto">Lv.{state.level}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className={cn(
                                            state.coins >= PVP_REQUIREMENTS.entryFee ? 'text-green-400' : 'text-red-400'
                                        )} size={16} />
                                        <span className="text-white/80">참가비 {PVP_REQUIREMENTS.entryFee} 코인</span>
                                        <span className="text-yellow-400 font-bold ml-auto">{state.coins}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className={cn(
                                            inventory.length >= PVP_REQUIREMENTS.minCards ? 'text-green-400' : 'text-red-400'
                                        )} size={16} />
                                        <span className="text-white/80">카드 {PVP_REQUIREMENTS.minCards}장 이상</span>
                                        <span className="text-purple-400 font-bold ml-auto">{inventory.length}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 전투 모드 선택 */}
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Target className="text-red-400" size={24} />
                                전투 모드 선택
                            </h2>
                            <div className="grid grid-cols-3 gap-6 mb-8">
                                {modes.map((mode) => {
                                    const Icon = mode.icon;
                                    const isSelected = selectedMode === mode.id;

                                    return (
                                        <button
                                            key={mode.id}
                                            onClick={() => handleModeSelect(mode.id)}
                                            className={cn(
                                                "relative p-6 rounded-2xl border-2 transition-all text-left overflow-hidden group",
                                                isSelected
                                                    ? "border-cyan-500 bg-cyan-500/10 scale-105 shadow-lg shadow-cyan-500/20"
                                                    : "border-white/10 hover:border-white/30 bg-black/20"
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity",
                                                mode.color
                                            )} />

                                            <div className="relative z-10">
                                                <div className="flex items-start justify-between mb-4">
                                                    <Icon className={cn(
                                                        "w-10 h-10",
                                                        isSelected ? "text-cyan-400" : "text-white/60"
                                                    )} />
                                                    {isSelected && (
                                                        <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center animate-pulse">
                                                            <div className="w-2 h-2 rounded-full bg-white" />
                                                        </div>
                                                    )}
                                                </div>

                                                <h3 className="text-xl font-bold text-white mb-1">{mode.name}</h3>
                                                <p className="text-sm text-white/40 mb-4">{mode.nameEn}</p>
                                                <p className="text-sm text-white/60 mb-4">{mode.description}</p>

                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-white/40">{mode.rounds}</span>
                                                    <span className="text-yellow-400 font-bold">{mode.reward}</span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* 시작 버튼 */}
                            <div className="text-center">
                                <button
                                    onClick={() => handleStartPVP(selectedMode)}
                                    className="px-12 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-red-500/50 hover:shadow-red-500/70 hover:scale-105 flex items-center gap-2 mx-auto"
                                >
                                    <Swords size={24} />
                                    전투 시작
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* 2단계: 덱 선택 */}
                    {phase === 'deck-select' && (
                        <motion.div
                            key="deck-select"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="pb-32"
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-black text-white mb-2">덱 선택</h2>
                                <p className="text-white/60">전투에 사용할 카드 5장을 선택하세요</p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {inventory
                                    .sort((a, b) => b.stats.totalPower - a.stats.totalPower)
                                    .map(card => (
                                        <motion.div
                                            key={card.id}
                                            whileTap={{ scale: 0.95 }}
                                            className="cursor-pointer"
                                            onClick={() => {
                                                const isSelected = footer.state.selectionSlots.find(c => c.id === card.id);
                                                if (isSelected) {
                                                    footer.removeFromSelection(card.id);
                                                } else if (footer.state.selectionSlots.length < 5) {
                                                    footer.addToSelection(card);
                                                }
                                            }}
                                        >
                                            <GameCard
                                                card={card}
                                                isSelected={footer.state.selectionSlots.some(c => c.id === card.id)}
                                            />
                                        </motion.div>
                                    ))}
                            </div>
                        </motion.div>
                    )}

                    {/* 3단계: 대전 방식 선택 */}
                    {phase === 'match-type' && (
                        <motion.div
                            key="match-type"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-black text-white mb-2">대전 방식 선택</h2>
                                <p className="text-white/60">실시간 대전 또는 AI 훈련을 선택하세요</p>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <button
                                    onClick={() => handleMatchTypeSelect('realtime')}
                                    className="relative p-8 rounded-2xl border-2 border-white/10 hover:border-red-500/50 bg-black/40 hover:bg-red-500/10 transition-all group"
                                >
                                    <div className="text-center">
                                        <Users className="w-16 h-16 text-red-400 mx-auto mb-4" />
                                        <h3 className="text-2xl font-bold text-white mb-2">실시간 대전</h3>
                                        <p className="text-sm text-white/60 mb-4">실제 플레이어와 매칭</p>
                                        <div className="text-xs text-yellow-400">정식 보상 지급</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleMatchTypeSelect('ai-training')}
                                    className="relative p-8 rounded-2xl border-2 border-white/10 hover:border-cyan-500/50 bg-black/40 hover:bg-cyan-500/10 transition-all group"
                                >
                                    <div className="text-center">
                                        <Target className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                                        <h3 className="text-2xl font-bold text-white mb-2">AI 훈련</h3>
                                        <p className="text-sm text-white/60 mb-4">AI 상대와 연습</p>
                                        <div className="text-xs text-cyan-400">테스트용 - 정식 보상</div>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* 4단계: 덱 공개 */}
                    {phase === 'deck-reveal' && (
                        <motion.div
                            key="deck-reveal"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="text-center mb-8">
                                <div className="text-6xl font-black text-cyan-400 mb-2 font-mono">
                                    {revealTimer}
                                </div>
                                <p className="text-white/60">덱 공개 중...</p>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                {/* 플레이어 덱 */}
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                                    <h3 className="text-lg font-bold text-blue-400 mb-4">내 덱</h3>
                                    <div className="grid grid-cols-5 gap-2">
                                        {playerDeck.map((card, i) => (
                                            <div key={i} className="w-full">
                                                <GameCard card={card} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 상대 덱 */}
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                                    <h3 className="text-lg font-bold text-red-400 mb-4">상대 덱</h3>
                                    <div className="grid grid-cols-5 gap-2">
                                        {opponentDeck.map((card, i) => (
                                            <div key={i} className="w-full">
                                                <GameCard card={card} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* 5단계: 카드 순서 배치 */}
                    {phase === 'card-order' && (
                        <motion.div
                            key="card-order"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-black text-white mb-2">카드 순서 배치</h2>
                                <p className="text-white/60">드래그하여 출전 순서를 변경하세요</p>
                            </div>

                            <Reorder.Group
                                axis="x"
                                values={cardOrder}
                                onReorder={setCardOrder}
                                className="flex gap-4 justify-center mb-8"
                            >
                                {cardOrder.map((index) => (
                                    <Reorder.Item key={index} value={index} className="cursor-move">
                                        <div className="relative">
                                            <div className="absolute -top-3 -left-3 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                                                {cardOrder.indexOf(index) + 1}
                                            </div>
                                            <GameCard card={playerDeck[index]} />
                                        </div>
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>

                            <div className="text-center">
                                <button
                                    onClick={handleOrderConfirm}
                                    className="px-12 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:scale-105 flex items-center gap-2 mx-auto"
                                >
                                    <Play size={24} />
                                    전투 시작
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* 6단계: 전투 */}
                    {phase === 'battle' && battleResult && (
                        <motion.div
                            key="battle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {currentRound < battleResult.rounds.length && (
                                <div>
                                    <div className="text-center mb-8">
                                        <h2 className="text-4xl font-black text-white mb-2">
                                            라운드 {battleResult.rounds[currentRound].round}
                                        </h2>
                                        <div className="flex items-center justify-center gap-4 text-2xl font-bold">
                                            <span className="text-blue-400">{battleResult.playerWins}</span>
                                            <span className="text-white/40">:</span>
                                            <span className="text-red-400">{battleResult.opponentWins}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-8 items-center mb-8">
                                        {/* 플레이어 카드 */}
                                        <motion.div
                                            initial={{ x: -100, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            className="text-center"
                                        >
                                            <GameCard card={battleResult.rounds[currentRound].playerCard} />
                                            <div className="mt-4 text-4xl">
                                                {getTypeEmoji(battleResult.rounds[currentRound].playerType)}
                                            </div>
                                            <div className="text-sm text-white/60 mt-2">
                                                {getTypeName(battleResult.rounds[currentRound].playerType)}
                                            </div>
                                        </motion.div>

                                        {/* VS */}
                                        <div className="text-center">
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                                                transition={{ duration: 1, repeat: Infinity }}
                                                className="text-6xl font-black text-white/20"
                                            >
                                                VS
                                            </motion.div>
                                            {animating && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="mt-4"
                                                >
                                                    {battleResult.rounds[currentRound].winner === 'player' && (
                                                        <div className="text-2xl text-green-400 font-bold">승리!</div>
                                                    )}
                                                    {battleResult.rounds[currentRound].winner === 'opponent' && (
                                                        <div className="text-2xl text-red-400 font-bold">패배!</div>
                                                    )}
                                                    {battleResult.rounds[currentRound].winner === 'draw' && (
                                                        <div className="text-2xl text-yellow-400 font-bold">무승부!</div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* 상대 카드 */}
                                        <motion.div
                                            initial={{ x: 100, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            className="text-center"
                                        >
                                            <GameCard card={battleResult.rounds[currentRound].opponentCard} />
                                            <div className="mt-4 text-4xl">
                                                {getTypeEmoji(battleResult.rounds[currentRound].opponentType)}
                                            </div>
                                            <div className="text-sm text-white/60 mt-2">
                                                {getTypeName(battleResult.rounds[currentRound].opponentType)}
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* 7단계: 결과 */}
                    {phase === 'result' && battleResult && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="max-w-2xl mx-auto"
                        >
                            <div className={cn(
                                "text-center mb-8 p-12 rounded-2xl border-2",
                                battleResult.winner === 'player'
                                    ? "bg-green-500/10 border-green-500/50"
                                    : "bg-red-500/10 border-red-500/50"
                            )}>
                                <div className="text-8xl mb-4">
                                    {battleResult.winner === 'player' ? '🏆' : '😢'}
                                </div>
                                <h2 className={cn(
                                    "text-5xl font-black mb-4",
                                    battleResult.winner === 'player' ? "text-green-400" : "text-red-400"
                                )}>
                                    {battleResult.winner === 'player' ? '승리!' : '패배!'}
                                </h2>
                                <div className="text-2xl font-bold text-white/60 mb-8">
                                    {battleResult.playerWins} : {battleResult.opponentWins}
                                </div>

                                {/* 보상 */}
                                <div className="bg-black/40 rounded-xl p-6 mb-6">
                                    <h3 className="text-lg font-bold text-white mb-4">보상</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <Coins className="text-yellow-400" size={24} />
                                            <span className={cn(
                                                "text-2xl font-bold",
                                                battleResult.rewards.coins > 0 ? "text-green-400" : "text-red-400"
                                            )}>
                                                {battleResult.rewards.coins > 0 ? '+' : ''}{battleResult.rewards.coins}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2">
                                            <TrendingUp className="text-cyan-400" size={24} />
                                            <span className="text-2xl font-bold text-cyan-400">
                                                +{battleResult.rewards.experience} EXP
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2">
                                            <Trophy className="text-purple-400" size={24} />
                                            <span className={cn(
                                                "text-2xl font-bold",
                                                battleResult.rewards.ratingChange > 0 ? "text-green-400" : "text-red-400"
                                            )}>
                                                {battleResult.rewards.ratingChange > 0 ? '+' : ''}{battleResult.rewards.ratingChange}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* 카드 교환 */}
                                {battleResult.cardExchange && (battleResult.cardExchange.cardsGained.length > 0 || battleResult.cardExchange.cardsLost.length > 0) && (
                                    <div className="bg-black/40 rounded-xl p-6 mb-6">
                                        <h3 className="text-lg font-bold text-white mb-4">카드 교환</h3>
                                        {battleResult.cardExchange.cardsGained.length > 0 && (
                                            <div className="mb-4">
                                                <p className="text-sm text-green-400 mb-2">획득한 카드 ({battleResult.cardExchange.cardsGained.length}장)</p>
                                                <div className="flex gap-2 justify-center">
                                                    {battleResult.cardExchange.cardsGained.map((card, i) => (
                                                        <div key={i} className="w-20">
                                                            <GameCard card={card} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {battleResult.cardExchange.cardsLost.length > 0 && (
                                            <div>
                                                <p className="text-sm text-red-400 mb-2">잃은 카드 ({battleResult.cardExchange.cardsLost.length}장)</p>
                                                <div className="flex gap-2 justify-center">
                                                    {battleResult.cardExchange.cardsLost.map((card, i) => (
                                                        <div key={i} className="w-20 opacity-50">
                                                            <GameCard card={card} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 버튼 */}
                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={handlePlayAgain}
                                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all"
                                    >
                                        다시 하기
                                    </button>
                                    <button
                                        onClick={() => router.push('/main')}
                                        className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all"
                                    >
                                        메인으로
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </CyberPageLayout>
    );
}
