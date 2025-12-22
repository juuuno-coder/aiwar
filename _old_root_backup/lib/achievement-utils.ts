// 업적 관리 유틸리티
import { storage } from './utils';
import { Achievement, UserAchievements, AchievementType } from './achievement-types';

// 기본 업적 목록 생성
export function generateDefaultAchievements(): Achievement[] {
    return [
        {
            id: 'ach-first-win',
            title: '첫 승리',
            description: '첫 번째 대전에서 승리하세요',
            type: 'first_win',
            target: 1,
            current: 0,
            completed: false,
            claimed: false,
            reward: { coins: 500 },
            icon: '🏆',
        },
        {
            id: 'ach-win-streak-3',
            title: '연승 시작',
            description: '3연승을 달성하세요',
            type: 'win_streak_3',
            target: 3,
            current: 0,
            completed: false,
            claimed: false,
            reward: { coins: 1000 },
            icon: '🔥',
        },
        {
            id: 'ach-legendary',
            title: '전설의 시작',
            description: '레전더리 카드를 획득하세요',
            type: 'legendary_card',
            target: 1,
            current: 0,
            completed: false,
            claimed: false,
            reward: { coins: 1500 },
            icon: '💎',
        },
        {
            id: 'ach-battles-10',
            title: '전투 입문',
            description: '총 10회 대전하세요',
            type: 'total_battles',
            target: 10,
            current: 0,
            completed: false,
            claimed: false,
            reward: { coins: 800 },
            icon: '⚔️',
        },
        {
            id: 'ach-fusions-5',
            title: '합성 마스터',
            description: '카드를 5회 합성하세요',
            type: 'total_fusions',
            target: 5,
            current: 0,
            completed: false,
            claimed: false,
            reward: { coins: 600 },
            icon: '✨',
        },
    ];
}

// 업적 데이터 초기화
export function initializeAchievements(): UserAchievements {
    const saved = storage.get<UserAchievements | null>('userAchievements', null);
    if (saved !== null) return saved;

    const defaultData: UserAchievements = {
        achievements: generateDefaultAchievements(),
        stats: {
            totalWins: 0,
            currentWinStreak: 0,
            maxWinStreak: 0,
            totalBattles: 0,
            totalFusions: 0,
            totalUnits: 0,
            collectedFactions: [],
            hasLegendary: false,
            completedChapters: [],
        },
    };
    storage.set('userAchievements', defaultData);
    return defaultData;
}

// 업적 보상 수령
export function claimAchievementReward(achievementId: string): boolean {
    const data = initializeAchievements();
    const achievement = data.achievements.find(a => a.id === achievementId);
    if (!achievement || !achievement.completed || achievement.claimed) return false;

    if (achievement.reward.coins) {
        const currentCoins = storage.get<number>('userCoins', 1000);
        storage.set('userCoins', currentCoins + achievement.reward.coins);
    }

    data.achievements = data.achievements.map(a =>
        a.id === achievementId ? { ...a, claimed: true } : a
    );
    storage.set('userAchievements', data);
    return true;
}

// 업적 통계 업데이트 (대전 승리, 합성 등)
export function updateAchievementStats(statType: string, value: number): void {
    const data = initializeAchievements();

    // 간단하게 통계만 업데이트 (실제 업적 체크는 별도로)
    switch (statType) {
        case 'totalBattles':
            data.stats.totalBattles += value;
            break;
        case 'totalWins':
            data.stats.totalWins += value;
            break;
        case 'winStreak':
            data.stats.currentWinStreak = value;
            data.stats.maxWinStreak = Math.max(data.stats.maxWinStreak, value);
            break;
        case 'fusion':
            data.stats.totalFusions += value;
            break;
        case 'legendary':
            data.stats.hasLegendary = true;
            break;
    }

    storage.set('userAchievements', data);
}


// 완료되었지만 미수령 업적 개수
export function getUnclaimedAchievementCount(): number {
    const data = initializeAchievements();
    return data.achievements.filter(a => a.completed && !a.claimed).length;
}
