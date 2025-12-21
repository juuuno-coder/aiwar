// 시너지 계산 유틸리티

import { Card } from './types';

export interface ComboDefinition {
    id: string;
    name: string;
    requiredFactions: string[]; // 다중 팩션 조합 등
    bonusPower: number;
    description: string;
    icon: string;
}

export interface DeckSynergy {
    factionCounts: Record<string, number>;
    totalBonus: number;
    activeSynergies: Array<{
        faction: string;
        count: number;
        bonus: number;
    }>;
    activeCombos: ComboDefinition[];
}

// 군단별 카드 개수 계산
export function calculateFactionCounts(cards: Card[]): Record<string, number> {
    const counts: Record<string, number> = {};

    cards.forEach(card => {
        // templateId에서 AI 군단 추출 (예: "gemini-text-001" -> "gemini")
        const faction = card.templateId.split('-')[0];
        counts[faction] = (counts[faction] || 0) + 1;
    });

    return counts;
}

// 시너지 보너스 계산
export function calculateSynergyBonus(count: number): number {
    const bonusMap: Record<number, number> = {
        2: 1.10, // +10%
        3: 1.20, // +20%
        4: 1.30, // +30%
        5: 1.50, // +50%
    };

    return bonusMap[count] || 1.0;
}

// 덱 시너지 분석
export function analyzeDeckSynergy(cards: Card[]): DeckSynergy {
    const factionCounts = calculateFactionCounts(cards);
    const activeSynergies: Array<{ faction: string; count: number; bonus: number }> = [];
    let totalBonus = 1.0;

    Object.entries(factionCounts).forEach(([faction, count]) => {
        if (count >= 2) {
            const bonus = calculateSynergyBonus(count);
            activeSynergies.push({ faction, count, bonus });

            // 가장 높은 보너스만 적용 (중복 방지)
            if (bonus > totalBonus) {
                totalBonus = bonus;
            }
        }
    });

    // TODO: 콤보 계산 로직 추가 (현재는 빈 배열)
    const activeCombos: ComboDefinition[] = [];

    return {
        factionCounts,
        totalBonus,
        activeSynergies,
        activeCombos
    };
}

// AI 군단 이름 가져오기
export function getFactionDisplayName(factionId: string): string {
    const factionNames: Record<string, string> = {
        'gemini': 'Gemini',
        'chatgpt': 'ChatGPT',
        'claude': 'Claude',
        'midjourney': 'Midjourney',
        'dalle': 'DALL-E',
        'stable': 'Stable Diffusion',
        'runway': 'Runway',
        'kling': 'Kling',
        'suno': 'Suno',
        'eleven': 'ElevenLabs',
    };

    return factionNames[factionId] || factionId;
}
