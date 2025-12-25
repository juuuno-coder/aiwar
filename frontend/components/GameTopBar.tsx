'use client';

import { useState, useEffect } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext';
import { onGameStateChange, getGameState } from '@/lib/game-state';
import { Settings, LogOut, Bell } from 'lucide-react';
import { logout } from '@/lib/auth-utils';

interface GameTopBarProps {
    sidebarCollapsed?: boolean;
}

export default function GameTopBar({ sidebarCollapsed = false }: GameTopBarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { t } = useTranslation();
    const { profile, loading } = useUserProfile();

    // State initialization with defaults
    const [userTokens, setUserTokens] = useState(0);
    const [userCoins, setUserCoins] = useState(0);
    const [userLevel, setUserLevel] = useState(1);
    const [userExp, setUserExp] = useState(0);
    const [requiredExp, setRequiredExp] = useState(100);

    const navLinks = [
        { name: t('menu.story'), path: '/story', color: 'cyan' },
        { name: t('menu.battle'), path: '/battle', color: 'red' },
        { name: t('menu.aiFaction'), path: '/factions', color: 'green' },
        { name: 'LAB', path: '/lab', color: 'amber' },
        { name: t('menu.pvp'), path: '/pvp', color: 'purple' },
        { name: t('menu.ranking'), path: '/ranking', color: 'pink' },
    ];

    // Load initial state and subscribe to events
    useEffect(() => {
        const loadState = () => {
            if (typeof window !== 'undefined') {
                const state = getGameState();
                setUserTokens(state.tokens || 2000);
                setUserCoins(state.coins || 10000);
                setUserLevel(state.level || 1);
                setUserExp(state.experience || 0);
                setRequiredExp((state.level || 1) * 100);
            }
        };

        loadState();

        const unsubscribeTokens = onGameStateChange('TOKENS_UPDATED', (newState) => {
            setUserTokens(newState.tokens);
        });

        const unsubscribeLevel = onGameStateChange('LEVEL_UP', (newState) => {
            setUserLevel(newState.level);
            setUserExp(newState.experience);
            setRequiredExp((newState.level || 1) * 100);
        });

        const unsubscribeState = onGameStateChange('STATE_UPDATED', (newState) => {
            setUserTokens(newState.tokens);
            setUserCoins(newState.coins || 0);
            setUserLevel(newState.level);
            setUserExp(newState.experience);
            setRequiredExp((newState.level || 1) * 100);
        });

        return () => {
            unsubscribeTokens();
            unsubscribeLevel();
            unsubscribeState();
        };
    }, []);

    useEffect(() => {
        if (profile) {
            setUserTokens(profile.tokens || 0);
            setUserCoins(profile.coins || 0);
            setUserLevel(profile.level || 1);
            setUserExp(profile.exp || 0);
            setRequiredExp((profile.level || 1) * 100);
        }
    }, [profile]);

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        setIsAuthenticated(!!localStorage.getItem('nickname'));
    }, []);

    const handleLogout = () => {
        if (confirm('로그아웃하시겠습니까?')) {
            logout();
            router.push('/intro');
        }
    };

    return (
        <div
            className="fixed top-0 left-0 right-0 h-16 bg-black/90 backdrop-blur-2xl border-b border-cyan-500/10 z-30 px-6 flex items-center justify-between transition-all duration-300 ease-out"
        >
            {/* Decorative top line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[var(--primary-blue)] via-transparent to-[var(--primary-purple)]" />

            {/* Left - Logo */}
            <div className="flex items-center gap-4">
                <Link href={isAuthenticated ? "/main" : "/intro"} className="group flex items-center gap-2">
                    <span className="text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 group-hover:scale-105 transition-transform font-orbitron">
                        AI WAR
                    </span>
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]" />
                </Link>
            </div>

            {/* Middle - Navigation */}
            <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8 h-full">
                {navLinks.map((link) => {
                    const isActive = pathname.startsWith(link.path);
                    return (
                        <Link
                            key={link.path}
                            href={link.path}
                            className="relative h-full flex items-center group"
                        >
                            <span className={`text-sm md:text-base font-black tracking-[0.2em] orbitron transition-all duration-300 ${isActive
                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                                : 'text-white/40 group-hover:text-white group-hover:scale-105'
                                }`}>
                                {link.name}
                            </span>

                            {/* Active indicator */}
                            {isActive && (
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 shadow-[0_0_15px_rgba(34,211,238,0.8)] rounded-full" />
                            )}

                            {/* Hover highlight */}
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </Link>
                    );
                })}
            </nav>

            {/* Right - Stats & Actions */}
            <div className="flex items-center gap-3 ml-auto">
                {/* Level & Exp */}
                <div className="hidden xl:flex flex-col items-end gap-0.5 px-3 py-1.5 bg-black/40 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-white/30 font-mono uppercase">SYNC LV</span>
                        <span className="text-sm font-black orbitron text-cyan-400">{userLevel}</span>
                    </div>
                    <div className="w-24 h-1 bg-black/50 rounded-full overflow-hidden border border-white/10">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                            style={{ width: `${(userExp / requiredExp) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Coins */}
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-amber-500/20">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-xs shadow-md">
                        💰
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="text-[8px] text-amber-400/60 font-mono uppercase">Coins</div>
                        <div className="text-xs font-black orbitron text-amber-400">
                            {userCoins.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Tokens */}
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-purple-500/20">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-xs shadow-md">
                        💎
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="text-[8px] text-purple-400/60 font-mono uppercase">Tokens</div>
                        <div className="text-xs font-black orbitron text-purple-400">
                            {userTokens.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-white/10" />

                {/* Notification */}
                <button className="relative w-9 h-9 flex items-center justify-center bg-black/40 hover:bg-white/10 border border-white/5 rounded-lg transition-all group">
                    <Bell size={16} className="text-white/40 group-hover:text-white transition-colors" />
                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_6px_rgba(239,68,68,0.8)] animate-pulse" />
                </button>

                {/* Settings */}
                <Link
                    href="/settings"
                    className="w-9 h-9 flex items-center justify-center bg-black/40 hover:bg-white/10 border border-white/5 rounded-lg transition-all group"
                >
                    <Settings size={16} className="text-white/40 group-hover:text-white group-hover:rotate-90 transition-all" />
                </Link>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-9 h-9 flex items-center justify-center bg-black/40 hover:bg-red-500/20 border border-white/5 hover:border-red-500/30 rounded-lg transition-all group"
                >
                    <LogOut size={16} className="text-white/40 group-hover:text-red-400 transition-colors" />
                </button>
            </div>
        </div>
    );
}
