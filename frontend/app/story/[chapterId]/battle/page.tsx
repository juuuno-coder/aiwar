'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/lib/types';
import { storage, generateId } from '@/lib/utils';
import { useAlert } from '@/context/AlertContext';
import { useUser } from '@/context/UserContext';
import CardPlacementBoard, { RoundPlacement } from '@/components/battle/CardPlacementBoard';
import {
    BattleParticipant,
    BattleResult,
    generateOpponentDeck,
    simulateBattle,
    applyBattleResult
} from '@/lib/pvp-battle-system';
import { Swords, Trophy, XCircle, ArrowRight, Loader } from 'lucide-react';

interface StoryChapter {
    id: string;
    title: string;
    year: string;
    description: string;
    difficulty: string;
    reward: number;
    completed: boolean;
    enemyLevel: number;
}

type BattlePhase = 'loading' | 'placement' | 'battle' | 'result';

export default function StoryBattlePage() {
    const params = useParams();
    const router = useRouter();
    const { showAlert } = useAlert();
    const { addCoins, refreshData } = useUser();

    const chapterId = params.chapterId as string;

    const [chapter, setChapter] = useState<StoryChapter | null>(null);
    const [phase, setPhase] = useState<BattlePhase>('loading');

    // Battle State
    const [playerDeck, setPlayerDeck] = useState<Card[]>([]);
    const [opponentDeck, setOpponentDeck] = useState<Card[]>([]);
    const [battleResult, setBattleResult] = useState<BattleResult | null>(null);

    // Animation State
    const [currentRound, setCurrentRound] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [animationPhase, setAnimationPhase] = useState<'idle' | 'ready' | 'clash' | 'reveal'>('idle');

    useEffect(() => {
        const initializeBattle = async () => {
            // 1. Load Chapter Info
            const chapters: StoryChapter[] = [
                { id: 'chapter-1', title: '2025: AI의 시작', year: '2025', description: 'ChatGPT가 세상을 바꾸기 시작했다', difficulty: '쉬움', reward: 500, completed: false, enemyLevel: 1 },
                { id: 'chapter-2', title: '2026: 멀티모달의 시대', year: '2026', description: '이미지와 텍스트를 넘나드는 AI', difficulty: '보통', reward: 800, completed: false, enemyLevel: 2 },
                { id: 'chapter-3', title: '2027: 창작의 혁명', year: '2027', description: 'AI가 예술가가 되다', difficulty: '어려움', reward: 1200, completed: false, enemyLevel: 3 },
                { id: 'chapter-4', title: '2028: 자동화의 가속', year: '2028', description: '모든 것이 자동화되는 세상', difficulty: '매우 어려움', reward: 1500, completed: false, enemyLevel: 4 },
                { id: 'chapter-5', title: '2029: AGI의 등장', year: '2029', description: '범용 인공지능의 탄생', difficulty: '극악', reward: 2000, completed: false, enemyLevel: 5 },
            ];

            const foundChapter = chapters.find(c => c.id === chapterId);
            if (!foundChapter) {
                router.push('/story');
                return;
            }
            setChapter(foundChapter);

            // 2. Load Player Cards
            const userCards = storage.get<Card[]>('userCards', []);
            if (userCards.length < 5) {
                showAlert({ title: '오류', message: '카드가 부족합니다. 최소 5장이 필요합니다.', type: 'error' });
                router.push('/story');
                return;
            }

            // Auto-select top 5 cards for convenience in story mode
            const topCards = userCards
                .sort((a, b) => b.stats.totalPower - a.stats.totalPower)
                .slice(0, 5);
            setPlayerDeck(topCards);

            // 3. Generate Enemy Deck
            const aiOpponent = generateOpponentDeck(foundChapter.enemyLevel, [], 5);
            setOpponentDeck(aiOpponent.deck);

            setPhase('placement');
        };

        initializeBattle();
    }, [chapterId, router, showAlert]);

    const handlePlacementConfirm = (placements: RoundPlacement[]) => {
        if (!chapter) return;

        // Convert placements to card order array
        const cardOrder = placements.map(p => {
            const index = playerDeck.findIndex(c => c.id === p.cardId);
            return index;
        });

        // Setup Participants
        const player: BattleParticipant = {
            name: 'Player',
            level: 1, // Story mode doesn't track player level strictly yet
            deck: playerDeck,
            cardOrder: cardOrder
        };

        const opponent: BattleParticipant = {
            name: `AI Level ${chapter.enemyLevel}`,
            level: chapter.enemyLevel,
            deck: opponentDeck,
            cardOrder: [0, 1, 2, 3, 4] // Simple AI order
        };

        // Simulate Battle
        const result = simulateBattle(player, opponent, 'tactics'); // Use tactics mode logic (3 best of 5 basically)
        setBattleResult(result);

        // Start Animation
        setPhase('battle');
        runBattleAnimation(result);
    };

    const runBattleAnimation = async (result: BattleResult) => {
        for (let i = 0; i < result.rounds.length; i++) {
            setCurrentRound(i);

            // 1. Ready
            setAnimationPhase('ready');
            setAnimating(true);
            await new Promise(r => setTimeout(r, 1000));

            // 2. Clash
            setAnimationPhase('clash');
            await new Promise(r => setTimeout(r, 1500));

            // 3. Reveal
            setAnimationPhase('reveal');
            await new Promise(r => setTimeout(r, 3000));

            setAnimationPhase('idle');
            setAnimating(false);
            await new Promise(r => setTimeout(r, 500));
        }

        // Apply Results
        await handleBattleEnd(result);
        setPhase('result');
    };

    const handleBattleEnd = async (result: BattleResult) => {
        if (!chapter) return;

        if (result.winner === 'player') {
            // Reward
            await addCoins(chapter.reward);

            // Mark Completed
            const completedChapters = storage.get<string[]>('completedChapters', []);
            if (!completedChapters.includes(chapterId)) {
                completedChapters.push(chapterId);
                storage.set('completedChapters', completedChapters);
            }

            // Refresh Context
            await refreshData();
        }
    };

    if (phase === 'loading' || !chapter) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
                <Loader className="animate-spin text-cyan-500 mb-4" size={40} />
                <p className="text-xl font-bold animate-pulse">전장 생성 중...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden relative">
            {/* Background */}
            <div className="absolute inset-0 bg-[url('/bg-grid.svg')] opacity-20 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 h-screen flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between mb-6 shrink-0">
                    <div>
                        <h1 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                            STORY BATTLE
                        </h1>
                        <p className="text-white/60 flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/80">{chapter.year}</span>
                            {chapter.title}
                        </p>
                    </div>

                    {phase === 'battle' && (
                        <div className="bg-white/5 border border-white/10 rounded-full px-6 py-2 flex items-center gap-8">
                            <div className="text-center">
                                <span className="text-xs text-cyan-400 block mb-1">PLAYER</span>
                                <span className="text-2xl font-black">{battleResult?.playerWins || 0}</span>
                            </div>
                            <div className="text-xl font-bold text-white/20">VS</div>
                            <div className="text-center">
                                <span className="text-xs text-red-400 block mb-1">ENEMY</span>
                                <span className="text-2xl font-black">{battleResult?.opponentWins || 0}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Battle Area */}
                <div className="flex-1 min-h-0 flex flex-col">
                    {phase === 'placement' && (
                        <CardPlacementBoard
                            playerDeck={playerDeck}
                            opponentDeck={opponentDeck}
                            onConfirm={handlePlacementConfirm}
                            isOpponentHidden={true} // Hide enemy cards during placement
                        />
                    )}

                    {phase === 'battle' && battleResult && (
                        <div className="flex-1 flex flex-col items-center justify-center relative">
                            {/* Battle Visualization Reuse or Simplified */}
                            {/* Since CardPlacementBoard handles placement, we need a BattleVisualizer. 
                                 However, for now, we can reuse CardPlacementBoard in 'view-only' mode or build a simple visualizer here 
                                 as the previous PVP page did inline. Let's build a quick inline visualizer for consistency with the Request.
                              */}

                            <div className="w-full max-w-4xl aspect-video bg-black/40 border border-white/10 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center p-12">
                                {/* Enemy Card (Top) */}
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={`enemy-${currentRound}`}
                                        initial={{ y: -50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -50, opacity: 0 }}
                                        className="mb-8"
                                    >
                                        <div className={`w-36 h-52 rounded-xl border-2 transition-all duration-500 transform
                                            ${animationPhase === 'reveal' ? 'border-red-500 bg-red-900/20 rotate-0' : 'border-white/20 bg-white/5 rotate-180'}
                                        `}>
                                            {animationPhase === 'reveal' ? (
                                                <div className="w-full h-full flex flex-col items-center justify-center">
                                                    {/* Show Enemy Card Info */}
                                                    <div className="text-xs font-bold text-red-400 mb-2">ENEMY</div>
                                                    <div className="text-2xl">🤖</div>
                                                    <div className="text-sm font-bold mt-2">{battleResult.rounds[currentRound].opponentCard.name}</div>
                                                    <div className="text-xs text-white/60">Power: {battleResult.rounds[currentRound].opponentCard.stats.totalPower}</div>
                                                </div>
                                            ) : (
                                                <div className="w-full h-full bg-[url('/card-back.png')] bg-cover bg-center opacity-50" />
                                            )}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>

                                {/* VS Badge */}
                                <div className={`absolute center z-20 text-4xl font-black italic transition-all duration-300
                                     ${animationPhase === 'clash' ? 'scale-150 text-yellow-400' : 'scale-100 text-white/20'}
                                 `}>
                                    VS
                                </div>

                                {/* Player Card (Bottom) */}
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={`player-${currentRound}`}
                                        initial={{ y: 50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 50, opacity: 0 }}
                                        className="mt-8"
                                    >
                                        <div className={`w-36 h-52 rounded-xl border-2 transition-all duration-500 transform
                                            ${animationPhase !== 'idle' ? 'border-cyan-500 bg-cyan-900/20' : 'border-white/20'}
                                        `}>
                                            <div className="w-full h-full flex flex-col items-center justify-center">
                                                <div className="text-xs font-bold text-cyan-400 mb-2">YOU</div>
                                                {/* Card Image Placeholder */}
                                                <div className="text-2xl">🃏</div>
                                                <div className="text-sm font-bold mt-2">{battleResult.rounds[currentRound].playerCard.name}</div>
                                                <div className="text-xs text-white/60">Power: {battleResult.rounds[currentRound].playerCard.stats.totalPower}</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Round Result Text */}
                                {animationPhase === 'reveal' && (
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 text-6xl font-black drop-shadow-lg
                                            ${battleResult.rounds[currentRound].winner === 'player' ? 'text-cyan-400' :
                                                battleResult.rounds[currentRound].winner === 'opponent' ? 'text-red-500' : 'text-gray-400'}
                                        `}
                                    >
                                        {battleResult.rounds[currentRound].winner === 'player' ? 'WIN!' :
                                            battleResult.rounds[currentRound].winner === 'opponent' ? 'LOSS' : 'DRAW'}
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    )}

                    {phase === 'result' && battleResult && (
                        <div className="flex-1 flex flex-col items-center justify-center animate-fade-in pb-20">
                            <div className="text-center mb-8">
                                {battleResult.winner === 'player' ? (
                                    <>
                                        <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4 animate-bounce" />
                                        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-600 mb-2">VICTORY</h2>
                                        <p className="text-white/60">챕터를 완벽하게 제압했습니다!</p>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-20 h-20 text-gray-500 mx-auto mb-4" />
                                        <h2 className="text-5xl font-black text-gray-500 mb-2">DEFEAT</h2>
                                        <p className="text-white/60">더 강력한 덱으로 다시 도전하세요.</p>
                                    </>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => router.push('/story')}
                                    className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-all"
                                >
                                    돌아가기
                                </button>
                                {battleResult.winner === 'player' && (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl text-white font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20">
                                            <span className="text-yellow-400 font-black">+{chapter.reward}</span> 코인 획득
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
