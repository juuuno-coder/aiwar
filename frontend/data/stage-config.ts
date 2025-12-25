import { BattleMode } from '@/lib/battle-modes';
import { AIType } from '@/lib/types';

export interface EnemyConfig {
    name: string;
    description: string;
    deckConfig: {
        type: 'fixed' | 'random';
        cardIds?: string[]; // For fixed decks
        types?: AIType[]; // For random decks (e.g., ['FUNCTION'] for mono-type)
        count: number;
    };
    aiStrategy: 'random' | 'smart' | 'pattern';
}

export interface StageConfig {
    id: string; // e.g., '1-1'
    title: string;
    mode: BattleMode;
    enemy: EnemyConfig;
    difficulty: number; // 1-5 stars
    rewards: {
        coins: number;
        exp: number;
        tokens?: number;
        firstClearBonus?: boolean;
    };
    unlockCondition?: {
        stageId?: string; // Must clear this stage first
        level?: number;
    };
}

export const STAGE_DATABASE: StageConfig[] = [
    // --- STAGE 1: BASICS (Mono Types) ---
    {
        id: '1-1',
        title: 'Training Ground: Efficiency',
        mode: 'tactics',
        difficulty: 1,
        enemy: {
            name: 'Training Bot Alpha',
            description: 'Uses only basic EFFICIENCY cards. Counter with FUNCTION!',
            deckConfig: { type: 'random', types: ['EFFICIENCY'], count: 5 }, // Mono Rock
            aiStrategy: 'random'
        },
        rewards: { coins: 100, exp: 50, tokens: 10 },
        unlockCondition: { level: 1 }
    },
    {
        id: '1-2',
        title: 'Training Ground: Creativity',
        mode: 'tactics',
        difficulty: 1,
        enemy: {
            name: 'Training Bot Beta',
            description: 'Uses only CREATIVITY cards. Counter with EFFICIENCY!',
            deckConfig: { type: 'random', types: ['CREATIVITY'], count: 5 }, // Mono Paper
            aiStrategy: 'random'
        },
        rewards: { coins: 100, exp: 50, tokens: 10 },
        unlockCondition: { stageId: '1-1' }
    },
    {
        id: '1-3',
        title: 'Training Ground: Function',
        mode: 'tactics',
        difficulty: 1,
        enemy: {
            name: 'Training Bot Gamma',
            description: 'Uses only FUNCTION cards. Counter with CREATIVITY!',
            deckConfig: { type: 'random', types: ['FUNCTION'], count: 5 }, // Mono Scissors
            aiStrategy: 'random'
        },
        rewards: { coins: 100, exp: 50, tokens: 10 },
        unlockCondition: { stageId: '1-2' }
    },

    // --- STAGE 2: MIXED TACTICS ---
    {
        id: '1-4',
        title: 'Live Combat Test',
        mode: 'tactics',
        difficulty: 2,
        enemy: {
            name: 'Combat Unit Delta',
            description: 'Uses a mix of types. Watch out!',
            deckConfig: { type: 'random', count: 5 }, // Standard Random
            aiStrategy: 'random'
        },
        rewards: { coins: 200, exp: 80, tokens: 20 },
        unlockCondition: { stageId: '1-3' }
    },

    // --- STAGE 3: BOSS (Sudden Death) ---
    {
        id: '1-5',
        title: 'BOSS: The Gatekeeper',
        mode: 'sudden-death',
        difficulty: 3,
        enemy: {
            name: 'GATEKEEPER',
            description: 'A powerful entity. One shot, one kill.',
            deckConfig: { type: 'random', count: 5 }, // Pool of 5, picks 1
            aiStrategy: 'smart' // Should try to pick best card
        },
        rewards: { coins: 500, exp: 200, tokens: 50, firstClearBonus: true },
        unlockCondition: { stageId: '1-4' }
    },

    // --- STAGE 4: ADVANCED (Ambush) ---
    {
        id: '2-1',
        title: 'Ambush Alley',
        mode: 'ambush',
        difficulty: 3,
        enemy: {
            name: 'Rogue Squad',
            description: 'Uses hidden Joker cards to turn the tide.',
            deckConfig: { type: 'random', count: 5 },
            aiStrategy: 'smart'
        },
        rewards: { coins: 300, exp: 120, tokens: 30 },
        unlockCondition: { stageId: '1-5' }
    }
];
