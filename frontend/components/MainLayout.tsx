'use client';

import { useState, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import GameSidebar from './GameSidebar';
import GameTopBar from './GameTopBar';
import MobileNav from './MobileNav'; // [NEW]
import dynamic from 'next/dynamic';

const DynamicFooter = dynamic(() => import('@/components/DynamicFooter'), {
    ssr: false,
});

const TutorialManager = dynamic(() => import('@/components/TutorialManager'), {
    ssr: false,
});

const StarterPackModal = dynamic(() => import('@/components/StarterPackModal'), {
    ssr: false,
});

import { useFooter } from '@/context/FooterContext';
import { cn } from '@/lib/utils';

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
    const { state: footerState } = useFooter();

    // Pages that should be 100% full page without any layout
    const noLayoutPages = ['/intro', '/login', '/signup', '/'];
    const isNoLayout = noLayoutPages.includes(pathname || '');

    // Sidebar state
    const [isCollapsed, setIsCollapsed] = useState(false);

    if (isNoLayout) {
        return <div className="h-screen w-screen overflow-hidden bg-black">{children}</div>;
    }

    return (
        <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
            <div
                className="flex h-screen overflow-hidden bg-black"
                style={{
                    ['--sidebar-width' as any]: isCollapsed ? '80px' : '256px'
                }}
            >
                {/* 메인 영역 */}
                <div
                    className="flex-1 flex flex-col transition-all duration-300 ease-out md:mr-[var(--sidebar-width)] mr-0" // md:mr 적용
                // style={{ marginRight: 'var(--sidebar-width)' }} // REMOVED inline style force
                >
                    {/* 상단 바 */}
                    <GameTopBar sidebarCollapsed={isCollapsed} />

                    {/* 컨텐츠 */}
                    <main
                        id="main-content"
                        className={cn(
                            "flex-1 overflow-y-auto overflow-x-hidden relative mt-16 bg-gradient-to-br from-[#050510] via-[#0a0a1a] to-[#050510] scroll-smooth",
                            footerState.visible && "pb-[160px]" // 푸터가 보일 때 하단 여백 추가
                        )}
                    >
                        <TutorialManager />
                        <StarterPackModal />
                        {children}

                        {/* Dynamic Footer - Only renders when FooterContext.visible is true */}
                        <div className="hidden md:block">
                            <DynamicFooter />
                        </div>
                        {/* Mobile Footer Spacer */}
                        <div className="h-20 md:hidden" />
                    </main>

                    {/* Mobile Navigation */}
                    <MobileNav />
                </div>

                {/* 사이드바 (우측 고정) - 데스크탑 전용 */}
                <div className="hidden md:block">
                    <GameSidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
                </div>
            </div>
        </SidebarContext.Provider>
    );
}
