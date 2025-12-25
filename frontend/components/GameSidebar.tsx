'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext';
import { useState, useEffect } from 'react';
import { Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { logout } from '@/lib/auth-utils';

interface GameSidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export default function GameSidebar({ isCollapsed, onToggle }: GameSidebarProps) {
    const pathname = usePathname();
    const { t } = useTranslation();
    const [nickname, setNickname] = useState('COMMANDER');

    useEffect(() => {
        const stored = localStorage.getItem('nickname');
        if (stored) setNickname(stored);
    }, []);

    const menuItems = [
        { name: t('menu.myCards'), path: '/my-cards', icon: '📦', color: 'purple' },
        { name: t('menu.generation'), path: '/generation', icon: '🎲', color: 'green' },
        { name: t('menu.uniqueGeneration'), path: '/unique-create', icon: '✨', color: 'pink' },
        { name: t('menu.enhance'), path: '/enhance', icon: '🆙', color: 'amber' },
        { name: t('menu.fusion'), path: '/fusion', icon: '🔮', color: 'blue' },
        { name: t('menu.encyclopedia'), path: '/encyclopedia', icon: '📖', color: 'cyan' },
    ];

    const handleWheel = (e: React.WheelEvent) => {
        const main = document.getElementById('main-content');
        if (main) {
            main.scrollTop += e.deltaY;
        }
    };

    const handleLogout = () => {
        if (confirm('LOGOUT_CONFIRM?')) {
            logout();
        }
    };

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; glow: string }> = {
            cyan: { bg: 'bg-cyan-500/10', glow: 'shadow-[0_0_10px_rgba(34,211,238,0.2)]' },
            purple: { bg: 'bg-purple-500/10', glow: 'shadow-[0_0_10px_rgba(168,85,247,0.2)]' },
            green: { bg: 'bg-green-500/10', glow: 'shadow-[0_0_10px_rgba(34,197,94,0.2)]' },
            amber: { bg: 'bg-amber-500/10', glow: 'shadow-[0_0_10px_rgba(245,158,11,0.2)]' },
            blue: { bg: 'bg-blue-500/10', glow: 'shadow-[0_0_10px_rgba(59,130,246,0.2)]' },
            pink: { bg: 'bg-pink-500/10', glow: 'shadow-[0_0_10px_rgba(236,72,153,0.2)]' },
            red: { bg: 'bg-red-500/10', glow: 'shadow-[0_0_10px_rgba(239,68,68,0.2)]' },
        };
        return colors[color] || colors.cyan;
    };

    return (
        <aside
            className={`fixed right-0 top-16 bottom-[200px] bg-black/95 backdrop-blur-2xl border-l border-white/5 z-50 transition-all duration-300 ease-out overflow-hidden flex flex-col ${isCollapsed ? 'w-20' : 'w-64'}`}
            onWheel={handleWheel}
        >
            {/* Top Border Gradient */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

            {/* Toggle Button */}
            <button
                onClick={onToggle}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-12 bg-black/50 border border-white/10 rounded-l-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-black/80 transition-all z-50 backdrop-blur-sm group/toggle"
            >
                {isCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>

            {/* 1. Commander Profile */}
            <div className="p-6 border-b border-white/5 flex flex-col items-center flex-none">
                <div className={`relative mb-3 transition-all ${isCollapsed ? 'w-10 h-10' : 'w-20 h-20'}`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full opacity-20 animate-pulse" />
                    <div className="absolute inset-0 border border-white/10 rounded-full" />
                    <div className="w-full h-full rounded-full bg-black/50 flex items-center justify-center text-2xl overflow-hidden relative">
                        {/* Placeholder Avatar */}
                        <span className="z-10 relative">👨‍✈️</span>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />
                    </div>
                    {/* Online Status Indicator */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black shadow-[0_0_5px_#22c55e]" />
                </div>

                {!isCollapsed && (
                    <div className="text-center w-full">
                        <h3 className="font-bold text-white text-sm mb-1 truncate px-2 font-orbitron">{nickname}</h3>
                        <div className="flex items-center justify-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[9px] font-mono text-cyan-400">SYSTEM_ONLINE</span>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Menu Items */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    const colors = getColorClasses(item.color);

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 group relative ${isActive
                                ? `${colors.bg} border border-${item.color}-500/20`
                                : 'hover:bg-white/5 border border-transparent'
                                }`}
                            title={item.name}
                        >
                            {/* Active Glow */}
                            {isActive && (
                                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-${item.color}-500/50 rounded-r-full shadow-[0_0_10px_currentColor]`} />
                            )}

                            <span className={`text-xl flex-none ${isActive ? '' : 'grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100'} transition-all`}>
                                {item.icon}
                            </span>

                            {!isCollapsed && (
                                <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'} transition-colors font-mono tracking-wide truncate`}>
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Gradient Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10" />
        </aside>
    );
}
