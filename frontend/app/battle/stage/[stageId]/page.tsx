'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, BattleMode } from '@/lib/types';
import { getStoryStage, completeStage, StoryStage } from '@/lib/story-system';
import { generateEnemies, StageConfig } from '@/lib/stage-system';
import { simulateBattle, BattleResult, BattleParticipant, applyBattleResult, determineRoundWinner } from '@/lib/pvp-battle-system';
import { useGameSound } from '@/hooks/useGameSound';
import Button from '@/components/ui/Button';
import CardPlacementBoard, { RoundPlacement as BoardPlacement } from '@/components/battle/CardPlacementBoard';
import { useTranslation } from '@/context/LanguageContext';
import BattleDeckSelection from '@/components/battle/BattleDeckSelection';
import { useUser } from '@/context/UserContext';
import { Award, Trophy, XCircle, Zap, Users, Shield, Eye, Swords, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import GameCard from '@/components/GameCard';

// Shared Phase Type
type Phase =
    | 'intro' // Story specific: Dialogue
    | 'deck-select' // Unified
    | 'card-placement' // Unified
    | 'battle' // Unified
    | 'double-battle' // Interactive for Double Mode
    | 'result'; // Unified

export default function StageBattlePage() {
    const params = useParams();
    const router = useRouter();
    const { playSound } = useGameSound();
    const { t, language } = useTranslation();
    const { inventory, loading: userLoading, coins, level, user } = useUser(); // [Updated] Added user

    // Stage Data
    const [storyStage, setStoryStage] = useState<StoryStage | null>(null);
    const [enemies, setEnemies] = useState<Card[]>([]);

    // User State
    const [userDeck, setUserDeck] = useState<Card[]>([]);

    // Battle State
    const [phase, setPhase] = useState<Phase>('intro');
    const [selectedHand, setSelectedHand] = useState<Card[]>([]); // Current selection in deck-select
    const [cardPlacement, setCardPlacement] = useState<BoardPlacement | null>(null);
    const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
    const [currentRound, setCurrentRound] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [animationPhase, setAnimationPhase] = useState<'idle' | 'ready' | 'clash' | 'reveal'>('idle');

    // Double Battle State (Shared from PVP)
    const [doubleBattleState, setDoubleBattleState] = useState<{
        round: number;
        phase: 'ready' | 'choice' | 'clash' | 'result';
        timer: number;
        playerSelection: Card | null;
        opponentSelection: Card | null;
        roundWinner: 'player' | 'opponent' | 'draw' | null;
        playerWins: number;
        opponentWins: number;
        history: any[];
    }>({
        round: 1,
        phase: 'ready',
        timer: 3,
        playerSelection: null,
        opponentSelection: null,
        roundWinner: null,
        playerWins: 0,
        opponentWins: 0,
        history: []
    });

    // ⚠️ Active Deck for Battle (Ordered)
    const [activeBattleDeck, setActiveBattleDeck] = useState<Card[]>([]);


    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Load Stage
        const stageId = Array.isArray(params.stageId) ? params.stageId[0] : params.stageId || '';
        const stage = getStoryStage(stageId);

        if (!stage) {
            router.push('/story');
            return;
        }
        setStoryStage(stage);

        // Load User Deck from Inventory
        if (!userLoading) {
            setUserDeck(inventory || []);
        }

        // Load Enemies (Specific to Story Stage)
        const loadEnemies = () => {
            const stageConfig: StageConfig = {
                stageId: 0,
                chapter: parseInt(stage.id.split('-')[1]),
                stageInChapter: stage.step,
                playerHandSize: 5,
                battleCardCount: 3,
                enemyPowerBonus: 0,
                rewardMultiplier: 1,
                isBoss: stage.difficulty === 'BOSS',
                enemyPattern: 'random',
                description: stage.description
            };

            const generatedEnemies = generateEnemies(stageConfig, 100);

            // Adjust count based on battle mode
            let targetCount = 5;
            if (stage.battleMode === 'ambush' || stage.battleMode === 'double') targetCount = 6;

            while (generatedEnemies.length < targetCount) {
                generatedEnemies.push({ ...generatedEnemies[0], id: `enemy-extra-${generatedEnemies.length}` });
            }

            const enemyCards = generatedEnemies.slice(0, targetCount).map((e: any, i: number) => ({
                id: `enemy-${i}`,
                templateId: e.id || `enemy-${i}`,
                name: language === 'ko' ? e.name : e.name,
                type: (e.attribute === 'rock' ? 'EFFICIENCY' : e.attribute === 'scissors' ? 'CREATIVITY' : 'FUNCTION') as 'EFFICIENCY' | 'CREATIVITY' | 'FUNCTION',
                stats: { totalPower: e.power, efficiency: e.power, creativity: e.power, function: e.power },
                rarity: 'common' as const,
                level: stage.step,
                image: '/assets/cards/default-enemy.png',
                ownerId: 'system',
                experience: 0,
                acquiredAt: new Date(),
                isLocked: false
            }));
            setEnemies(enemyCards);
        };
        loadEnemies();

    }, [params.stageId, router, language, inventory, userLoading]);

    // --- Actions ---

    const startDeckSelection = () => {
        setPhase('deck-select');
    };

    const confirmDeck = (selected: Card[]) => {
        setSelectedHand(selected);
        setPhase('card-placement');
    };

    const handlePlacementComplete = (placement: BoardPlacement) => {
        if (!storyStage) return;
        setCardPlacement(placement);

        // Flatten BoardPlacement to Card List for Battle Logic
        let playerBattleDeck: Card[] = [];
        if (storyStage.battleMode === 'sudden-death') {
            playerBattleDeck = [placement.round1.main, placement.round2.main, placement.round3.main, placement.round4.main, placement.round5.main].filter((c): c is Card => !!c);
        } else if (storyStage.battleMode === 'double' || storyStage.battleMode === 'ambush') {
            // Re-constructing deck for Double Battle / Ambush logic
            if (storyStage.battleMode === 'double') {
                // Double Battle needs 6 cards in sequence: R1(2), R2(2), R3(2)
                playerBattleDeck = [
                    placement.round1.main, placement.round1.hidden,
                    placement.round2.main, placement.round2.hidden,
                    placement.round3.main, placement.round3.hidden
                ].filter((c): c is Card => !!c);
            } else {
                // Ambush: R1, R2, R3, R4, R5, R3(Hidden Ambush)
                playerBattleDeck = [
                    placement.round1.main,
                    placement.round2.main,
                    placement.round3.main,
                    placement.round4.main,
                    placement.round5.main,
                    placement.round3.hidden // The Ambush Card
                ].filter((c): c is Card => !!c);
            }
        } else {
            // Tactics & Standard
            playerBattleDeck = [placement.round1.main, placement.round2.main, placement.round3.main, placement.round4.main, placement.round5.main].filter((c): c is Card => !!c);
        }

        handleStartBattle(playerBattleDeck);
    };

    const handleStartBattle = (preparedDeck: Card[]) => {
        if (!storyStage) return;
        setActiveBattleDeck(preparedDeck); // SAVE DECK for View/Interaction

        const player: BattleParticipant = {
            name: `Player_${level}`,
            level: level,
            deck: preparedDeck,
            cardOrder: [0, 1, 2, 3, 4, 5], // Simple index order
        };

        const opponent: BattleParticipant = {
            name: language === 'ko' ? storyStage.enemy.name_ko : storyStage.enemy.name,
            level: storyStage.step,
            deck: enemies,
            cardOrder: [0, 1, 2, 3, 4, 5],
        };

        if (storyStage.battleMode === 'double') {
            startDoubleBattle(player, opponent);
        } else {
            const result = simulateBattle(player, opponent, storyStage.battleMode as BattleMode);
            setBattleResult(result);
            setCurrentRound(0);
            setPhase('battle');
            runBattleAnimation(result);
        }
    };

    // --- Double Battle Logic (Ported from PVP) ---

    const startDoubleBattle = (player: BattleParticipant, opponent: BattleParticipant) => {
        setDoubleBattleState({
            round: 1,
            phase: 'ready',
            timer: 3,
            playerSelection: null,
            opponentSelection: null,
            roundWinner: null,
            playerWins: 0,
            opponentWins: 0,
            history: []
        });
        setPhase('double-battle');
        // Initial setup for first round
        setDoubleBattleState(prev => ({ ...prev, round: 1, phase: 'ready', timer: 3 }));
    };

    // Auto-transition: Ready -> Choice
    useEffect(() => {
        if (phase === 'double-battle' && doubleBattleState.phase === 'ready') {
            const t = setTimeout(() => {
                setDoubleBattleState(prev => ({ ...prev, phase: 'choice', timer: 3 }));
            }, 1500);
            return () => clearTimeout(t);
        }
    }, [phase, doubleBattleState.phase, doubleBattleState.round]);


    // Auto-timer: Choice -> Resolve
    useEffect(() => {
        if (phase === 'double-battle' && doubleBattleState.phase === 'choice') {
            if (activeBattleDeck.length === 0) return;

            if (doubleBattleState.timer > 0) {
                const timerId = setTimeout(() => {
                    setDoubleBattleState(prev => ({ ...prev, timer: prev.timer - 1 }));
                }, 1000);
                return () => clearTimeout(timerId);
            } else {
                resolveDoubleBattleRound();
            }
        }
    }, [phase, doubleBattleState.phase, doubleBattleState.timer, activeBattleDeck]);

    const handleDoubleBattleSelection = (card: Card) => {
        if (doubleBattleState.phase !== 'choice') return;
        setDoubleBattleState(prev => ({ ...prev, playerSelection: card }));
    };

    const resolveDoubleBattleRound = async () => {
        if (activeBattleDeck.length === 0) return;

        setDoubleBattleState(prev => {
            const baseIdx = (prev.round - 1) * 2;
            const aiCard1 = enemies[baseIdx];
            const aiCard2 = enemies[baseIdx + 1];

            // Simple AI: Random
            const aiSelection = Math.random() > 0.5 ? aiCard1 : (aiCard2 || aiCard1);

            let playerSel = prev.playerSelection;
            const myCard1 = activeBattleDeck[baseIdx];
            const myCard2 = activeBattleDeck[baseIdx + 1];

            // Default random if not selected
            if (!playerSel) {
                playerSel = Math.random() > 0.5 ? myCard1 : (myCard2 || myCard1);
            }

            const winner = determineRoundWinner(playerSel, aiSelection);

            return {
                ...prev,
                playerSelection: playerSel,
                opponentSelection: aiSelection,
                roundWinner: winner,
                phase: 'clash',
                playerWins: prev.playerWins + (winner === 'player' ? 1 : 0),
                opponentWins: prev.opponentWins + (winner === 'opponent' ? 1 : 0),
            };
        });

        // Clash Effect Duration
        await new Promise(r => setTimeout(r, 2500));

        setDoubleBattleState(prev => {
            if (prev.round >= 3) {
                finishDoubleBattle(prev);
                return prev;
            }
            return {
                ...prev,
                round: prev.round + 1,
                phase: 'ready',
                timer: 3,
                playerSelection: null,
                opponentSelection: null,
                roundWinner: null
            };
        });
    };

    const finishDoubleBattle = (finalState: any) => {
        // Calculate Winner
        let finalWinner: 'player' | 'opponent' = 'opponent';
        if (finalState.playerWins > finalState.opponentWins) finalWinner = 'player';
        else if (finalState.playerWins === finalState.opponentWins) finalWinner = 'opponent'; // Draw is loss in PVE?

        const result: BattleResult = {
            winner: finalWinner,
            rounds: [],
            playerWins: finalState.playerWins,
            opponentWins: finalState.opponentWins,
            rewards: {
                coins: finalWinner === 'player' ? storyStage!.rewards.coins : 0,
                experience: finalWinner === 'player' ? storyStage!.rewards.experience : 10,
                ratingChange: 0
            }
        };

        setBattleResult(result);
        setPhase('result');
    };


    // --- Generic Battle Animation ---
    const runBattleAnimation = async (result: BattleResult) => {
        for (let i = 0; i < result.rounds.length; i++) {
            setCurrentRound(i);
            setAnimationPhase('ready');
            setAnimating(true);
            await new Promise(resolve => setTimeout(resolve, 800));

            setAnimationPhase('clash');
            await new Promise(resolve => setTimeout(resolve, 1500));

            setAnimationPhase('reveal');
            await new Promise(resolve => setTimeout(resolve, 2000));

            setAnimationPhase('idle');
            setAnimating(false);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        setPhase('result');
    };

    const handleResultConfirm = async () => {
        if (battleResult?.winner === 'player') {
            if (storyStage) {
                await applyBattleResult(battleResult, activeBattleDeck, enemies);
                await completeStage(storyStage.id.split('-')[1] === '1' ? 'chapter-1' : storyStage.id.split('-')[1] === '2' ? 'chapter-2' : 'chapter-3', storyStage.id, user?.uid);
            }
            const chapterNum = storyStage?.id.split('-')[1] || '1';
            router.push(`/story/chapter-${chapterNum}`);
        } else {
            setPhase('intro');
            setBattleResult(null);
            setCardPlacement(null);
            setSelectedHand([]);
            setActiveBattleDeck([]);
        }
    };

    if (!storyStage) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

    const maxSelect = (storyStage.battleMode === 'double' || storyStage.battleMode === 'ambush') ? 6 : 5;

    // UI RENDER
    return (
        <div className="min-h-screen bg-black text-white overflow-hidden flex flex-col relative select-none">
            {/* Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
                <div className="absolute inset-0 opacity-20 bg-[url('/assets/grid.png')] bg-center bg-repeat" />
            </div>

            {/* Header - Only layout for non-battle phases */}
            {phase !== 'battle' && phase !== 'double-battle' && (
                <div className="relative z-10 p-4 flex justify-between items-start shrink-0">
                    <Button variant="ghost" className="text-white hover:text-cyan-400 gap-2" onClick={() => router.back()}>
                        <ArrowLeft size={16} /> BACK
                    </Button>
                    <div className="text-right">
                        <h1 className="text-2xl font-black italic orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                            {language === 'ko' ? storyStage.title_ko : storyStage.title.toUpperCase()}
                        </h1>
                        <div className="flex items-center justify-end gap-2 text-xs text-gray-400 font-mono mt-1">
                            <span className={cn(
                                "px-2 py-0.5 rounded text-white font-bold",
                                storyStage.difficulty === 'EASY' ? 'bg-green-600' :
                                    storyStage.difficulty === 'NORMAL' ? 'bg-blue-600' : 'bg-red-600'
                            )}>
                                {storyStage.difficulty}
                            </span>
                            <span className="bg-white/10 px-2 py-0.5 rounded">
                                {storyStage.battleMode === 'sudden-death' ? (language === 'ko' ? '단판 승부' : 'SUDDEN DEATH') :
                                    storyStage.battleMode === 'double' ? (language === 'ko' ? '두장 승부' : 'TWO-CARD BATTLE') :
                                        storyStage.battleMode === 'ambush' ? (language === 'ko' ? '전략 승부' : 'STRATEGY BATTLE') :
                                            (language === 'ko' ? '전술 승부' : 'TACTICAL DUEL')}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 relative z-10 flex flex-col min-h-0">

                {/* 1. Intro (Dialogue) */}
                {phase === 'intro' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto w-full">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                            className="w-full bg-zinc-900/80 border border-red-500/30 rounded-2xl p-8 mb-8 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                            <h3 className="text-red-400 font-bold mb-2 text-sm tracking-widest flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                {language === 'ko' ? '적군 조우' : 'ENEMY ENCOUNTER'}
                            </h3>
                            <div className="flex gap-6 items-center">
                                <div className="w-24 h-24 bg-red-900/20 rounded-full border-2 border-red-500 flex items-center justify-center text-4xl shrink-0">
                                    👿
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-white italic mb-2">
                                        {language === 'ko' ? storyStage.enemy.name_ko : storyStage.enemy.name}
                                    </div>
                                    <p className="text-xl text-gray-300">
                                        "{language === 'ko' ? (storyStage.enemy.dialogue.start_ko || storyStage.enemy.dialogue.intro_ko) : (storyStage.enemy.dialogue.start || storyStage.enemy.dialogue.intro)}"
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                        <Button size="lg" className="w-full text-xl py-8 bg-cyan-600 hover:bg-cyan-500" onClick={startDeckSelection}>
                            {language === 'ko' ? '전투 준비' : 'PREPARE BATTLE'}
                        </Button>
                    </div>
                )}

                {/* 2. Deck Selection */}
                {phase === 'deck-select' && (
                    <BattleDeckSelection
                        availableCards={userDeck}
                        maxSelection={maxSelect}
                        currentSelection={selectedHand}
                        onSelectionChange={setSelectedHand}
                        onConfirm={confirmDeck}
                        onCancel={() => setPhase('intro')}
                    />
                )}

                {/* 3. Card Placement */}
                {phase === 'card-placement' && (
                    <div className="flex-1 overflow-hidden">
                        <CardPlacementBoard
                            selectedCards={selectedHand}
                            battleMode={storyStage.battleMode as BattleMode}
                            onPlacementComplete={handlePlacementComplete}
                            opponentDeck={enemies}
                        />
                    </div>
                )}

                {/* 4. Battle Animation (Auto) */}
                {phase === 'battle' && battleResult && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-4xl font-black mb-8">ROUND {currentRound + 1}</h2>
                            <div className="flex gap-12 items-center justify-center">
                                {/* Player Card */}
                                <div className={cn("transition-all duration-500 transform", animationPhase === 'reveal' ? "rotate-y-0" : "")}>
                                    <GameCard
                                        card={activeBattleDeck[currentRound] || activeBattleDeck[0]}
                                        isFlipped={animationPhase !== 'reveal'}
                                    />
                                    <p className="mt-4 font-bold text-cyan-400">YOU</p>
                                </div>

                                <div className="text-6xl font-black italic text-red-500">VS</div>

                                {/* Enemy Card */}
                                <div className={cn("transition-all duration-500 transform", animationPhase === 'reveal' ? "rotate-y-0" : "")}>
                                    <GameCard
                                        card={enemies[currentRound] || enemies[0]}
                                        isFlipped={animationPhase !== 'reveal'}
                                    />
                                    <p className="mt-4 font-bold text-red-500">ENEMY</p>
                                </div>
                            </div>

                            {animationPhase === 'reveal' && (
                                <motion.div
                                    initial={{ scale: 2, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="mt-12 text-5xl font-black text-yellow-400"
                                >
                                    {battleResult.rounds[currentRound]?.winner === 'player' ? 'WIN!' :
                                        battleResult.rounds[currentRound]?.winner === 'opponent' ? 'LOSE' : 'DRAW'}
                                </motion.div>
                            )}
                        </div>
                    </div>
                )}

                {/* 4-B. Double Battle Interactive */}
                {phase === 'double-battle' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-4">
                        <div className="text-center mb-8">
                            <h2 className="text-4xl font-black text-white mb-2">ROUND {doubleBattleState.round} / 3</h2>
                            <div className="text-xl text-cyan-400 font-mono">
                                {doubleBattleState.phase === 'ready' && "준비"}
                                {doubleBattleState.phase === 'choice' && `카드 선택: ${doubleBattleState.timer}s`}
                                {doubleBattleState.phase === 'clash' && "격돌!"}
                            </div>
                        </div>

                        <div className="flex gap-20 items-center">
                            {/* Player Cards (2 options) */}
                            <div className="flex gap-4">
                                {[0, 1].map(offset => {
                                    const idx = (doubleBattleState.round - 1) * 2 + offset;
                                    const card = activeBattleDeck[idx];
                                    if (!card) return null;

                                    const isSelected = doubleBattleState.playerSelection?.id === card.id;

                                    return (
                                        <motion.div
                                            key={card.id}
                                            whileHover={{ y: -20, scale: 1.1 }}
                                            onClick={() => handleDoubleBattleSelection(card)}
                                            className={cn(
                                                "cursor-pointer transition-all duration-300",
                                                doubleBattleState.phase !== 'choice' && !isSelected && "opacity-30 blur-sm scale-90",
                                                isSelected && "ring-4 ring-cyan-400 shadow-[0_0_30px_cyan]"
                                            )}
                                        >
                                            <GameCard card={card} />
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Vertical VS Divider */}
                            <div className="w-px h-64 bg-white/20 relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black p-2 rounded-full border border-white/20">
                                    VS
                                </div>
                            </div>

                            {/* Enemy Cards (2 options - Hidden) */}
                            <div className="flex gap-4">
                                {[0, 1].map(offset => {
                                    const idx = (doubleBattleState.round - 1) * 2 + offset;
                                    const card = enemies[idx];
                                    if (!card) return null;

                                    // Reveal only selected card during clash
                                    const isSelectedRole = doubleBattleState.opponentSelection?.id === card.id;
                                    const isRevealed = doubleBattleState.phase === 'clash' && isSelectedRole;

                                    return (
                                        <motion.div
                                            key={idx}
                                            className={cn(
                                                "transition-all duration-300",
                                                doubleBattleState.phase === 'clash' && !isSelectedRole && "opacity-30 blur-sm scale-90",
                                                isRevealed && "ring-4 ring-red-500 shadow-[0_0_30px_red]"
                                            )}
                                        >
                                            <GameCard card={card} isFlipped={!isRevealed} />
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Clash Result Overlay */}
                        {doubleBattleState.phase === 'clash' && doubleBattleState.roundWinner && (
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="absolute inset-0 flex items-center justify-center bg-black/50 z-50 pointer-events-none"
                            >
                                <div className={cn(
                                    "text-8xl font-black italic orbitron drop-shadow-[0_0_20px_rgba(0,0,0,1)]",
                                    doubleBattleState.roundWinner === 'player' ? "text-yellow-400" :
                                        doubleBattleState.roundWinner === 'opponent' ? "text-red-600" : "text-gray-400"
                                )}>
                                    {doubleBattleState.roundWinner === 'player' ? "WIN" :
                                        doubleBattleState.roundWinner === 'opponent' ? "LOSE" : "DRAW"}
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* 5. Result */}
                {phase === 'result' && battleResult && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="bg-zinc-900/90 border border-white/10 rounded-3xl p-12 text-center max-w-sm w-full shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                            <div className="text-7xl mb-6">{battleResult.winner === 'player' ? '🏆' : '💀'}</div>
                            <h2 className={`text-6xl font-black mb-2 orbitron italic tracking-tighter ${battleResult.winner === 'player' ? 'text-yellow-400' : 'text-red-500'}`}>
                                {battleResult.winner === 'player'
                                    ? (language === 'ko' ? '승리' : 'VICTORY')
                                    : (language === 'ko' ? '패배' : 'DEFEAT')}
                            </h2>
                            <div className="w-full h-px bg-white/10 my-6" />

                            {battleResult.winner === 'player' ? (
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg">
                                        <span className="text-gray-400">보상</span>
                                        <span className="text-yellow-400 font-bold text-xl flex items-center gap-1">
                                            <img src="/assets/icons/coin.png" className="w-5 h-5" /> {storyStage.rewards.coins}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg">
                                        <span className="text-gray-400">경험치</span>
                                        <span className="text-cyan-400 font-bold text-xl flex items-center gap-1">
                                            <Zap size={16} /> {storyStage.rewards.experience}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-400 italic mb-8">
                                    전략을 재정비하고 다시 도전하세요.
                                </p>
                            )}

                            <Button size="lg" className={`w-full text-xl py-8 font-black rounded-xl ${battleResult.winner === 'player' ? 'bg-yellow-600 hover:bg-yellow-500 text-black' : 'bg-gray-700 hover:bg-gray-600'}`} onClick={handleResultConfirm}>
                                {battleResult.winner === 'player'
                                    ? (language === 'ko' ? '다음으로' : 'CONTINUE')
                                    : (language === 'ko' ? '재도전' : 'RETRY')}
                            </Button>
                        </motion.div>
                    </div>
                )}

            </div>
        </div>
    );
}
