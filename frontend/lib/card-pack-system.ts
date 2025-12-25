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
        id: 'starter',
        name: '스타터 팩',
        description: '기본 카드 3장을 획득합니다',
        price: 100,
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
        id: 'premium',
        name: '프리미엄 팩',
        description: '고급 카드 5장을 획득합니다',
        price: 300,
        cardCount: 5,
        icon: '🎁',
        rarityWeights: {
            common: 50,
            rare: 30,
            epic: 15,
            legendary: 5,
        },
    },
    {
        id: 'elite',
        name: '엘리트 팩',
        description: '최상급 카드 7장을 획득합니다',
        price: 500,
        cardCount: 7,
        icon: '💎',
        rarityWeights: {
            common: 40,
            rare: 30,
            epic: 20,
            legendary: 10,
        },
    },
    {
        id: 'legendary',
        name: '레전더리 팩',
        description: '전설 카드 10장을 획득합니다',
        price: 1000,
        cardCount: 10,
        icon: '👑',
        rarityWeights: {
            common: 0,
            rare: 40,
            epic: 35,
            legendary: 20,
            unique: 5,
        },
    },
];

/**
 * 카드팩을 개봉하여 랜덤 카드들을 생성합니다
 */
export function openCardPack(pack: CardPack, userId: string): Card[] {
    const cards: Card[] = [];

    for (let i = 0; i < pack.cardCount; i++) {
        // 등급 선택
        const rarity = selectRarityFromWeights(pack.rarityWeights);

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
