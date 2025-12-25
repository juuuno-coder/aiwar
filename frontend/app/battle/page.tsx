'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardTemplate, Specialty } from '@/lib/types';
import PreBattleScene from '@/components/battle/PreBattleScene';
import BattleScene from '@/components/battle/BattleScene';
import CyberPageLayout from '@/components/CyberPageLayout';
import { CARD_DATABASE } from '@/data/card-database';
import { STAGE_DATABASE, StageConfig } from '@/data/stage-config';
import { Lock, Map, Star } from 'lucide-react';
import { gameStorage } from '@/lib/game-storage';
import { motion } from 'framer-motion';

import { useSound } from '@/hooks/useSound';
import { useAlert } from '@/context/AlertContext';

import BattleResult from '@/components/BattleResult';

const deriveAIType = (specialty: Specialty): 'EFFICIENCY' | 'CREATIVITY' | 'FUNCTION' => {
    switch (specialty) {
        case 'code': return 'FUNCTION';
        case 'image':
        case 'video':
        case 'music': return 'CREATIVITY';
        default: return 'EFFICIENCY';
    }
};

const createBattleCard = (temp: CardTemplate, ownerId: string): Card => {
    const aiType = deriveAIType(temp.specialty);
    const stats = {
        creativity: temp.baseStats.creativity.min,
        accuracy: temp.baseStats.accuracy.min,
        speed: temp.baseStats.speed.min,
        stability: temp.baseStats.stability.min,
        ethics: temp.baseStats.ethics.min,
        totalPower: (temp.baseStats.creativity.min + temp.baseStats.accuracy.min + temp.baseStats.speed.min + temp.baseStats.stability.min + temp.baseStats.ethics.min) / 5,
        efficiency: temp.baseStats.accuracy.min, // Mapping for extended stats
        function: temp.baseStats.speed.min,
    };

    return {
        ...temp,
        id: `${temp.id}_${ownerId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        templateId: temp.id,
        ownerId,
        level: 1,
        experience: 0,
        isLocked: false,
        acquiredAt: new Date(),
        stats,
        type: aiType
    } as Card;
};

export default function BattlePage() {
    const { play } = useSound();
    const { showAlert } = useAlert();
    const [gameState, setGameState] = useState<'LOBBY' | 'PREPARATION' | 'BATTLE' | 'RESULT'>('LOBBY');
    const [currentStage, setCurrentStage] = useState<StageConfig | null>(null);

    // Battle Result State
    const [battleResultData, setBattleResultData] = useState<{
        isVictory: boolean;
        isLevelUp: boolean;
        playerWins: number;
        aiWins: number;
        rewards: { exp: number; tokens: number; coins: number; cards?: number };
    } | null>(null);

    // Decks
    const [playerDeck, setPlayerDeck] = useState<Card[]>([]);
    const [playerJokers, setPlayerJokers] = useState<Card[]>([]);
    const [enemyDeck, setEnemyDeck] = useState<Card[]>([]);
    const [enemyJokers, setEnemyJokers] = useState<Card[]>([]);
    const [enemyPool, setEnemyPool] = useState<Card[]>([]);

    const [inventory, setInventory] = useState<Card[]>([]);
    const [clearedStages, setClearedStages] = useState<string[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const state = await gameStorage.loadGameState();
                setInventory(state.inventory || []);
                setClearedStages(state.stageProgress?.clearedStages || []);
            } catch (e) {
                console.error("Failed to load game data", e);
                showAlert({ title: 'Error', message: 'Failed to load game data.', type: 'error' });
            }
        };
        loadData();
    }, [gameState, showAlert]);

    const selectStage = (stage: StageConfig) => {
        // Check Unlock Condition
        if (stage.unlockCondition?.stageId && !clearedStages.includes(stage.unlockCondition.stageId)) {
            play('error');
            return;
        }

        play('click');
        setCurrentStage(stage);

        // Generate Enemy Deck based on Stage Config
        const config = stage.enemy.deckConfig;
        let pool: Card[] = [];

        if (config.type === 'fixed' && config.cardIds) {
            pool = config.cardIds.map(id => {
                const temp = CARD_DATABASE.find(c => c.id === id);
                if (!temp) return null;
                return createBattleCard(temp, 'enemy');
            }).filter(c => c !== null) as Card[];
        } else {
            // Random Generation
            let candidates = CARD_DATABASE;
            if (config.types) {
                candidates = candidates.filter(c => config.types?.includes(deriveAIType(c.specialty)));
            }
            // Create Card Instances
            pool = candidates.sort(() => 0.5 - Math.random()).slice(0, 5).map(temp => createBattleCard(temp, 'enemy'));
        }

        setEnemyPool(pool);
        setGameState('PREPARATION');
    };

    const handleBattleStart = (selectedCards: Card[], jokerCards: Card[] = []) => {
        play('click');
        setPlayerDeck(selectedCards);
        setPlayerJokers(jokerCards);

        if (!currentStage) return;

        // Enemy Strategy
        if (currentStage.mode === 'sudden-death') {
            setEnemyDeck([enemyPool[0]]);
        } else if (currentStage.mode === 'ambush') {
            setEnemyDeck(enemyPool);
            // Generate Enemy Jokers
            const hidden = CARD_DATABASE
                .filter(c => !enemyPool.find(p => p.templateId === c.id)) // Exclude known
                .sort(() => 0.5 - Math.random())
                .slice(0, 2)
                .map(temp => createBattleCard(temp, 'enemy'));
            setEnemyJokers(hidden);
        } else {
            setEnemyDeck(enemyPool);
        }

        setGameState('BATTLE');
    };

    const handleBattleEnd = async (victory: boolean) => {
        if (!currentStage) return;

        try {
            // Sound Effect
            if (victory) play('victory');
            else play('defeat');

            const result = await gameStorage.processBattleResult(currentStage.mode, victory, enemyDeck);

            let rewards = {
                coins: currentStage.rewards.coins,
                exp: currentStage.rewards.exp,
                tokens: currentStage.rewards.tokens || 0,
                cards: 0
            };

            let isLevelUp = false;

            if (victory) {
                const state = await gameStorage.loadGameState();
                const currentCleared = state.stageProgress?.clearedStages || [];

                if (result.gainedCards && result.gainedCards.length > 0) {
                    rewards.cards = result.gainedCards.length;
                }

                if (!currentCleared.includes(currentStage.id)) {
                    const newCleared = [...currentCleared, currentStage.id];
                    await gameStorage.saveGameState({ stageProgress: { clearedStages: newCleared } });

                    const claimed = await gameStorage.claimStageRewards(currentStage.rewards, true);
                    rewards.coins = claimed.coins;
                    rewards.exp = claimed.exp;
                    rewards.tokens = claimed.tokens;
                    isLevelUp = claimed.leveledUp;
                } else {
                    const claimed = await gameStorage.claimStageRewards(currentStage.rewards, false);
                    rewards.coins = claimed.coins;
                    rewards.exp = claimed.exp;
                    rewards.tokens = claimed.tokens;
                    isLevelUp = claimed.leveledUp;
                }
            } else {
                rewards = { coins: 0, exp: 0, tokens: 0, cards: 0 };
            }

            if (isLevelUp) play('levelup');

            setBattleResultData({
                isVictory: victory,
                isLevelUp: isLevelUp,
                playerWins: victory ? 1 : 0,
                aiWins: victory ? 0 : 1,
                rewards: rewards
            });

            setGameState('RESULT');

        } catch (error) {
            console.error('Battle End Error:', error);
            play('error');
            showAlert({
                title: 'Data Error',
                message: 'Failed to save battle results. Please check your connection.',
                type: 'error'
            });
            setGameState('LOBBY'); // Fallback
        }
    };

    const handleBackToLobby = () => {
        play('click');
        setGameState('LOBBY');
        setCurrentStage(null);
        setBattleResultData(null);
    }

    return (
        <CyberPageLayout title="작전 지역" englishTitle="BATTLEFIELD">
            <div className="w-full h-full flex flex-col items-center justify-start p-4 overflow-y-auto">

                {gameState === 'LOBBY' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl pb-20">
                        {STAGE_DATABASE.map((stage) => {
                            const isLocked = stage.unlockCondition?.stageId && !clearedStages.includes(stage.unlockCondition.stageId);
                            const isCleared = clearedStages.includes(stage.id);

                            return (
                                <motion.button
                                    key={stage.id}
                                    onClick={() => selectStage(stage)}
                                    disabled={isLocked as boolean}
                                    whileHover={!isLocked ? { scale: 1.02 } : {}}
                                    className={`relative group p-6 rounded-2xl border transition-all text-left flex flex-col gap-2 overflow-hidden min-h-[160px]
                                        ${isLocked
                                            ? 'bg-gray-900 border-white/5 opacity-40 cursor-not-allowed grayscale'
                                            : 'bg-black/60 border-white/10 hover:bg-white/5 hover:border-cyan-500/50'
                                        }
                                    `}
                                >
                                    {/* Background Decor */}
                                    <div className="absolute right-0 top-0 p-4 opacity-10">
                                        <Map size={100} />
                                    </div>

                                    <div className="flex justify-between items-start relative z-10">
                                        <div className={`text-xs font-bold px-2 py-0.5 rounded-md font-mono ${isCleared ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/10 text-white/60'}`}>
                                            STAGE {stage.id}
                                        </div>
                                        <div className="flex gap-1">
                                            {Array.from({ length: 3 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={12}
                                                    className={`${i < stage.difficulty ? 'text-yellow-500 fill-yellow-500' : 'text-gray-700'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-white font-orbitron mt-2 relative z-10">{stage.title}</h3>

                                    <div className="flex items-center gap-2 mt-1 relative z-10">
                                        <div className={`w-2 h-2 rounded-full ${stage.mode === 'ambush' ? 'bg-purple-500' : 'bg-cyan-500'}`} />
                                        <div className="text-sm text-gray-400 font-mono uppercase tracking-wider">{stage.mode.replace('-', ' ')}</div>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-xs text-gray-500 relative z-10 font-mono">
                                        <div className="flex flex-col">
                                            <span className="text-white/30 text-[9px] uppercase">Enemy</span>
                                            <span className="text-white/70">{stage.enemy.name}</span>
                                        </div>
                                        {isLocked && <div className="text-red-500 flex items-center gap-1"><Lock size={12} /> LOCKED</div>}
                                        {isCleared && <div className="text-green-500 font-bold flex items-center gap-1">✓ CLEARED</div>}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                )}

                {gameState === 'PREPARATION' && currentStage && (
                    <div className="w-full flex justify-center">
                        <div className="w-full max-w-6xl mb-4">
                            <button onClick={handleBackToLobby} className="text-white/50 hover:text-white mb-2 flex items-center gap-2">
                                ← ABORT MISSION
                            </button>
                        </div>
                        <PreBattleScene
                            mode={currentStage.mode}
                            userInventory={inventory}
                            enemyPool={enemyPool}
                            onStartBattle={handleBattleStart}
                        />
                    </div>
                )}

                {gameState === 'BATTLE' && currentStage && (
                    <BattleScene
                        mode={currentStage.mode}
                        playerDeck={playerDeck}
                        enemyDeck={enemyDeck}
                        playerJokers={playerJokers}
                        enemyJokers={enemyJokers}
                        onBattleEnd={handleBattleEnd}
                    />
                )}

                {gameState === 'RESULT' && battleResultData && (
                    <BattleResult
                        isVictory={battleResultData.isVictory}
                        isLevelUp={battleResultData.isLevelUp}
                        playerWins={battleResultData.playerWins}
                        aiWins={battleResultData.aiWins}
                        rewards={battleResultData.rewards}
                        onClose={handleBackToLobby}
                    />
                )}

            </div>
        </CyberPageLayout>
    );
}
