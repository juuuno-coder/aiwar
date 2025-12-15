'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function GameSidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { name: '홈', path: '/', icon: '🏠', color: 'from-blue-500 to-cyan-500' },
        { name: '스토리', path: '/story', icon: '📖', color: 'from-purple-500 to-pink-500' },
        { name: '대전', path: '/battle', icon: '⚔️', color: 'from-red-500 to-orange-500' },
        { name: 'AI 군단', path: '/factions', icon: '🤖', color: 'from-green-500 to-teal-500' },
        { name: '슬롯', path: '/slots', icon: '🎰', color: 'from-yellow-500 to-orange-500' },
        { name: '유니크', path: '/unique-unit', icon: '🌟', color: 'from-purple-500 to-indigo-500' },
        { name: '상점', path: '/shop', icon: '🛒', color: 'from-pink-500 to-rose-500' },
        { name: '강화', path: '/enhance', icon: '⚡', color: 'from-yellow-500 to-amber-500' },
        { name: '랭킹', path: '/ranking', icon: '🏆', color: 'from-amber-500 to-yellow-500' },
    ];

    const quickLinks = [
        { name: '인벤토리', path: '/inventory', icon: '📦' },
        { name: '미션', path: '/missions', icon: '🎯' },
        { name: '업적', path: '/achievements', icon: '🏅' },
        { name: '설정', path: '/settings', icon: '⚙️' },
    ];

    return (
        <aside className={`fixed left-0 top-0 bottom-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-r-2 border-purple-500/30 transition-all duration-300 z-40 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className="h-full flex flex-col">
                {/* 로고 */}
                <div className="p-4 border-b border-gray-700">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-purple-500/50">
                            ⚡
                        </div>
                        {!isCollapsed && (
                            <div>
                                <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                    AI War
                                </div>
                                <div className="text-xs text-gray-400">AI 대전</div>
                            </div>
                        )}
                    </Link>
                </div>

                {/* 메인 메뉴 */}
                <nav className="flex-1 overflow-y-auto py-4 px-2">
                    <div className="space-y-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${isActive
                                            ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                    title={item.name}
                                >
                                    <span className="text-2xl">{item.icon}</span>
                                    {!isCollapsed && (
                                        <span className="font-medium">{item.name}</span>
                                    )}
                                    {isActive && !isCollapsed && (
                                        <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* 구분선 */}
                    <div className="my-4 border-t border-gray-700"></div>

                    {/* 빠른 링크 */}
                    <div className="space-y-1">
                        {quickLinks.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                                title={item.name}
                            >
                                <span className="text-xl">{item.icon}</span>
                                {!isCollapsed && (
                                    <span className="text-sm">{item.name}</span>
                                )}
                            </Link>
                        ))}
                    </div>
                </nav>

                {/* 토글 버튼 */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-4 border-t border-gray-700 text-gray-400 hover:text-white transition-colors"
                >
                    <span className="text-xl">{isCollapsed ? '→' : '←'}</span>
                </button>
            </div>
        </aside>
    );
}
