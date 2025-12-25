// 슬롯 시스템 유틸리티

import { getGameState, saveGameState, spendTokens } from './game-state';
import { AICategory, AIFaction } from './faction-types';
import factionsData from '@/data/ai-factions.json';

export interface SlotData {
    slotIndex: number; // 0-4
    factionId: string | null;
    placedAt: number; // timestamp
    lastCollectedAt?: number;
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

    // 구독 여부 확인 (기존 개방 로직 대체)
    const isSubscribed = state.unlockedFactions?.includes(factionId);
    if (!isSubscribed) {
        return { success: false, message: '개방된 AI 군단만 배치할 수 있습니다.' };
    }

    // 슬롯 데이터 초기화 (필요시)
    if (!state.slots) {
        state.slots = Array(5).fill(null).map((_, i) => ({
            slotIndex: i,
            factionId: null,
            placedAt: 0,
            lastCollectedAt: Date.now() // 생성 시작 시간
        }));
    }

    // 슬롯에 배치
    state.slots[slotIndex] = {
        slotIndex,
        factionId,
        placedAt: Date.now(),
        lastCollectedAt: Date.now()
    };

    saveGameState(state);

    return {
        success: true,
        message: `${faction.displayName}을(를) 슬롯 ${slotIndex + 1}에 배치했습니다. 카드가 생성되기 시작합니다.`
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
        placedAt: 0,
        lastCollectedAt: 0
    };

    saveGameState(state);

    return {
        success: true,
        message: '슬롯에서 제거했습니다. 생성이 중단됩니다.'
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
            placedAt: 0,
            lastCollectedAt: 0
        }));
    }

    return state.slots;
}

/**
 * 슬롯 시너지 계산
 */
export function calculateSynergy(): SynergyBonus {
    // ... (기존 로직 유지) ...
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

    const categoryCount: Record<string, number> = {};
    for (const faction of placedFactions) {
        categoryCount[faction.category] = (categoryCount[faction.category] || 0) + 1;
    }

    let totalTimeReduction = 0;
    let totalPowerBonus = 0;
    let totalFragmentBonus = 0;

    for (const faction of placedFactions) {
        totalTimeReduction += faction.effects.timeReduction;
        totalPowerBonus += faction.effects.powerBonus;
        totalFragmentBonus += faction.effects.fragmentBonus;
    }

    let synergyMultiplier = 1.0;
    let synergyTitle: string | undefined;
    let synergyDescription = '';

    for (const [category, count] of Object.entries(categoryCount)) {
        if (count >= 5) {
            synergyMultiplier = 2.2;
            synergyTitle = `${category.toUpperCase()} 마스터`;
            synergyDescription = `같은 카테고리 5개: 효과 +120%`;
        } else if (count >= 4) {
            synergyMultiplier = 1.8;
            synergyTitle = `${category.toUpperCase()} 전문가`;
            synergyDescription = `같은 카테고리 4개: 효과 +80%`;
        } else if (count >= 3) {
            synergyMultiplier = 1.5;
            synergyTitle = `${category.toUpperCase()} 특화`;
            synergyDescription = `같은 카테고리 3개: 효과 +50%`;
        } else if (count >= 2) {
            synergyMultiplier = 1.25;
            synergyDescription = `같은 카테고리 2개: 효과 +25%`;
        }
    }

    const uniqueCategories = Object.keys(categoryCount).length;
    if (uniqueCategories === 5 && placedFactions.length === 5) {
        synergyMultiplier = 1.2;
        synergyTitle = 'AI 올라운더';
        synergyDescription = '5개 모두 다른 카테고리: 모든 효과 +20%';
    }

    return {
        timeReduction: Math.min(totalTimeReduction * synergyMultiplier, 0.9), // 최대 90% 감소 제한
        powerBonus: totalPowerBonus * synergyMultiplier,
        fragmentBonus: Math.floor(totalFragmentBonus * synergyMultiplier),
        synergyTitle,
        description: synergyDescription || '시너지 효과 없음'
    };
}

/**
 * 카드가 생성되었는지 확인하고 진척도 반환 (0~100)
 */
export function getGenerationProgress(slotIndex: number): number {
    const slots = getSlots();
    const slot = slots[slotIndex];
    if (!slot || !slot.factionId) return 0;

    const faction = getFaction(slot.factionId);
    if (!faction) return 0;

    // 시너지 효과로 시간 감소 적용
    const synergy = calculateSynergy();
    const baseIntervalMinutes = faction.generationInterval || 180; // 기본 3시간
    const reducedIntervalMinutes = baseIntervalMinutes * (1 - synergy.timeReduction);
    const intervalMs = reducedIntervalMinutes * 60 * 1000;

    const elapsed = Date.now() - (slot.lastCollectedAt || slot.placedAt);
    const progress = Math.min((elapsed / intervalMs) * 100, 100);

    return progress;
}

/**
 * 생성된 카드 수확
 */
export async function collectCard(slotIndex: number): Promise<{ success: boolean; card?: any; message: string }> {
    const progress = getGenerationProgress(slotIndex);
    if (progress < 100) {
        return { success: false, message: '아직 카드가 생성되지 않았습니다.' };
    }

    const slots = getSlots();
    const slot = slots[slotIndex];
    if (!slot || !slot.factionId) return { success: false, message: '슬롯 오류' };

    const faction = getFaction(slot.factionId);
    if (!faction) return { success: false, message: '군단 정보 없음' };

    // 카드 생성 로직 (확률 기반 등급)
    const synergy = calculateSynergy();
    // TODO: 실제 카드 생성 함수 호출 (game-storage 등에서)
    // 여기서는 간단히 모의 객체 반환
    const newCard = {
        name: `${faction.displayName} 카드`,
        rarity: Math.random() > 0.9 ? 'legendary' : (Math.random() > 0.7 ? 'epic' : 'rare'),
        factionId: faction.id
    };

    // 슬롯 타이머 리셋
    const state = getGameState();
    if (state.slots && state.slots[slotIndex]) {
        state.slots[slotIndex].lastCollectedAt = Date.now();
        saveGameState(state);
    }

    // 실제로는 인벤토리에 추가해야 함 (game-storage 호출 필요)
    // const { gameStorage } = await import('@/lib/game-storage');
    // await gameStorage.addCardToInventory(newCard);

    return { success: true, card: newCard, message: `${newCard.rarity} 등급 카드를 획득했습니다!` };
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

    // 구독 여부 확인 (기존 개방 로직 대체)
    const isSubscribed = state.unlockedFactions?.includes(factionId);
    if (!isSubscribed) {
        return { canPlace: false, reason: '개방된 AI 군단만 배치할 수 있습니다.' };
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
