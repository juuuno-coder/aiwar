// Firebase Realtime Database 유틸리티
import {
    ref,
    set,
    get,
    update,
    onValue,
    off,
    serverTimestamp,
    DatabaseReference
} from 'firebase/database';
import { database, isFirebaseConfigured } from './firebase';
import { getUserId } from './firebase-auth';
import { GameState } from './game-storage';
import { CommanderResearch } from './research-system';
import { StageProgress } from './stage-system';

/**
 * 사용자 데이터 저장
 */
export async function saveUserData(path: string, data: any): Promise<void> {
    if (!isFirebaseConfigured || !database) {
        console.warn('Firebase Realtime Database가 설정되지 않았습니다.');
        return;
    }

    try {
        const userId = await getUserId();
        const dataRef = ref(database, `users/${userId}/${path}`);
        await set(dataRef, data);
        console.log(`✅ Firebase 저장 성공: ${path}`);
    } catch (error) {
        console.error(`❌ Firebase 저장 실패 (${path}):`, error);
        throw error;
    }
}

/**
 * 사용자 데이터 로드
 */
export async function loadUserData<T>(path: string, defaultValue: T): Promise<T> {
    if (!isFirebaseConfigured || !database) {
        console.warn('Firebase Realtime Database가 설정되지 않았습니다.');
        return defaultValue;
    }

    try {
        const userId = await getUserId();
        const dataRef = ref(database, `users/${userId}/${path}`);
        const snapshot = await get(dataRef);

        if (snapshot.exists()) {
            console.log(`✅ Firebase 로드 성공: ${path}`);
            return snapshot.val() as T;
        }

        return defaultValue;
    } catch (error) {
        console.error(`❌ Firebase 로드 실패 (${path}):`, error);
        return defaultValue;
    }
}

/**
 * 사용자 데이터 부분 업데이트
 */
export async function updateUserData(path: string, updates: any): Promise<void> {
    if (!isFirebaseConfigured || !database) {
        console.warn('Firebase Realtime Database가 설정되지 않았습니다.');
        return;
    }

    try {
        const userId = await getUserId();
        const dataRef = ref(database, `users/${userId}/${path}`);
        await update(dataRef, updates);
        console.log(`✅ Firebase 업데이트 성공: ${path}`);
    } catch (error) {
        console.error(`❌ Firebase 업데이트 실패 (${path}):`, error);
        throw error;
    }
}

/**
 * 실시간 리스닝
 */
export function listenToUserData<T>(
    path: string,
    callback: (data: T | null) => void
): () => void {
    if (!isFirebaseConfigured || !database) {
        console.warn('Firebase Realtime Database가 설정되지 않았습니다.');
        return () => { };
    }

    getUserId().then(userId => {
        const dataRef = ref(database, `users/${userId}/${path}`);

        onValue(dataRef, (snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.val() as T);
            } else {
                callback(null);
            }
        });

        // 정리 함수 반환
        return () => off(dataRef);
    });

    return () => { };
}

// ==================== 게임 상태 ====================

/**
 * 전체 게임 상태 저장
 */
export async function saveGameState(state: Partial<GameState>): Promise<void> {
    const updates: any = {};

    if (state.coins !== undefined) updates['profile/coins'] = state.coins;
    if (state.tokens !== undefined) updates['profile/tokens'] = state.tokens;
    if (state.level !== undefined) updates['profile/level'] = state.level;
    if (state.experience !== undefined) updates['profile/exp'] = state.experience;
    if (state.research) updates['research'] = state.research;
    if (state.stageProgress) updates['stageProgress'] = state.stageProgress;
    if (state.slots) updates['slots'] = state.slots;
    if (state.unlockedFactions) updates['unlockedFactions'] = state.unlockedFactions;

    updates['profile/lastLogin'] = serverTimestamp();

    if (!isFirebaseConfigured || !database) {
        return;
    }

    try {
        const userId = await getUserId();
        const userRef = ref(database, `users/${userId}`);
        await update(userRef, updates);
        console.log('✅ 게임 상태 저장 성공');
    } catch (error) {
        console.error('❌ 게임 상태 저장 실패:', error);
        throw error;
    }
}

/**
 * 전체 게임 상태 로드
 */
export async function loadGameState(): Promise<Partial<GameState> | null> {
    if (!isFirebaseConfigured || !database) {
        return null;
    }

    try {
        const userId = await getUserId();
        const userRef = ref(database, `users/${userId}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            console.log('✅ 게임 상태 로드 성공');

            return {
                coins: data.profile?.coins || 1000,
                tokens: data.profile?.tokens || 100,
                level: data.profile?.level || 1,
                experience: data.profile?.exp || 0,
                research: data.research,
                stageProgress: data.stageProgress,
                slots: data.slots || [],
                unlockedFactions: data.unlockedFactions || [],
                inventory: [],
                equipment: []
            };
        }

        return null;
    } catch (error) {
        console.error('❌ 게임 상태 로드 실패:', error);
        return null;
    }
}

// ==================== 연구 데이터 ====================

/**
 * 연구 데이터 저장
 */
export async function saveResearch(research: CommanderResearch): Promise<void> {
    await saveUserData('research', research);
}

/**
 * 연구 데이터 로드
 */
export async function loadResearch(): Promise<CommanderResearch | null> {
    return await loadUserData<CommanderResearch | null>('research', null);
}

// ==================== 스테이지 진행도 ====================

/**
 * 스테이지 진행도 저장
 */
export async function saveStageProgress(progress: StageProgress): Promise<void> {
    await saveUserData('stageProgress', progress);
}

/**
 * 스테이지 진행도 로드
 */
export async function loadStageProgress(): Promise<StageProgress | null> {
    return await loadUserData<StageProgress | null>('stageProgress', null);
}

// ==================== 리더보드 ====================

export interface LeaderboardEntry {
    userId: string;
    displayName: string;
    level: number;
    totalPower: number;
    winRate: number;
    rank?: number;
}

/**
 * 리더보드 업데이트
 */
export async function updateLeaderboard(entry: Omit<LeaderboardEntry, 'userId' | 'rank'>): Promise<void> {
    if (!isFirebaseConfigured || !database) {
        return;
    }

    try {
        const userId = await getUserId();
        const leaderboardRef = ref(database, `leaderboard/global/${userId}`);

        await set(leaderboardRef, {
            ...entry,
            userId,
            updatedAt: serverTimestamp()
        });

        console.log('✅ 리더보드 업데이트 성공');
    } catch (error) {
        console.error('❌ 리더보드 업데이트 실패:', error);
    }
}

/**
 * 리더보드 조회 (상위 100명)
 */
export async function getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    if (!isFirebaseConfigured || !database) {
        return [];
    }

    try {
        const leaderboardRef = ref(database, 'leaderboard/global');
        const snapshot = await get(leaderboardRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            const entries: LeaderboardEntry[] = Object.values(data);

            // 레벨과 총 전투력으로 정렬
            entries.sort((a, b) => {
                if (b.level !== a.level) return b.level - a.level;
                return b.totalPower - a.totalPower;
            });

            // 순위 할당
            return entries.slice(0, limit).map((entry, index) => ({
                ...entry,
                rank: index + 1
            }));
        }

        return [];
    } catch (error) {
        console.error('❌ 리더보드 조회 실패:', error);
        return [];
    }
}

/**
 * 내 순위 조회
 */
export async function getMyRank(): Promise<number | null> {
    if (!isFirebaseConfigured || !database) {
        return null;
    }

    try {
        const userId = await getUserId();
        const leaderboard = await getLeaderboard(1000); // 상위 1000명 조회

        const myEntry = leaderboard.find(entry => entry.userId === userId);
        return myEntry?.rank || null;
    } catch (error) {
        console.error('❌ 내 순위 조회 실패:', error);
        return null;
    }
}
