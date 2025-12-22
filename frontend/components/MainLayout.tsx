'use client';

import { useState, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import GameSidebar from './GameSidebar';
import GameTopBar from './GameTopBar';

// Context for sidebar state
const SidebarContext = createContext<{
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
}>({
    isCollapsed: false,
    setIsCollapsed: () => { },
});

export const useSidebar = () => useContext(SidebarContext);

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Pages that should be 100% full page without any layout
    const noLayoutPages = ['/intro', '/login', '/signup'];
    const isNoLayout = noLayoutPages.includes(pathname || '');

    if (isNoLayout) {
        return <div className="h-screen w-screen overflow-hidden bg-black">{children}</div>;
    }

    return (
        <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
            <div className="flex h-screen overflow-hidden bg-black">
                {/* 메인 영역 */}
                <div
                    className="flex-1 flex flex-col transition-all duration-300 ease-out"
                    style={{ marginRight: isCollapsed ? '80px' : '256px' }}
                >
                    {/* 상단 바 */}
                    <GameTopBar sidebarCollapsed={isCollapsed} />

                    {/* 컨텐츠 */}
                    <main className="flex-1 overflow-auto mt-16 p-6 bg-gradient-to-br from-[#050510] via-[#0a0a1a] to-[#050510]">
                        {children}
                    </main>
                </div>

                {/* 사이드바 (우측 고정) */}
                <GameSidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
            </div>
        </SidebarContext.Provider>
    );
}
