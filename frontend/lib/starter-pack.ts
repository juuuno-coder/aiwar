/**
 * 스타터 팩 시스템
 * 신규 플레이어에게 초기 카드 지급
 */

import { Card, Rarity } from './types';
import { InventoryCard } from './inventory-system';
import { CARD_DATABASE } from '@/data/card-database';
import { generateId } from './utils';

/**
 * 스타터 팩 카드 템플릿 ID
 * Gemini 팩션의 다양한 등급 카드로 구성
 */
export const STARTER_PACK_TEMPLATE_IDS = [
    'hero-flux',        // Epic (영웅)
    'hero-gemini',      // Legendary (전설)
];

/**
 * 스타터 팩 카드 생성
 * 
 * @param userId 사용자 ID
 * @returns 생성된 카드 목록
 */
export async function generateStarterPack(userId: string = 'player'): Promise<InventoryCard[]> {
    const starterCards: InventoryCard[] = [];
    const now = new Date();

    // 데이터베이스에서 스타터 팩 카드 템플릿 찾기
    for (const templateId of STARTER_PACK_TEMPLATE_IDS) {
        const template = CARD_DATABASE.find(t => t.id === templateId);

        if (!template) {
            console.warn(`Starter pack template not found: ${templateId}`);
            continue;
        }

        const rarity = template.rarity || 'common';
        const RARITY_POWER_RANGES: Record<string, { min: number, max: number }> = {
            common: { min: 40, max: 60 },
            rare: { min: 50, max: 70 },
            epic: { min: 60, max: 80 },
            legendary: { min: 70, max: 90 },
            unique: { min: 80, max: 100 },
            commander: { min: 80, max: 100 }
        };
        const range = RARITY_POWER_RANGES[rarity.toLowerCase()] || RARITY_POWER_RANGES.common;
        const totalPower = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

        // 스탯 생성 (총 전투력 기반 분배)
        const stats = {
            efficiency: Math.floor(totalPower * 0.35),
            creativity: Math.floor(totalPower * 0.35),
            function: Math.floor(totalPower * 0.30),
            accuracy: Math.floor(totalPower / 5),
            speed: Math.floor(totalPower / 5),
            stability: Math.floor(totalPower / 5),
            ethics: Math.floor(totalPower / 5),
            totalPower
        };

        // InventoryCard 생성
        const card: InventoryCard = {
            id: generateId(),
            instanceId: generateId(),
            templateId: template.id,
            name: template.name,
            ownerId: userId,
            level: 1,
            experience: 0,
            stats,
            rarity: template.rarity,
            type: getCardType(template.specialty),
            imageUrl: template.imageUrl,
            acquiredAt: now,
            isLocked: false,
            faction: template.aiFactionId
        };

        starterCards.push(card);
    }

    // 등급별로 최소 1장씩 보장하기 위해 추가 카드 생성
    // Epic과 Legendary는 이미 있으므로, Common과 Rare 추가
    const additionalCards = await generateBasicCards(userId, now);
    starterCards.push(...additionalCards);

    return starterCards;
}

/**
 * 기본 카드 생성 (Common, Rare)
 */
async function generateBasicCards(userId: string, acquiredAt: Date): Promise<InventoryCard[]> {
    const basicCards: InventoryCard[] = [];

    // Gemini 팩션의 Epic 카드를 Common/Rare로 변형하여 사용
    const geminiTemplate = CARD_DATABASE.find(t => t.id === 'hero-flux');

    if (!geminiTemplate) return basicCards;

    // Common 카드 생성
    const commonCard: InventoryCard = {
        id: generateId(),
        instanceId: generateId(),
        templateId: 'starter-common',
        name: 'Gemini Trainee',
        ownerId: userId,
        level: 1,
        experience: 0,
        stats: {
            creativity: 15,
            accuracy: 15,
            speed: 15,
            stability: 5,
            ethics: 5,
            totalPower: 55 // Common Range: 40-60
        },
        rarity: 'common',
        type: 'CREATIVITY',
        imageUrl: geminiTemplate.imageUrl,
        acquiredAt,
        isLocked: false,
        faction: 'gemini'
    };

    // Rare 카드 생성
    const rareCard: InventoryCard = {
        id: generateId(),
        instanceId: generateId(),
        templateId: 'starter-rare',
        name: 'Gemini Specialist',
        ownerId: userId,
        level: 1,
        experience: 0,
        stats: {
            creativity: 25,
            accuracy: 20,
            speed: 10,
            stability: 5,
            ethics: 5,
            totalPower: 65 // Rare Range: 50-70
        },
        rarity: 'rare',
        type: 'EFFICIENCY',
        imageUrl: geminiTemplate.imageUrl,
        acquiredAt,
        isLocked: false,
        faction: 'gemini'
    };

    // Common 카드 2 생성 (추가)
    const commonCard2: InventoryCard = {
        id: generateId(),
        instanceId: generateId(),
        templateId: 'starter-common-2',
        name: 'Gemini Rookie',
        ownerId: userId,
        level: 1,
        experience: 0,
        stats: {
            creativity: 10,
            accuracy: 10,
            speed: 20,
            stability: 10,
            ethics: 5,
            totalPower: 55
        },
        rarity: 'common',
        type: 'EFFICIENCY', // [Fix] SPEED is not a valid AIType. Changed to EFFICIENCY.
        imageUrl: geminiTemplate.imageUrl,
        acquiredAt,
        isLocked: false,
        faction: 'gemini'
    };

    basicCards.push(commonCard, commonCard2, rareCard);
    return basicCards;
}

/**
 * Specialty를 AIType으로 변환
 */
function getCardType(specialty: string): 'FUNCTION' | 'EFFICIENCY' | 'CREATIVITY' {
    switch (specialty) {
        case 'code':
            return 'FUNCTION';
        case 'text':
            return 'EFFICIENCY';
        case 'image':
        case 'video':
        case 'audio':
            return 'CREATIVITY';
        default:
            return 'EFFICIENCY';
    }
}

/**
 * 스타터 팩 정보
 */
export const STARTER_PACK_INFO = {
    name: 'Welcome Pack',
    description: 'Your first cards to begin your AI journey',
    cardCount: 4,
    rarities: ['common', 'rare', 'epic', 'legendary'] as Rarity[],
    faction: 'gemini'
};
