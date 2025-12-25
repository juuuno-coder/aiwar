'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, validateUsername, validatePassword, signInAsGuest } from '@/lib/auth-utils';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
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

        // 로그인 시도 (Firebase or Mock)
        const result = login(username, password);

        if (result.success) {
            setTimeout(() => {
                router.push('/main');
            }, 500);
        } else {
            setError(result.message);
            setIsLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        const result = await signInAsGuest();
        if (result.success) {
            router.push('/main');
        } else {
            setError('게스트 로그인 실패');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
            <BackgroundBeams className="opacity-50" />

            <div className="relative z-10 max-w-md w-full">
                {/* 로고 */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4 animate-bounce-slow">🔐</div>
                    <h1 className="text-4xl font-black text-white mb-2 orbitron tracking-tight">ACCESS PROTOCOL</h1>
                    <p className="text-cyan-400/60 font-mono text-sm tracking-widest">SECURE USER AUTHENTICATION</p>
                </div>

                {/* 로그인 폼 */}
                <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl relative">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-3xl -translate-x-2 -translate-y-2" />
                    <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-purple-500/30 rounded-br-3xl translate-x-2 translate-y-2" />

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* 아이디 */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Identity</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-mono"
                                placeholder="USERNAME"
                                required
                            />
                        </div>

                        {/* 비밀번호 */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Access Key</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-mono"
                                placeholder="PASSWORD"
                                required
                            />
                        </div>

                        {/* 에러 메시지 */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-xs font-bold text-center">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* 로그인 버튼 */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-black orbitron tracking-widest transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/20"
                        >
                            {isLoading ? 'AUTHENTICATING...' : 'INITIALIZE LINK'}
                        </button>
                    </form>

                    <div className="my-6 flex items-center gap-4">
                        <div className="h-px bg-white/10 flex-1" />
                        <span className="text-xs text-gray-500 font-mono">OR CONTINUE WITH</span>
                        <div className="h-px bg-white/10 flex-1" />
                    </div>

                    <div className="space-y-3">
                        <GoogleLoginButton />

                        <button
                            onClick={handleGuestLogin}
                            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-lg font-bold transition-all text-sm"
                        >
                            Guest Mode (게스트 로그인)
                        </button>
                    </div>

                    {/* 회원가입/뒤로가기 */}
                    <div className="mt-8 flex flex-col items-center gap-4 text-sm">
                        <p className="text-gray-400">
                            New Commander?{' '}
                            <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-bold ml-1 hover:underline">
                                Register ID
                            </Link>
                        </p>
                        <Link href="/intro" className="text-gray-500 hover:text-white transition-colors text-xs font-mono">
                            ← ABORT SESSION
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
