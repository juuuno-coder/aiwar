// 유니크 유닛 시스템 유틸리티

import { Card } from './types';
import { AICategory } from './faction-types';
import { getGameState, saveGameState } from './game-state';
import { calculateSynergy } from './slot-utils';
import uniqueUnitsData from '@/data/unique-units.json';

export interface UniqueUnitData {
    id: string;
    name: string;
    category: AICategory;
    description: string;
    basePower: number;
    powerMultiplier: number;
    specialSkill: {
        name: string;
        description: string;
        effect: string;
    };
    rarity: 'epic' | 'legendary';
    iconEmoji: string;
}

/**
 * 모든 유니크 유닛 데이터 가져오기
 */
export function getAllUniqueUnits(): UniqueUnitData[] {
    return uniqueUnitsData.uniqueUnits as UniqueUnitData[];
}

/**
 * 카테고리별 유니크 유닛 가져오기
 */
export function getUniqueUnitByCategory(category: AICategory): UniqueUnitData | null {
    const units = getAllUniqueUnits();
    return units.find(u => u.category === category) || null;
}

/**
 * 시너지 기반 생성 시간 계산
 */
export function calculateGenerationTime(): number {
    const baseTime = 86400; // 24시간 (초)
    const synergy = calculateSynergy();
    const reduction = synergy.timeReduction; // 0 ~ 0.95

    return Math.floor(baseTime * (1 - reduction));
}

/**
 * 유니크 유닛 생성 시작
 */
export function startUniqueUnitGeneration(): {
    success: boolean;
    message: string;
} {
    const state = getGameState();

    // 이미 생성 중인지 확인
    if (state.uniqueUnit?.isGenerating && !state.uniqueUnit.claimed) {
        return {
            success: false,
            message: '이미 유니크 유닛을 생성 중입니다.'
        };
    }

    // 슬롯 시너지 확인
    const synergy = calculateSynergy();

    // 가장 많은 카테고리 찾기
    const slots = state.slots || [];
    const categoryCount: Record<string, number> = {};

    for (const slot of slots) {
        if (slot.factionId) {
            // 카테고리 추출 (간단한 매핑)
            const category = getCategoryFromFactionId(slot.factionId);
            if (category) {
                categoryCount[category] = (categoryCount[category] || 0) + 1;
            }
        }
    }

    // 가장 많은 카테고리 선택 (없으면 super)
    let selectedCategory: AICategory = 'super';
    let maxCount = 0;

    for (const [category, count] of Object.entries(categoryCount)) {
        if (count > maxCount) {
            maxCount = count;
            selectedCategory = category as AICategory;
        }
    }

    // 생성 시간 계산
    const generationTime = calculateGenerationTime();
    const now = Date.now();

    state.uniqueUnit = {
        isGenerating: true,
        startTime: now,
        endTime: now + (generationTime * 1000), // 밀리초로 변환
        category: selectedCategory,
        claimed: false
    };

    saveGameState(state);

    return {
        success: true,
        message: `유니크 유닛 생성을 시작했습니다! (${formatTime(generationTime)})`
    };
}

/**
 * 유니크 유닛 생성 진행도
 */
export function getUniqueUnitProgress(): {
    isGenerating: boolean;
    isComplete: boolean;
    progress: number; // 0-100
    remainingTime: number; // 초
    category: AICategory | null;
    unitData: UniqueUnitData | null;
} {
    const state = getGameState();

    if (!state.uniqueUnit || !state.uniqueUnit.isGenerating) {
        return {
            isGenerating: false,
            isComplete: false,
            progress: 0,
            remainingTime: 0,
            category: null,
            unitData: null
        };
    }

    const now = Date.now();
    const totalTime = state.uniqueUnit.endTime - state.uniqueUnit.startTime;
    const elapsed = now - state.uniqueUnit.startTime;
    const remaining = Math.max(0, state.uniqueUnit.endTime - now);

    const progress = Math.min(100, Math.floor((elapsed / totalTime) * 100));
    const isComplete = remaining === 0;

    const category = state.uniqueUnit.category as AICategory;
    const unitData = category ? getUniqueUnitByCategory(category) : null;

    return {
        isGenerating: true,
        isComplete,
        progress,
        remainingTime: Math.floor(remaining / 1000),
        category,
        unitData
    };
}

/**
 * 유니크 유닛 수령
 */
export function claimUniqueUnit(): {
    success: boolean;
    message: string;
    card?: Card;
} {
    const state = getGameState();

    if (!state.uniqueUnit || !state.uniqueUnit.isGenerating) {
        return {
            success: false,
            message: '생성 중인 유니크 유닛이 없습니다.'
        };
    }

    const progress = getUniqueUnitProgress();

    if (!progress.isComplete) {
        return {
            success: false,
            message: '아직 생성이 완료되지 않았습니다.'
        };
    }

    if (state.uniqueUnit.claimed) {
        return {
            success: false,
            message: '이미 수령한 유닛입니다.'
        };
    }

    // 유니크 유닛 카드 생성
    const unitData = progress.unitData;
    if (!unitData) {
        return {
            success: false,
            message: '유닛 데이터를 찾을 수 없습니다.'
        };
    }

    const card: Card = {
        id: `unique-${Date.now()}`,
        templateId: unitData.id,
        ownerId: state.userId,
        level: 1,
        experience: 0,
        stats: {
            creativity: Math.floor(unitData.basePower * 0.2),
            accuracy: Math.floor(unitData.basePower * 0.2),
            speed: Math.floor(unitData.basePower * 0.2),
            stability: Math.floor(unitData.basePower * 0.2),
            ethics: Math.floor(unitData.basePower * 0.2),
            totalPower: unitData.basePower
        },
        rarity: unitData.rarity,
        acquiredAt: new Date(),
        isLocked: false,
        isUnique: true,
        specialSkill: unitData.specialSkill
    };

    // 인벤토리에 추가
    state.inventory.push(card);

    // 수령 완료 표시
    state.uniqueUnit.claimed = true;

    saveGameState(state);

    return {
        success: true,
        message: `${unitData.name}을(를) 획득했습니다!`,
        card
    };
}

/**
 * 시간 포맷팅 (초 → 시:분:초)
 */
export function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}시간 ${minutes}분`;
    } else if (minutes > 0) {
        return `${minutes}분 ${secs}초`;
    } else {
        return `${secs}초`;
    }
}

/**
 * 팩션 ID로부터 카테고리 추출 (간단한 매핑)
 */
function getCategoryFromFactionId(factionId: string): AICategory | null {
    // 슈퍼 모델
    if (['gemini', 'chatgpt', 'claude', 'grok'].includes(factionId)) {
        return 'super';
    }
    // 이미지 모델
    if (['midjourney', 'dalle', 'stable-diffusion', 'flux'].includes(factionId)) {
        return 'image';
    }
    // 영상 모델
    if (['kling', 'runway', 'pika', 'sora'].includes(factionId)) {
        return 'video';
    }
    // 사운드 모델
    if (['suno', 'udio', 'elevenlabs', 'musicgen'].includes(factionId)) {
        return 'audio';
    }
    // 코딩 모델
    if (['cursor', 'copilot', 'replit', 'codeium'].includes(factionId)) {
        return 'coding';
    }

    return null;
}
