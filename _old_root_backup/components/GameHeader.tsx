'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function GameHeader() {
    const pathname = usePathname();
    const [userTokens, setUserTokens] = useState(0);
    const [userLevel, setUserLevel] = useState(1);

    useEffect(() => {
        // 게임 상태 로드
        const loadGameState = () => {
            if (typeof window !== 'undefined') {
                const state = JSON.parse(localStorage.getItem('gameState') || '{}');
                setUserTokens(state.tokens || 2000);
                setUserLevel(state.level || 1);
            }
        };

        loadGameState();

        // 1초마다 상태 업데이트
        const interval = setInterval(loadGameState, 1000);
        return () => clearInterval(interval);
    }, []);

    const menuItems = [
        { name: '스토리', path: '/story', icon: '📖' },
        { name: '대전', path: '/battle', icon: '⚔️' },
        { name: 'AI 군단', path: '/factions', icon: '🤖' },
        { name: '슬롯', path: '/slots', icon: '🎰' },
        { name: '유니크', path: '/unique-unit', icon: '🌟' },
        { name: '상점', path: '/shop', icon: '🛒' },
        { name: '강화', path: '/enhance', icon: '⚡' },
        { name: '랭킹', path: '/ranking', icon: '🏆' },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-purple-900/95 via-blue-900/95 to-purple-900/95 backdrop-blur-md border-b-2 border-purple-500/50 z-50">
            <div className="h-full px-6 flex items-center justify-between">
                {/* 로고 */}
                <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-transform">
                    <div className="text-3xl font-bold text-gradient">AI War</div>
                    <div className="text-sm text-gray-400">AI 대전</div>
                </Link>

                {/* 메인 메뉴 */}
                <nav className="flex items-center gap-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${pathname === item.path
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                                }`}
                        >
                            <span className="mr-1">{item.icon}</span>
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* 유저 정보 */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-lg border border-yellow-500/50">
                        <span className="text-yellow-400">💰</span>
                        <span className="font-bold text-yellow-300">{userTokens.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-lg border border-blue-500/50">
                        <span className="text-blue-400">⭐</span>
                        <span className="font-bold text-blue-300">Lv.{userLevel}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
