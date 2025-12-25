'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signup, login, validateUsername, validatePassword, validateNickname } from '@/lib/auth-utils';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { HoverBorderGradient } from '@/components/ui/aceternity/hover-border-gradient';

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

        // Validation
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

        // Signup Attempt
        const signupResult = signup(username, password, nickname);

        if (signupResult.success) {
            // Auto Login
            login(username, password);

            setTimeout(() => {
                router.push('/'); // Redirect to Intro/Main which will handle auth check
            }, 500);
        } else {
            setError(signupResult.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
            <BackgroundBeams className="opacity-40" />

            <div className="relative z-10 max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4 animate-pulse">🧬</div>
                    <h1 className="text-4xl font-black text-white mb-2 orbitron tracking-tight">NEW RECRUIT_</h1>
                    <p className="text-cyan-400/60 font-mono text-sm tracking-widest">JOIN THE NEURAL NETWORK</p>
                </div>

                {/* Signup Form */}
                <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-[0_0_50px_rgba(88,28,135,0.2)] relative">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-2xl translate-x-1 -translate-y-1" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-purple-500/30 rounded-bl-2xl -translate-x-1 translate-y-1" />

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* ID */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Identity (ID)</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-mono text-sm"
                                placeholder="USERNAME"
                                required
                            />
                        </div>

                        {/* Nickname */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Callsign (Nickname)</label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-mono text-sm"
                                placeholder="DISPLAY NAME"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Access Code</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-mono text-sm"
                                placeholder="PASSWORD"
                                required
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Verify Code</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-mono text-sm"
                                placeholder="CONFIRM PASSWORD"
                                required
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-900/20 border border-red-500/50 rounded p-3 text-red-400 text-xs font-mono text-center animate-pulse">
                                [ERROR]: {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-4">
                            <HoverBorderGradient
                                as="button"
                                type="submit"
                                disabled={isLoading}
                                containerClassName="w-full rounded-xl"
                                className="w-full bg-gradient-to-r from-purple-900/80 to-pink-900/80 hover:from-purple-800 hover:to-pink-800 text-white py-4 font-black orbitron tracking-widest uppercase"
                            >
                                {isLoading ? 'REGISTERING...' : 'INITIATE REGISTRATION'}
                            </HoverBorderGradient>
                        </div>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-8 flex flex-col items-center gap-4 text-sm font-mono">
                        <p className="text-gray-500 text-xs">
                            ALREADY REGISTERED?{' '}
                            <Link href="/intro" className="text-purple-400 hover:text-purple-300 font-bold ml-1 hover:underline">
                                LOGIN HERE
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
