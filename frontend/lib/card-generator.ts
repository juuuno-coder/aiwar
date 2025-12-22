import { Card, Rarity, AIType, Stats } from './types';
import { generateId } from './utils';

const UNIT_PREFIXES = ['Mk-', 'Type-', 'Unit-', 'Model-', 'Series-'];
const UNIT_NAMES = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Zeta', 'Omega', 'Prime', 'Nova', 'Core', 'Vortex'];

export function generateRandomCard(ownerId: string, forcedRarity?: Rarity, insightBonus: number = 0): Card {
    // 기본 확률
    const baseWeights: Record<Rarity, number> = {
        common: 60,
        rare: 25,
        epic: 10,
        legendary: 4,
        unique: 0.9,
        commander: 0.1
    };

    // 통찰력 연구 보너스 적용
    const rarityWeights: Record<Rarity, number> = { ...baseWeights };

    if (insightBonus > 0) {
        // 통찰력 레벨에 따라 희귀 등급 확률 증가
        const commonReduction = Math.min(insightBonus, 30); // 최대 30% 감소
        rarityWeights.common = Math.max(30, baseWeights.common - commonReduction);

        // 레벨에 따라 희귀/영웅/전설 확률 증가
        if (insightBonus >= 5) {
            // Lv5+: 영웅 확률 증가
            const epicBonus = Math.min((insightBonus - 4) * 0.4, 5);
            rarityWeights.epic = baseWeights.epic + epicBonus;
        }
        if (insightBonus >= 10) {
            // Lv10: 전설 확률 증가
            rarityWeights.legendary = baseWeights.legendary + 3;
        }

        // 희귀 확률 증가 (나머지)
        const totalReduction = baseWeights.common - rarityWeights.common;
        const epicIncrease = rarityWeights.epic - baseWeights.epic;
        const legendaryIncrease = rarityWeights.legendary - baseWeights.legendary;
        rarityWeights.rare = baseWeights.rare + (totalReduction - epicIncrease - legendaryIncrease);
    }

    let rarity: Rarity = forcedRarity || 'common';
    if (!forcedRarity) {
        const total = Object.values(rarityWeights).reduce((a, b) => a + b, 0);
        const rand = Math.random() * total;
        let cumulative = 0;
        for (const [r, weight] of Object.entries(rarityWeights)) {
            cumulative += weight;
            if (rand <= cumulative) {
                rarity = r as Rarity;
                break;
            }
        }
    }

    const statRanges: Record<Rarity, { min: number, max: number }> = {
        common: { min: 10, max: 40 },
        rare: { min: 41, max: 60 },
        epic: { min: 61, max: 75 },
        legendary: { min: 76, max: 90 },
        unique: { min: 91, max: 100 },
        commander: { min: 100, max: 120 }
    };

    const range = statRanges[rarity];
    const stats: Stats = {
        efficiency: range.min + Math.floor(Math.random() * (range.max - range.min + 1)),
        creativity: range.min + Math.floor(Math.random() * (range.max - range.min + 1)),
        function: range.min + Math.floor(Math.random() * (range.max - range.min + 1)),
        totalPower: 0
    };
    stats.totalPower = (stats.efficiency || 0) + (stats.creativity || 0) + (stats.function || 0);

    const types: AIType[] = ['EFFICIENCY', 'CREATIVITY', 'COST'];
    const type = types[Math.floor(Math.random() * types.length)];

    const name = `${UNIT_PREFIXES[Math.floor(Math.random() * UNIT_PREFIXES.length)]}${UNIT_NAMES[Math.floor(Math.random() * UNIT_NAMES.length)]}-${Math.floor(Math.random() * 999)}`;

    return {
        id: generateId(),
        templateId: `gen-${rarity}-${Date.now()}`,
        ownerId,
        name,
        type,
        level: 1,
        experience: 0,
        stats,
        rarity,
        acquiredAt: new Date(),
        isLocked: rarity === 'legendary'
    };
}
