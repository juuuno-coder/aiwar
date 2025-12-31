/**
 * 인벤토리 시스템
 * Firebase Firestore를 사용한 카드 인벤토리 관리
 */

import { Card } from './types';
import { CARD_DATABASE } from '@/data/card-database';
import { db, isFirebaseConfigured } from './firebase';
import { getUserId } from './firebase-auth';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp,
    writeBatch,
    updateDoc
} from 'firebase/firestore';

export interface InventoryCard extends Omit<Card, 'acquiredAt'> {
    acquiredAt: Timestamp | Date;
    instanceId: string; // 고유 인스턴스 ID (같은 카드 여러 개 소유 가능)
    faction?: string; // 추가 메타데이터
    power?: number; // 총 파워 (stats.totalPower의 별칭)
    affinity?: number; // Commander Affinity (0-100)
}

export type CardFilter = {
    rarity?: string[];
    faction?: string[];
    type?: string[];
};

export type CardSortBy = 'name' | 'power' | 'acquiredAt' | 'rarity';

/**
 * UID 기반 인벤토리 저장 키 생성
 */
function getInventoryKey(uid?: string): string {
    if (!uid) return 'inventory_guest';
    return `inventory_${uid}`;
}

/**
 * 인벤토리 카드 업데이트 (Partial)
 */
export async function updateInventoryCard(instanceId: string, updates: Partial<InventoryCard>, uid?: string): Promise<void> {
    if (!isFirebaseConfigured || !db) {
        // localStorage fallback
        const key = getInventoryKey(uid);
        const inventory = JSON.parse(localStorage.getItem(key) || '[]');
        const index = inventory.findIndex((c: InventoryCard) => c.instanceId === instanceId);
        if (index !== -1) {
            inventory[index] = { ...inventory[index], ...updates };
            localStorage.setItem(key, JSON.stringify(inventory));
        }
        return;
    }

    try {
        const userId = uid || await getUserId();
        const cardRef = doc(db, 'users', userId, 'inventory', instanceId);
        // @ts-ignore
        await updateDoc(cardRef, updates);
        console.log('✅ 카드 업데이트:', instanceId);
    } catch (error) {
        console.error('❌ 카드 업데이트 실패:', error);
        throw error;
    }
}

/**
 * 인벤토리에 카드 추가
 */
export async function addCardToInventory(card: Card, uid?: string): Promise<string> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다.');
        // localStorage fallback
        const key = getInventoryKey(uid);
        const inventory = JSON.parse(localStorage.getItem(key) || '[]');
        const instanceId = `${card.id}-${Date.now()}`;
        inventory.push({ ...card, instanceId, acquiredAt: new Date() });
        localStorage.setItem(key, JSON.stringify(inventory));
        return instanceId;
    }

    try {
        const userId = uid || await getUserId();
        const instanceId = `${card.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const cardRef = doc(db, 'users', userId, 'inventory', instanceId);

        const inventoryCard: InventoryCard = {
            ...card,
            instanceId,
            acquiredAt: serverTimestamp() as Timestamp
        };

        await setDoc(cardRef, inventoryCard);
        console.log('✅ 카드 추가:', card.name);
        return instanceId;
    } catch (error) {
        console.error('❌ 카드 추가 실패:', error);
        throw error;
    }
}

/**
 * 인벤토리에 여러 카드 추가 (배치 작업)
 */
export async function addCardsToInventory(cards: Card[], uid?: string): Promise<string[]> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다.');
        const key = getInventoryKey(uid);
        const inventory = JSON.parse(localStorage.getItem(key) || '[]');

        const instanceIds: string[] = [];
        const newCards = cards.map(card => {
            const instanceId = `${card.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            instanceIds.push(instanceId);
            return { ...card, instanceId, acquiredAt: new Date() };
        });

        inventory.push(...newCards);
        localStorage.setItem(key, JSON.stringify(inventory));
        return instanceIds;
    }

    try {
        const userId = uid || await getUserId();
        const batch = writeBatch(db);
        const instanceIds: string[] = [];

        for (const card of cards) {
            const instanceId = `${card.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            instanceIds.push(instanceId);
            const cardRef = doc(db, 'users', userId, 'inventory', instanceId);

            const inventoryCard: InventoryCard = {
                ...card,
                instanceId,
                acquiredAt: serverTimestamp() as Timestamp
            };
            batch.set(cardRef, inventoryCard);
        }

        await batch.commit();
        console.log(`✅ ${cards.length}개 카드 배치 추가 완료`);
        return instanceIds;
    } catch (error) {
        console.error('❌ 카드 배치 추가 실패:', error);
        throw error;
    }
}

/**
 * 인벤토리에서 카드 제거
 */
export async function removeCardFromInventory(instanceId: string, uid?: string): Promise<void> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다.');
        // localStorage fallback
        const key = getInventoryKey(uid);
        const inventory = JSON.parse(localStorage.getItem(key) || '[]');
        const filtered = inventory.filter((c: InventoryCard) => c.instanceId !== instanceId);
        localStorage.setItem(key, JSON.stringify(filtered));
        return;
    }

    try {
        const userId = uid || await getUserId();
        const cardRef = doc(db, 'users', userId, 'inventory', instanceId);
        await deleteDoc(cardRef);
        console.log('✅ 카드 제거:', instanceId);
    } catch (error) {
        console.error('❌ 카드 제거 실패:', error);
        throw error;
    }
}

/**
 * 전체 인벤토리 로드
 */
export async function loadInventory(uid?: string): Promise<InventoryCard[]> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다. localStorage 사용.');
        const key = getInventoryKey(uid);
        const inventory = JSON.parse(localStorage.getItem(key) || '[]');

        // LocalStorage 데이터도 동기화
        return inventory.map((card: InventoryCard) => {
            const staticData = CARD_DATABASE.find(c => c.id === card.id);
            if (staticData) {
                return {
                    ...card,
                    ...staticData,
                    instanceId: card.instanceId,
                    acquiredAt: card.acquiredAt,
                    level: card.level || 1,
                    experience: card.experience || 0,
                    stats: card.stats || staticData.baseStats
                };
            }
            return card;
        });
    }

    try {
        const userId = uid || await getUserId();
        const inventoryRef = collection(db, 'users', userId, 'inventory');
        const querySnapshot = await getDocs(inventoryRef);

        const cards: InventoryCard[] = querySnapshot.docs.map(doc => {
            const data = doc.data() as InventoryCard;
            const staticData = CARD_DATABASE.find(c => c.id === data.id);

            if (staticData) {
                return {
                    ...data,
                    ...staticData,
                    instanceId: data.instanceId,
                    acquiredAt: data.acquiredAt || new Date(),
                    level: data.level || 1,
                    experience: data.experience || 0,
                    stats: data.stats || staticData.baseStats,
                } as InventoryCard;
            }

            return {
                ...data,
                acquiredAt: data.acquiredAt || new Date()
            };
        });

        console.log(`✅ 인벤토리 로드: ${cards.length}개 카드`);
        return cards;
    } catch (error) {
        console.error('❌ 인벤토리 로드 실패:', error);
        return [];
    }
}

/**
 * 특정 카드 조회
 */
export async function getCardByInstanceId(instanceId: string, uid?: string): Promise<InventoryCard | null> {
    if (!isFirebaseConfigured || !db) {
        const key = getInventoryKey(uid);
        const inventory = JSON.parse(localStorage.getItem(key) || '[]');
        return inventory.find((c: InventoryCard) => c.instanceId === instanceId) || null;
    }

    try {
        const userId = uid || await getUserId();
        const cardRef = doc(db, 'users', userId, 'inventory', instanceId);
        const docSnap = await getDoc(cardRef);

        if (docSnap.exists()) {
            return docSnap.data() as InventoryCard;
        }
        return null;
    } catch (error) {
        console.error('❌ 카드 조회 실패:', error);
        return null;
    }
}

/**
 * 카드 필터링
 */
export function filterCards(cards: InventoryCard[], filters: CardFilter): InventoryCard[] {
    let filtered = [...cards];

    if (filters.rarity && filters.rarity.length > 0) {
        filtered = filtered.filter(card => card.rarity && filters.rarity!.includes(card.rarity));
    }

    if (filters.faction && filters.faction.length > 0) {
        filtered = filtered.filter(card => card.faction && filters.faction!.includes(card.faction));
    }

    if (filters.type && filters.type.length > 0) {
        filtered = filtered.filter(card => card.type && filters.type!.includes(card.type));
    }

    return filtered;
}

/**
 * 카드 정렬
 */
export function sortCards(cards: InventoryCard[], sortBy: CardSortBy, ascending: boolean = true): InventoryCard[] {
    const sorted = [...cards];

    sorted.sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
            case 'name':
                comparison = (a.name || '').localeCompare(b.name || '');
                break;
            case 'power':
                const powerA = a.power || a.stats?.totalPower || 0;
                const powerB = b.power || b.stats?.totalPower || 0;
                comparison = powerA - powerB;
                break;
            case 'acquiredAt':
                const dateA = a.acquiredAt instanceof Date ? a.acquiredAt : new Date(a.acquiredAt.seconds * 1000);
                const dateB = b.acquiredAt instanceof Date ? b.acquiredAt : new Date(b.acquiredAt.seconds * 1000);
                comparison = dateA.getTime() - dateB.getTime();
                break;
            case 'rarity':
                const rarityOrder = { 'common': 1, 'rare': 2, 'epic': 3, 'legendary': 4, 'unique': 5, 'commander': 6 };
                comparison = (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0) -
                    (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0);
                break;
        }

        return ascending ? comparison : -comparison;
    });

    return sorted;
}

/**
 * 인벤토리 통계
 */
export function getInventoryStats(cards: InventoryCard[]) {
    const stats = {
        total: cards.length,
        byRarity: {} as Record<string, number>,
        byFaction: {} as Record<string, number>,
        byType: {} as Record<string, number>,
        totalPower: 0,
        averagePower: 0
    };

    cards.forEach(card => {
        // Rarity
        if (card.rarity) {
            stats.byRarity[card.rarity] = (stats.byRarity[card.rarity] || 0) + 1;
        }

        // Faction
        if (card.faction) {
            stats.byFaction[card.faction] = (stats.byFaction[card.faction] || 0) + 1;
        }

        // Type
        if (card.type) {
            stats.byType[card.type] = (stats.byType[card.type] || 0) + 1;
        }

        // Power
        const power = card.power || card.stats?.totalPower || 0;
        stats.totalPower += power;
    });

    stats.averagePower = cards.length > 0 ? Math.round(stats.totalPower / cards.length) : 0;

    return stats;
}

/**
 * 스타터팩 지급 (튜토리얼 완료 시)
 * 일반 1, 희귀 1, 영웅 1, 전설 1, 유니크 1 (군단장 카드) 지급
 */
const UNIQUE_COMMANDER_PORTRAITS = [
    '/assets/cards/cyber-warlord.png',
    '/assets/cards/fleet-admiral.png',
    '/assets/cards/gemini-character.png',
    '/assets/cards/cursor-character.png',
    '/assets/cards/runway-character.png'
];

export async function distributeStarterPack(uid?: string, nickname?: string): Promise<InventoryCard[]> {
    try {
        const { generateCardByRarity } = await import('./card-generation-system');

        // 각 등급별 1장씩 생성
        const commonCard = generateCardByRarity('common', uid);
        const rareCard = generateCardByRarity('rare', uid);
        const epicCard = generateCardByRarity('epic', uid);
        const legendaryCard = generateCardByRarity('legendary', uid);

        // Commander Unique Card
        const uniqueCard = generateCardByRarity('unique', uid);

        // Customize Unique Card with Nickname
        if (nickname) {
            uniqueCard.name = `지휘관 ${nickname}`; // '사령관' -> '지휘관' (User refers to themselves)
            uniqueCard.description = "전장에 새롭게 합류한 지휘관의 전용 유닛입니다.";

            // Randomize portrait for the Unique card
            const randomPortrait = UNIQUE_COMMANDER_PORTRAITS[Math.floor(Math.random() * UNIQUE_COMMANDER_PORTRAITS.length)];
            uniqueCard.imageUrl = randomPortrait;
        }

        const starterPack = [
            commonCard,
            rareCard,
            epicCard,
            legendaryCard,
            uniqueCard
        ];

        // 인벤토리에 추가
        await addCardsToInventory(starterPack, uid);

        // InventoryCard 형태로 반환 (UI 표시용)
        const inventoryCards = starterPack.map(card => ({
            ...card,
            instanceId: '', // UI 표시용이라 ID 불필요하지만 타입 맞춤
            acquiredAt: new Date()
        } as InventoryCard));

        console.log('✅ 스타터팩 지급 완료 (5장, 포함: Commander Card)');
        return inventoryCards;
    } catch (error) {
        console.error('❌ 스타터팩 지급 실패:', error);
        return [];
    }
}
