// 퀘스트 시스템 - 일일 목표 및 업적 추적

export type QuestType = 'daily' | 'weekly' | 'achievement';
export type QuestCategory = 'battle' | 'card' | 'fusion' | 'general';

export interface Quest {
    id: string;
    type: QuestType;
    category: QuestCategory;
    title: string;
    description: string;
    progress: number;
    target: number;
    reward: {
        coins?: number;
        experience?: number;
        cards?: number;
    };
    completed: boolean;
    expiresAt?: string; // ISO string for daily/weekly quests
}

/**
 * 일일 퀘스트 생성
 */
export function generateDailyQuests(): Quest[] {
    return [
        {
            id: 'daily-battle-3',
            type: 'daily',
            category: 'battle',
            title: '일일 전투',
            description: '전투에서 3번 승리하기',
            progress: 0,
            target: 3,
            reward: { coins: 300, experience: 50 },
            completed: false,
            expiresAt: getEndOfDay()
        },
        {
            id: 'daily-card-5',
            type: 'daily',
            category: 'card',
            title: '카드 수집',
            description: '카드 5장 획득하기',
            progress: 0,
            target: 5,
            reward: { coins: 200, experience: 30 },
            completed: false,
            expiresAt: getEndOfDay()
        },
        {
            id: 'daily-fusion-1',
            type: 'daily',
            category: 'fusion',
            title: '카드 합성',
            description: '카드 1번 합성하기',
            progress: 0,
            target: 1,
            reward: { coins: 150, experience: 20 },
            completed: false,
            expiresAt: getEndOfDay()
        }
    ];
}

/**
 * 주간 퀘스트 생성
 */
export function generateWeeklyQuests(): Quest[] {
    return [
        {
            id: 'weekly-battle-20',
            type: 'weekly',
            category: 'battle',
            title: '주간 전투 마스터',
            description: '전투에서 20번 승리하기',
            progress: 0,
            target: 20,
            reward: { coins: 2000, experience: 300, cards: 3 },
            completed: false,
            expiresAt: getEndOfWeek()
        },
        {
            id: 'weekly-card-30',
            type: 'weekly',
            category: 'card',
            title: '주간 컬렉터',
            description: '카드 30장 획득하기',
            progress: 0,
            target: 30,
            reward: { coins: 1500, experience: 200, cards: 2 },
            completed: false,
            expiresAt: getEndOfWeek()
        }
    ];
}

/**
 * 업적 퀘스트
 */
export function getAchievementQuests(): Quest[] {
    return [
        {
            id: 'achievement-level-10',
            type: 'achievement',
            category: 'general',
            title: '레벨 10 달성',
            description: '레벨 10에 도달하기',
            progress: 0,
            target: 10,
            reward: { coins: 1000, experience: 0, cards: 1 },
            completed: false
        },
        {
            id: 'achievement-battle-100',
            type: 'achievement',
            category: 'battle',
            title: '백전노장',
            description: '전투 100번 승리하기',
            progress: 0,
            target: 100,
            reward: { coins: 5000, experience: 500, cards: 5 },
            completed: false
        },
        {
            id: 'achievement-card-100',
            type: 'achievement',
            category: 'card',
            title: '카드 마스터',
            description: '카드 100장 획득하기',
            progress: 0,
            target: 100,
            reward: { coins: 3000, experience: 300, cards: 3 },
            completed: false
        },
        {
            id: 'achievement-mythic-1',
            type: 'achievement',
            category: 'card',
            title: '신화의 소유자',
            description: '신화 등급 카드 획득하기',
            progress: 0,
            target: 1,
            reward: { coins: 2000, experience: 200 },
            completed: false
        }
    ];
}

/**
 * 퀘스트 진행도 업데이트
 */
export function updateQuestProgress(
    quests: Quest[],
    category: QuestCategory,
    action: string,
    amount: number = 1
): Quest[] {
    return quests.map(quest => {
        if (quest.completed || quest.category !== category) {
            return quest;
        }

        // 액션에 따라 진행도 업데이트
        let shouldUpdate = false;

        if (action === 'battle-win' && quest.id.includes('battle')) {
            shouldUpdate = true;
        } else if (action === 'card-acquired' && quest.id.includes('card')) {
            shouldUpdate = true;
        } else if (action === 'fusion-complete' && quest.id.includes('fusion')) {
            shouldUpdate = true;
        } else if (action === 'level-up' && quest.id.includes('level')) {
            shouldUpdate = true;
        }

        if (shouldUpdate) {
            const newProgress = Math.min(quest.progress + amount, quest.target);
            return {
                ...quest,
                progress: newProgress,
                completed: newProgress >= quest.target
            };
        }

        return quest;
    });
}

/**
 * 완료된 퀘스트 보상 수령
 */
export function claimQuestReward(quest: Quest): {
    coins: number;
    experience: number;
    cards: number;
} {
    if (!quest.completed) {
        return { coins: 0, experience: 0, cards: 0 };
    }

    return {
        coins: quest.reward.coins || 0,
        experience: quest.reward.experience || 0,
        cards: quest.reward.cards || 0
    };
}

/**
 * 만료된 퀘스트 확인
 */
export function isQuestExpired(quest: Quest): boolean {
    if (!quest.expiresAt) return false;
    return new Date() > new Date(quest.expiresAt);
}

/**
 * 퀘스트 저장/불러오기
 */
export function saveQuests(quests: Quest[]): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem('quests', JSON.stringify(quests));
        localStorage.setItem('questsUpdatedAt', new Date().toISOString());
    }
}

export function loadQuests(): Quest[] {
    if (typeof window === 'undefined') return [];

    const saved = localStorage.getItem('quests');
    if (!saved) {
        // 첫 로드 시 기본 퀘스트 생성
        const quests = [
            ...generateDailyQuests(),
            ...generateWeeklyQuests(),
            ...getAchievementQuests()
        ];
        saveQuests(quests);
        return quests;
    }

    const quests: Quest[] = JSON.parse(saved);

    // 만료된 퀘스트 확인 및 갱신
    const needsRefresh = quests.some(q => isQuestExpired(q));
    if (needsRefresh) {
        const refreshed = refreshExpiredQuests(quests);
        saveQuests(refreshed);
        return refreshed;
    }

    return quests;
}

/**
 * 만료된 퀘스트 갱신
 */
function refreshExpiredQuests(quests: Quest[]): Quest[] {
    const now = new Date();
    let updated = [...quests];

    // 일일 퀘스트 갱신
    const expiredDaily = updated.filter(q =>
        q.type === 'daily' && isQuestExpired(q)
    );
    if (expiredDaily.length > 0) {
        updated = updated.filter(q => q.type !== 'daily');
        updated.push(...generateDailyQuests());
    }

    // 주간 퀘스트 갱신
    const expiredWeekly = updated.filter(q =>
        q.type === 'weekly' && isQuestExpired(q)
    );
    if (expiredWeekly.length > 0) {
        updated = updated.filter(q => q.type !== 'weekly');
        updated.push(...generateWeeklyQuests());
    }

    return updated;
}

// 유틸리티 함수
function getEndOfDay(): string {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date.toISOString();
}

function getEndOfWeek(): string {
    const date = new Date();
    const day = date.getDay();
    const diff = 7 - day; // 일요일까지
    date.setDate(date.getDate() + diff);
    date.setHours(23, 59, 59, 999);
    return date.toISOString();
}
