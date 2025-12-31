'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, BattleMode } from '@/lib/types';
import { getStoryStage, completeStage, StoryStage } from '@/lib/story-system';
import { generateEnemies, StageConfig } from '@/lib/stage-system';
import { simulateBattle, BattleResult } from '@/lib/pvp-battle-system';
import { useGameSound } from '@/hooks/useGameSound';
import Button from '@/components/ui/Button';
import EnhancedBattleScene from '@/components/battle/EnhancedBattleScene';
import CardPlacementBoard, { RoundPlacement as BoardPlacement } from '@/components/battle/CardPlacementBoard';
import { getGameState } from '@/lib/game-state';
import { useTranslation } from '@/context/LanguageContext';
import BattleDeckSelection from '@/components/battle/BattleDeckSelection';
import { useUser } from '@/context/UserContext';

// Import Types correctly
// import { BattleType } from '@/lib/types';

export default function StageBattlePage() {
    const params = useParams();
    const router = useRouter();
    const { playSound } = useGameSound();
    const { t, language } = useTranslation();
    const { inventory, loading: userLoading } = useUser();

    // Stage Data
    const [storyStage, setStoryStage] = useState<StoryStage | null>(null);
    const [enemies, setEnemies] = useState<any[]>([]);

    // User State
    const [userDeck, setUserDeck] = useState<Card[]>([]);

    // Battle State
    const [phase, setPhase] = useState<'intro' | 'hand-selection' | 'card-placement' | 'viewing' | 'battle' | 'result'>('intro');
    const [selectedHand, setSelectedHand] = useState<Card[]>([]);
    const [cardPlacement, setCardPlacement] = useState<BoardPlacement | null>(null);
    const [battleResult, setBattleResult] = useState<BattleResult | null>(null);

    // Tutorials & Misc
    const [showTutorial, setShowTutorial] = useState(false);
    const [tutorialStep, setTutorialStep] = useState(0);
    const [viewTimer, setViewTimer] = useState(3);

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
            let currentDeck = [...inventory];

            // 🛡️ Fallback: If inventory is empty (new user/guest), provide starter cards
            if (!currentDeck || currentDeck.length === 0) {
                console.log('Using starter deck');
                currentDeck = [
                    { id: 'starter-1', templateId: 'starter-blade', name: 'Cyber Blade', type: 'EFFICIENCY', rarity: 'common', level: 1, stats: { totalPower: 10, efficiency: 10, creativity: 5, function: 5 }, acquiredAt: new Date(), isLocked: false, experience: 0, ownerId: 'guest' },
                    { id: 'starter-2', templateId: 'starter-shield', name: 'Firewall', type: 'FUNCTION', rarity: 'common', level: 1, stats: { totalPower: 10, efficiency: 5, creativity: 5, function: 10 }, acquiredAt: new Date(), isLocked: false, experience: 0, ownerId: 'guest' },
                    { id: 'starter-3', templateId: 'starter-virus', name: 'Logic Virus', type: 'CREATIVITY', rarity: 'common', level: 1, stats: { totalPower: 10, efficiency: 5, creativity: 10, function: 5 }, acquiredAt: new Date(), isLocked: false, experience: 0, ownerId: 'guest' },
                    { id: 'starter-4', templateId: 'starter-bot', name: 'Worker Bot', type: 'EFFICIENCY', rarity: 'common', level: 1, stats: { totalPower: 8, efficiency: 8, creativity: 4, function: 4 }, acquiredAt: new Date(), isLocked: false, experience: 0, ownerId: 'guest' },
                    { id: 'starter-5', templateId: 'starter-drone', name: 'Scout Drone', type: 'FUNCTION', rarity: 'common', level: 1, stats: { totalPower: 8, efficiency: 4, creativity: 4, function: 8 }, acquiredAt: new Date(), isLocked: false, experience: 0, ownerId: 'guest' },
                ];
            }
            setUserDeck(currentDeck);
        }

        // Load Enemies
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

            // Generate enemies using stage config
            const generatedEnemies = generateEnemies(stageConfig, 100);

            // Adjust count based on battle mode
            let targetCount = 5;
            if (stage.battleMode === 'ambush' || stage.battleMode === 'double') targetCount = 6;

            // Ensure we have enough enemies
            while (generatedEnemies.length < targetCount) {
                generatedEnemies.push({ ...generatedEnemies[0], id: `enemy-extra-${generatedEnemies.length}` });
            }

            // Transform to Card format for consistency
            const enemyCards = generatedEnemies.slice(0, targetCount).map((e: any, i: number) => ({
                id: `enemy-${i}`,
                templateId: e.id || `enemy-${i}`,
                name: language === 'ko' ? e.name : e.name,
                type: e.attribute === 'rock' ? 'EFFICIENCY' : e.attribute === 'scissors' ? 'CREATIVITY' : 'FUNCTION',
                stats: { totalPower: e.power, efficiency: e.power, creativity: e.power, function: e.power },
                rarity: 'common' as const,
                level: stage.step,
                image: '/assets/cards/default-enemy.png'
            }));
            setEnemies(enemyCards);
        };
        loadEnemies();

        // Tutorial Check
        const isTutorialDone = localStorage.getItem('tutorial_stage_1_1_done');
        if (stage.id === 'stage-1-1' && !isTutorialDone) {
            setShowTutorial(true);
        }
    }, [params.stageId, router, language, inventory, userLoading]);

    // Phase Transitions
    const startHandSelection = () => {
        setPhase('hand-selection');
    };

    const confirmHand = (selected: Card[]) => {
        setSelectedHand(selected);
        setPhase('card-placement');
    };

    const handlePlacementComplete = (placement: BoardPlacement) => {
        if (!storyStage) return;
        setCardPlacement(placement);

        // Construct Player Deck from Placement
        // Flatten the BoardPlacement structure to Card[]
        let playerBattleDeck: Card[] = [];

        if (storyStage.battleMode === 'sudden-death') {
            // Sudden death uses only indices 0-4 sequentially if provided, 
            // but for simulation consistency we use the placed cards.
            playerBattleDeck = [
                placement.round1.main,
                placement.round2.main,
                placement.round3.main,
                placement.round4.main,
                placement.round5.main
            ].filter((c): c is Card => !!c);
        } else if (storyStage.battleMode === 'double' || storyStage.battleMode === 'ambush') {
            playerBattleDeck = [
                placement.round1.main,
                placement.round2.main,
                placement.round3.main,
                placement.round4.main,
                placement.round5.main,
                placement.round3.hidden // Use hidden slot for R3
            ].filter((c): c is Card => !!c);
        } else {
            // Tactics (Normal 5-card)
            playerBattleDeck = [
                placement.round1.main,
                placement.round2.main,
                placement.round3.main,
                placement.round4.main,
                placement.round5.main
            ].filter((c): c is Card => !!c);
        }

        // Construct Enemy Deck (Sync with Stage System)
        const enemyBattleDeck = enemies.slice(0, playerBattleDeck.length);

        const result = simulateBattle(
            { name: 'Player', level: 1, deck: playerBattleDeck },
            { name: 'Enemy', level: storyStage.step, deck: enemyBattleDeck },
            storyStage.battleMode
        );

        setBattleResult(result);
        setPhase('viewing');
        // Start Timer
        setViewTimer(3);
    };

    // Timer Effect
    useEffect(() => {
        if (phase === 'viewing') {
            if (viewTimer > 0) {
                const timer = setTimeout(() => setViewTimer(prev => prev - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                setPhase('battle');
            }
        }
    }, [phase, viewTimer]);

    const handleResultConfirm = () => {
        if (battleResult?.winner === 'player') {
            // Complete Stage
            if (storyStage) {
                completeStage(storyStage.id.split('-')[1] === '1' ? 'chapter-1' : storyStage.id.split('-')[1] === '2' ? 'chapter-2' : 'chapter-3', storyStage.id);
            }
            const chapterNum = storyStage?.id.split('-')[1] || '1';
            router.push(`/story/chapter-${chapterNum}`);
        } else {
            // Retry
            setPhase('intro');
            setBattleResult(null);
            setCardPlacement(null);
            setSelectedHand([]);
        }
    };

    if (!storyStage) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

    // Determine max cards for hand selection
    const maxSelect = (storyStage.battleMode === 'double' || storyStage.battleMode === 'ambush') ? 6 : 5;

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden flex flex-col relative select-none">
            {/* Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
                <div className="absolute inset-0 opacity-20 bg-[url('/assets/grid.png')] bg-center bg-repeat" />
            </div>

            {/* Header Area */}
            <div className="relative z-10 p-4 flex justify-between items-start">
                <Button variant="ghost" className="text-white hover:text-cyan-400" onClick={() => router.back()}>
                    ← BACK
                </Button>
                <div className="text-right">
                    <h1 className="text-3xl font-black italic orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                        {language === 'ko' ? storyStage.title_ko : storyStage.title.toUpperCase()}
                    </h1>
                    <div className="flex items-center justify-end gap-2 text-sm text-gray-400 font-mono mt-1">
                        <span className={`px-2 py-0.5 rounded text-white font-bold
                            ${storyStage.difficulty === 'EASY' ? 'bg-green-600' :
                                storyStage.difficulty === 'NORMAL' ? 'bg-blue-600' :
                                    storyStage.difficulty === 'HARD' ? 'bg-orange-600' : 'bg-red-600 animate-pulse'}`}>
                            {storyStage.difficulty}
                        </span>
                        <span>{storyStage.battleMode.toUpperCase().replace('-', ' ')}</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative z-10 flex flex-col">

                {/* Intro Phase */}
                {phase === 'intro' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto w-full">
                        {/* Enemy Dialogue */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                            className="w-full bg-zinc-900/80 border border-red-500/30 rounded-2xl p-8 mb-8 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                            <h3 className="text-red-400 font-bold mb-2 text-sm tracking-widest">
                                {language === 'ko' ? '⚠️ 경고: 적 조우' : '⚠️ WARNING: ENEMY ENCOUNTER'}
                            </h3>
                            <div className="flex gap-6 items-center">
                                <div className="w-24 h-24 bg-red-900/20 rounded-full border-2 border-red-500 flex items-center justify-center text-4xl">
                                    👿
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-white italic mb-2">
                                        {language === 'ko' ? storyStage.enemy.name_ko : storyStage.enemy.name}
                                    </div>
                                    <p className="text-xl text-gray-300">
                                        "{language === 'ko' ? storyStage.enemy.dialogue.intro_ko : storyStage.enemy.dialogue.intro}"
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <Button size="lg" className="w-full text-xl py-8 bg-cyan-600 hover:bg-cyan-500" onClick={startHandSelection}>
                            {language === 'ko' ? '전투 시작' : 'BATTLE START'}
                        </Button>
                    </div>
                )}

                {/* Hand Selection Phase */}
                {phase === 'hand-selection' && (
                    <BattleDeckSelection
                        availableCards={userDeck}
                        maxSelection={maxSelect}
                        currentSelection={selectedHand}
                        onSelectionChange={setSelectedHand}
                        onConfirm={confirmHand}
                        onCancel={() => setPhase('intro')}
                    />
                )}

                {/* Placement Phase  */}
                {phase === 'card-placement' && (
                    <div className="flex-1 flex items-center justify-center p-4 w-full">
                        <div className="w-full max-w-5xl">
                            <CardPlacementBoard
                                selectedCards={selectedHand}
                                battleMode={storyStage.battleMode as BattleMode}
                                onPlacementComplete={handlePlacementComplete}
                                opponentDeck={enemies}
                            />
                        </div>
                    </div>
                )}

                {/* Viewing (Countdown) */}
                {phase === 'viewing' && (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                            <h2 className="text-4xl text-white font-black mb-4 orbitron">
                                {language === 'ko' ? '전투 분석 중...' : 'BATTLE STARTING'}
                            </h2>
                            <div className="text-9xl font-black text-cyan-400 orbitron">{viewTimer}</div>
                        </motion.div>
                    </div>
                )}

                {/* Battle Phase */}
                {phase === 'battle' && battleResult && cardPlacement && (
                    <div className="flex-1 flex items-center justify-center p-4">
                        <EnhancedBattleScene
                            playerCards={
                                [
                                    cardPlacement.round1.main,
                                    cardPlacement.round2.main,
                                    // Handle missing cards safely
                                    cardPlacement.round3 ? cardPlacement.round3.main : null,
                                    cardPlacement.round4 ? cardPlacement.round4.main : null,
                                    cardPlacement.round5 ? cardPlacement.round5.main : null
                                ].filter((c): c is Card => !!c)
                            }
                            enemyCards={enemies.slice(0, 5)} // Pass main enemies
                            battleType={storyStage.battleMode === 'ambush' || storyStage.battleMode === 'double' || storyStage.battleMode === 'tactics' ? 'strategic' : 'tactical'} // Map to visual type
                            // Pass Hidden Cards
                            playerHiddenCards={{
                                round3: (storyStage.battleMode === 'ambush' || storyStage.battleMode === 'double') ? cardPlacement.round3.hidden : undefined
                            }}
                            enemyHiddenCards={{
                                round3: (storyStage.battleMode === 'ambush' || storyStage.battleMode === 'double') && enemies.length > 5 ? enemies[5] : undefined
                            }}

                            battleResult={battleResult}
                            onBattleEnd={(victory) => {
                                setPhase('result');
                            }}
                        />
                    </div>
                )}

                {/* Result Phase */}
                {phase === 'result' && battleResult && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="bg-zinc-900 border border-white/10 rounded-2xl p-12 text-center max-w-2xl w-full"
                        >
                            <div className="text-6xl mb-4">{battleResult.winner === 'player' ? '🏆' : '💀'}</div>
                            <h2 className={`text-5xl font-black mb-4 orbitron ${battleResult.winner === 'player' ? 'text-yellow-400' : 'text-red-500'}`}>
                                {battleResult.winner === 'player'
                                    ? (language === 'ko' ? '승리' : 'VICTORY')
                                    : (language === 'ko' ? '패배' : 'DEFEAT')}
                            </h2>
                            <p className="text-xl text-gray-300 mb-8 italic">
                                "{battleResult.winner === 'player'
                                    ? (language === 'ko' ? storyStage.enemy.dialogue.win_ko : storyStage.enemy.dialogue.win)
                                    : (language === 'ko' ? storyStage.enemy.dialogue.lose_ko : storyStage.enemy.dialogue.lose)}"
                            </p>

                            {battleResult.winner === 'player' && (
                                <div className="flex justify-center gap-8 mb-8">
                                    <div className="bg-white/5 rounded-xl p-4 min-w-[120px]">
                                        <div className="text-sm text-gray-400">Coins</div>
                                        <div className="text-2xl font-bold text-yellow-400">+{storyStage.rewards.coins}</div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 min-w-[120px]">
                                        <div className="text-sm text-gray-400">EXP</div>
                                        <div className="text-2xl font-bold text-cyan-400">+{storyStage.rewards.experience}</div>
                                    </div>
                                </div>
                            )}

                            <Button size="lg" className={`w-full text-lg py-6 ${battleResult.winner === 'player' ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-gray-600 hover:bg-gray-500'}`} onClick={handleResultConfirm}>
                                {battleResult.winner === 'player'
                                    ? (language === 'ko' ? '계속하기' : 'CONTINUE')
                                    : (language === 'ko' ? '다시 시도' : 'TRY AGAIN')}
                            </Button>
                        </motion.div>
                    </div>
                )}

            </div>
        </div>
    );
}

// Helper types if needed locally
interface BattleDeck {
    main: Card[];
    hidden: Card[];
}
