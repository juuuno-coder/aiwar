'use client';

import { useState, useEffect } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface GameTopBarProps {
    sidebarCollapsed?: boolean;
}

export default function GameTopBar({ sidebarCollapsed = false }: GameTopBarProps) {
    const pathname = usePathname();
    const { profile, loading } = useUserProfile();
    const [userTokens, setUserTokens] = useState(0);
    const [userLevel, setUserLevel] = useState(1);
    const [userExp, setUserExp] = useState(0);
    const [requiredExp, setRequiredExp] = useState(100);

    const navLinks = [
        { name: 'STORY', path: '/story', color: 'cyan' },
        { name: 'BATTLE', path: '/battle', color: 'red' },
        { name: 'FACTIONS', path: '/factions', color: 'green' },
        { name: 'SLOTS', path: '/slots', color: 'amber' },
        { name: 'ARENA', path: '/pvp', color: 'purple' },
        { name: 'RANKING', path: '/ranking', color: 'pink' },
    ];

    useEffect(() => {
        if (profile) {
            setUserTokens(profile.tokens || 0);
            setUserLevel(profile.level || 1);
            setUserExp(profile.exp || 0);
            setRequiredExp((profile.level || 1) * 100);
        } else if (!loading) {
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
        <div
            className="fixed top-0 left-0 h-16 bg-black/90 backdrop-blur-2xl border-b border-cyan-500/10 z-30 px-6 flex items-center justify-between transition-all duration-300 ease-out"
            style={{ right: sidebarCollapsed ? '80px' : '256px' }}
        >
            {/* Decorative top line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[var(--primary-blue)] via-transparent to-[var(--primary-purple)]" />

            {/* Left - Player Info */}
            <div className="flex items-center gap-4">
                <div className="relative group cursor-pointer">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="relative w-10 h-10 bg-[var(--dark-card)] rounded-full flex items-center justify-center text-lg border border-white/10">
                        👤
                    </div>
                </div>
                <div className="hidden lg:block">
                    <div className="text-[9px] text-[var(--text-muted)] font-mono tracking-widest uppercase">Commander_Registry</div>
                    <div className="text-sm font-black orbitron text-white">PLAYER_128</div>
                </div>
            </div>

            {/* Middle - Navigation */}
            <nav className="flex items-center gap-1 h-full">
                {navLinks.map((link) => {
                    const isActive = pathname.startsWith(link.path);
                    return (
                        <Link
                            key={link.path}
                            href={link.path}
                            className="relative h-full flex items-center px-4 group"
                        >
                            <span className={`text-[10px] font-black tracking-[0.15em] orbitron transition-colors duration-300 ${isActive
                                ? 'text-[var(--primary-blue)]'
                                : 'text-[var(--text-muted)] group-hover:text-white'
                                }`}>
                                {link.name}
                            </span>

                            {/* Active indicator */}
                            {isActive && (
                                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-[var(--primary-blue)] shadow-[0_0_10px_rgba(0,217,255,0.8)]" />
                            )}

                            {/* Hover effect */}
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    );
                })}
            </nav>

            {/* Right - Stats */}
            <div className="flex items-center gap-5">
                {/* Level & Exp */}
                <div className="hidden md:flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-[var(--text-muted)] font-mono uppercase">Sync_Level</span>
                        <span className="text-xs font-black orbitron text-[var(--primary-blue)]">LV.{userLevel}</span>
                    </div>
                    <div className="w-28 h-1 bg-[var(--dark-card)] rounded-full overflow-hidden border border-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-[var(--primary-blue)] to-[var(--primary-purple)] shadow-[0_0_5px_rgba(0,217,255,0.5)]"
                            style={{ width: `${(userExp / requiredExp) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Tokens */}
                <div className="flex items-center gap-2 bg-[var(--dark-card)] px-4 py-2 border border-[var(--primary-purple)]/30 rounded-lg">
                    <span className="text-lg">🪙</span>
                    <div>
                        <div className="text-[8px] text-[var(--text-muted)] font-mono uppercase">Token</div>
                        <div className="text-sm font-black orbitron text-[var(--primary-purple)]">
                            {userTokens.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Notification */}
                <button className="relative w-9 h-9 bg-[var(--dark-card)] hover:bg-white/5 border border-white/5 transition-all group rounded-lg overflow-hidden">
                    <span className="relative z-10 text-lg">🔔</span>
                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_5px_rgba(239,68,68,0.8)] animate-pulse" />
                </button>
            </div>
        </div>
    );
}
