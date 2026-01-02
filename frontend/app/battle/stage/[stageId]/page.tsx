'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, BattleMode } from '@/lib/types';
import { getStoryStage, completeStage, StoryStage } from '@/lib/story-system';
import { generateEnemies, StageConfig } from '@/lib/stage-system';
import { simulateBattle, BattleResult, BattleParticipant, applyBattleResult, determineRoundWinner } from '@/lib/pvp-battle-system';
import { useGameSound } from '@/hooks/useGameSound';
import { Button } from '@/components/ui/custom/Button';
import CardPlacementBoard, { RoundPlacement as BoardPlacement } from '@/components/battle/CardPlacementBoard';
import { useTranslation } from '@/context/LanguageContext';
import BattleDeckSelection from '@/components/battle/BattleDeckSelection';
import { useUser } from '@/context/UserContext';
import { Award, Trophy, XCircle, Zap, Users, Shield, Eye, Swords, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import GameCard from '@/components/GameCard';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';

interface BattleLog {
    id: string;
    message: string;
    type: 'system' | 'player' | 'enemy' | 'winner' | 'draw' | 'advantage';
}

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

    // Mini Card States
    const [alivePlayerCards, setAlivePlayerCards] = useState<boolean[]>([true, true, true, true, true]);
    const [aliveEnemyCards, setAliveEnemyCards] = useState<boolean[]>([true, true, true, true, true]);

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

    const [battleLogs, setBattleLogs] = useState<BattleLog[]>([]);

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

        addBattleLog(language === 'ko' ? "실시간 전투 시작!" : "Live Battle Initiated!", 'system');
        setBattleResult(result);
        setPhase('result');
    };


    // --- UI Helpers (Ported from PVP Fight) ---
    const getTypeColor = (type: string | undefined) => {
        switch (type) {
            case 'EFFICIENCY': return 'rgba(239, 68, 68, 0.6)';
            case 'COST': return 'rgba(245, 158, 11, 0.6)';
            case 'CREATIVITY': return 'rgba(59, 130, 246, 0.6)';
            case 'FUNCTION': return 'rgba(168, 85, 247, 0.6)';
            default: return 'rgba(255, 255, 255, 0.2)';
        }
    };

    const getTypeGlow = (type: string | undefined) => {
        switch (type) {
            case 'EFFICIENCY': return 'shadow-[0_0_20px_rgba(239,68,68,0.5)] border-red-500/50';
            case 'COST': return 'shadow-[0_0_20px_rgba(245,158,11,0.5)] border-amber-500/50';
            case 'CREATIVITY': return 'shadow-[0_0_20px_rgba(59,130,246,0.5)] border-blue-500/50';
            case 'FUNCTION': return 'shadow-[0_0_20px_rgba(168,85,247,0.5)] border-purple-500/50';
            default: return 'border-white/10';
        }
    };

    const getTypeIcon = (type: string | undefined) => {
        switch (type) {
            case 'EFFICIENCY': return '✊';
            case 'COST': return '✌️';
            case 'CREATIVITY': return '✋';
            case 'FUNCTION': return '✂️';
            default: return '❓';
        }
    };

    const addBattleLog = (message: string, type: BattleLog['type'] = 'system') => {
        const id = Math.random().toString(36).substring(2, 9);
        setBattleLogs(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setBattleLogs(prev => prev.filter(log => log.id !== id));
        }, 6000);
    };

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


    // --- Generic Battle Animation ---
    const runBattleAnimation = async (result: BattleResult) => {
        setAlivePlayerCards(new Array(5).fill(true));
        setAliveEnemyCards(new Array(5).fill(true));

        for (let i = 0; i < result.rounds.length; i++) {
            const round = result.rounds[i];
            setCurrentRound(i + 1);

            // Log Round Start
            addBattleLog((language === 'ko' ? `라운드 ${i + 1} 시작!` : `Round ${i + 1} Started!`), 'system');

            setAnimationPhase('ready');
            setAnimating(true);
            await new Promise(resolve => setTimeout(resolve, 800));

            // Log Clash
            addBattleLog((language === 'ko'
                ? `${round.playerCard.name} (${round.playerCard.stats.totalPower}) vs ${round.opponentCard.name} (${round.opponentCard.stats.totalPower})`
                : `${round.playerCard.name} (${round.playerCard.stats.totalPower}) vs ${round.opponentCard.name} (${round.opponentCard.stats.totalPower})`), 'system');

            setAnimationPhase('clash');
            await new Promise(resolve => setTimeout(resolve, 1500));

            setAnimationPhase('reveal');

            // Update Alive States & Log Winner
            if (round.winner === 'player') {
                setAliveEnemyCards(prev => {
                    const next = [...prev];
                    next[i] = false;
                    return next;
                });
                addBattleLog((language === 'ko' ? `${round.playerCard.name} 승리!` : `${round.playerCard.name} Victory!`), 'winner');
            } else if (round.winner === 'opponent') {
                setAlivePlayerCards(prev => {
                    const next = [...prev];
                    next[i] = false;
                    return next;
                });
                addBattleLog((language === 'ko' ? `${round.opponentCard.name} 승리!` : `${round.opponentCard.name} Victory!`), 'enemy');
            } else {
                addBattleLog((language === 'ko' ? "무승부!" : "Draw!"), 'draw');
            }

            await new Promise(resolve => setTimeout(resolve, 2000));

            setAnimationPhase('idle');
            setAnimating(false);
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Final Result Log
        const isWin = result.winner === 'player';
        addBattleLog(
            isWin
                ? (language === 'ko' ? "최종 승리!" : "Final Victory!")
                : (language === 'ko' ? "패배..." : "Defeat..."),
            isWin ? 'winner' : 'enemy'
        );

        setPhase('result');
    };

    const handleResultConfirm = async () => {
        if (battleResult?.winner === 'player') {
            if (storyStage) {
                // Pass manual rewards to bypass PVP "practice mode" penalties
                const manualRewards = {
                    coins: storyStage.rewards.coins,
                    experience: storyStage.rewards.experience
                };
                await applyBattleResult(battleResult, activeBattleDeck, enemies, false, false, manualRewards);
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
                <BackgroundBeams className="opacity-35" />
            </div>

            <CombatLogDisplay />

            {/* Header - Only layout for non-battle phases */}
            {phase !== 'battle' && phase !== 'double-battle' && (
                <div className="relative z-10 p-4 flex justify-between items-start shrink-0">
                    <Button variant="ghost" className="text-white hover:text-cyan-400 gap-2" onPress={() => router.back()} startContent={<ArrowLeft size={16} />}>
                        BACK
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
                        <Button size="lg" className="w-full text-xl py-8 font-black bg-cyan-600 hover:bg-cyan-500 rounded-2xl" onPress={startDeckSelection}>
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

                {/* 4. Battle Animation (PVP Sync) */}
                {phase === 'battle' && battleResult && (
                    <div className="flex-1 flex flex-col p-4">
                        {/* Floating Header (Round & Score) */}
                        <div className="text-center mb-6 pt-2">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl inline-flex items-center gap-8 shadow-2xl mx-auto"
                            >
                                <div className="text-center">
                                    <p className="text-[8px] text-gray-500 font-bold orbitron uppercase tracking-[0.2em] mb-0.5">ROUND</p>
                                    <p className="text-2xl font-black text-white orbitron italic">{currentRound}/5</p>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-[8px] text-blue-400 font-bold orbitron uppercase tracking-widest">YOU</p>
                                        <p className="text-3xl font-black text-white orbitron">{battleResult.rounds.slice(0, currentRound).filter(r => r.winner === 'player').length}</p>
                                    </div>
                                    <div className="text-lg font-black text-gray-700 font-mono">VS</div>
                                    <div className="text-left">
                                        <p className="text-[8px] text-red-500 font-bold orbitron uppercase tracking-widest">ENEMY</p>
                                        <p className="text-3xl font-black text-white orbitron">{battleResult.rounds.slice(0, currentRound).filter(r => r.winner === 'opponent').length}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Enemy Mini Deck */}
                        <div className="grid grid-cols-5 gap-2 h-16 max-w-lg mx-auto w-full mb-4">
                            {enemies.slice(0, 5).map((card, index) => (
                                <AnimatePresence key={index}>
                                    {aliveEnemyCards[index] && (
                                        <motion.div
                                            initial={{ opacity: 1, scale: 1 }}
                                            animate={{
                                                scale: (currentRound - 1) === index ? 1.05 : 1,
                                                y: (currentRound - 1) === index && animationPhase === 'clash' ? 30 : 0,
                                            }}
                                            exit={{ opacity: 0, scale: 0.5, rotate: 15, filter: 'blur(8px)' }}
                                            className={cn(
                                                "bg-black/40 border border-red-500/20 rounded-xl flex flex-col items-center justify-center p-1 relative overflow-hidden",
                                                (currentRound - 1) === index ? "border-red-500 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.15)]" : "opacity-40"
                                            )}
                                        >
                                            <div className="text-lg">{getTypeIcon(card.type)}</div>
                                            <div className="text-[9px] font-black text-red-400 orbitron">{card.stats.totalPower}</div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            ))}
                        </div>

                        {/* Clash Arena */}
                        <div className="flex-1 flex items-center justify-center py-4">
                            <AnimatePresence>
                                {animationPhase !== 'idle' && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.1, filter: 'blur(15px)' }}
                                        className="flex items-center gap-6"
                                    >
                                        {/* Player Card Container */}
                                        <motion.div
                                            animate={{ x: animationPhase === 'clash' ? [0, 30, 0] : 0 }}
                                            transition={{ duration: 0.6, repeat: animationPhase === 'clash' ? Infinity : 0 }}
                                            className={cn(
                                                "relative p-6 rounded-[2rem] border-2 bg-black/60 backdrop-blur-3xl min-w-[160px] text-center transition-all duration-500",
                                                animationPhase === 'reveal' ? getTypeGlow(activeBattleDeck[currentRound - 1]?.type || activeBattleDeck[0].type) : "border-white/10"
                                            )}
                                        >
                                            <div className="text-4xl mb-3 filter drop-shadow-xl">
                                                {animationPhase === 'reveal' ? getTypeIcon(activeBattleDeck[currentRound - 1]?.type) : "❓"}
                                            </div>
                                            <div className="text-[10px] font-bold text-gray-400 mb-0.5 truncate max-w-[120px] mx-auto">
                                                {animationPhase === 'reveal' ? activeBattleDeck[currentRound - 1]?.name : "???"}
                                            </div>
                                            <div className="text-2xl font-black text-blue-500 orbitron">
                                                {animationPhase === 'reveal' ? activeBattleDeck[currentRound - 1]?.stats.totalPower : "--"}
                                            </div>
                                            <h2 className="text-[7px] font-black text-white/20 orbitron mt-1 tracking-[0.2em]">COMMANDER UNIT</h2>
                                        </motion.div>

                                        {/* Vs Zap Icon */}
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

                                        {/* Enemy Card Container */}
                                        <motion.div
                                            animate={{ x: animationPhase === 'clash' ? [0, -30, 0] : 0 }}
                                            transition={{ duration: 0.6, repeat: animationPhase === 'clash' ? Infinity : 0 }}
                                            className={cn(
                                                "relative p-6 rounded-[2rem] border-2 bg-black/60 backdrop-blur-3xl min-w-[160px] text-center transition-all duration-500",
                                                animationPhase === 'reveal' ? getTypeGlow(enemies[currentRound - 1]?.type || enemies[0].type) : "border-white/10"
                                            )}
                                        >
                                            <div className="text-4xl mb-3 filter drop-shadow-xl">
                                                {animationPhase === 'reveal' ? getTypeIcon(enemies[currentRound - 1]?.type) : "❓"}
                                            </div>
                                            <div className="text-[10px] font-bold text-gray-400 mb-0.5 truncate max-w-[120px] mx-auto">
                                                {animationPhase === 'reveal' ? enemies[currentRound - 1]?.name : "???"}
                                            </div>
                                            <div className="text-2xl font-black text-red-500 orbitron">
                                                {animationPhase === 'reveal' ? enemies[currentRound - 1]?.stats.totalPower : "--"}
                                            </div>
                                            <h2 className="text-[7px] font-black text-white/20 orbitron mt-1 tracking-[0.2em]">ENEMY MODEL</h2>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Player Mini Deck */}
                        <div className="grid grid-cols-5 gap-2 h-16 max-w-lg mx-auto w-full mt-4">
                            {activeBattleDeck.slice(0, 5).map((card, index) => (
                                <AnimatePresence key={index}>
                                    {alivePlayerCards[index] && (
                                        <motion.div
                                            initial={{ opacity: 1, scale: 1 }}
                                            animate={{
                                                scale: (currentRound - 1) === index ? 1.05 : 1,
                                                y: (currentRound - 1) === index && animationPhase === 'clash' ? -30 : 0,
                                            }}
                                            exit={{ opacity: 0, scale: 0.5, rotate: -15, filter: 'blur(8px)' }}
                                            className={cn(
                                                "bg-black/40 border border-blue-500/20 rounded-xl flex flex-col items-center justify-center p-1 relative overflow-hidden",
                                                (currentRound - 1) === index ? "border-blue-500 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.15)]" : "opacity-40"
                                            )}
                                        >
                                            <div className="text-lg">{getTypeIcon(card.type)}</div>
                                            <div className="text-[9px] font-black text-blue-400 orbitron">{card.stats.totalPower}</div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            ))}
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

                {/* 5. Result (PVP Sync) */}
                {phase === 'result' && battleResult && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#050505]/95 backdrop-blur-xl p-4 overflow-hidden">
                        <BackgroundBeams className="opacity-40" />
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
                                {battleResult.winner === 'player' ? (
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
                                battleResult.winner === 'player' ? 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'text-red-500/60'
                            )}>
                                {battleResult.winner === 'player' ? t('pvp.battle.victory') : t('pvp.battle.defeat')}
                            </h1>
                            <p className="text-[8px] font-black orbitron text-gray-500 tracking-[0.3em] mb-4">
                                {battleResult.winner === 'player' ? "MISSION_OBJECTIVE_COMPLETE" : "TACTICAL_FAILURE_RETRY"}
                            </p>

                            <div className="text-2xl text-white orbitron font-black mb-4 p-3 bg-white/5 rounded-2xl border border-white/5 inline-block px-8">
                                {battleResult.playerWins} <span className="text-gray-600 px-2">-</span> {battleResult.opponentWins}
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-6">
                                <div className="bg-black/40 backdrop-blur-xl rounded-xl p-3 border border-white/5">
                                    <div className="text-[8px] text-gray-500 orbitron uppercase mb-0.5">Stage</div>
                                    <div className="text-lg font-black orbitron text-cyan-400">
                                        {storyStage.id.split('-').slice(1).join('-')}
                                    </div>
                                </div>
                                <div className="bg-black/40 backdrop-blur-xl rounded-xl p-3 border border-white/5">
                                    <div className="text-[8px] text-gray-500 orbitron uppercase mb-0.5">Coins</div>
                                    <div className="text-lg font-black orbitron text-yellow-400">
                                        +{battleResult.winner === 'player' ? storyStage.rewards.coins : 0}
                                    </div>
                                </div>
                                <div className="bg-black/40 backdrop-blur-xl rounded-xl p-3 border border-white/5">
                                    <div className="text-[8px] text-gray-500 orbitron uppercase mb-0.5">EXP</div>
                                    <div className="text-lg font-black orbitron text-purple-400">
                                        +{battleResult.winner === 'player' ? storyStage.rewards.experience : 10}
                                    </div>
                                </div>
                            </div>

                            <Button
                                fullWidth
                                size="lg"
                                onPress={handleResultConfirm}
                                className={cn(
                                    "h-14 font-black orbitron text-sm rounded-xl shadow-lg transition-all",
                                    battleResult.winner === 'player'
                                        ? "bg-white text-black hover:bg-gray-200"
                                        : "bg-zinc-800 text-white hover:bg-zinc-700"
                                )}
                            >
                                {battleResult.winner === 'player'
                                    ? (language === 'ko' ? '다음 단계로' : 'NEXT STAGE')
                                    : (language === 'ko' ? '다시 도전' : 'RETRY MISSION')}
                            </Button>
                        </motion.div>
                    </div>
                )}

            </div>
        </div>
    );
}
