// 레벨별 보상 시스템
// 지휘관 레벨이 성장함에 따라 얻을 수 있는 보상과 해금 시스템

export interface LevelRewardExtended {
    level: number;
    coins: number;
    tokens: number;
    description: string;
    unlock?: {
        type: 'feature' | 'mode' | 'chapter';
        id: string;
        name: string;
    };
    cardPack?: {
        type: 'normal' | 'rare' | 'epic';
        count: number;
    };
    isMilestone?: boolean; // 5레벨 단위 마일스톤
}

// 레벨별 보상 테이블
export const LEVEL_REWARDS_TABLE: LevelRewardExtended[] = [
    // 초반 (1-5): 환영 보상
    { level: 1, coins: 100, tokens: 0, description: '전장에 오신 것을 환영합니다!' },
    { level: 2, coins: 150, tokens: 0, description: '기초 훈련 완료!' },
    { level: 3, coins: 200, tokens: 0, description: '스토리 챕터 2 해금!', unlock: { type: 'chapter', id: 'chapter-2', name: '스토리 챕터 2' } },
    { level: 4, coins: 250, tokens: 0, description: '전투력 상승!' },
    { level: 5, coins: 500, tokens: 1, description: '첫 번째 마일스톤!', isMilestone: true, unlock: { type: 'mode', id: 'pvp', name: 'PVP 모드' } },

    // 중반 (6-10): 성장 보상
    { level: 6, coins: 400, tokens: 0, description: '실력이 늘고 있군요!' },
    { level: 7, coins: 450, tokens: 0, description: '카드 융합 해금!', unlock: { type: 'feature', id: 'fusion', name: '카드 융합' } },
    { level: 8, coins: 500, tokens: 0, description: '전투 전략가!' },
    { level: 9, coins: 600, tokens: 0, description: '거의 다 왔습니다!' },
    { level: 10, coins: 1000, tokens: 2, description: '10레벨 달성!', isMilestone: true, cardPack: { type: 'rare', count: 1 }, unlock: { type: 'chapter', id: 'chapter-3', name: '스토리 챕터 3' } },

    // 후반 (11-15): 베테랑 보상
    { level: 11, coins: 700, tokens: 0, description: '베테랑 지휘관!' },
    { level: 12, coins: 750, tokens: 0, description: '강화 시스템 해금!', unlock: { type: 'feature', id: 'enhance', name: '카드 강화' } },
    { level: 13, coins: 800, tokens: 0, description: '전술의 대가!' },
    { level: 14, coins: 900, tokens: 0, description: '전설로 향하는 길!' },
    { level: 15, coins: 1500, tokens: 3, description: '15레벨 마일스톤!', isMilestone: true, cardPack: { type: 'epic', count: 1 }, unlock: { type: 'feature', id: 'unique-create', name: '유니크 카드 생성' } },

    // 마스터 (16-20): 엘리트 보상
    { level: 16, coins: 1000, tokens: 0, description: '엘리트 지휘관!' },
    { level: 17, coins: 1100, tokens: 0, description: '전장의 영웅!' },
    { level: 18, coins: 1200, tokens: 0, description: '명예로운 전사!' },
    { level: 19, coins: 1300, tokens: 0, description: '전설의 문턱!' },
    { level: 20, coins: 2000, tokens: 5, description: 'VIP 마스터 지휘관!', isMilestone: true, cardPack: { type: 'epic', count: 2 } },

    // 레전드 (21+): 무한 성장
    { level: 21, coins: 1500, tokens: 1, description: '레전드의 시작!' },
    { level: 22, coins: 1600, tokens: 1, description: '무한한 가능성!' },
    { level: 23, coins: 1700, tokens: 1, description: '전설의 여정!' },
    { level: 24, coins: 1800, tokens: 1, description: '끝없는 도전!' },
    { level: 25, coins: 2500, tokens: 3, description: '25레벨 그랜드 마일스톤!', isMilestone: true, cardPack: { type: 'epic', count: 3 } },
];

/**
 * 특정 레벨의 보상 정보 가져오기
 */
export function getLevelReward(level: number): LevelRewardExtended {
    const reward = LEVEL_REWARDS_TABLE.find(r => r.level === level);

    // 레벨 25 이상은 스케일링 보상
    if (!reward && level > 25) {
        const baseCoins = 1500 + (level - 21) * 100;
        const isMilestone = level % 5 === 0;
        return {
            level,
            coins: isMilestone ? baseCoins * 2 : baseCoins,
            tokens: isMilestone ? 3 : 1,
            description: isMilestone ? `${level}레벨 마일스톤!` : `레벨 ${level} 달성!`,
            isMilestone,
            cardPack: isMilestone ? { type: 'epic', count: Math.floor(level / 10) } : undefined
        };
    }

    return reward || { level, coins: 100, tokens: 0, description: `레벨 ${level} 달성!` };
}

/**
 * 특정 레벨까지의 누적 보상 계산
 */
export function getTotalRewardsToLevel(targetLevel: number): { coins: number; tokens: number } {
    let totalCoins = 0;
    let totalTokens = 0;

    for (let level = 1; level <= targetLevel; level++) {
        const reward = getLevelReward(level);
        totalCoins += reward.coins;
        totalTokens += reward.tokens;
    }

    return { coins: totalCoins, tokens: totalTokens };
}

/**
 * 특정 기능이 해금되는 레벨 확인
 */
export function getUnlockLevel(featureId: string): number | null {
    const reward = LEVEL_REWARDS_TABLE.find(
        r => r.unlock?.id === featureId
    );
    return reward?.level || null;
}

/**
 * 특정 레벨에서 해금되는 모든 항목 확인
 */
export function getUnlocksAtLevel(level: number): LevelRewardExtended['unlock'][] {
    return LEVEL_REWARDS_TABLE
        .filter(r => r.level <= level && r.unlock)
        .map(r => r.unlock!);
}

/**
 * 특정 기능이 현재 레벨에서 해금되었는지 확인
 */
export function isFeatureUnlocked(featureId: string, currentLevel: number): boolean {
    const unlockLevel = getUnlockLevel(featureId);
    return unlockLevel !== null && currentLevel >= unlockLevel;
}

// 해금 상태 기본값 (레벨 1에서도 사용 가능한 기능들)
export const DEFAULT_UNLOCKED_FEATURES = ['story', 'shop', 'my-cards', 'generation'];
