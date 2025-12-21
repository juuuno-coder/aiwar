"use client";
import { useState } from 'react';
// ... previous imports
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { GameProvider } from '@/components/GameContext';
import GameHeader from '@/components/GameHeader';
import Sidebar from '@/components/Sidebar';
import DynamicFooter from '@/components/DynamicFooter';
import InteractiveCardPreview from '@/components/InteractiveCardPreview';
import styles from '@/components/LayoutWrapper.module.css';
import { FooterProvider } from '@/context/FooterContext';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLobby = pathname === '/';
    const isBattle = pathname === '/battle'; // Battle might not show sidebar, handle below
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <GameProvider>
            <FooterProvider>
                <div className={styles.container}>
                    <GameHeader />
                    <div className={styles.mainArea}>
                        {!isLobby && <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />}
                        <motion.main
                            className={isLobby ? 'flex-1 overflow-hidden' : styles.content}
                            animate={{
                                paddingRight: !isLobby ? (isSidebarOpen ? 300 : 100) : 0,
                                paddingLeft: !isLobby ? 32 : 0
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={pathname}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="h-full w-full"
                                >
                                    {children}
                                </motion.div>
                            </AnimatePresence>
                        </motion.main>
                    </div>
                    <DynamicFooter />
                    <InteractiveCardPreview />
                </div>
            </FooterProvider>
        </GameProvider>
    );
}
