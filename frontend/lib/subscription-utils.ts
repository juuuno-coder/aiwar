import { gameStorage } from './game-storage';
import { FACTIONS_DATA } from './faction-subscription';

const MAX_SUBSCRIPTIONS = 5;
const SUBSCRIPTION_COST_COINS = 5000;
const DAILY_TOKEN_DRAIN = 100;

export interface Subscription {
    factionId: string;
    nextPaymentAt: number;
    isActive: boolean;
}

/**
 * 구독 가능한지 확인
 */
export async function canSubscribe(factionId: string): Promise<{ success: boolean; message: string }> {
    const state = await gameStorage.loadGameState();
    const subs = state.subscriptions || [];

    if (subs.filter(s => s.isActive).length >= MAX_SUBSCRIPTIONS) {
        return { success: false, message: `최대 ${MAX_SUBSCRIPTIONS}개까지만 구독할 수 있습니다.` };
    }

    if (subs.find(s => s.factionId === factionId && s.isActive)) {
        return { success: false, message: '이미 구독 중인 AI 군단입니다.' };
    }

    if (state.coins < SUBSCRIPTION_COST_COINS) {
        return { success: false, message: `구독 비용이 부족합니다. (필요: ${SUBSCRIPTION_COST_COINS} 코인)` };
    }

    return { success: true, message: '구독 가능합니다.' };
}

/**
 * 구독 실행
 */
export async function subscribeToFaction(factionId: string): Promise<{ success: boolean; message: string }> {
    const check = await canSubscribe(factionId);
    if (!check.success) return check;

    const state = await gameStorage.loadGameState();
    const subs = state.subscriptions || [];

    // 코인 차감
    await gameStorage.addCoins(-SUBSCRIPTION_COST_COINS);

    // 구독 추가
    const newSubscription: Subscription = {
        factionId,
        nextPaymentAt: Date.now() + (24 * 60 * 60 * 1000), // 다음 결제는 24시간 후
        isActive: true
    };

    const newSubs = [...subs, newSubscription];
    await gameStorage.saveGameState({ subscriptions: newSubs });

    return { success: true, message: '구독이 시작되었습니다! 매일 토큰이 소모됩니다.' };
}

/**
 * 구독 취소
 */
export async function unsubscribeFaction(factionId: string): Promise<{ success: boolean; message: string }> {
    const state = await gameStorage.loadGameState();
    const subs = state.subscriptions || [];

    const updatedSubs = subs.filter(s => s.factionId !== factionId);
    await gameStorage.saveGameState({ subscriptions: updatedSubs });

    return { success: true, message: '구독이 취소되었습니다.' };
}

/**
 * 현재 구독 목록 가져오기
 */
export async function getActiveSubscriptions(): Promise<Subscription[]> {
    const state = await gameStorage.loadGameState();
    return (state.subscriptions || []).filter(s => s.isActive);
}
