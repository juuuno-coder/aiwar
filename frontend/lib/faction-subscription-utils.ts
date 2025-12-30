// AI 군단 구독 티어 시스템
// Free/Pro/Ultra 3가지 티어로 구독 관리

import { storage } from './utils';
import { getGameState, updateGameState } from './game-state';

export type SubscriptionTier = 'free' | 'pro' | 'ultra';

export interface FactionSubscription {
    factionId: string;
    tier: SubscriptionTier;
    subscribedAt: Date;
    lastBilledAt: string; // ISO string of last deduction
    dailyCost: number; // 일간 구독 비용
    dailyGenerationLimit: number;
    generationInterval: number; // minutes
    generationsToday: number;
    lastResetDate: string; // YYYY-MM-DD format
    affinity: number; // 0-100 군단 친밀도 (확률 보정)
}

/**
 * 티어별 설정 (게임 밸런스 고려)
 * - cost는 '일간 유지비'로 설정 (Option 2 반영)
 * - 최초 가입 시에도 1일치 비용 선납
 */
export const TIER_CONFIG = {
    free: {
        cost: 0,
        generationInterval: 30, // 30 minutes
        dailyLimit: 3,
        name: 'Free',
        description: '무료 티어 - 체험용'
    },
    pro: {
        cost: 40, // 일일 유지비 현실화 (Ultra의 1/5 수준으로 조정)
        generationInterval: 20, // 20 minutes
        dailyLimit: 10,
        name: 'Pro',
        description: '프로 티어 - 매일 40코인 자동 차감'
    },
    ultra: {
        cost: 200, // 5개 구독 시 1000코인 달성 (200코인/일)
        generationInterval: 10, // 10 minutes
        dailyLimit: 999999, // unlimited
        name: 'Ultra',
        description: '울트라 티어 - 매일 200코인 자동 차감'
    }
};

/**
 * 구독 저장 키 생성
 */
function getSubscriptionKey(userId?: string): string {
    if (!userId || userId === 'local-user' || userId === 'guest') {
        return 'factionSubscriptions'; // Legacy/Guest key
    }
    return `factionSubscriptions_${userId}`;
}

/**
 * 구독 중인 군단 목록 가져오기
 */
export function getSubscribedFactions(userId?: string): FactionSubscription[] {
    const key = getSubscriptionKey(userId);
    const subscriptions = storage.get<FactionSubscription[]>(key, []);

    // 날짜 변환 및 일일 카운터 리셋
    const today = new Date().toISOString().split('T')[0];

    let billingOccurred = false;
    const currentSubs = subscriptions.map(sub => {
        const subscription = {
            ...sub,
            subscribedAt: new Date(sub.subscribedAt)
        };

        // 티어 설정에서 최신 값 가져와서 동기화
        const config = TIER_CONFIG[subscription.tier];
        if (config) {
            subscription.dailyCost = config.cost;
            subscription.dailyGenerationLimit = config.dailyLimit;
            subscription.generationInterval = config.generationInterval;
        }

        // 날짜가 바뀌면 카운터 리셋
        if (subscription.lastResetDate !== today) {
            subscription.generationsToday = 0;
            subscription.lastResetDate = today;
        }

        // 친밀도 초기화
        if (subscription.affinity === undefined) {
            subscription.affinity = 0;
        }

        // 필드 초기화 (기존 데이터 호환)
        if (!subscription.lastBilledAt) {
            subscription.lastBilledAt = new Date().toISOString();
        }

        return subscription;
    });

    // 일일 구독료 정산 (마켓 이코노미: 접속 시 정산)
    const { billedSubs, updatedCoins } = processRecurringBilling(currentSubs, userId);
    if (updatedCoins !== undefined) {
        saveSubscriptions(billedSubs, userId);
        return billedSubs;
    }

    return currentSubs;
}

/**
 * 일간 반복 청구 프로세스 (Option 2)
 */
function processRecurringBilling(subscriptions: FactionSubscription[], userId?: string): { billedSubs: FactionSubscription[], updatedCoins?: number } {
    const state = getGameState(userId);
    let totalDeduction = 0;
    const now = new Date();
    let changed = false;

    const billedSubs = subscriptions.map(sub => {
        const lastBilled = new Date(sub.lastBilledAt);
        const hoursDiff = (now.getTime() - lastBilled.getTime()) / (1000 * 60 * 60);

        // 24시간 이상 지났을 경우 정산
        if (hoursDiff >= 24) {
            const daysPassed = Math.floor(hoursDiff / 24);
            const cost = sub.dailyCost * daysPassed;

            if (cost > 0) {
                totalDeduction += cost;
                changed = true;

                // 친밀도 보너스 (구독 유지 보상): 1일당 5 포인트
                const affinityBonus = daysPassed * 5;
                const newAffinity = Math.min((sub.affinity || 0) + affinityBonus, 100);

                // 마지막 청구 시간 업데이트 (다음 날로)
                const nextBilled = new Date(lastBilled);
                nextBilled.setDate(nextBilled.getDate() + daysPassed);

                return {
                    ...sub,
                    lastBilledAt: nextBilled.toISOString(),
                    affinity: newAffinity
                };
            }
        }
        return sub;
    });

    if (changed && totalDeduction > 0) {
        // 코인이 부족할 경우? 일단 차감 (마이너스 허용 혹은 0으로 수렴)
        // 여기서는 마이너스를 허용하여 사용자가 '빚'을 지게 하여 구독 취소를 유도 (마켓 이코노미)
        const newCoins = state.coins - totalDeduction;
        updateGameState({ coins: newCoins }, userId);
        return { billedSubs, updatedCoins: newCoins };
    }

    return { billedSubs };
}

/**
 * 구독 저장
 */
function saveSubscriptions(subscriptions: FactionSubscription[], userId?: string): void {
    const key = getSubscriptionKey(userId);
    storage.set(key, subscriptions);

    // Firebase 동기화 (userId가 있을 때만)
    if (userId && userId !== 'local-user' && userId !== 'guest') {
        const { saveSubscriptions: firebaseSave } = require('./firebase-db');
        firebaseSave(subscriptions).catch((err: any) => console.error('Firebase Subscription Sync Error:', err));
    }
}

/**
 * Firebase에서 구독 데이터 가져와서 로컬 동기화
 */
export async function syncSubscriptionsWithFirebase(userId: string): Promise<FactionSubscription[]> {
    if (!userId || userId === 'local-user' || userId === 'guest') return [];

    try {
        const { loadSubscriptions: firebaseLoad } = require('./firebase-db');
        const remoteSubscriptions = await firebaseLoad();

        if (remoteSubscriptions) {
            // 로컬에 저장
            const key = getSubscriptionKey(userId);
            storage.set(key, remoteSubscriptions);
            return remoteSubscriptions;
        }
    } catch (err) {
        console.error('Firebase Subscription Load Error:', err);
    }

    return getSubscribedFactions(userId);
}

/**
 * [MIGRATION] 레거시/게스트 구독 데이터를 유저 데이터로 마이그레이션
 */
export async function migrateLegacySubscriptions(userId: string): Promise<void> {
    if (!userId || userId === 'local-user' || userId === 'guest') return;

    const legacyKey = 'factionSubscriptions';
    const legacyCancelKey = 'cancellationHistory';
    const userKey = `factionSubscriptions_${userId}`;
    const userCancelKey = `cancellationHistory_${userId}`;

    // 1. 구독 정보 마이그레이션
    const legacySubs = storage.get<FactionSubscription[]>(legacyKey, []);
    if (legacySubs.length > 0) {
        const userSubs = storage.get<FactionSubscription[]>(userKey, []);

        // 병합 (중복 제거: factionId 기준)
        const combinedSubs = [...userSubs];
        legacySubs.forEach(legacySub => {
            if (!combinedSubs.find(s => s.factionId === legacySub.factionId)) {
                combinedSubs.push(legacySub);
            }
        });

        storage.set(userKey, combinedSubs);
        storage.remove(legacyKey);

        // Firebase 동기화 트리거
        const { saveSubscriptions: firebaseSave } = require('./firebase-db');
        firebaseSave(combinedSubs).catch((err: any) => console.error('Firebase Migration Sync Error:', err));

        console.log(`[Migration] Migrated ${legacySubs.length} subscriptions to user ${userId}`);
    }

    // 2. 취소 이력 마이그레이션
    const legacyHistory = storage.get<any[]>(legacyCancelKey, []);
    if (legacyHistory.length > 0) {
        const userHistory = storage.get<any[]>(userCancelKey, []);
        const combinedHistory = [...userHistory, ...legacyHistory];

        storage.set(userCancelKey, combinedHistory);
        storage.remove(legacyCancelKey);

        console.log(`[Migration] Migrated ${legacyHistory.length} cancellation history items to user ${userId}`);
    }
}

/**
 * 군단 구독하기 (티어 선택 및 변경 지원)
 */
export function subscribeFaction(
    factionId: string,
    tier: SubscriptionTier,
    userId?: string
): { success: boolean; message: string } {
    const state = getGameState(userId);
    const config = TIER_CONFIG[tier];

    // 이미 구독 중인지 확인
    const subscriptions = getSubscribedFactions(userId);
    const existingIndex = subscriptions.findIndex(sub => sub.factionId === factionId);
    const existing = existingIndex !== -1 ? subscriptions[existingIndex] : null;

    // 동일 티어면 변경 필요 없음
    if (existing && existing.tier === tier) {
        return { success: false, message: '이미 동일한 티어로 구독 중입니다.' };
    }

    // 기존 구독이 있으면 티어 변경 로직
    if (existing) {
        const oldConfig = TIER_CONFIG[existing.tier];
        const costDiff = config.cost - oldConfig.cost;

        // 업그레이드: 차액 지불
        if (costDiff > 0) {
            if (state.coins < costDiff) {
                return { success: false, message: `티어 업그레이드 비용이 부족합니다. (필요: ${costDiff.toLocaleString()} 코인)` };
            }
            updateGameState({ coins: state.coins - costDiff }, userId);
        }
        // 다운그레이드: 차액 일부 환불 (50%)
        else if (costDiff < 0) {
            const refund = Math.floor(Math.abs(costDiff) * 0.5);
            updateGameState({ coins: state.coins + refund }, userId);
        }

        // 기존 구독 업데이트 (친밀도, 생성 횟수 유지)
        const today = new Date().toISOString().split('T')[0];
        subscriptions[existingIndex] = {
            ...existing,
            tier,
            lastBilledAt: existing.lastBilledAt || new Date().toISOString(),
            dailyCost: config.cost,
            dailyGenerationLimit: config.dailyLimit,
            generationInterval: config.generationInterval,
            // 날짜가 바뀌면 생성 횟수 리셋
            generationsToday: existing.lastResetDate === today ? existing.generationsToday : 0,
            lastResetDate: today
        };

        saveSubscriptions(subscriptions, userId);

        const changeType = costDiff > 0 ? '업그레이드' : '다운그레이드';
        const costMsg = costDiff > 0
            ? ` (${costDiff.toLocaleString()} 코인 추가 지불)`
            : costDiff < 0
                ? ` (${Math.floor(Math.abs(costDiff) * 0.5).toLocaleString()} 코인 환불)`
                : '';

        return {
            success: true,
            message: `${config.name} 티어로 ${changeType}되었습니다!${costMsg}`
        };
    }

    // 신규 구독
    // 코인 확인 (Free는 무료)
    if (config.cost > 0 && state.coins < config.cost) {
        return { success: false, message: `코인이 부족합니다. (필요: ${config.cost.toLocaleString()} 코인)` };
    }

    // 코인 차감
    if (config.cost > 0) {
        updateGameState({ coins: state.coins - config.cost }, userId);
    }

    // 구독 추가
    const today = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();
    const newSubscription: FactionSubscription = {
        factionId,
        tier,
        subscribedAt: new Date(),
        lastBilledAt: nowIso,
        dailyCost: config.cost, // 일간 비용
        dailyGenerationLimit: config.dailyLimit,
        generationInterval: config.generationInterval,
        generationsToday: 0,
        lastResetDate: today,
        affinity: 0
    };

    subscriptions.push(newSubscription);
    saveSubscriptions(subscriptions, userId);

    const costMsg = config.cost > 0 ? ` (${config.cost.toLocaleString()} 코인 소모)` : ' (무료)';
    return {
        success: true,
        message: `${factionId} 군단을 ${config.name} 티어로 구독했습니다!${costMsg}`
    };
}


/**
 * 구독 취소 이력 관리
 */
interface CancellationHistory {
    factionId: string;
    cancelledAt: Date;
    refundAmount: number;
}

function getCancellationKey(userId?: string): string {
    if (!userId || userId === 'local-user' || userId === 'guest') {
        return 'cancellationHistory';
    }
    return `cancellationHistory_${userId}`;
}

function getCancellationHistory(userId?: string): CancellationHistory[] {
    const key = getCancellationKey(userId);
    return storage.get<CancellationHistory[]>(key, []).map(h => ({
        ...h,
        cancelledAt: new Date(h.cancelledAt)
    }));
}

function saveCancellationHistory(history: CancellationHistory[], userId?: string): void {
    const key = getCancellationKey(userId);
    storage.set(key, history);
}

function hasEverCancelled(factionId: string, userId?: string): boolean {
    const history = getCancellationHistory(userId);
    return history.some(h => h.factionId === factionId);
}

/**
 * 환불 금액 계산
 * - 첫 구독 취소: 50% 환불
 * - 이후 취소: 사용 시간에 비례하여 환불 (30일 기준)
 */
function calculateRefund(subscription: FactionSubscription, userId?: string): number {
    const { dailyCost, subscribedAt, factionId } = subscription;

    // Free 티어는 환불 없음
    if (dailyCost === 0) {
        return 0;
    }

    const isFirstCancellation = !hasEverCancelled(factionId, userId);

    if (isFirstCancellation) {
        // 첫 취소: 50% 환불
        return Math.floor(dailyCost * 0.5);
    } else {
        // 이후 취소: 당일 취소는 전액 환불, 다음날부터는 환불 없음
        const now = new Date();
        const subscriptionStart = new Date(subscribedAt);
        const hoursUsed = (now.getTime() - subscriptionStart.getTime()) / (1000 * 60 * 60);

        // 24시간 이내 취소: 전액 환불
        if (hoursUsed < 24) {
            return dailyCost;
        }

        // 24시간 이후: 환불 없음
        return 0;
    }
}

/**
 * 군단 구독 취소 (환불 포함)
 */
export function unsubscribeFaction(factionId: string, userId?: string): { success: boolean; message: string; refund?: number } {
    const subscriptions = getSubscribedFactions(userId);
    const subscription = subscriptions.find(sub => sub.factionId === factionId);

    if (!subscription) {
        return { success: false, message: '구독 중이 아닌 군단입니다.' };
    }

    // 환불 금액 계산
    const refundAmount = calculateRefund(subscription, userId);

    // 구독 제거
    const filtered = subscriptions.filter(sub => sub.factionId !== factionId);
    saveSubscriptions(filtered, userId);

    // 취소 이력 저장
    const history = getCancellationHistory(userId);
    history.push({
        factionId,
        cancelledAt: new Date(),
        refundAmount
    });
    saveCancellationHistory(history, userId);

    // 코인 환불
    if (refundAmount > 0) {
        const state = getGameState(userId);
        updateGameState({ coins: state.coins + refundAmount }, userId);
    }

    const isFirstCancellation = history.filter(h => h.factionId === factionId).length === 1;
    const refundMsg = refundAmount > 0
        ? ` ${refundAmount.toLocaleString()} 코인이 환불되었습니다. ${isFirstCancellation ? '(첫 취소 50% 환불)' : `(사용 기간 기준 환불)`}`
        : '';

    return {
        success: true,
        message: `구독이 취소되었습니다.${refundMsg}`,
        refund: refundAmount
    };
}

/**
 * 총 일간 구독 비용 계산
 */
export function getTotalSubscriptionCost(userId?: string): number {
    const subscriptions = getSubscribedFactions(userId);
    return subscriptions.reduce((total, sub) => total + sub.dailyCost, 0);
}

/**
 * 특정 군단의 구독 정보 가져오기
 */
export function getFactionSubscription(factionId: string, userId?: string): FactionSubscription | null {
    const subscriptions = getSubscribedFactions(userId);
    return subscriptions.find(sub => sub.factionId === factionId) || null;
}

/**
 * 군단 구독 여부 확인
 */
export function hasActiveFactionSubscription(factionId: string, userId?: string): boolean {
    return getFactionSubscription(factionId, userId) !== null;
}

/**
 * 일일 생성 가능 여부 확인
 */
export function canGenerateToday(factionId: string, userId?: string): { canGenerate: boolean; reason?: string; remaining?: number } {
    const subscription = getFactionSubscription(factionId, userId);

    if (!subscription) {
        return { canGenerate: false, reason: '구독 중이 아닌 군단입니다.' };
    }

    const remaining = subscription.dailyGenerationLimit - subscription.generationsToday;

    if (remaining <= 0) {
        return { canGenerate: false, reason: '오늘의 생성 횟수를 모두 사용했습니다.', remaining: 0 };
    }

    return { canGenerate: true, remaining };
}

/**
 * 생성 카운터 증가
 */
export function incrementGenerationCount(factionId: string, userId?: string): void {
    const subscriptions = getSubscribedFactions(userId);
    const subscription = subscriptions.find(sub => sub.factionId === factionId);

    if (subscription) {
        subscription.generationsToday += 1;

        // 카드 생성 시 친밀도 증가 (Legacy - UI 호환성용)
        subscription.affinity = Math.min((subscription.affinity || 0) + 1, 100);
        saveSubscriptions(subscriptions, userId);

        // [NEW] 전역 지휘관 숙련도(Mastery) 증가
        // 어떤 군단을 사용하든 지휘관의 총괄 능력이 상승하여 모든 군단에 이점 제공
        const state = getGameState(userId);

        // 연구 보너스 적용 (리더십: 숙련도 획득 속도 증가)
        let bonusMultiplier = 1;
        if (state.research?.stats?.leadership) {
            const { getResearchBonus } = require('./research-system');
            const bonus = getResearchBonus('leadership', state.research.stats.leadership.currentLevel);
            bonusMultiplier = 1 + (bonus / 100);
        }

        const baseGain = 1;
        const actualGain = baseGain * bonusMultiplier;
        const newMastery = Math.min((state.commanderMastery || 0) + actualGain, 100);

        if (newMastery > (state.commanderMastery || 0)) {
            updateGameState({ commanderMastery: newMastery }, userId);
        }
    }
}

/**
 * 티어별 통계
 */
export function getSubscriptionStats(userId?: string): {
    total: number;
    byTier: Record<SubscriptionTier, number>;
    totalCost: number;
} {
    const subscriptions = getSubscribedFactions(userId);

    return {
        total: subscriptions.length,
        byTier: {
            free: subscriptions.filter(s => s.tier === 'free').length,
            pro: subscriptions.filter(s => s.tier === 'pro').length,
            ultra: subscriptions.filter(s => s.tier === 'ultra').length
        },
        totalCost: getTotalSubscriptionCost(userId)
    };
}
