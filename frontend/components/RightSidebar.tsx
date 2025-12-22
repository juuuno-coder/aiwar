'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function RightSidebar() {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);

    const menuItems = [
        { name: 'Home', href: '/main', icon: '🏠' },
        { name: 'Cards', href: '/my-cards', icon: '🎴' },
        { name: 'Enhance', href: '/enhance', icon: '⚡' },
        { name: 'Fusion', href: '/fusion', icon: '🔮' },
        { name: 'Unique', href: '/unique-create', icon: '✨' },
        { name: 'Shop', href: '/shop', icon: '🛒' },
        { name: 'Missions', href: '/missions', icon: '🎯' },
        { name: 'Achieve', href: '/achievements', icon: '🏆' },
    ];

    return (
        <motion.aside
            initial={{ x: 100 }}
            animate={{ x: 0, width: isExpanded ? 200 : 80 }}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            className="fixed right-0 top-20 bottom-0 z-40 bg-slate-900/80 backdrop-blur-xl border-l border-purple-500/10"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="flex flex-col gap-2 p-4 h-full">
                <div className="mb-4">
                    <div className="text-xs text-slate-500 uppercase tracking-wider px-2">
                        {isExpanded ? 'Quick Menu' : ''}
                    </div>
                </div>

                {menuItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                whileHover={{ scale: 1.05, x: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? 'bg-purple-500/20 text-purple-300'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <span className="text-2xl">{item.icon}</span>
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            exit={{ opacity: 0, width: 0 }}
                                            className="text-sm font-medium whitespace-nowrap overflow-hidden"
                                        >
                                            {item.name}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeSidebarItem"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-blue-500 rounded-r"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </motion.aside>
    );
}
