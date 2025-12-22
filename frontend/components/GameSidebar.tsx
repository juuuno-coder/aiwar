'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface GameSidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export default function GameSidebar({ isCollapsed, onToggle }: GameSidebarProps) {
    const pathname = usePathname();

    const menuItems = [
        { name: '홈', path: '/', icon: '🏠', color: 'cyan' },
        { name: '내 카드', path: '/my-cards', icon: '📦', color: 'purple' },
        { name: '슬롯', path: '/slots', icon: '🎰', color: 'amber' },
        { name: '강화', path: '/enhance', icon: '⚡', color: 'yellow' },
        { name: '합성', path: '/fusion', icon: '🔮', color: 'blue' },
        { name: '유니크', path: '/unique-create', icon: '✨', color: 'pink' },
        { name: '상점', path: '/shop', icon: '🛒', color: 'rose' },
        { name: '미션', path: '/missions', icon: '🎯', color: 'green' },
        { name: '업적', path: '/achievements', icon: '🏅', color: 'amber' },
        { name: '도감', path: '/encyclopedia', icon: '📖', color: 'cyan' },
    ];

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; text: string; glow: string }> = {
            cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', glow: 'shadow-[0_0_15px_rgba(34,211,238,0.3)]' },
            purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]' },
            yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', glow: 'shadow-[0_0_15px_rgba(234,179,8,0.3)]' },
            blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]' },
            pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', glow: 'shadow-[0_0_15px_rgba(236,72,153,0.3)]' },
            rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]' },
            green: { bg: 'bg-green-500/10', text: 'text-green-400', glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]' },
            amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]' },
        };
        return colors[color] || colors.cyan;
    };

    return (
        <aside
            className={`fixed right-0 top-0 bottom-0 bg-black/95 backdrop-blur-2xl border-l border-cyan-500/10 z-40 transition-all duration-300 ease-out ${isCollapsed ? 'w-20' : 'w-64'
                }`}
        >
            {/* Decorative top line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-cyan-500/50 via-purple-500/50 to-transparent" />

            <div className="h-full flex flex-col">
                {/* Logo Section */}
                <div className="p-4 border-b border-white/5">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="relative w-12 h-12 bg-black rounded-lg flex items-center justify-center text-2xl border border-cyan-500/20">
                                ⚡
                            </div>
                        </div>
                        {!isCollapsed && (
                            <div className="overflow-hidden">
                                <div className="text-lg font-black orbitron bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent italic whitespace-nowrap">
                                    AI WAR
                                </div>
                                <div className="text-[8px] text-white/30 tracking-[0.15em] font-mono uppercase whitespace-nowrap">QUICK_ACCESS</div>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        const colorClasses = getColorClasses(item.color);

                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${isActive
                                    ? `${colorClasses.bg} ${colorClasses.glow}`
                                    : 'hover:bg-white/5'
                                    }`}
                                title={item.name}
                            >
                                {/* Active indicator */}
                                {isActive && (
                                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gradient-to-b from-cyan-400 to-purple-400 rounded-full`} />
                                )}

                                <span className={`text-lg ${isActive ? '' : 'grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100'} transition-all`}>
                                    {item.icon}
                                </span>

                                {!isCollapsed && (
                                    <span className={`text-sm font-medium tracking-tight whitespace-nowrap ${isActive
                                        ? colorClasses.text
                                        : 'text-white/50 group-hover:text-white'
                                        } transition-colors`}>
                                        {item.name}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Controls */}
                <div className="p-3 space-y-1 border-t border-white/5">
                    <Link
                        href="/settings"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <span className="text-lg">⚙️</span>
                        {!isCollapsed && <span className="text-[10px] font-mono uppercase tracking-widest whitespace-nowrap">Settings</span>}
                    </Link>
                </div>

                {/* Toggle Button */}
                <button
                    onClick={onToggle}
                    className="p-4 border-t border-white/5 text-white/30 hover:text-cyan-400 transition-colors bg-black/50 hover:bg-cyan-500/5 flex items-center justify-center"
                >
                    <span className="text-lg transition-transform duration-300" style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        →
                    </span>
                </button>
            </div>
        </aside>
    );
}
