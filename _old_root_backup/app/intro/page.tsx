'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { startAsGuest } from '@/lib/auth-utils';

export default function IntroPage() {
    const router = useRouter();
    const [isAnimating, setIsAnimating] = useState(false);

    const handleGuestStart = () => {
        setIsAnimating(true);
        startAsGuest();

        setTimeout(() => {
            router.push('/');
        }, 500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 overflow-hidden">
            {/* 배경 애니메이션 */}
            <div className="absolute inset-0 grid-pattern opacity-20"></div>

            {/* 메인 컨텐츠 */}
            <div className="relative z-10 max-w-4xl w-full">
                {/* 로고 및 타이틀 */}
                <div className="text-center mb-12 animate-float">
                    <div className="text-8xl mb-6 animate-pulse-glow">🤖</div>
                    <h1
                        className="text-7xl md:text-9xl font-bold mb-4 text-gradient"
                        style={{ fontFamily: 'Orbitron, sans-serif' }}
                    >
                        AI 대전
                    </h1>
                    <p className="text-2xl md:text-3xl text-white mb-2">
                        AI DAEJEON
                    </p>
                    <p className="text-lg md:text-xl text-gray-300">
                        2030년의 미래를 바꿀 카드 전략 게임
                    </p>
                </div>

                {/* 게임 소개 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
                    <h2 className="text-2xl font-bold text-white mb-4 text-center">🎮 게임 소개</h2>
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                        <div>
                            <div className="text-4xl mb-2">⚔️</div>
                            <h3 className="text-lg font-bold text-white mb-2">전략적 전투</h3>
                            <p className="text-sm text-gray-300">5전 3선승제로 치열한 전투를 펼치세요</p>
                        </div>
                        <div>
                            <div className="text-4xl mb-2">🤖</div>
                            <h3 className="text-lg font-bold text-white mb-2">13개 AI 군단</h3>
                            <p className="text-sm text-gray-300">각기 다른 특성을 가진 AI 군단을 수집하세요</p>
                        </div>
                        <div>
                            <div className="text-4xl mb-2">🏆</div>
                            <h3 className="text-lg font-bold text-white mb-2">랭킹 경쟁</h3>
                            <p className="text-sm text-gray-300">전 세계 플레이어와 순위를 겨루세요</p>
                        </div>
                    </div>
                </div>

                {/* 버튼 그룹 */}
                <div className="space-y-4">
                    <Link href="/login">
                        <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-xl font-bold transition-all transform hover:scale-105 hover:shadow-2xl">
                            🔐 로그인
                        </button>
                    </Link>

                    <Link href="/signup">
                        <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl text-xl font-bold transition-all transform hover:scale-105 hover:shadow-2xl">
                            ✨ 회원가입
                        </button>
                    </Link>

                    <button
                        onClick={handleGuestStart}
                        disabled={isAnimating}
                        className="w-full py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl text-xl font-bold transition-all border-2 border-white/30 hover:border-white/50 disabled:opacity-50"
                    >
                        👤 게스트로 시작
                    </button>
                </div>

                {/* 하단 정보 */}
                <div className="mt-8 text-center text-gray-400 text-sm">
                    <p>v0.6.0 - Phase 10 Update</p>
                    <p className="mt-2">© 2025 AI DAEJEON. All rights reserved.</p>
                </div>
            </div>

            {/* 파티클 효과 */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-500 rounded-full opacity-20 blur-3xl animate-pulse animation-delay-500"></div>
            <div className="absolute top-1/2 right-20 w-24 h-24 bg-pink-500 rounded-full opacity-20 blur-3xl animate-pulse animation-delay-1000"></div>
        </div>
    );
}
