// 전투 모드 시스템

export type BattleMode = '5-card' | '3-card' | '1-card';

export interface BattleModeConfig {
    mode: BattleMode;
    name: string;
    description: string;
    cardCount: number;
    rounds: number;
    winsNeeded: number;
    hasHiddenRounds: boolean;
    hiddenRounds?: number[];
    rewards: {
        coins: number;
        experience: number;
        multiplier: number;
    };
}

export const BATTLE_MODES: Record<BattleMode, BattleModeConfig> = {
    '5-card': {
        mode: '5-card',
        name: '메인 전투',
        description: '5장의 카드로 5라운드 전투 (3선승제)',
        cardCount: 5,
        rounds: 5,
        winsNeeded: 3,
        hasHiddenRounds: true,
        hiddenRounds: [2, 4],
        rewards: {
            coins: 300,
            experience: 50,
            multiplier: 1.0
        }
    },
    '3-card': {
        mode: '3-card',
        name: '빠른 사냥',
        description: '3장의 카드로 2라운드 빠른 전투',
        cardCount: 3,
        rounds: 2,
        winsNeeded: 1,
        hasHiddenRounds: true,
        hiddenRounds: [2],
        rewards: {
            coins: 150,
            experience: 25,
            multiplier: 0.8
        }
    },
    '1-card': {
        mode: '1-card',
        name: '보스전',
        description: '1장의 카드로 단판 승부',
        cardCount: 1,
        rounds: 1,
        winsNeeded: 1,
        hasHiddenRounds: false,
        rewards: {
            coins: 500,
            experience: 100,
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
    return deckSize === config.cardCount;
}
