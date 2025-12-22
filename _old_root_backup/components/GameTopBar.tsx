'use client';

import { useState, useEffect } from 'react';
import ExpBar from './ExpBar';
import { useUserProfile } from '@/hooks/useUserProfile';

export default function GameTopBar() {
    const { profile, loading } = useUserProfile();
    const [userTokens, setUserTokens] = useState(0);
    const [userLevel, setUserLevel] = useState(1);
    const [userExp, setUserExp] = useState(0);
    const [requiredExp, setRequiredExp] = useState(100);

    useEffect(() => {
        if (profile) {
            // Firebase 데이터 사용
            setUserTokens(profile.tokens || 0);
            setUserLevel(profile.level || 1);
            setUserExp(profile.exp || 0);
            setRequiredExp((profile.level || 1) * 100);
        } else if (!loading) {
            // Firebase 로딩 완료 후에도 데이터가 없으면 localStorage 사용
            const loadFromLocalStorage = () => {
                if (typeof window !== 'undefined') {
                    const state = JSON.parse(localStorage.getItem('gameState') || '{}');
                    setUserTokens(state.tokens || 2000);
                    setUserLevel(state.level || 1);
                    setUserExp(state.experience || 0);
                    setRequiredExp((state.level || 1) * 100);
                }
            };
            loadFromLocalStorage();
        }
    }, [profile, loading]);

    return (
        <div className="fixed top-0 right-0 left-64 h-20 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b-2 border-purple-500/30 z-30 px-6 flex items-center justify-between">
            {/* 왼쪽 - 플레이어 정보 */}
            <div className="flex items-center gap-6">
                {/* 프로필 */}
                <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-2xl border-2 border-purple-400 shadow-lg shadow-purple-500/50">
                        👤
                    </div>
                    <div>
                        <div className="text-white font-bold">플레이어</div>
                        <div className="text-xs text-gray-400">레벨 {userLevel}</div>
                    </div>
                </div>

                {/* 경험치 바 */}
                <div className="w-56">
                    <ExpBar
                        currentExp={userExp}
                        requiredExp={requiredExp}
                        level={userLevel}
                        showLabel={true}
                        size="md"
                    />
                </div>
            </div>

            {/* 오른쪽 - 리소스 */}
            <div className="flex items-center gap-4">
                {/* 토큰 */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-2 border-yellow-500/50 rounded-xl px-4 py-2 shadow-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-lg shadow-lg">
                        💰
                    </div>
                    <div>
                        <div className="text-xs text-gray-400">토큰</div>
                        <div className="text-lg font-bold text-yellow-300">{userTokens.toLocaleString()}</div>
                    </div>
                </div>

                {/* 알림 */}
                <button className="relative w-12 h-12 bg-white/5 hover:bg-white/10 rounded-xl transition-colors flex items-center justify-center">
                    <span className="text-2xl">🔔</span>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                        3
                    </div>
                </button>

                {/* 설정 */}
                <button className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-xl transition-colors flex items-center justify-center">
                    <span className="text-2xl">⚙️</span>
                </button>
            </div>
        </div>
    );
}
