// 레벨 시스템 유틸리티

/**
 * 경험치로 레벨 계산
 */
export function calculateLevel(experience: number): number {
    return Math.floor(experience / 100) + 1;
}

/**
 * 다음 레벨까지 필요한 경험치
 */
export function getExperienceForNextLevel(currentLevel: number): number {
    return currentLevel * 100;
}

/**
 * 현재 레벨에서의 진행도 (%)
 */
export function getLevelProgress(experience: number): number {
    const currentLevel = calculateLevel(experience);
    const expForCurrentLevel = (currentLevel - 1) * 100;
    const expForNextLevel = currentLevel * 100;
    const progress = experience - expForCurrentLevel;
    const total = expForNextLevel - expForCurrentLevel;

    return Math.floor((progress / total) * 100);
}

/**
 * 레벨업 체크
 */
export function checkLevelUp(oldExp: number, newExp: number): boolean {
    return calculateLevel(newExp) > calculateLevel(oldExp);
}

/**
 * 레벨업 보상 계산
 */
export function getLevelUpRewards(newLevel: number): {
    coins: number;
    cards: number;
    title?: string;
} {
    const rewards = {
        coins: newLevel * 100,
        cards: 0,
        title: undefined as string | undefined
    };

    // 5레벨마다 카드 1장
    if (newLevel % 5 === 0) {
        rewards.cards = 1;
    }

    // 10레벨마다 특별 칭호
    if (newLevel === 10) {
        rewards.title = '🌟 초보 트레이너';
    } else if (newLevel === 20) {
        rewards.title = '⭐ 숙련된 트레이너';
    } else if (newLevel === 30) {
        rewards.title = '💫 마스터 트레이너';
    } else if (newLevel === 50) {
        rewards.title = '🏆 전설의 트레이너';
    }

    return rewards;
}

/**
 * 레벨별 능력치 보너스
 */
export function getLevelBonus(level: number): number {
    // 레벨당 1% 보너스
    return 1 + (level - 1) * 0.01;
}
