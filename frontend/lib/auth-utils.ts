// 인증 시스템 유틸리티

export interface User {
    id: string;
    username: string;
    nickname: string;
    createdAt: number;
}

export interface AuthSession {
    user: User;
    token: string;
    expiresAt: number;
}

/**
 * 회원가입
 */
export function signup(email: string, password: string): { success: boolean; message: string; user?: User } {
    // 기존 사용자 확인
    const users = getAllUsers();

    if (users.find(u => u.username.toLowerCase() === email.toLowerCase())) {
        return { success: false, message: '이미 등록된 이메일 주소입니다.' };
    }

    // 새 사용자 생성
    const newUser: User = {
        id: `user-${Date.now()}`,
        username: email,
        nickname: '', // Nickname will be set during first login onboarding
        createdAt: Date.now()
    };

    // 사용자 저장
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // 비밀번호 저장 (실제로는 해싱해야 하지만 데모용)
    const passwords = getPasswords();
    passwords[email] = password;
    localStorage.setItem('passwords', JSON.stringify(passwords));

    return { success: true, message: '회원가입이 완료되었습니다.', user: newUser };
}

/**
 * 로그인
 */
export function login(username: string, password: string): { success: boolean; message: string; session?: AuthSession } {
    const users = getAllUsers();
    const passwords = getPasswords();

    const user = users.find(u => u.username === username);

    if (!user) {
        return { success: false, message: '존재하지 않는 아이디입니다.' };
    }

    if (passwords[username] !== password) {
        return { success: false, message: '비밀번호가 일치하지 않습니다.' };
    }

    // 세션 생성
    const session: AuthSession = {
        user,
        token: `token-${Date.now()}`,
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7일
    };

    // 세션 저장
    localStorage.setItem('auth-session', JSON.stringify(session));

    return { success: true, message: '로그인 성공!', session };
}

import { gameStorage } from './game-storage';

/**
 * 로그아웃
 */
export function logout(): void {
    // Aggressively clear all session-related data from localStorage
    gameStorage.clearAllSessionData();
    // The auth-session key is also cleared by the above function, but we'll leave this for good measure.
    localStorage.removeItem('auth-session');
    console.log("Logout successful and all session data cleared.");
}

/**
 * 현재 세션 가져오기
 */
export function getCurrentSession(): AuthSession | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const sessionData = localStorage.getItem('auth-session');

    if (!sessionData) {
        return null;
    }

    const session: AuthSession = JSON.parse(sessionData);

    // 세션 만료 확인
    if (session.expiresAt < Date.now()) {
        logout();
        return null;
    }

    return session;
}

/**
 * 로그인 여부 확인
 */
export function isLoggedIn(): boolean {
    return getCurrentSession() !== null;
}

/**
 * 현재 사용자 정보 가져오기
 */
export function getCurrentUser(): User | null {
    const session = getCurrentSession();
    return session ? session.user : null;
}

/**
 * 게스트로 시작
 */
export function startAsGuest(): { success: boolean; session: AuthSession } {
    const guestUser: User = {
        id: `guest-${Date.now()}`,
        username: 'guest',
        nickname: `게스트${Math.floor(Math.random() * 9000) + 1000}`,
        createdAt: Date.now()
    };

    const session: AuthSession = {
        user: guestUser,
        token: `guest-token-${Date.now()}`,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 1일
    };

    localStorage.setItem('auth-session', JSON.stringify(session));

    return { success: true, session };
}

import { signInWithGoogle as firebaseSignInWithGoogle } from './firebase-auth';

/**
 * 구글 로그인 (Firebase Real)
 */
export async function signInWithGoogle(): Promise<{ success: boolean; message: string; session?: AuthSession }> {
    try {
        const firebaseUser = await firebaseSignInWithGoogle();

        if (!firebaseUser) {
            return { success: false, message: 'Google 로그인 취소 또는 실패' };
        }

        // Firebase User -> Local AuthSession 변환
        const user: User = {
            id: firebaseUser.uid,
            username: firebaseUser.email || `google_${firebaseUser.uid.slice(0, 8)}`,
            nickname: firebaseUser.displayName || 'Commander',
            createdAt: parseInt(firebaseUser.metadata.creationTime ? new Date(firebaseUser.metadata.creationTime).getTime().toString() : Date.now().toString())
        };

        const session: AuthSession = {
            user,
            token: await firebaseUser.getIdToken(),
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
        };

        localStorage.setItem('auth-session', JSON.stringify(session));
        return { success: true, message: 'Google 로그인 성공!', session };
    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, message: '로그인 중 오류가 발생했습니다.' };
    }
}

/**
 * 게스트로 시작 (Alias for startAsGuest to match UI usage)
 */
export const signInAsGuest = startAsGuest;

/**
 * 테스트 군단장으로 로그인 (개발/테스트용)
 * 모든 자원을 풍족하게 설정하여 시작
 */
// function loginAsTestCommander removed

/**
 * 모든 사용자 가져오기
 */
function getAllUsers(): User[] {
    const data = localStorage.getItem('users');
    return data ? JSON.parse(data) : [];
}

/**
 * 비밀번호 맵 가져오기
 */
function getPasswords(): Record<string, string> {
    const data = localStorage.getItem('passwords');
    return data ? JSON.parse(data) : {};
}

/**
 * 이메일 유효성 검사
 */
export function validateEmail(email: string): { valid: boolean; message: string } {
    if (!email) {
        return { valid: false, message: '이메일을 입력해 주세요.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, message: '유효한 이메일 형식이 아닙니다.' };
    }

    return { valid: true, message: '' };
}

/**
 * (Alias for reverse compatibility or specific ID usage if needed)
 */
export const validateUsername = validateEmail;

/**
 * 비밀번호 유효성 검사
 */
export function validatePassword(password: string): { valid: boolean; message: string } {
    if (password.length < 4) {
        return { valid: false, message: '비밀번호는 4자 이상이어야 합니다.' };
    }

    if (password.length > 50) {
        return { valid: false, message: '비밀번호는 50자 이하여야 합니다.' };
    }

    return { valid: true, message: '' };
}

/**
 * 닉네임 유효성 검사
 */
export function validateNickname(nickname: string): { valid: boolean; message: string } {
    if (nickname.length < 2) {
        return { valid: false, message: '닉네임은 2자 이상이어야 합니다.' };
    }

    if (nickname.length > 20) {
        return { valid: false, message: '닉네임은 20자 이하여야 합니다.' };
    }

    return { valid: true, message: '' };
}
