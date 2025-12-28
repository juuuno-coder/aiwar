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
 * 구독 중인 군단 목록 가져오기
 */
export function getSubscribedFactions(): FactionSubscription[] {
    const subscriptions = storage.get<FactionSubscription[]>('factionSubscriptions', []);

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
    const { billedSubs, updatedCoins } = processRecurringBilling(currentSubs);
    if (updatedCoins !== undefined) {
        saveSubscriptions(billedSubs);
        return billedSubs;
    }

    return currentSubs;
}

/**
 * 일간 반복 청구 프로세스 (Option 2)
 */
function processRecurringBilling(subscriptions: FactionSubscription[]): { billedSubs: FactionSubscription[], updatedCoins?: number } {
    const state = getGameState();
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
        updateGameState({ coins: newCoins });
        return { billedSubs, updatedCoins: newCoins };
    }

    return { billedSubs };
}

/**
 * 구독 저장
 */
function saveSubscriptions(subscriptions: FactionSubscription[]): void {
    storage.set('factionSubscriptions', subscriptions);
}

/**
 * 군단 구독하기 (티어 선택 및 변경 지원)
 */
export function subscribeFaction(
    factionId: string,
    tier: SubscriptionTier
): { success: boolean; message: string } {
    const state = getGameState();
    const config = TIER_CONFIG[tier];

    // 이미 구독 중인지 확인
    const subscriptions = getSubscribedFactions();
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
            updateGameState({ coins: state.coins - costDiff });
        }
        // 다운그레이드: 차액 일부 환불 (50%)
        else if (costDiff < 0) {
            const refund = Math.floor(Math.abs(costDiff) * 0.5);
            updateGameState({ coins: state.coins + refund });
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

        saveSubscriptions(subscriptions);

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
        updateGameState({ coins: state.coins - config.cost });
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
    saveSubscriptions(subscriptions);

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

function getCancellationHistory(): CancellationHistory[] {
    return storage.get<CancellationHistory[]>('cancellationHistory', []).map(h => ({
        ...h,
        cancelledAt: new Date(h.cancelledAt)
    }));
}

function saveCancellationHistory(history: CancellationHistory[]): void {
    storage.set('cancellationHistory', history);
}

function hasEverCancelled(factionId: string): boolean {
    const history = getCancellationHistory();
    return history.some(h => h.factionId === factionId);
}

/**
 * 환불 금액 계산
 * - 첫 구독 취소: 50% 환불
 * - 이후 취소: 사용 시간에 비례하여 환불 (30일 기준)
 */
function calculateRefund(subscription: FactionSubscription): number {
    const { dailyCost, subscribedAt, factionId } = subscription;

    // Free 티어는 환불 없음
    if (dailyCost === 0) {
        return 0;
    }

    const isFirstCancellation = !hasEverCancelled(factionId);

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
export function unsubscribeFaction(factionId: string): { success: boolean; message: string; refund?: number } {
    const subscriptions = getSubscribedFactions();
    const subscription = subscriptions.find(sub => sub.factionId === factionId);

    if (!subscription) {
        return { success: false, message: '구독 중이 아닌 군단입니다.' };
    }

    // 환불 금액 계산
    const refundAmount = calculateRefund(subscription);

    // 구독 제거
    const filtered = subscriptions.filter(sub => sub.factionId !== factionId);
    saveSubscriptions(filtered);

    // 취소 이력 저장
    const history = getCancellationHistory();
    history.push({
        factionId,
        cancelledAt: new Date(),
        refundAmount
    });
    saveCancellationHistory(history);

    // 코인 환불
    if (refundAmount > 0) {
        const state = getGameState();
        updateGameState({ coins: state.coins + refundAmount });
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
export function getTotalSubscriptionCost(): number {
    const subscriptions = getSubscribedFactions();
    return subscriptions.reduce((total, sub) => total + sub.dailyCost, 0);
}

/**
 * 특정 군단의 구독 정보 가져오기
 */
export function getFactionSubscription(factionId: string): FactionSubscription | null {
    const subscriptions = getSubscribedFactions();
    return subscriptions.find(sub => sub.factionId === factionId) || null;
}

/**
 * 군단 구독 여부 확인
 */
export function hasActiveFactionSubscription(factionId: string): boolean {
    return getFactionSubscription(factionId) !== null;
}

/**
 * 일일 생성 가능 여부 확인
 */
export function canGenerateToday(factionId: string): { canGenerate: boolean; reason?: string; remaining?: number } {
    const subscription = getFactionSubscription(factionId);

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
export function incrementGenerationCount(factionId: string): void {
    const subscriptions = getSubscribedFactions();
    const subscription = subscriptions.find(sub => sub.factionId === factionId);

    if (subscription) {
        subscription.generationsToday += 1;
        // 카드 생성 시 친밀도 증가 (최대 100)
        subscription.affinity = Math.min((subscription.affinity || 0) + 1, 100);
        saveSubscriptions(subscriptions);
    }
}

/**
 * 티어별 통계
 */
export function getSubscriptionStats(): {
    total: number;
    byTier: Record<SubscriptionTier, number>;
    totalCost: number;
} {
    const subscriptions = getSubscribedFactions();

    return {
        total: subscriptions.length,
        byTier: {
            free: subscriptions.filter(s => s.tier === 'free').length,
            pro: subscriptions.filter(s => s.tier === 'pro').length,
            ultra: subscriptions.filter(s => s.tier === 'ultra').length
        },
        totalCost: getTotalSubscriptionCost()
    };
}
