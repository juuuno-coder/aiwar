'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, validateUsername, validatePassword } from '@/lib/auth-utils';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
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

        // 로그인 시도
        const result = login(username, password);

        if (result.success) {
            setTimeout(() => {
                router.push('/');
            }, 500);
        } else {
            setError(result.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
            <div className="absolute inset-0 grid-pattern opacity-20"></div>

            <div className="relative z-10 max-w-md w-full">
                {/* 로고 */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🔐</div>
                    <h1 className="text-4xl font-bold text-white mb-2">로그인</h1>
                    <p className="text-gray-300">AI 대전에 오신 것을 환영합니다</p>
                </div>

                {/* 로그인 폼 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 아이디 */}
                        <div>
                            <label className="block text-white font-bold mb-2">아이디</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="아이디를 입력하세요"
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
                                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="비밀번호를 입력하세요"
                                required
                            />
                        </div>

                        {/* 에러 메시지 */}
                        {error && (
                            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-200 text-sm">
                                {error}
                            </div>
                        )}

                        {/* 로그인 버튼 */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? '로그인 중...' : '로그인'}
                        </button>
                    </form>

                    {/* 회원가입 링크 */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-300">
                            계정이 없으신가요?{' '}
                            <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-bold">
                                회원가입
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
