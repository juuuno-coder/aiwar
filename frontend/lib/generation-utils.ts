import aiFactionsData from '@/data/ai-factions.json';

// 카드 생성 슬롯 시스템 (티어 기반)
// Free/Pro/Ultra 티어에 따라 생성 시간과 일일 제한이 다름

import { storage } from './utils';
import { gameStorage } from './game-storage';
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
 * 생성 슬롯 저장 키 생성
 */
function getSlotsKey(userId?: string): string {
    if (!userId || userId === 'local-user' || userId === 'guest') {
        return 'generationSlots'; // Legacy/Guest key
    }
    return `generationSlots_${userId}`;
}

/**
 * 모든 생성 슬롯 가져오기
 */
export function getGenerationSlots(userId?: string): GenerationSlot[] {
    const key = getSlotsKey(userId);
    const slots = storage.get<GenerationSlot[]>(key, []);

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
            const { canGenerate } = canGenerateToday(slot.factionId, userId);
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
 * [MIGRATION] 레거시/게스트 생성 슬롯 데이터를 유저 데이터로 마이그레이션
 */
export function migrateLegacySlots(userId: string): void {
    if (!userId || userId === 'local-user' || userId === 'guest') return;

    const legacyKey = 'generationSlots';
    const userKey = `generationSlots_${userId}`;

    const legacySlots = storage.get<GenerationSlot[]>(legacyKey, []);
    if (legacySlots.length > 0) {
        // 이미 유저 데이터가 있는지 확인
        const userSlots = storage.get<GenerationSlot[]>(userKey, []);

        if (userSlots.length === 0) {
            // 유저 데이터가 없으면 레거시로 덮어쓰기
            storage.set(userKey, legacySlots);
            storage.remove(legacyKey);
            console.log(`[Migration] Migrated ${legacySlots.length} generation slots to user ${userId}`);
        } else {
            // 이미 유저 데이터가 있으면? 
            // 여기서는 슬롯은 소모성 데이터이므로 레거시를 비우기만 하거나
            // 유저의 비어있는 슬롯을 레거시 데이터로 채울 수 있음

            let migratedCount = 0;
            const updatedUserSlots = [...userSlots];

            legacySlots.forEach(legacySlot => {
                if (legacySlot.factionId) {
                    // 유저 슬롯 중 빈 곳 찾기
                    const emptyIndex = updatedUserSlots.findIndex(s => !s.factionId);
                    if (emptyIndex !== -1) {
                        updatedUserSlots[emptyIndex] = {
                            ...legacySlot,
                            index: emptyIndex
                        };
                        migratedCount++;
                    }
                }
            });

            if (migratedCount > 0) {
                storage.set(userKey, updatedUserSlots);
            }

            storage.remove(legacyKey);
            console.log(`[Migration] Merged ${migratedCount} active generation slots from legacy to user ${userId}`);
        }
    }
}

/**
 * 슬롯 데이터 저장
 */
function saveSlots(slots: GenerationSlot[], userId?: string): void {
    const key = getSlotsKey(userId);
    storage.set(key, slots);
}

/**
 * 슬롯에 군단 배치
 */
export function assignFactionToSlot(slotIndex: number, factionId: string, userId?: string): { success: boolean; message: string } {
    const subscription = getFactionSubscription(factionId, userId);

    if (!subscription) {
        return { success: false, message: '구독하지 않은 군단입니다.' };
    }

    const slots = getGenerationSlots(userId);
    const slot = slots[slotIndex];

    if (!slot) {
        return { success: false, message: '잘못된 슬롯 인덱스입니다.' };
    }

    if (slot.factionId) {
        return { success: false, message: '이미 군단이 배치되어 있습니다.' };
    }

    // 일일 제한 확인
    const { canGenerate } = canGenerateToday(factionId, userId);

    slot.factionId = factionId;
    slot.generationInterval = subscription.generationInterval;

    if (canGenerate) {
        slot.status = 'waiting';
        // 첫 배치 시에도 대기 시간 적용 (30분/20분/10분)
        slot.nextGenerationAt = new Date(Date.now() + subscription.generationInterval * 60 * 1000);
    } else {
        slot.status = 'limit_reached';
        slot.nextGenerationAt = null;
    }

    saveSlots(slots, userId);
    return { success: true, message: '군단이 배치되었습니다.' };
}

/**
 * 슬롯에서 군단 제거
 */
export function removeFactionFromSlot(slotIndex: number, userId?: string): { success: boolean; message: string } {
    const slots = getGenerationSlots(userId);
    const slot = slots[slotIndex];

    if (!slot || !slot.factionId) {
        return { success: false, message: '배치된 군단이 없습니다.' };
    }

    slot.factionId = null;
    slot.status = 'empty';
    slot.nextGenerationAt = null;
    slot.generationInterval = 0;
    delete slot.lastGeneratedCard;

    saveSlots(slots, userId);
    return { success: true, message: '군단이 제거되었습니다.' };
}

/**
 * 생성 가능 여부 확인
 */
export function checkGenerationStatus(slotIndex: number, userId?: string): { canGenerate: boolean; reason?: string } {
    const slots = getGenerationSlots(userId);
    const slot = slots[slotIndex];

    if (!slot || !slot.factionId) {
        return { canGenerate: false, reason: '배치된 군단이 없습니다.' };
    }

    // 일일 제한 확인
    const { canGenerate: canGenerateDaily, reason: dailyReason } = canGenerateToday(slot.factionId, userId);
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
export async function generateCard(slotIndex: number, userId?: string): Promise<{ success: boolean; card?: Card; message: string }> {
    const { canGenerate, reason } = checkGenerationStatus(slotIndex, userId);

    if (!canGenerate) {
        return { success: false, message: reason || '생성할 수 없습니다.' };
    }

    const slots = getGenerationSlots(userId);
    const slot = slots[slotIndex];
    const subscription = getFactionSubscription(slot.factionId!, userId);

    if (!subscription) {
        return { success: false, message: '구독 정보를 찾을 수 없습니다.' };
    }

    const factionData = (aiFactionsData as { factions: any[] }).factions.find((f: any) => f.id === slot.factionId);

    // 실제 카드 생성 (등급별 확률 적용 + 친밀도 + 군단 효과)
    // Dynamic import removed to avoid potential client/server mismatch issues in next.js app dir if not handled carefully.
    // Assuming card-generation-system is safe to import at top level or handling it cleaner.
    const { generateRandomCard } = require('./card-generation-system');

    // Research Stat Extraction
    const gameState = await gameStorage.loadGameState(userId);
    const researchStats = gameState.research?.stats;
    const researchBonuses = {
        efficiency: researchStats?.efficiency?.currentLevel || 0,
        creativity: researchStats?.insight?.currentLevel || 0, // Insight maps to Creativity
        function: researchStats?.mastery?.currentLevel || 0    // Mastery maps to Function
    };

    // 친밀도와 군단 효과를 전달하여 생성
    const newCard = generateRandomCard(subscription.tier, subscription.affinity || 0, factionData?.effects, researchBonuses);


    // 생성 카운터 증가
    incrementGenerationCount(slot.factionId!, userId);

    // 다음 생성 시간 설정
    const { canGenerate: canGenerateNext } = canGenerateToday(slot.factionId!, userId);
    if (canGenerateNext) {
        slot.nextGenerationAt = new Date(Date.now() + subscription.generationInterval * 60 * 1000);
        slot.status = 'waiting';
    } else {
        slot.nextGenerationAt = null;
        slot.status = 'limit_reached';
    }

    slot.lastGeneratedCard = newCard;
    saveSlots(slots, userId);

    // Check for active bonuses
    const hasBonuses = researchBonuses.efficiency > 1 || researchBonuses.creativity > 1 || researchBonuses.function > 1;
    const bonusText = hasBonuses ? `\n(연구 보너스 적용됨! +${Math.max(researchBonuses.efficiency, researchBonuses.creativity, researchBonuses.function) * 3} 스탯)` : '';

    return {
        success: true,
        card: newCard,
        message: `${(newCard.rarity || 'COMMON').toUpperCase()} 등급 카드가 생성되었습니다!${bonusText}`
    };
}

/**
 * 모든 슬롯 상태 업데이트
 */
export function updateAllSlotStatuses(userId?: string): void {
    const slots = getGenerationSlots(userId);

    slots.forEach(slot => {
        if (slot.factionId) {
            const { canGenerate } = canGenerateToday(slot.factionId, userId);

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

    saveSlots(slots, userId);
}

/**
 * 슬롯별 남은 생성 횟수 가져오기
 */
export function getRemainingGenerations(factionId: string, userId?: string): number {
    const { remaining } = canGenerateToday(factionId, userId);
    return remaining || 0;
}
