/**
 * 등급별 균형 잡힌 덱 선택 시스템
 * 각 등급(일반/희귀/영웅/전설/유니크/군단장)별로 1장씩 선택하여 균형 잡힌 덱 구성
 */

import { Card, Rarity } from './types';
import { InventoryCard } from './inventory-system';

/**
 * 등급별로 카드 그룹화
 */
export function groupCardsByRarity(cards: (Card | InventoryCard)[]): Record<Rarity, (Card | InventoryCard)[]> {
    const grouped: Record<string, (Card | InventoryCard)[]> = {
        common: [],
        rare: [],
        epic: [],
        legendary: [],
        unique: [],
        commander: []
    };

    for (const card of cards) {
        const rarity = card.rarity || 'common';
        if (!grouped[rarity]) {
            grouped[rarity] = [];
        }
        grouped[rarity].push(card);
    }

    return grouped as Record<Rarity, (Card | InventoryCard)[]>;
}

/**
 * 등급별로 1장씩 선택하여 균형 잡힌 덱 구성
 * 
 * 우선순위: 군단장 > 유니크 > 전설 > 영웅 > 희귀 > 일반
 * 
 * @param cards 선택 가능한 카드 목록
 * @param deckSize 덱 크기 (기본 5장)
 * @returns 균형 잡힌 덱
 */
export function selectBalancedDeck(
    cards: (Card | InventoryCard)[],
    deckSize: number = 5
): (Card | InventoryCard)[] {
    if (cards.length === 0) return [];
    if (cards.length <= deckSize) return cards;

    const byRarity = groupCardsByRarity(cards);
    const selected: (Card | InventoryCard)[] = [];

    // 등급 우선순위 (높은 등급부터)
    const rarityOrder: Rarity[] = ['commander', 'unique', 'legendary', 'epic', 'rare', 'common'];

    // 각 등급별로 최고 전투력 카드 1장씩 선택
    for (const rarity of rarityOrder) {
        if (selected.length >= deckSize) break;

        const rarityCards = byRarity[rarity] || [];
        if (rarityCards.length > 0) {
            // 레벨 우선, 그 다음 전투력 기준 정렬 후 최고 카드 선택
            const sortedByPriority = [...rarityCards].sort((a, b) => {
                const levelA = a.level || 1;
                const levelB = b.level || 1;
                if (levelA !== levelB) return levelB - levelA;

                const powerA = a.stats?.totalPower || 0;
                const powerB = b.stats?.totalPower || 0;
                return powerB - powerA;
            });
            selected.push(sortedByPriority[0]);
        }
    }

    // 부족한 경우 남은 카드 중 최고 전투력으로 보충
    if (selected.length < deckSize) {
        const selectedIds = new Set(selected.map(c => c.id));
        const remaining = cards
            .filter(c => !selectedIds.has(c.id))
            .sort((a, b) => {
                const powerA = a.stats?.totalPower || 0;
                const powerB = b.stats?.totalPower || 0;
                return powerB - powerA;
            });

        const needed = deckSize - selected.length;
        selected.push(...remaining.slice(0, needed));
    }

    return selected;
}

/**
 * 등급별 카드 개수 확인
 */
export function getRarityDistribution(cards: (Card | InventoryCard)[]): Record<Rarity, number> {
    const distribution: Record<string, number> = {
        common: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
        unique: 0,
        commander: 0
    };

    for (const card of cards) {
        const rarity = card.rarity || 'common';
        distribution[rarity] = (distribution[rarity] || 0) + 1;
    }

    return distribution as Record<Rarity, number>;
}

/**
 * 균형 잡힌 덱인지 확인 (각 등급별로 최소 1장씩 있는지)
 */
export function isBalancedDeck(cards: (Card | InventoryCard)[]): boolean {
    const distribution = getRarityDistribution(cards);

    // 최소한 3개 이상의 다른 등급이 있어야 균형 잡힌 것으로 간주
    const uniqueRarities = Object.values(distribution).filter(count => count > 0).length;
    return uniqueRarities >= 3;
}

/**
 * 주력 카드 추출 (등급별 최고 레벨 카드)
 */
export function getMainCards(cards: (Card | InventoryCard)[]): (Card | InventoryCard)[] {
    const mainCardsMap: Record<string, Card | InventoryCard> = {};
    const rarities: Rarity[] = ['commander', 'unique', 'legendary', 'epic', 'rare', 'common'];

    cards.forEach(card => {
        const rarity = card.rarity || 'common';
        const currentMain = mainCardsMap[rarity];
        const cardLevel = card.level || 1;
        const currentMainLevel = currentMain?.level || 1;

        if (!currentMain || cardLevel > currentMainLevel) {
            mainCardsMap[rarity] = card;
        } else if (cardLevel === currentMainLevel) {
            // 레벨이 같으면 전투력 높은 쪽
            const currentPower = currentMain.stats?.totalPower || 0;
            const cardPower = card.stats?.totalPower || 0;
            if (cardPower > currentPower) {
                mainCardsMap[rarity] = card;
            }
        }
    });

    return rarities
        .map(rarity => mainCardsMap[rarity])
        .filter((card): card is (Card | InventoryCard) => !!card);
}
