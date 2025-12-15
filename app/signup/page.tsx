'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signup, login, validateUsername, validatePassword, validateNickname } from '@/lib/auth-utils';

export default function SignupPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // 유효성 검사
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.valid) {
            setError(usernameValidation.message);
            setIsLoading(false);
            return;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            setError(passwordValidation.message);
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            setIsLoading(false);
            return;
        }

        const nicknameValidation = validateNickname(nickname);
        if (!nicknameValidation.valid) {
            setError(nicknameValidation.message);
            setIsLoading(false);
            return;
        }

        // 회원가입 시도
        const signupResult = signup(username, password, nickname);

        if (signupResult.success) {
            // 자동 로그인
            login(username, password);

            setTimeout(() => {
                router.push('/');
            }, 500);
        } else {
            setError(signupResult.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center p-4">
            <div className="absolute inset-0 grid-pattern opacity-20"></div>

            <div className="relative z-10 max-w-md w-full">
                {/* 로고 */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">✨</div>
                    <h1 className="text-4xl font-bold text-white mb-2">회원가입</h1>
                    <p className="text-gray-300">새로운 계정을 만들어보세요</p>
                </div>

                {/* 회원가입 폼 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* 아이디 */}
                        <div>
                            <label className="block text-white font-bold mb-2">아이디</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="영문, 숫자, _ 사용 (3-20자)"
                                required
                            />
                        </div>

                        {/* 닉네임 */}
                        <div>
                            <label className="block text-white font-bold mb-2">닉네임</label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="게임 내 표시될 이름 (2-20자)"
                                required
                            />
                        </div>

                        {/* 비밀번호 */}
                        <div>
                            <label className="block text-white font-bold mb-2">비밀번호</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="4자 이상"
                                required
                            />
                        </div>

                        {/* 비밀번호 확인 */}
                        <div>
                            <label className="block text-white font-bold mb-2">비밀번호 확인</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="비밀번호를 다시 입력하세요"
                                required
                            />
                        </div>

                        {/* 에러 메시지 */}
                        {error && (
                            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-200 text-sm">
                                {error}
                            </div>
                        )}

                        {/* 회원가입 버튼 */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? '가입 중...' : '회원가입'}
                        </button>
                    </form>

                    {/* 로그인 링크 */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-300">
                            이미 계정이 있으신가요?{' '}
                            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-bold">
                                로그인
                            </Link>
                        </p>
                    </div>

                    {/* 뒤로가기 */}
                    <div className="mt-4 text-center">
                        <Link href="/intro" className="text-gray-400 hover:text-gray-300 text-sm">
                            ← 인트로로 돌아가기
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
