import {
    signInAnonymously,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut,
    User
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';
import { gameStorage } from './game-storage';

/**
 * 구글 로그인
 */
export async function signInWithGoogle(): Promise<User | null> {
    if (!isFirebaseConfigured || !auth) {
        console.warn('Firebase가 설정되지 않았습니다.');
        return null;
    }

    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error: any) {
        console.error('구글 로그인 실패:', error);

        if (error.code === 'auth/unauthorized-domain') {
            alert('도메인 승인 오류: Firebase Console에서 현재 도메인을 승인된 도메인에 추가해야 로그인이 가능합니다.\n(Authentication > Settings > Authorized Domains)');
        } else if (error.code === 'auth/popup-closed-by-user') {
            console.log('사용자가 로그인 팝업을 닫았습니다.');
        } else if (error.code === 'auth/cancelled-popup-request') {
            // Multiple popups
        } else {
            alert(`로그인 오류가 발생했습니다: ${error.message}`);
        }

        return null;
    }
}

/**
 * 익명 로그인
 * 자동으로 사용자 ID를 생성하고 로그인합니다
 */
export async function signInAnonymous(): Promise<User | null> {
    if (!isFirebaseConfigured || !auth) {
        console.warn('Firebase가 설정되지 않았습니다.');
        return null;
    }

    try {
        const userCredential = await signInAnonymously(auth);
        return userCredential.user;
    } catch (error) {
        console.error('익명 로그인 실패:', error);
        return null;
    }
}

/**
 * 현재 로그인된 사용자 가져오기
 */
export function getCurrentUser(): User | null {
    if (!auth) return null;
    return auth.currentUser;
}

/**
 * 인증 상태 변경 리스너
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
    if (!auth) {
        callback(null);
        return () => { };
    }
    return onAuthStateChanged(auth, callback);
}

/**
 * 사용자 ID 가져오기 (없으면 익명 로그인)
 */
export async function getUserId(): Promise<string> {
    if (!isFirebaseConfigured) {
        return 'local-user'; // Firebase 미설정 시 로컬 사용자 ID 반환
    }

    let user = getCurrentUser();

    if (!user) {
        user = await signInAnonymous();
    }

    return user?.uid || 'local-user';
}

/**
 * 로그아웃
 * @description
 * This function orchestrates a clean and safe logout process.
 * 1. Clears all local session data ('Nuclear Option') to prevent "Zombie Data".
 * 2. Signs the user out from Firebase Authentication.
 * 3. Forces a page reload to ensure all React contexts and states are reset.
 */
export async function signOutUser(): Promise<void> {
    if (!auth) return;

    try {
        console.log('[Auth] Starting sign-out process...');

        // 1. Clear all sensitive local data BEFORE logging out
        // This prevents any chance of data bleeding into the next session.
        console.log('[Auth] Clearing local session data...');
        gameStorage.clearAllSessionData();

        // 2. Sign out from Firebase
        console.log('[Auth] Signing out from Firebase...');
        await signOut(auth);

        // 3. Force a full page reload to reset application state
        // This is a critical step to ensure UserContext and other states are cleared.
        if (typeof window !== 'undefined') {
            console.log('[Auth] Reloading page to ensure clean state...');
            window.location.href = '/';
        }

    } catch (error) {
        console.error('Sign-out failed:', error);
        // Optional: Add user-facing error notification
    }
}
