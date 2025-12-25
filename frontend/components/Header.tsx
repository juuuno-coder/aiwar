'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Header() {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Story', href: '/story' },
        { name: 'Battle', href: '/battle' },
        { name: 'AI Factions', href: '/factions' },
        { name: 'Shop', href: '/shop' },
        { name: 'Lab', href: '/lab' },
        { name: 'PVP Arena', href: '/pvp/realtime' },
        { name: 'Ranking', href: '/ranking' },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-purple-500/10">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/main">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-3 cursor-pointer"
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-black text-xl">AI</span>
                            </div>
                            <span className="text-2xl font-black bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
                                WAR
                            </span>
                        </motion.div>
                    </Link>

                    {/* Navigation Menu */}
                    <nav className="flex items-center gap-8">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                            return (
                                <Link key={item.href} href={item.href}>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className="relative"
                                    >
                                        <span
                                            className={`text-sm font-medium tracking-wide transition-colors ${isActive
                                                ? 'text-purple-300'
                                                : 'text-slate-400 hover:text-white'
                                                }`}
                                        >
                                            {item.name}
                                        </span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute -bottom-6 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500"
                                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                            />
                                        )}
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Profile & Settings */}
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-10 h-10 rounded-full bg-slate-800 border border-purple-500/20 flex items-center justify-center hover:border-purple-400/40 transition-colors"
                        >
                            <svg className="w-5 h-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-10 h-10 rounded-full bg-slate-800 border border-purple-500/20 flex items-center justify-center hover:border-purple-400/40 transition-colors"
                        >
                            <svg className="w-5 h-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </motion.button>
                    </div>
                </div>
            </div>
        </header>
    );
}
