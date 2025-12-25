// Firebase 데이터베이스 유틸리티
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    getDocs,
    serverTimestamp,
    increment,
    DocumentData
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { getUserId } from './firebase-auth';

// ==================== 사용자 프로필 ====================

export interface UserProfile {
    coins: number;
    tokens: number;
    level: number;
    exp: number;
    createdAt?: any;
    lastLogin?: any;
}

/**
 * 사용자 프로필 저장
 */
export async function saveUserProfile(profile: Partial<UserProfile>): Promise<void> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다. localStorage를 사용하세요.');
        return;
    }

    try {
        const userId = await getUserId();
        const userRef = doc(db, 'users', userId, 'profile', 'data');

        await setDoc(userRef, {
            ...profile,
            lastLogin: serverTimestamp()
        }, { merge: true });

        console.log('✅ Firebase 프로필 저장 성공:', profile);
    } catch (error) {
        console.error('❌ 프로필 저장 실패:', error);
        throw error;
    }
}

/**
 * 사용자 프로필 로드
 */
export async function loadUserProfile(): Promise<UserProfile | null> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다. localStorage를 사용하세요.');
        return null;
    }

    try {
        const userId = await getUserId();
        const userRef = doc(db, 'users', userId, 'profile', 'data');
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            if (process.env.NODE_ENV === 'development') {
                console.log('✅ Firebase 프로필 로드 성공:', data);
            }
            return data;
        }

        // 프로필이 없으면 기본값 생성
        const defaultProfile: UserProfile = {
            coins: 1000,
            tokens: 100,
            level: 1,
            exp: 0,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
        };

        await setDoc(userRef, defaultProfile);
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ 기본 프로필 생성:', defaultProfile);
        }
        return defaultProfile;
    } catch (error) {
        console.error('❌ 프로필 로드 실패:', error);
        return null;
    }
}

/**
 * 코인 업데이트 (증감)
 */
export async function updateCoins(amount: number): Promise<void> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다.');
        return;
    }

    try {
        const userId = await getUserId();
        const userRef = doc(db, 'users', userId, 'profile', 'data');

        await updateDoc(userRef, {
            coins: increment(amount)
        });

        console.log(`✅ 코인 업데이트: ${amount > 0 ? '+' : ''}${amount}`);
    } catch (error) {
        console.error('❌ 코인 업데이트 실패:', error);
        throw error;
    }
}

/**
 * 토큰 업데이트 (증감)
 */
export async function updateTokens(amount: number): Promise<void> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다.');
        return;
    }

    try {
        const userId = await getUserId();
        const userRef = doc(db, 'users', userId, 'profile', 'data');

        await updateDoc(userRef, {
            tokens: increment(amount)
        });

        console.log(`✅ 토큰 업데이트: ${amount > 0 ? '+' : ''}${amount}`);
    } catch (error) {
        console.error('❌ 토큰 업데이트 실패:', error);
        throw error;
    }
}

/**
 * 경험치 및 레벨 업데이트
 */
export async function updateExpAndLevel(exp: number, level: number): Promise<void> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다.');
        return;
    }

    try {
        const userId = await getUserId();
        const userRef = doc(db, 'users', userId, 'profile', 'data');

        await updateDoc(userRef, {
            exp,
            level
        });

        console.log(`✅ 경험치/레벨 업데이트: Lv.${level}, ${exp} XP`);
    } catch (error) {
        console.error('❌ 경험치/레벨 업데이트 실패:', error);
        throw error;
    }
}

// ==================== 인벤토리 ====================

export interface InventoryCard {
    id: string;
    name: string;
    power: number;
    rarity: string;
    acquiredAt?: any;
}

/**
 * 인벤토리에 카드 추가
 */
export async function addCardToInventory(card: InventoryCard): Promise<void> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다.');
        return;
    }

    try {
        const userId = await getUserId();
        const cardRef = doc(db, 'users', userId, 'inventory', card.id);

        await setDoc(cardRef, {
            ...card,
            acquiredAt: serverTimestamp()
        });

        console.log('✅ 카드 추가:', card.name);
    } catch (error) {
        console.error('❌ 카드 추가 실패:', error);
        throw error;
    }
}

/**
 * 인벤토리 로드
 */
export async function loadInventory(): Promise<InventoryCard[]> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다.');
        return [];
    }

    try {
        const userId = await getUserId();
        const inventoryRef = collection(db, 'users', userId, 'inventory');
        const querySnapshot = await getDocs(inventoryRef);

        const cards = querySnapshot.docs.map(doc => doc.data() as InventoryCard);
        console.log(`✅ 인벤토리 로드: ${cards.length}개 카드`);
        return cards;
    } catch (error) {
        console.error('❌ 인벤토리 로드 실패:', error);
        return [];
    }
}

// ==================== 팩션 ====================

export interface FactionData {
    unlocked: string[];
    slots: any[];
    synergy?: any;
}

/**
 * 팩션 데이터 저장
 */
export async function saveFactionData(data: FactionData): Promise<void> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다.');
        return;
    }

    try {
        const userId = await getUserId();
        const factionRef = doc(db, 'users', userId, 'factions', 'data');

        await setDoc(factionRef, data, { merge: true });
        console.log('✅ 팩션 데이터 저장');
    } catch (error) {
        console.error('❌ 팩션 데이터 저장 실패:', error);
        throw error;
    }
}

/**
 * 팩션 데이터 로드
 */
export async function loadFactionData(): Promise<FactionData | null> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다.');
        return null;
    }

    try {
        const userId = await getUserId();
        const factionRef = doc(db, 'users', userId, 'factions', 'data');
        const docSnap = await getDoc(factionRef);

        if (docSnap.exists()) {
            console.log('✅ 팩션 데이터 로드');
            return docSnap.data() as FactionData;
        }

        return {
            unlocked: [],
            slots: []
        };
    } catch (error) {
        console.error('❌ 팩션 데이터 로드 실패:', error);
        return null;
    }
}

// ==================== 미션 ====================

export interface MissionData {
    date: string;
    missions: any[];
    lastReset?: any;
}

/**
 * 미션 데이터 저장
 */
export async function saveMissionData(data: MissionData): Promise<void> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다.');
        return;
    }

    try {
        const userId = await getUserId();
        const missionRef = doc(db, 'users', userId, 'missions', 'daily');

        await setDoc(missionRef, {
            ...data,
            lastReset: serverTimestamp()
        }, { merge: true });

        console.log('✅ 미션 데이터 저장');
    } catch (error) {
        console.error('❌ 미션 데이터 저장 실패:', error);
        throw error;
    }
}

/**
 * 미션 데이터 로드
 */
export async function loadMissionData(): Promise<MissionData | null> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다.');
        return null;
    }

    try {
        const userId = await getUserId();
        const missionRef = doc(db, 'users', userId, 'missions', 'daily');
        const docSnap = await getDoc(missionRef);

        if (docSnap.exists()) {
            console.log('✅ 미션 데이터 로드');
            return docSnap.data() as MissionData;
        }

        return {
            date: '',
            missions: []
        };
    } catch (error) {
        console.error('❌ 미션 데이터 로드 실패:', error);
        return null;
    }
}

// ==================== 업적 ====================

export interface AchievementData {
    id: string;
    completed: boolean;
    claimed: boolean;
    progress: number;
    completedAt?: any;
}

/**
 * 업적 데이터 저장
 */
export async function saveAchievement(achievement: AchievementData): Promise<void> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다.');
        return;
    }

    try {
        const userId = await getUserId();
        const achievementRef = doc(db, 'users', userId, 'achievements', achievement.id);

        await setDoc(achievementRef, {
            ...achievement,
            completedAt: achievement.completed ? serverTimestamp() : null
        }, { merge: true });

        console.log('✅ 업적 저장:', achievement.id);
    } catch (error) {
        console.error('❌ 업적 저장 실패:', error);
        throw error;
    }
}

/**
 * 모든 업적 로드
 */
export async function loadAchievements(): Promise<AchievementData[]> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다.');
        return [];
    }

    try {
        const userId = await getUserId();
        const achievementsRef = collection(db, 'users', userId, 'achievements');
        const querySnapshot = await getDocs(achievementsRef);

        const achievements = querySnapshot.docs.map(doc => doc.data() as AchievementData);
        console.log(`✅ 업적 로드: ${achievements.length}개`);
        return achievements;
    } catch (error) {
        console.error('❌ 업적 로드 실패:', error);
        return [];
    }
}
