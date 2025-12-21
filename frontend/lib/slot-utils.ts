// 슬롯 시스템 유틸리티

import { getGameState, saveGameState, spendTokens } from './game-state';
import { AICategory, AIFaction } from './faction-types';
import factionsData from '@/data/ai-factions.json';

export interface SlotData {
    slotIndex: number; // 0-4
    factionId: string | null;
    placedAt: number; // timestamp
}

export interface SynergyBonus {
    timeReduction: number;
    powerBonus: number;
    fragmentBonus: number;
    synergyTitle?: string;
    description: string;
}

/**
 * 모든 AI 군단 가져오기
 */
export function getAllFactions(): AIFaction[] {
    return factionsData.factions as AIFaction[];
}

/**
 * 특정 AI 군단 가져오기
 */
export function getFaction(factionId: string): AIFaction | null {
    const factions = getAllFactions();
    return factions.find(f => f.id === factionId) || null;
}

/**
 * 카테고리별 AI 군단 가져오기
 */
export function getFactionsByCategory(category: AICategory): AIFaction[] {
    const factions = getAllFactions();
    return factions.filter(f => f.category === category);
}

/**
 * 슬롯에 AI 군단 배치
 */
export function placeFactonInSlot(slotIndex: number, factionId: string): {
    success: boolean;
    message: string;
} {
    if (slotIndex < 0 || slotIndex > 4) {
        return { success: false, message: '잘못된 슬롯 번호입니다.' };
    }

    const faction = getFaction(factionId);
    if (!faction) {
        return { success: false, message: 'AI 군단을 찾을 수 없습니다.' };
    }

    const state = getGameState();

    // 해금 여부 확인
    if (!state.unlockedFactions.includes(factionId)) {
        return { success: false, message: '먼저 AI 군단을 해금해야 합니다.' };
    }

    // 슬롯 배치 비용 확인 및 차감
    const spendResult = spendTokens(faction.slotCost);
    if (!spendResult.success) {
        return { success: false, message: `토큰이 부족합니다. (필요: ${faction.slotCost} 토큰)` };
    }

    // 슬롯 데이터 초기화 (필요시)
    if (!state.slots) {
        state.slots = Array(5).fill(null).map((_, i) => ({
            slotIndex: i,
            factionId: null,
            placedAt: 0
        }));
    }

    // 슬롯에 배치
    state.slots[slotIndex] = {
        slotIndex,
        factionId,
        placedAt: Date.now()
    };

    saveGameState(state);

    return {
        success: true,
        message: `${faction.displayName}을(를) 슬롯 ${slotIndex + 1}에 배치했습니다.`
    };
}

/**
 * 슬롯에서 AI 군단 제거
 */
export function removeFactonFromSlot(slotIndex: number): {
    success: boolean;
    message: string;
} {
    if (slotIndex < 0 || slotIndex > 4) {
        return { success: false, message: '잘못된 슬롯 번호입니다.' };
    }

    const state = getGameState();

    if (!state.slots || !state.slots[slotIndex]?.factionId) {
        return { success: false, message: '슬롯이 비어있습니다.' };
    }

    // 슬롯 비우기
    state.slots[slotIndex] = {
        slotIndex,
        factionId: null,
        placedAt: 0
    };

    saveGameState(state);

    return {
        success: true,
        message: '슬롯에서 제거했습니다.'
    };
}

/**
 * 현재 슬롯 상태 가져오기
 */
export function getSlots(): SlotData[] {
    const state = getGameState();

    if (!state.slots) {
        // 초기화
        return Array(5).fill(null).map((_, i) => ({
            slotIndex: i,
            factionId: null,
            placedAt: 0
        }));
    }

    return state.slots;
}

/**
 * 슬롯 시너지 계산
 */
export function calculateSynergy(): SynergyBonus {
    const slots = getSlots();
    const placedFactions = slots
        .filter(s => s.factionId)
        .map(s => getFaction(s.factionId!))
        .filter(f => f !== null) as AIFaction[];

    if (placedFactions.length === 0) {
        return {
            timeReduction: 0,
            powerBonus: 0,
            fragmentBonus: 0,
            description: '배치된 AI 군단이 없습니다.'
        };
    }

    // 카테고리별 개수 세기
    const categoryCount: Record<string, number> = {};
    for (const faction of placedFactions) {
        categoryCount[faction.category] = (categoryCount[faction.category] || 0) + 1;
    }

    // 기본 효과 합산
    let totalTimeReduction = 0;
    let totalPowerBonus = 0;
    let totalFragmentBonus = 0;

    for (const faction of placedFactions) {
        totalTimeReduction += faction.effects.timeReduction;
        totalPowerBonus += faction.effects.powerBonus;
        totalFragmentBonus += faction.effects.fragmentBonus;
    }

    // 시너지 보너스 계산
    let synergyMultiplier = 1.0;
    let synergyTitle: string | undefined;
    let synergyDescription = '';

    // 같은 카테고리 시너지
    for (const [category, count] of Object.entries(categoryCount)) {
        if (count >= 5) {
            synergyMultiplier = 2.2; // +120%
            synergyTitle = `${category.toUpperCase()} 마스터`;
            synergyDescription = `같은 카테고리 5개: 효과 +120%`;
        } else if (count >= 4) {
            synergyMultiplier = Math.max(synergyMultiplier, 1.8); // +80%
            synergyTitle = `${category.toUpperCase()} 전문가`;
            synergyDescription = `같은 카테고리 4개: 효과 +80%`;
        } else if (count >= 3) {
            synergyMultiplier = Math.max(synergyMultiplier, 1.5); // +50%
            synergyTitle = `${category.toUpperCase()} 특화`;
            synergyDescription = `같은 카테고리 3개: 효과 +50%`;
        } else if (count >= 2) {
            synergyMultiplier = Math.max(synergyMultiplier, 1.25); // +25%
            synergyDescription = `같은 카테고리 2개: 효과 +25%`;
        }
    }

    // 모든 카테고리 다른 경우 (올라운더)
    const uniqueCategories = Object.keys(categoryCount).length;
    if (uniqueCategories === 5 && placedFactions.length === 5) {
        synergyMultiplier = 1.2; // 모든 효과 20%
        synergyTitle = 'AI 올라운더';
        synergyDescription = '5개 모두 다른 카테고리: 모든 효과 +20%';
    }

    return {
        timeReduction: totalTimeReduction * synergyMultiplier,
        powerBonus: totalPowerBonus * synergyMultiplier,
        fragmentBonus: Math.floor(totalFragmentBonus * synergyMultiplier),
        synergyTitle,
        description: synergyDescription || '시너지 효과 없음'
    };
}

/**
 * 슬롯 배치 가능 여부 확인
 */
export function canPlaceInSlot(slotIndex: number, factionId: string): {
    canPlace: boolean;
    reason?: string;
} {
    if (slotIndex < 0 || slotIndex > 4) {
        return { canPlace: false, reason: '잘못된 슬롯 번호입니다.' };
    }

    const faction = getFaction(factionId);
    if (!faction) {
        return { canPlace: false, reason: 'AI 군단을 찾을 수 없습니다.' };
    }

    const state = getGameState();

    // 해금 여부
    if (!state.unlockedFactions.includes(factionId)) {
        return { canPlace: false, reason: '먼저 AI 군단을 해금해야 합니다.' };
    }

    // 토큰 확인
    if (state.tokens < faction.slotCost) {
        return { canPlace: false, reason: `토큰이 부족합니다. (필요: ${faction.slotCost} 토큰)` };
    }

    return { canPlace: true };
}

/**
 * 슬롯에 배치된 AI 군단 정보 가져오기
 */
export function getSlotFaction(slotIndex: number): AIFaction | null {
    const slots = getSlots();
    const slot = slots[slotIndex];

    if (!slot || !slot.factionId) {
        return null;
    }

    return getFaction(slot.factionId);
}
