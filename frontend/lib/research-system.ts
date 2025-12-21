// 연구소 시스템 - 지휘관 스탯 강화를 통한 게임 전반 효율 향상

// ============================================
// 연구 카테고리 및 스탯
// ============================================
export type ResearchCategory =
    | 'insight'      // 통찰력: 희귀 등급 확률
    | 'efficiency'   // 효율성: 생산 속도
    | 'negotiation'  // 협상력: 비용 절감
    | 'leadership'   // 리더십: 숙련도 증가 속도
    | 'mastery'      // 숙달: 강화/합성 성공률
    | 'fortune';     // 행운: 배틀 보상 증가

export interface ResearchStat {
    id: ResearchCategory;
    name: string;
    description: string;
    icon: string;
    maxLevel: number;
    effects: {
        level: number;
        bonus: number;
        description: string;
    }[];
    baseCost: number;          // 레벨 1 비용
    costMultiplier: number;    // 레벨당 비용 증가율
    baseTime: number;          // 레벨 1 연구 시간 (분)
    timeMultiplier: number;    // 레벨당 시간 증가율
    requiredLevel: number;     // 해금에 필요한 지휘관 레벨
    requiredResearchId?: ResearchCategory; // 해금에 필요한 선행 연구 ID
    requiredResearchLevel?: number;        // 해금에 필요한 선행 연구 레벨
    color: string;
    gradient: string;
}

export const RESEARCH_STATS: ResearchStat[] = [
    {
        id: 'insight',
        name: '통찰력',
        description: '유닛 생성 시 높은 등급 확률 증가',
        icon: '👁️',
        maxLevel: 10,
        effects: [
            { level: 1, bonus: 2, description: '희귀 등급 +2%' },
            { level: 2, bonus: 4, description: '희귀 등급 +4%' },
            { level: 3, bonus: 6, description: '희귀 등급 +6%' },
            { level: 4, bonus: 8, description: '희귀 등급 +8%' },
            { level: 5, bonus: 12, description: '희귀 등급 +12%, 영웅 +2%' },
            { level: 6, bonus: 15, description: '희귀 등급 +15%, 영웅 +3%' },
            { level: 7, bonus: 18, description: '희귀 등급 +18%, 영웅 +5%' },
            { level: 8, bonus: 22, description: '희귀 등급 +22%, 영웅 +7%' },
            { level: 9, bonus: 26, description: '희귀 등급 +26%, 영웅 +10%' },
            { level: 10, bonus: 30, description: '희귀 +30%, 영웅 +15%, 전설 +3%' },
        ],
        baseCost: 200,
        costMultiplier: 1.5,
        baseTime: 10,
        timeMultiplier: 1.3,
        requiredLevel: 1,
        color: 'purple',
        gradient: 'from-purple-500 to-violet-600'
    },
    {
        id: 'efficiency',
        name: '효율성',
        description: '모든 슬롯의 유닛 생산 속도 증가',
        icon: '⚡',
        maxLevel: 10,
        effects: [
            { level: 1, bonus: 5, description: '생산 속도 +5%' },
            { level: 2, bonus: 10, description: '생산 속도 +10%' },
            { level: 3, bonus: 15, description: '생산 속도 +15%' },
            { level: 4, bonus: 20, description: '생산 속도 +20%' },
            { level: 5, bonus: 27, description: '생산 속도 +27%' },
            { level: 6, bonus: 34, description: '생산 속도 +34%' },
            { level: 7, bonus: 42, description: '생산 속도 +42%' },
            { level: 8, bonus: 50, description: '생산 속도 +50%' },
            { level: 9, bonus: 60, description: '생산 속도 +60%' },
            { level: 10, bonus: 75, description: '생산 속도 +75%' },
        ],
        baseCost: 150,
        costMultiplier: 1.4,
        baseTime: 8,
        timeMultiplier: 1.25,
        requiredLevel: 2,
        requiredResearchId: 'insight',
        requiredResearchLevel: 1,
        color: 'yellow',
        gradient: 'from-yellow-500 to-amber-600'
    },
    {
        id: 'negotiation',
        name: '협상력',
        description: '상점 및 강화 비용 할인',
        icon: '💰',
        maxLevel: 10,
        effects: [
            { level: 1, bonus: 3, description: '비용 -3%' },
            { level: 2, bonus: 6, description: '비용 -6%' },
            { level: 3, bonus: 9, description: '비용 -9%' },
            { level: 4, bonus: 12, description: '비용 -12%' },
            { level: 5, bonus: 16, description: '비용 -16%' },
            { level: 6, bonus: 20, description: '비용 -20%' },
            { level: 7, bonus: 24, description: '비용 -24%' },
            { level: 8, bonus: 28, description: '비용 -28%' },
            { level: 9, bonus: 33, description: '비용 -33%' },
            { level: 10, bonus: 40, description: '비용 -40%' },
        ],
        baseCost: 250,
        costMultiplier: 1.5,
        baseTime: 12,
        timeMultiplier: 1.3,
        requiredLevel: 3,
        requiredResearchId: 'efficiency',
        requiredResearchLevel: 2,
        color: 'green',
        gradient: 'from-green-500 to-emerald-600'
    },
    {
        id: 'leadership',
        name: '리더십',
        description: '군단 숙련도 획득 속도 증가',
        icon: '👑',
        maxLevel: 10,
        effects: [
            { level: 1, bonus: 5, description: '숙련도 +5%/일' },
            { level: 2, bonus: 10, description: '숙련도 +10%/일' },
            { level: 3, bonus: 15, description: '숙련도 +15%/일' },
            { level: 4, bonus: 20, description: '숙련도 +20%/일' },
            { level: 5, bonus: 28, description: '숙련도 +28%/일' },
            { level: 6, bonus: 36, description: '숙련도 +36%/일' },
            { level: 7, bonus: 45, description: '숙련도 +45%/일' },
            { level: 8, bonus: 55, description: '숙련도 +55%/일' },
            { level: 9, bonus: 70, description: '숙련도 +70%/일' },
            { level: 10, bonus: 100, description: '숙련도 +100%/일' },
        ],
        baseCost: 300,
        costMultiplier: 1.6,
        baseTime: 15,
        timeMultiplier: 1.35,
        requiredLevel: 5,
        requiredResearchId: 'negotiation',
        requiredResearchLevel: 3,
        color: 'cyan',
        gradient: 'from-cyan-500 to-blue-600'
    },
    {
        id: 'mastery',
        name: '숙달',
        description: '강화/합성 성공률 증가',
        icon: '🔧',
        maxLevel: 10,
        effects: [
            { level: 1, bonus: 2, description: '성공률 +2%' },
            { level: 2, bonus: 4, description: '성공률 +4%' },
            { level: 3, bonus: 6, description: '성공률 +6%' },
            { level: 4, bonus: 8, description: '성공률 +8%' },
            { level: 5, bonus: 11, description: '성공률 +11%' },
            { level: 6, bonus: 14, description: '성공률 +14%' },
            { level: 7, bonus: 17, description: '성공률 +17%' },
            { level: 8, bonus: 21, description: '성공률 +21%' },
            { level: 9, bonus: 25, description: '성공률 +25%' },
            { level: 10, bonus: 30, description: '성공률 +30%' },
        ],
        baseCost: 350,
        costMultiplier: 1.6,
        baseTime: 20,
        timeMultiplier: 1.4,
        requiredLevel: 7,
        requiredResearchId: 'leadership',
        requiredResearchLevel: 3,
        color: 'orange',
        gradient: 'from-orange-500 to-red-600'
    },
    {
        id: 'fortune',
        name: '행운',
        description: '배틀/스토리 보상 증가',
        icon: '🍀',
        maxLevel: 10,
        effects: [
            { level: 1, bonus: 3, description: '보상 +3%' },
            { level: 2, bonus: 6, description: '보상 +6%' },
            { level: 3, bonus: 10, description: '보상 +10%' },
            { level: 4, bonus: 14, description: '보상 +14%' },
            { level: 5, bonus: 19, description: '보상 +19%' },
            { level: 6, bonus: 24, description: '보상 +24%' },
            { level: 7, bonus: 30, description: '보상 +30%' },
            { level: 8, bonus: 37, description: '보상 +37%' },
            { level: 9, bonus: 45, description: '보상 +45%' },
            { level: 10, bonus: 55, description: '보상 +55%' },
        ],
        baseCost: 400,
        costMultiplier: 1.7,
        baseTime: 25,
        timeMultiplier: 1.45,
        requiredLevel: 10,
        requiredResearchId: 'mastery',
        requiredResearchLevel: 5,
        color: 'pink',
        gradient: 'from-pink-500 to-rose-600'
    }
];

// ============================================
// 연구 상태 인터페이스
// ============================================
export interface ResearchProgress {
    categoryId: ResearchCategory;
    currentLevel: number;
    isResearching: boolean;
    researchStartTime: number | null;
    researchEndTime: number | null;
}

export interface CommanderResearch {
    stats: Record<ResearchCategory, ResearchProgress>;
    totalResearchPoints: number;
}

// ============================================
// 유틸리티 함수
// ============================================

import { Card } from './types';

/**
 * 진행 중인 연구가 있는지 확인 및 반환
 */
export function getActiveResearch(research: CommanderResearch): ResearchProgress | null {
    if (!research || !research.stats) return null;
    for (const key in research.stats) {
        const progress = research.stats[key as ResearchCategory];
        if (progress.isResearching) return progress;
    }
    return null;
}

/**
 * 연구 선행 조건 확인
 */
export function checkResearchDependency(stat: ResearchStat, research: CommanderResearch): { met: boolean; message?: string } {
    if (!stat.requiredResearchId) return { met: true };

    const requiredProgress = research.stats[stat.requiredResearchId];
    if (!requiredProgress || requiredProgress.currentLevel < (stat.requiredResearchLevel || 1)) {
        const requiredStat = RESEARCH_STATS.find(s => s.id === stat.requiredResearchId);
        return {
            met: false,
            message: `${requiredStat?.name} Lv.${stat.requiredResearchLevel} 연구가 먼저 필요합니다.`
        };
    }

    return { met: true };
}

/**
 * 군단 카드 기반의 연구 시간 단축 버프 계산 (0 ~ 1 사이의 값)
 * 레전더리/유니크 카드 중 'reduction' 버프가 있는 카드를 찾습니다.
 */
export function getResearchTimeBuff(deck: Card[]): number {
    let maxBuff = 0;

    for (const card of deck) {
        // 카테고리나 등급에 따른 버프 적용 (임의의 로직)
        if (card.rarity === 'legendary') {
            maxBuff = Math.max(maxBuff, 0.15); // 15% 단축
        } else if (card.rarity === 'unique') {
            maxBuff = Math.max(maxBuff, 0.25); // 25% 단축
        }

        // 특정 카드 이름이나 태그가 있다면 추가 버프 (예: 'Sora', 'GPT-5' 등)
        if (card.name.includes('Sora') || card.name.includes('GPT-4o')) {
            maxBuff = Math.max(maxBuff, 0.3); // 30% 단축
        }
    }

    return maxBuff;
}

/**
 * 연구 비용 계산
 */
export function getResearchCost(stat: ResearchStat, targetLevel: number): number {
    return Math.floor(stat.baseCost * Math.pow(stat.costMultiplier, targetLevel - 1));
}

/**
 * 연구 시간 계산 (분)
 */
export function getResearchTime(stat: ResearchStat, targetLevel: number): number {
    return Math.floor(stat.baseTime * Math.pow(stat.timeMultiplier, targetLevel - 1));
}

/**
 * 특정 카테고리의 현재 보너스 반환
 */
export function getResearchBonus(categoryId: ResearchCategory, currentLevel: number): number {
    if (currentLevel === 0) return 0;
    const stat = RESEARCH_STATS.find(s => s.id === categoryId);
    if (!stat) return 0;
    const effect = stat.effects[currentLevel - 1];
    return effect?.bonus || 0;
}

/**
 * 초기 연구 상태 생성
 */
export function createInitialResearchState(): CommanderResearch {
    const stats: Record<ResearchCategory, ResearchProgress> = {} as any;
    for (const stat of RESEARCH_STATS) {
        stats[stat.id] = {
            categoryId: stat.id,
            currentLevel: 0,
            isResearching: false,
            researchStartTime: null,
            researchEndTime: null,
        };
    }
    return {
        stats,
        totalResearchPoints: 0
    };
}

/**
 * 연구 가능한 카테고리 목록 반환 (지휘관 레벨 기반)
 */
export function getAvailableResearch(commanderLevel: number): ResearchStat[] {
    return RESEARCH_STATS.filter(stat => stat.requiredLevel <= commanderLevel);
}

/**
 * 진행 중인 연구 남은 시간 (초)
 */
export function getRemainingResearchTime(progress: ResearchProgress): number {
    if (!progress.isResearching || !progress.researchEndTime) return 0;
    const remaining = progress.researchEndTime - Date.now();
    return Math.max(0, Math.floor(remaining / 1000));
}

/**
 * 연구 완료 여부 확인
 */
export function isResearchComplete(progress: ResearchProgress): boolean {
    if (!progress.isResearching || !progress.researchEndTime) return false;
    return Date.now() >= progress.researchEndTime;
}
