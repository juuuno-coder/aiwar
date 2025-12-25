// 전투 모드 시스템

export type BattleMode = 'sudden-death' | 'tactics' | 'ambush' | 'pvp-standard' | 'pvp-realtime-sudden' | 'pvp-realtime-tactics' | 'pvp-realtime-ambush';

export interface BattleModeConfig {
    mode: BattleMode;
    name: string;
    description: string;
    poolSize: number; // Cards to select/reveal (usually 5)
    battleSize: number; // Cards actually fighting
    rounds: number;
    winsNeeded: number;
    hasJokers: boolean; // For Ambush mode
    ante: {
        requiredCount: number;
        lossCount: number;
        lossRarityPriority: string[];
        winRewardType: 'card' | 'token';
    };
    rewards: {
        coins: number;
        experience: number;
        multiplier: number;
    };
}

export const BATTLE_MODES: Record<BattleMode, BattleModeConfig> = {
    'sudden-death': {
        mode: 'sudden-death',
        name: '단판 승부 (Sudden Death)',
        description: '5장을 공개하고 1장으로 승부하는 심리전',
        poolSize: 5,
        battleSize: 1,
        rounds: 1,
        winsNeeded: 1,
        hasJokers: false,
        ante: {
            requiredCount: 1,
            lossCount: 1,
            lossRarityPriority: ['common', 'rare'],
            winRewardType: 'card'
        },
        rewards: {
            coins: 100,
            experience: 20,
            multiplier: 1.0
        }
    },
    'tactics': {
        mode: 'tactics',
        name: '전술 대항전 (Tactics)',
        description: '5장의 순서를 정하여 3선승제 전투',
        poolSize: 5,
        battleSize: 5,
        rounds: 5,
        winsNeeded: 3,
        hasJokers: false,
        ante: {
            requiredCount: 5,
            lossCount: 1, // PvE default
            lossRarityPriority: ['common', 'rare'],
            winRewardType: 'card'
        },
        rewards: {
            coins: 300,
            experience: 50,
            multiplier: 1.5
        }
    },
    'ambush': {
        mode: 'ambush',
        name: '매복 작전 (Ambush)',
        description: '히든 카드를 활용한 전략적 3선승제',
        poolSize: 5,
        battleSize: 5, // +2 Jokers logic handled in engine
        rounds: 5,
        winsNeeded: 3,
        hasJokers: true,
        ante: {
            requiredCount: 7, // Need extra cards for jokers
            lossCount: 1,
            lossRarityPriority: ['common', 'rare'],
            winRewardType: 'card'
        },
        rewards: {
            coins: 500,
            experience: 100,
            multiplier: 2.0
        }
    },
    'pvp-standard': {
        mode: 'pvp-standard' as BattleMode,
        name: '랭크전 (Ranked PvP)',
        description: '다른 플레이어의 방어 덱과 전투합니다.',
        poolSize: 5,
        battleSize: 5,
        rounds: 5,
        winsNeeded: 3,
        hasJokers: false,
        ante: {
            requiredCount: 5,
            lossCount: 5, // High Stakes: Lose 5 cards
            lossRarityPriority: ['common', 'rare'],
            winRewardType: 'token'
        },
        rewards: {
            coins: 0, // PvP mainly gives Tokens/Rank
            experience: 0,
            multiplier: 1.0
        }
    },
    'pvp-realtime-sudden': {
        mode: 'pvp-realtime-sudden' as BattleMode,
        name: '실시간 단판 승부',
        description: '실시간 플레이어와 1장 전투',
        poolSize: 5,
        battleSize: 1,
        rounds: 1,
        winsNeeded: 1,
        hasJokers: false,
        ante: {
            requiredCount: 5,
            lossCount: 5,
            lossRarityPriority: ['common', 'rare'],
            winRewardType: 'card'
        },
        rewards: {
            coins: 200,
            experience: 50,
            multiplier: 1.0
        }
    },
    'pvp-realtime-tactics': {
        mode: 'pvp-realtime-tactics' as BattleMode,
        name: '실시간 전술 대항전',
        description: '실시간 플레이어와 5장 전투 (3선승)',
        poolSize: 5,
        battleSize: 5,
        rounds: 5,
        winsNeeded: 3,
        hasJokers: false,
        ante: {
            requiredCount: 5,
            lossCount: 5,
            lossRarityPriority: ['common', 'rare'],
            winRewardType: 'card'
        },
        rewards: {
            coins: 500,
            experience: 100,
            multiplier: 1.5
        }
    },
    'pvp-realtime-ambush': {
        mode: 'pvp-realtime-ambush' as BattleMode,
        name: '실시간 매복 작전',
        description: '실시간 플레이어와 히든카드 전투',
        poolSize: 5,
        battleSize: 5,
        rounds: 5,
        winsNeeded: 3,
        hasJokers: true,
        ante: {
            requiredCount: 7,
            lossCount: 5,
            lossRarityPriority: ['common', 'rare'],
            winRewardType: 'card'
        },
        rewards: {
            coins: 800,
            experience: 150,
            multiplier: 2.0
        }
    }
};

/**
 * 전투 모드 설정 가져오기
 */
export function getBattleModeConfig(mode: BattleMode): BattleModeConfig {
    return BATTLE_MODES[mode];
}

/**
 * 전투 모드별 보상 계산
 * @param fortuneBonus 행운 연구 보너스 (0-55)
 */
export function calculateRewards(
    mode: BattleMode,
    isVictory: boolean,
    bonusMultiplier: number = 1.0,
    fortuneBonus: number = 0
): { coins: number; experience: number } {
    const config = getBattleModeConfig(mode);

    if (!isVictory) {
        return {
            coins: Math.floor(config.rewards.coins * 0.3),
            experience: Math.floor(config.rewards.experience * 0.3)
        };
    }

    // 행운 연구 보너스 적용
    const fortuneMultiplier = 1 + (fortuneBonus / 100);

    return {
        coins: Math.floor(config.rewards.coins * config.rewards.multiplier * bonusMultiplier * fortuneMultiplier),
        experience: Math.floor(config.rewards.experience * config.rewards.multiplier * bonusMultiplier * fortuneMultiplier)
    };
}

/**
 * 전투 모드 검증
 */
export function validateDeckForMode(deckSize: number, mode: BattleMode): boolean {
    const config = getBattleModeConfig(mode);
    return deckSize === config.poolSize;
}
