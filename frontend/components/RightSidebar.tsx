'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useFirebase } from '@/components/FirebaseProvider';
import CommanderProfileModal from '@/components/CommanderProfileModal';
import { User } from 'lucide-react';

export default function RightSidebar() {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const { profile } = useUserProfile();
    const { user } = useFirebase();

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
                {/* Commander Profile Section */}
                <div className="mb-4">
                    <motion.div
                        onClick={() => setShowProfileModal(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative cursor-pointer group"
                    >
                        <div className="w-full aspect-square rounded-xl overflow-hidden border-2 border-cyan-500/30 group-hover:border-cyan-500/60 transition-all bg-gradient-to-br from-cyan-900/20 to-purple-900/20">
                            <div className="w-full h-full flex items-center justify-center">
                                <User size={isExpanded ? 32 : 24} className="text-cyan-400" />
                            </div>
                        </div>
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-2 text-center overflow-hidden"
                                >
                                    <p className="text-xs font-black text-white orbitron truncate">
                                        {profile?.nickname || '지휘관'}
                                    </p>
                                    <p className="text-[10px] text-cyan-400/60 font-mono">프로필 보기</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                <div className="mb-2">
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

            {/* Commander Profile Modal */}
            <CommanderProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
            />
        </motion.aside>
    );
}
