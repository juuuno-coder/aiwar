import { Card, Rarity } from './types';
import { generateCardByRarity } from './card-generation-system';

export interface CardPack {
    id: string;
    name: string;
    description: string;
    price: number;
    cardCount: number;
    icon: string;
    rarityWeights: {
        common: number;
        rare: number;
        epic: number;
        legendary: number;
        unique?: number;
    };
}

export const CARD_PACKS: CardPack[] = [
    {
        id: 'standard',
        name: 'Standard Supply',
        description: '보급형 카드 팩 (3장)',
        price: 200,
        cardCount: 3,
        icon: '📦',
        rarityWeights: {
            common: 70,
            rare: 25,
            epic: 5,
            legendary: 0,
        },
    },
    {
        id: 'elite',
        name: 'Elite Supply',
        description: '정예 카드 팩 (5장)',
        price: 500,
        cardCount: 5,
        icon: '💼',
        rarityWeights: {
            common: 40,
            rare: 40,
            epic: 15,
            legendary: 5,
        },
    },
    {
        id: 'commander',
        name: 'Commander Supply',
        description: '지휘관용 최상급 팩 (10장)',
        price: 1000,
        cardCount: 10,
        icon: '👑',
        rarityWeights: {
            common: 20,
            rare: 30,
            epic: 30,
            legendary: 15,
            unique: 5,
        },
    },
];

/**
 * 카드팩을 개봉하여 랜덤 카드들을 생성합니다
 */
export function openCardPack(pack: CardPack, userId: string, insightLevel: number = 0): Card[] {
    const cards: Card[] = [];

    // 통찰력 보너스 계산 (정의서 v2.0 테이블 반영)
    let insightRareBonus = 0;
    let insightEpicBonus = 0;
    let insightLegendaryBonus = 0;

    if (insightLevel > 0) {
        const rareMap = [0, 2, 4, 6, 8, 12, 15, 18, 22, 30];
        const epicMap = [0, 1, 2, 3.5, 5, 7, 9, 12, 15, 20];
        const legMap = [0, 0.2, 0.4, 0.7, 1.0, 1.5, 2.0, 2.5, 3.2, 5.0];

        const idx = Math.min(insightLevel, 9);
        insightRareBonus = rareMap[idx];
        insightEpicBonus = epicMap[idx];
        insightLegendaryBonus = legMap[idx];
    }

    const totalBonus = insightRareBonus + insightEpicBonus + insightLegendaryBonus;

    // 카드팩 기본 확률에 통찰력 보너스 합산
    const adjustedWeights = {
        ...pack.rarityWeights,
        common: Math.max(0, pack.rarityWeights.common - totalBonus),
        rare: (pack.rarityWeights.rare || 0) + insightRareBonus,
        epic: (pack.rarityWeights.epic || 0) + insightEpicBonus,
        legendary: (pack.rarityWeights.legendary || 0) + insightLegendaryBonus
    };

    for (let i = 0; i < pack.cardCount; i++) {
        // 보정된 가중치로 등급 선택
        const rarity = selectRarityFromWeights(adjustedWeights);

        // 해당 등급의 랜덤 카드 생성
        const card = generateCardByRarity(rarity as Rarity, userId);
        cards.push(card);
    }

    return cards;
}

/**
 * 가중치 기반으로 등급 선택
 */
function selectRarityFromWeights(weights: CardPack['rarityWeights']): string {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + (weight || 0), 0);
    let random = Math.random() * totalWeight;

    for (const [rarity, weight] of Object.entries(weights)) {
        if (!weight) continue;
        random -= weight;
        if (random <= 0) {
            return rarity;
        }
    }

    return 'common'; // fallback
}
