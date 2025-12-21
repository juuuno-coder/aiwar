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
export function signup(username: string, password: string, nickname: string): { success: boolean; message: string; user?: User } {
    // 기존 사용자 확인
    const users = getAllUsers();

    if (users.find(u => u.username === username)) {
        return { success: false, message: '이미 존재하는 아이디입니다.' };
    }

    // 새 사용자 생성
    const newUser: User = {
        id: `user-${Date.now()}`,
        username,
        nickname,
        createdAt: Date.now()
    };

    // 사용자 저장
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // 비밀번호 저장 (실제로는 해싱해야 하지만 데모용)
    const passwords = getPasswords();
    passwords[username] = password;
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

/**
 * 로그아웃
 */
export function logout(): void {
    localStorage.removeItem('auth-session');
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
 * 사용자 이름 유효성 검사
 */
export function validateUsername(username: string): { valid: boolean; message: string } {
    if (username.length < 3) {
        return { valid: false, message: '아이디는 3자 이상이어야 합니다.' };
    }

    if (username.length > 20) {
        return { valid: false, message: '아이디는 20자 이하여야 합니다.' };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { valid: false, message: '아이디는 영문, 숫자, _만 사용 가능합니다.' };
    }

    return { valid: true, message: '' };
}

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
