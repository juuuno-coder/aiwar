import { useState, useEffect } from 'react';
import { useGame } from '@/components/GameContext';
import { useFooter } from '@/context/FooterContext';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { gameStorage } from '@/lib/game-storage';
import { Card as CardType } from '@/lib/types';
import GameCard from '@/components/GameCard';
import CyberButton from '@/components/CyberButton';
import { Layers, Sword, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import styles from './FooterControls.module.css';

export default function FooterControls() {
    const { selectedCardId, setPreviewCard } = useGame();
    const footer = useFooter();
    const { showFooter, hideFooter, showDeckSlots, hideDeckSlots } = footer;
    const pathname = usePathname();
    const router = useRouter();
    const isBattlePage = pathname.includes('/battle/fight');
    const isLobby = pathname === '/';

    const [viewMode, setViewMode] = useState<'main' | 'union' | 'ace' | 'slots'>('main');
    const [deck, setDeck] = useState<CardType[]>([]);
    const [slots, setSlots] = useState<any[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const loadContent = async () => {
            if (viewMode === 'slots') {
                const state = await gameStorage.loadGameState();
                setSlots(state.slots || []);
            } else {
                const activeCards = await gameStorage.getDeck(viewMode);
                // Fallback for main if empty
                if (viewMode === 'main' && (!activeCards || activeCards.length === 0)) {
                    const fallback = await gameStorage.getActiveDeckCards();
                    setDeck(fallback);
                } else {
                    setDeck(activeCards || []);
                }
            }
        };
        loadContent();

        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, [pathname, viewMode]);

    useEffect(() => {
        if (isLobby) {
            // 로비에서는 기본 상태 유지 (슬롯 숨김) - 모달 등에서 필요시 제어
            // hideDeckSlots(); 
        } else {
            // 그 외 페이지(덱 편집, 전투 등)에서는 슬롯 표시
            // 단, 스토리 페이지는 별도로 제어하므로 제외할 수도 있음.
            // 일단은 기존 동작 보장을 위해 기본적으로 켬.
            showDeckSlots();
        }
    }, [isLobby, showDeckSlots, hideDeckSlots]);

    if (isLobby) return null;

    // 만약 useFooter의 state.visible이 false라면 여기서도 렌더링 안 함?
    // 아니면 FooterControls 자체가 DynamicFooter와 다른 별개의 컴포넌트인가?
    // 파일 내용을 보니 FooterControls는 별도의 레거시/대체 컴포넌트로 보임.
    // DynamicFooter가 현재 메인으로 사용되는 것 같음.
    // LayoutWrapper.tsx를 다시 확인해야 함.

    return (
        <footer className={styles.footer}>
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-8 h-full">
                {/* 덱 정보 섹션 */}
                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                    <div className="flex flex-col gap-1 pr-6 border-r border-white/10 shrink-0">
                        <button
                            onClick={() => setViewMode('main')}
                            className={cn("text-[8px] font-black orbitron px-2 py-1 rounded transition-all", viewMode === 'main' ? "bg-purple-600 text-white" : "text-gray-500 hover:text-white")}
                        >
                            MAIN 5
                        </button>
                        <button
                            onClick={() => setViewMode('union')}
                            className={cn("text-[8px] font-black orbitron px-2 py-1 rounded transition-all", viewMode === 'union' ? "bg-blue-600 text-white" : "text-gray-500 hover:text-white")}
                        >
                            UNION 3
                        </button>
                        <button
                            onClick={() => setViewMode('ace')}
                            className={cn("text-[8px] font-black orbitron px-2 py-1 rounded transition-all", viewMode === 'ace' ? "bg-orange-600 text-white" : "text-gray-500 hover:text-white")}
                        >
                            ACE 1
                        </button>
                        <button
                            onClick={() => setViewMode('slots')}
                            className={cn("text-[8px] font-black orbitron px-2 py-1 rounded transition-all", viewMode === 'slots' ? "bg-green-600 text-white" : "text-gray-500 hover:text-white")}
                        >
                            SLOTS
                        </button>
                    </div>

                    <div className="flex-1 overflow-x-auto no-scrollbar py-2">
                        <div className="flex gap-4 items-center min-w-max px-2">
                            {viewMode === 'slots' ? (
                                slots.map((slot, index) => {
                                    const isReady = slot.nextGeneration && new Date(slot.nextGeneration) <= currentTime;
                                    const progress = slot.nextGeneration ? Math.max(0, Math.min(100, 100 - ((new Date(slot.nextGeneration).getTime() - currentTime.getTime()) / (30 * 60 * 1000) * 100))) : 0;

                                    return (
                                        <motion.div
                                            key={slot.id || index}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="w-24 h-24 rounded-lg border border-white/5 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center p-2 relative overflow-hidden group"
                                        >
                                            <div className="text-[7px] text-gray-500 font-bold orbitron uppercase mb-2">Slot {slot.slotNumber}</div>
                                            <div className={cn("text-xl mb-1 transition-all", isReady ? "scale-110 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" : "opacity-30")}>
                                                {slot.aiFactionId ? '🤖' : '➕'}
                                            </div>
                                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                                                <motion.div
                                                    className={cn("h-full", isReady ? "bg-green-500" : "bg-purple-500")}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${slot.aiFactionId ? progress : 0}%` }}
                                                />
                                            </div>
                                            {isReady && <div className="absolute inset-0 bg-purple-600/10 animate-pulse pointer-events-none" />}
                                        </motion.div>
                                    );
                                })
                            ) : (
                                deck.map((card, index) => (
                                    <motion.div
                                        key={card.id || index}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="shrink-0 group relative cursor-pointer"
                                        whileHover={{ y: -10, scale: 1.05 }}
                                        onClick={() => setPreviewCard(card)}
                                    >
                                        <div className="w-16 h-24 rounded-lg overflow-hidden border border-white/10 bg-black/40 backdrop-blur-md shadow-lg transition-all group-hover:border-purple-500/50 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                                            <div className="h-full w-full relative">
                                                <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-black opacity-50" />
                                                <div className="absolute inset-0 flex flex-col p-1.5 justify-between">
                                                    <div className="flex justify-between items-start">
                                                        <div className="text-[6px] text-white font-black orbitron truncate max-w-[40px] leading-tight">
                                                            {card.name}
                                                        </div>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)]" />
                                                    </div>
                                                    <div className="flex justify-between items-baseline mt-auto">
                                                        <span className="text-[10px] font-black text-purple-400 orbitron">{card.stats?.totalPower || 0}</span>
                                                        <span className="text-[5px] text-gray-500 uppercase tracking-tighter">Unit</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {selectedCardId === card.id && (
                                            <motion.div
                                                layoutId="footerActiveStroke"
                                                className="absolute -inset-1 border border-cyan-400 rounded-xl blur-[1px] shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                                            />
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* 퀵 액션 섹션 */}
                <div className="flex items-center gap-2 shrink-0 border-l border-white/10 pl-8 h-12">
                    <CyberButton variant="ghost" size="sm" onClick={() => router.push('/inventory')} className="text-[10px] font-black orbitron text-gray-400">
                        INVENTORY
                    </CyberButton>
                    <CyberButton variant="primary" size="sm" onClick={() => router.push('/battle')} className="h-12 px-8 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                        <Sword size={16} className="mr-2" /> BATTLE ARENA
                    </CyberButton>
                </div>
            </div>
        </footer>
    );
}

