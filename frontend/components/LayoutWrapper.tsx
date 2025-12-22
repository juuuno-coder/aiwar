'use client';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Header from './Header';
import RightSidebar from './RightSidebar';
import Sidebar from './Sidebar';
import GameFooter from './GameFooter';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Added sidebar state

    // Pages that don't need the full layout
    const noLayoutPages = ['/intro', '/login', '/signup'];
    const shouldShowLayout = !noLayoutPages.includes(pathname || '');

    if (!shouldShowLayout) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-[#050505]"> {/* Changed background color */}
            {/* Fixed Header */}
            <Header />

            {/* Main Content Area */}
            <div className="flex pt-20">
                {/* Left Sidebar (existing) */}
                <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} /> {/* Passed sidebar state and toggle function */}

                {/* Main Content */}
                <main className="flex-1 mr-20">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* Right Sidebar */}
                <RightSidebar />
            </div>

            {/* Footer */}
            <GameFooter />
        </div>
    );
}
