/**
 * 인벤토리 시스템
 * Firebase Firestore를 사용한 카드 인벤토리 관리
 */

import { Card } from './types';
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
    Timestamp
} from 'firebase/firestore';

export interface InventoryCard extends Omit<Card, 'acquiredAt'> {
    acquiredAt: Timestamp | Date;
    instanceId: string; // 고유 인스턴스 ID (같은 카드 여러 개 소유 가능)
    faction?: string; // 추가 메타데이터
    power?: number; // 총 파워 (stats.totalPower의 별칭)
}

export type CardFilter = {
    rarity?: string[];
    faction?: string[];
    type?: string[];
};

export type CardSortBy = 'name' | 'power' | 'acquiredAt' | 'rarity';

/**
 * 인벤토리에 카드 추가
 */
export async function addCardToInventory(card: Card): Promise<string> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다.');
        // localStorage fallback
        const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
        const instanceId = `${card.id}-${Date.now()}`;
        inventory.push({ ...card, instanceId, acquiredAt: new Date() });
        localStorage.setItem('inventory', JSON.stringify(inventory));
        return instanceId;
    }

    try {
        const userId = await getUserId();
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
 * 인벤토리에서 카드 제거
 */
export async function removeCardFromInventory(instanceId: string): Promise<void> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다.');
        // localStorage fallback
        const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
        const filtered = inventory.filter((c: InventoryCard) => c.instanceId !== instanceId);
        localStorage.setItem('inventory', JSON.stringify(filtered));
        return;
    }

    try {
        const userId = await getUserId();
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
export async function loadInventory(): Promise<InventoryCard[]> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다. localStorage 사용.');
        const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
        return inventory;
    }

    try {
        const userId = await getUserId();
        const inventoryRef = collection(db, 'users', userId, 'inventory');
        const querySnapshot = await getDocs(inventoryRef);

        const cards: InventoryCard[] = querySnapshot.docs.map(doc => {
            const data = doc.data() as InventoryCard;
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
export async function getCardByInstanceId(instanceId: string): Promise<InventoryCard | null> {
    if (!isFirebaseConfigured || !db) {
        const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
        return inventory.find((c: InventoryCard) => c.instanceId === instanceId) || null;
    }

    try {
        const userId = await getUserId();
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
