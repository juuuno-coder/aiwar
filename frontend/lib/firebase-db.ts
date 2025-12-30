// Firebase 데이터베이스 유틸리티
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    getDocs,
    query,
    where,
    serverTimestamp,
    increment,
    DocumentData
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { getUserId } from './firebase-auth';

// ==================== 사용자 프로필 ====================

export interface UserProfile {
    nickname?: string;
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
export async function saveUserProfile(profile: Partial<UserProfile>, uid?: string): Promise<void> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다. localStorage를 사용하세요.');
        return;
    }

    try {
        const userId = uid || await getUserId();
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
export async function loadUserProfile(uid?: string): Promise<UserProfile | null> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다. localStorage를 사용하세요.');
        return null;
    }

    try {
        const userId = uid || await getUserId();
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
 * 닉네임 중복 체크
 */
export async function checkNicknameUnique(nickname: string, currentUid?: string): Promise<boolean> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다.');
        return true; // Firebase 미설정 시 로컬 체크로 넘어감
    }

    try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);

        for (const userDoc of snapshot.docs) {
            const profileRef = doc(db, 'users', userDoc.id, 'profile', 'data');
            const profileSnap = await getDoc(profileRef);

            if (profileSnap.exists()) {
                const data = profileSnap.data();
                if (data.nickname?.toLowerCase() === nickname.toLowerCase() && userDoc.id !== currentUid) {
                    return false; // 중복됨
                }
            }
        }

        return true; // 중복 없음
    } catch (error) {
        console.error('❌ 닉네임 중복 체크 실패:', error);
        return true; // 에러 시 통과
    }
}

/**
 * 닉네임 업데이트
 */
export async function updateNickname(nickname: string, uid?: string): Promise<void> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다.');
        return;
    }

    try {
        const userId = uid || await getUserId();

        // 중복 체크
        const isUnique = await checkNicknameUnique(nickname, userId);
        if (!isUnique) {
            throw new Error('이미 사용 중인 닉네임입니다.');
        }

        const userRef = doc(db, 'users', userId, 'profile', 'data');

        // setDoc with merge: 프로필이 없으면 생성, 있으면 업데이트
        await setDoc(userRef, {
            nickname,
            lastLogin: serverTimestamp()
        }, { merge: true });

        // localStorage에도 저장 (백업 및 빠른 접근)
        localStorage.setItem('nickname', nickname);

        console.log('✅ 닉네임 업데이트 성공:', nickname);
    } catch (error) {
        console.error('❌ 닉네임 업데이트 실패:', error);
        throw error;
    }
}

/**
 * 코인 업데이트 (증감)
 */
export async function updateCoins(amount: number, uid?: string): Promise<void> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다.');
        return;
    }

    try {
        const userId = uid || await getUserId();
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
export async function updateTokens(amount: number, uid?: string): Promise<void> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다.');
        return;
    }

    try {
        const userId = uid || await getUserId();
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
export async function updateExpAndLevel(exp: number, level: number, uid?: string): Promise<void> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다.');
        return;
    }

    try {
        const userId = uid || await getUserId();
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

// ==================== 구독 ====================

/**
 * 군단 구독 데이터 저장
 */
export async function saveSubscriptions(subscriptions: any[]): Promise<void> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다.');
        return;
    }

    try {
        const userId = await getUserId();
        const subRef = doc(db, 'users', userId, 'factions', 'subscriptions');

        await setDoc(subRef, {
            data: subscriptions,
            updatedAt: serverTimestamp()
        });
        console.log('✅ 구독 데이터 Firebase 저장 성공');
    } catch (error) {
        console.error('❌ 구독 데이터 저장 실패:', error);
        throw error;
    }
}

/**
 * 군단 구독 데이터 로드
 */
export async function loadSubscriptions(): Promise<any[] | null> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다.');
        return null;
    }

    try {
        const userId = await getUserId();
        const subRef = doc(db, 'users', userId, 'factions', 'subscriptions');
        const docSnap = await getDoc(subRef);

        if (docSnap.exists()) {
            console.log('✅ 구독 데이터 Firebase 로드 성공');
            return docSnap.data().data || [];
        }

        return null;
    } catch (error) {
        console.error('❌ 구독 데이터 로드 실패:', error);
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
