
import { AIFaction } from './types';
import { FACTIONS_DATA } from './faction-subscription';

interface TrendState {
    factionId: string;
    expiresAt: number; // Timestamp
}

const TREND_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const STORAGE_KEY = 'ai_war_trend';

/**
 * 현재 유행중인 AI 군단을 가져오거나 새로 선정합니다.
 */
export function getCurrentTrend(): AIFaction {
    if (typeof window === 'undefined') return FACTIONS_DATA.factions[0]; // SSR Fallback

    const saved = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();

    const allFactions = FACTIONS_DATA.factions as any[];
    if (saved) {
        const parsed: TrendState = JSON.parse(saved);
        if (parsed.expiresAt > now) {
            const found = allFactions.find(f => f.id === parsed.factionId);
            if (found) return found;
        }
    }

    // 새로운 유행 선정
    const randomFaction = allFactions[Math.floor(Math.random() * allFactions.length)];
    const newState: TrendState = {
        factionId: randomFaction.id,
        expiresAt: now + TREND_DURATION
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    return randomFaction;
}

/**
 * 유행 효과 (보너스 수치)
 */
export const TREND_EFFECTS = {
    statMultiplier: 1.2, // 스탯 20% 증가
    dropRateBonus: 1.5   // 드랍률 보정 (기존 로직에 적용 필요)
};
