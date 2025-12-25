// 카드 생성 슬롯 시스템 (티어 기반)
// Free/Pro/Ultra 티어에 따라 생성 시간과 일일 제한이 다름

import { storage } from './utils';
import { Card } from './types';
import { generateId } from './utils';
import {
    getFactionSubscription,
    canGenerateToday,
    incrementGenerationCount
} from './faction-subscription-utils';

export interface GenerationSlot {
    index: number;
    factionId: string | null;
    status: 'active' | 'waiting' | 'limit_reached' | 'empty';
    nextGenerationAt: Date | null;
    generationInterval: number; // minutes
    lastGeneratedCard?: Card;
}

/**
 * 모든 생성 슬롯 가져오기
 */
export function getGenerationSlots(): GenerationSlot[] {
    const slots = storage.get<GenerationSlot[]>('generationSlots', []);

    // 초기화되지 않았으면 5개 슬롯 생성
    if (slots.length === 0) {
        const initialSlots: GenerationSlot[] = Array.from({ length: 5 }, (_, i) => ({
            index: i,
            factionId: null,
            status: 'empty' as const,
            nextGenerationAt: null,
            generationInterval: 0
        }));
        storage.set('generationSlots', initialSlots);
        return initialSlots;
    }

    // Date 객체 변환 및 상태 업데이트
    return slots.map(slot => {
        const updated = {
            ...slot,
            nextGenerationAt: slot.nextGenerationAt ? new Date(slot.nextGenerationAt) : null
        };

        // 상태 업데이트
        if (slot.factionId) {
            const { canGenerate } = canGenerateToday(slot.factionId);
            if (!canGenerate) {
                updated.status = 'limit_reached';
                updated.nextGenerationAt = null;
            } else if (updated.nextGenerationAt && new Date() >= updated.nextGenerationAt) {
                updated.status = 'active';
            } else if (updated.nextGenerationAt) {
                updated.status = 'waiting';
            }
        }

        return updated;
    });
}

/**
 * 슬롯에 군단 배치
 */
export function assignFactionToSlot(slotIndex: number, factionId: string): { success: boolean; message: string } {
    const subscription = getFactionSubscription(factionId);

    if (!subscription) {
        return { success: false, message: '구독하지 않은 군단입니다.' };
    }

    const slots = getGenerationSlots();
    const slot = slots[slotIndex];

    if (!slot) {
        return { success: false, message: '잘못된 슬롯 인덱스입니다.' };
    }

    if (slot.factionId) {
        return { success: false, message: '이미 군단이 배치되어 있습니다.' };
    }

    // 일일 제한 확인
    const { canGenerate } = canGenerateToday(factionId);

    slot.factionId = factionId;
    slot.generationInterval = subscription.generationInterval;

    if (canGenerate) {
        slot.status = 'active';
        // 첫 배치는 즉시 생성 가능하도록 과거 시간으로 설정
        slot.nextGenerationAt = new Date(Date.now() - 1000);
    } else {
        slot.status = 'limit_reached';
        slot.nextGenerationAt = null;
    }

    storage.set('generationSlots', slots);
    return { success: true, message: '군단이 배치되었습니다.' };
}

/**
 * 슬롯에서 군단 제거
 */
export function removeFactionFromSlot(slotIndex: number): { success: boolean; message: string } {
    const slots = getGenerationSlots();
    const slot = slots[slotIndex];

    if (!slot || !slot.factionId) {
        return { success: false, message: '배치된 군단이 없습니다.' };
    }

    slot.factionId = null;
    slot.status = 'empty';
    slot.nextGenerationAt = null;
    slot.generationInterval = 0;
    delete slot.lastGeneratedCard;

    storage.set('generationSlots', slots);
    return { success: true, message: '군단이 제거되었습니다.' };
}

/**
 * 생성 가능 여부 확인
 */
export function checkGenerationStatus(slotIndex: number): { canGenerate: boolean; reason?: string } {
    const slots = getGenerationSlots();
    const slot = slots[slotIndex];

    if (!slot || !slot.factionId) {
        return { canGenerate: false, reason: '배치된 군단이 없습니다.' };
    }

    // 일일 제한 확인
    const { canGenerate: canGenerateDaily, reason: dailyReason } = canGenerateToday(slot.factionId);
    if (!canGenerateDaily) {
        return { canGenerate: false, reason: dailyReason };
    }

    if (!slot.nextGenerationAt) {
        return { canGenerate: false, reason: '생성 타이머가 설정되지 않았습니다.' };
    }

    if (new Date() < slot.nextGenerationAt) {
        return { canGenerate: false, reason: '아직 생성 시간이 되지 않았습니다.' };
    }

    return { canGenerate: true };
}

/**
 * 카드 생성
 */
export async function generateCard(slotIndex: number): Promise<{ success: boolean; card?: Card; message: string }> {
    const { canGenerate, reason } = checkGenerationStatus(slotIndex);

    if (!canGenerate) {
        return { success: false, message: reason || '생성할 수 없습니다.' };
    }

    const slots = getGenerationSlots();
    const slot = slots[slotIndex];
    const subscription = getFactionSubscription(slot.factionId!);

    if (!subscription) {
        return { success: false, message: '구독 정보를 찾을 수 없습니다.' };
    }

    // 실제 카드 생성 (등급별 확률 적용)
    const { generateRandomCard } = await import('./card-generation-system');
    const newCard = generateRandomCard(subscription.tier);

    // 생성 카운터 증가
    incrementGenerationCount(slot.factionId!);

    // 다음 생성 시간 설정
    const { canGenerate: canGenerateNext } = canGenerateToday(slot.factionId!);
    if (canGenerateNext) {
        slot.nextGenerationAt = new Date(Date.now() + subscription.generationInterval * 60 * 1000);
        slot.status = 'waiting';
    } else {
        slot.nextGenerationAt = null;
        slot.status = 'limit_reached';
    }

    slot.lastGeneratedCard = newCard;
    storage.set('generationSlots', slots);

    return {
        success: true,
        card: newCard,
        message: `${(newCard.rarity || 'COMMON').toUpperCase()} 등급 카드가 생성되었습니다!`
    };
}

/**
 * 모든 슬롯 상태 업데이트
 */
export function updateAllSlotStatuses(): void {
    const slots = getGenerationSlots();

    slots.forEach(slot => {
        if (slot.factionId) {
            const { canGenerate } = canGenerateToday(slot.factionId);

            if (!canGenerate) {
                slot.status = 'limit_reached';
                slot.nextGenerationAt = null;
            } else if (slot.nextGenerationAt && new Date() >= slot.nextGenerationAt) {
                slot.status = 'active';
            } else if (slot.nextGenerationAt) {
                slot.status = 'waiting';
            }
        }
    });

    storage.set('generationSlots', slots);
}

/**
 * 슬롯별 남은 생성 횟수 가져오기
 */
export function getRemainingGenerations(factionId: string): number {
    const { remaining } = canGenerateToday(factionId);
    return remaining || 0;
}
