// AI 군단 구독 티어 시스템
// Free/Pro/Ultra 3가지 티어로 구독 관리

import { storage } from './utils';
import { getGameState, updateGameState } from './game-state';

export type SubscriptionTier = 'free' | 'pro' | 'ultra';

export interface FactionSubscription {
    factionId: string;
    tier: SubscriptionTier;
    subscribedAt: Date;
    dailyCost: number; // 일간 구독 비용
    dailyGenerationLimit: number;
    generationInterval: number; // minutes
    generationsToday: number;
    lastResetDate: string; // YYYY-MM-DD format
}

/**
 * 티어별 설정 (게임 밸런스 고려)
 */
export const TIER_CONFIG = {
    free: {
        cost: 0,
        generationInterval: 30, // 30 minutes
        dailyLimit: 5,
        name: 'Free',
        description: '무료 티어 - 체험용'
    },
    pro: {
        cost: 500,
        generationInterval: 20, // 20 minutes
        dailyLimit: 20,
        name: 'Pro',
        description: '프로 티어 - 일반 플레이어용'
    },
    ultra: {
        cost: 2000,
        generationInterval: 10, // 10 minutes
        dailyLimit: 999999, // unlimited
        name: 'Ultra',
        description: '울트라 티어 - 프리미엄 무제한'
    }
};

/**
 * 구독 중인 군단 목록 가져오기
 */
export function getSubscribedFactions(): FactionSubscription[] {
    const subscriptions = storage.get<FactionSubscription[]>('factionSubscriptions', []);

    // 날짜 변환 및 일일 카운터 리셋
    const today = new Date().toISOString().split('T')[0];

    return subscriptions.map(sub => {
        const subscription = {
            ...sub,
            subscribedAt: new Date(sub.subscribedAt)
        };

        // dailyCost가 없거나 NaN인 경우 티어 설정에서 가져오기
        if (!subscription.dailyCost || isNaN(subscription.dailyCost)) {
            const config = TIER_CONFIG[subscription.tier];
            subscription.dailyCost = config?.cost || 0;
        }

        // 날짜가 바뀌면 카운터 리셋
        if (subscription.lastResetDate !== today) {
            subscription.generationsToday = 0;
            subscription.lastResetDate = today;
        }

        return subscription;
    });
}

/**
 * 구독 저장
 */
function saveSubscriptions(subscriptions: FactionSubscription[]): void {
    storage.set('factionSubscriptions', subscriptions);
}

/**
 * 군단 구독하기 (티어 선택)
 */
export function subscribeFaction(
    factionId: string,
    tier: SubscriptionTier
): { success: boolean; message: string } {
    const state = getGameState();
    const config = TIER_CONFIG[tier];

    // 이미 구독 중인지 확인
    const subscriptions = getSubscribedFactions();
    const existing = subscriptions.find(sub => sub.factionId === factionId);

    if (existing) {
        return { success: false, message: '이미 구독 중인 군단입니다. 티어 변경을 원하시면 먼저 구독을 취소하세요.' };
    }

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
    const newSubscription: FactionSubscription = {
        factionId,
        tier,
        subscribedAt: new Date(),
        dailyCost: config.cost, // 일간 비용
        dailyGenerationLimit: config.dailyLimit,
        generationInterval: config.generationInterval,
        generationsToday: 0,
        lastResetDate: today
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
