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
    DocumentData,
    addDoc,
    orderBy,
    collectionGroup,
    limit
} from 'firebase/firestore';
import { createUniqueCardFromApplication } from './unique-card-factory';
import { db, isFirebaseConfigured } from './firebase';
import { getUserId } from './firebase-auth';
import { CATEGORY_TOKEN_BONUS, FACTION_CATEGORY_MAP, TIER_MULTIPLIER } from './token-constants';
import { SubscriptionTier } from './faction-subscription';

// ==================== 사용자 프로필 ====================

export interface UserProfile {
    uid?: string; // Added for Ranking
    nickname?: string;
    email?: string; // Added
    displayName?: string; // Added
    photoURL?: string; // Added
    coins: number;
    tokens: number;
    level: number;
    exp: number;
    avatarUrl?: string;
    hasReceivedStarterPack?: boolean;
    createdAt?: any;
    lastLogin?: any;
    lastTokenUpdate?: any; // [NEW] 토큰 자동 충전 기준 시간
}

const BASE_MAX_TOKENS = 1000;
const BASE_RECHARGE_RATE = 100;

/**
 * 활성 구독 목록을 기반으로 보너스 계산
 */
function calculateTokenBonuses(subscriptions: { factionId: string; tier: SubscriptionTier }[]) {
    let bonusRecharge = 0;
    let bonusMaxCap = 0;
    let bonusSpeedMinutes = 0; // 감소할 분 (기본 60분 간격)

    subscriptions.forEach(sub => {
        const categoryKey = FACTION_CATEGORY_MAP[sub.factionId];
        if (!categoryKey) return;

        const bonusConfig = CATEGORY_TOKEN_BONUS[categoryKey];
        const multiplier = TIER_MULTIPLIER[sub.tier] || 1;

        if (bonusConfig.type === 'recharge_amount') {
            bonusRecharge += (bonusConfig.baseValue || 0) * multiplier;
        } else if (bonusConfig.type === 'max_capacity') {
            bonusMaxCap += (bonusConfig.baseValue || 0) * multiplier;
        } else if (bonusConfig.type === 'recharge_speed') {
            bonusSpeedMinutes += (bonusConfig.baseValue || 0) * multiplier;
        }
    });

    return { bonusRecharge, bonusMaxCap, bonusSpeedMinutes };
}

/**
 * 유저의 활성 구독 목록 조회
 */
export async function fetchUserSubscriptions(userId: string): Promise<any[]> {
    try {
        const subscriptionsRef = collection(db!, 'users', userId, 'subscriptions');
        const q = query(subscriptionsRef, where('status', '==', 'active'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        return [];
    }
}

/**
 * 토큰 자동 충전 체크 및 업데이트
 * @param subscriptions - [{ factionId: 'chatgpt', tier: 'pro' }, ...]
 */
export async function checkAndRechargeTokens(
    userId: string,
    currentTokens: number,
    lastUpdate: any,
    subscriptions: { factionId: string; tier: SubscriptionTier }[] = []
): Promise<number> {
    if (!lastUpdate) {
        // 첫 실행 시 현재 시간 기록
        const userRef = doc(db!, 'users', userId);
        await updateDoc(userRef, { lastTokenUpdate: serverTimestamp() });
        return currentTokens;
    }

    const { bonusRecharge, bonusMaxCap, bonusSpeedMinutes } = calculateTokenBonuses(subscriptions);

    // 기본 60분 - 보너스 단축 (최소 10분 간격은 유지)
    const rechargeIntervalMinutes = Math.max(10, 60 - bonusSpeedMinutes);

    // 최종 충전량 (시간당 기본 100 + 보너스)
    // 간격이 줄어들면, '1회 충전당 지급량'을 조절하거나, '시간당 총량'을 유지하거나 선택해야 함.
    // 여기서는 '시간당 총량' 개념보다 '충전 주기'가 빨라지는 것으로 기획됨 (이미지 카테고리).
    // => 단순히 (경과시간 / 주기) * (기본양 + 보너스양) 으로 계산.

    const rechargeAmountPerCycle = BASE_RECHARGE_RATE + bonusRecharge;
    const maxTokens = BASE_MAX_TOKENS + bonusMaxCap;

    const now = new Date();
    const lastDate = lastUpdate.toDate ? lastUpdate.toDate() : new Date(lastUpdate);
    const diffMs = now.getTime() - lastDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    // 충전 주기(Interval) 횟수 계산
    const cycles = Math.floor(diffMinutes / rechargeIntervalMinutes);

    if (cycles >= 1) {
        // 실제 충전량
        const totalRecharge = cycles * rechargeAmountPerCycle;

        let newTokens = currentTokens + totalRecharge;

        // 최대 보유량 체크
        if (newTokens > maxTokens) {
            // 이미 초과 상태면 유지, 아니면 max로
            if (currentTokens < maxTokens) {
                newTokens = maxTokens;
            } else {
                return currentTokens;
            }
        }

        const userRef = doc(db!, 'users', userId);
        // lastTokenUpdate를 '이번에 충전된 주기만큼' 앞으로 당김 (정확한 주기 유지)
        // 단, 너무 오래전이면 그냥 now로 리셋할수도 았으나, 정밀하게 하려면 cycles * interval 만큼 더해줌.
        const cyclesMs = cycles * rechargeIntervalMinutes * 60 * 1000;
        const newLastUpdate = new Date(lastDate.getTime() + cyclesMs);

        await updateDoc(userRef, {
            tokens: newTokens,
            lastTokenUpdate: newLastUpdate // Firestore Timestamp로 변환 필요하지만 JS Date도 허용될 수 있음, 안전하게 Timestamp 사용 권장되나 로컬 계산이라 Date 저장
        });

        console.log(`🔋 토큰 충전: +${newTokens - currentTokens} (주기: ${cycles}회, 간격: ${rechargeIntervalMinutes}분)`);
        return newTokens;
    }

    return currentTokens;
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
            coins: 0,
            tokens: 100,
            level: 1,
            exp: 0,
            hasReceivedStarterPack: false,
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
// ==================== 고객 지원 (Support) ====================

export interface SupportTicket {
    id?: string;
    userId: string;
    userNickname: string;
    type: 'error' | 'idea';
    title: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved' | 'rejected';
    createdAt: any;
    adminReply?: string;
}

/**
 * 티켓 생성 (오류 제보 / 아이디어)
 */
/**
 * 티켓 생성 (오류 제보 / 아이디어)
 */
export async function createTicket(data: { type: 'error' | 'idea', title: string, description: string, userNickname: string }): Promise<string> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase가 설정되지 않았습니다.');
        return 'local-id-' + Date.now();
    }

    try {
        const userId = await getUserId();
        const ticketsRef = collection(db, 'support_tickets');

        const docRef = await addDoc(ticketsRef, {
            ...data,
            userId,
            status: 'open',
            createdAt: serverTimestamp()
        });

        console.log('✅ 티켓 생성 성공:', data.title);
        return docRef.id;
    } catch (error) {
        console.error('❌ 티켓 생성 실패:', error);
        throw error;
    }
}

/**
 * 티켓 목록 로드 (관리자용)
 */
export async function loadSupportTickets(status?: string): Promise<SupportTicket[]> {
    if (!isFirebaseConfigured || !db) {
        return [];
    }

    try {
        const ticketsRef = collection(db, 'support_tickets');
        // Simple query, ideally indexed.
        // For now, load all or filter by status if provided
        let q = query(ticketsRef, orderBy('createdAt', 'desc'));

        if (status) {
            q = query(ticketsRef, where('status', '==', status), orderBy('createdAt', 'desc'));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportTicket));
    } catch (error) {
        console.error('❌ 티켓 로드 실패:', error);
        return [];
    }
}

/**
 * 티켓 상태 업데이트 (관리자용)
 */
export async function updateTicketStatus(ticketId: string, status: 'open' | 'in_progress' | 'resolved' | 'rejected', reply?: string): Promise<void> {
    if (!isFirebaseConfigured || !db) return;

    try {
        const ticketRef = doc(db, 'support_tickets', ticketId);
        const updateData: any = { status };
        if (reply) {
            updateData.adminReply = reply;
        }

        await updateDoc(ticketRef, updateData);
        console.log('✅ 티켓 상태 업데이트:', ticketId, status);
    } catch (error) {
        console.error('❌ 티켓 업데이트 실패:', error);
        throw error;
    }
}

// ==================== 유니크 신청 (Unique Requests) ====================

export interface UniqueRequest {
    id: string;
    userId: string;
    userNickname: string;
    name: string;
    description: string;
    imageUrl: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: any;
    adminComment?: string;
    materialCardIds?: string[]; // Optional: if we want to track what cards were consumed
}

/**
 * 유니크 신청 생성
 */
export async function createUniqueRequest(data: { name: string, description: string, imageUrl: string, userNickname: string }): Promise<string> {
    if (!isFirebaseConfigured || !db) {
        throw new Error('Firebase not configured');
    }

    try {
        const userId = await getUserId();
        const requestsRef = collection(db, 'unique_requests');

        const docRef = await addDoc(requestsRef, {
            ...data,
            userId,
            status: 'pending',
            createdAt: serverTimestamp()
        });

        console.log('✅ 유니크 신청 생성:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ 유니크 신청 실패:', error);
        throw error;
    }
}

/**
 * 유니크 신청 목록 로드 (관리자용)
 */
export async function loadUniqueRequests(status?: string): Promise<UniqueRequest[]> {
    if (!isFirebaseConfigured || !db) return [];

    try {
        const requestsRef = collection(db, 'unique_requests');
        let q = query(requestsRef, orderBy('createdAt', 'desc'));

        if (status) {
            q = query(requestsRef, where('status', '==', status), orderBy('createdAt', 'desc'));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UniqueRequest));
    } catch (error) {
        console.error('❌ 유니크 신청 로드 실패:', error);
        return [];
    }
}

/**
 * 유니크 신청 상태 업데이트 (관리자용)
 */
export async function updateUniqueRequestStatus(requestId: string, status: 'pending' | 'approved' | 'rejected', comment?: string): Promise<void> {
    if (!isFirebaseConfigured || !db) return;

    try {
        const requestRef = doc(db, 'unique_requests', requestId);
        const updateData: any = { status };
        if (comment) {
            updateData.adminComment = comment;
        }

        await updateDoc(requestRef, updateData);
        console.log('✅ 유니크 신청 업데이트:', requestId, status);

        // [NEW] 만약 승인(approved)되었다면, 실제 카드를 생성하여 유저에게 지급
        if (status === 'approved') {
            const success = await createUniqueCardFromApplication(requestId);
            if (!success) {
                console.error('⚠️ 카드 생성에 실패했습니다. 수동 지급이 필요할 수 있습니다.');
                // 실패했다고 신청 상태를 다시 돌리지는 않음 (관리자가 알아야 함)
                if (comment) {
                    await updateDoc(requestRef, { adminComment: comment + " (시스템 오류: 카드 자동 지급 실패)" });
                }
            }
        }
    } catch (error) {
        console.error('❌ 유니크 신청 업데이트 실패:', error);
        throw error;
    }
}
/**
 * 리더보드 데이터 로드
 */
/**
 * 리더보드 데이터 로드 (실제 DB 연동)
 */
export async function getLeaderboardData(limitCount = 50): Promise<UserProfile[]> {
    if (!isFirebaseConfigured || !db) return [];

    try {
        const usersRef = collection(db, 'users');
        // 레벨 내림차순 -> 경험치 내림차순 정렬
        // 주의: Firestore 복합 색인(Composite Index)이 필요할 수 있음.
        // 에러 발생 시 콘솔의 링크를 클릭하여 색인 생성 필요.
        const q = query(
            usersRef,
            orderBy('level', 'desc'),
            orderBy('exp', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                uid: doc.id,
                ...data
            } as UserProfile;
        });
    } catch (error) {
        console.error('❌ 리더보드 로드 실패:', error);
        return [];
    }
}
