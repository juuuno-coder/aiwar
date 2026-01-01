
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, ShoppingBag, Sword, Box, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function MobileNav() {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        { name: '홈', path: '/main', icon: Home },
        { name: '상점', path: '/shop', icon: ShoppingBag },
        { name: '전투', path: '/battle', icon: Sword },
        { name: '보관함', path: '/my-cards', icon: Box },
        { name: '메뉴', path: '/ranking', icon: Menu }, // 임시로 랭킹/메뉴 매핑
    ];

    const isCurrent = (path: string) => {
        if (path === '/main' && pathname === '/') return true;
        return pathname?.startsWith(path);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-t border-white/10 md:hidden pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const active = isCurrent(item.path);
                    return (
                        <button
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className="relative flex flex-col items-center justify-center w-full h-full space-y-1"
                        >
                            {active && (
                                <motion.div
                                    layoutId="mobileNavIndicator"
                                    className="absolute top-0 w-8 h-1 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                                />
                            )}
                            <item.icon
                                size={20}
                                className={cn(
                                    "transition-colors duration-300",
                                    active ? "text-cyan-400" : "text-gray-500"
                                )}
                            />
                            <span className={cn(
                                "text-[10px] font-medium transition-colors duration-300",
                                active ? "text-white" : "text-gray-600"
                            )}>
                                {item.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
