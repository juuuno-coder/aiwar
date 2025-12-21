'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import PageHeader from '@/components/PageHeader';
import GameCard from '@/components/GameCard';
import { Button } from '@/components/ui/custom/Button';
import { useTranslation } from '@/context/LanguageContext';
import { CATEGORY_NAMES, CATEGORY_ICONS, CATEGORY_COLORS, AIFaction } from '@/lib/faction-types';
import { FACTION_LORE_DATA } from '@/lib/faction-lore';
import { X, BookOpen, ExternalLink, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    getFactionColor,
    FACTIONS_DATA
} from '@/lib/faction-subscription';

export default function EncyclopediaPage() {
    const { t } = useTranslation();
    const [selectedFaction, setSelectedFaction] = useState<string | null>(null);

    const factions = FACTIONS_DATA.factions;

    // 카테고리별로 분류
    const factionsByCategory = factions.reduce((acc, faction) => {
        if (!acc[faction.category]) {
            acc[faction.category] = [];
        }
        acc[faction.category].push(faction);
        return acc;
    }, {} as Record<string, AIFaction[]>);

    const categories = ['super', 'image', 'video', 'audio', 'coding'];

    const handleFactionClick = (factionId: string) => {
        setSelectedFaction(factionId);
    };

    const selectedLore = selectedFaction ? FACTION_LORE_DATA[selectedFaction] : null;
    const selectedFactionData = factions.find(f => f.id === selectedFaction);

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col pb-20">
            <BackgroundBeams />

            <div className="relative z-10 container mx-auto px-4 pt-4 flex-1 overflow-y-auto custom-scrollbar">
                <PageHeader
                    title="AI 백과사전"
                    englishTitle="AI ENCYCLOPEDIA"
                    description="Dive into the history and secrets of Artificial Intelligences."
                />

                <div className="space-y-12 pb-20">
                    {categories.map((category) => (
                        <div key={category} className="space-y-4">
                            <div className="flex items-center gap-3 border-b border-white/10 pb-2">
                                <span className="text-2xl">{CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]}</span>
                                <h2 className="text-xl font-bold orbitron uppercase tracking-widest text-white/90">
                                    {CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES]}
                                </h2>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {factionsByCategory[category]?.map((faction) => (
                                    <motion.div
                                        key={faction.id}
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="relative group cursor-pointer"
                                        onClick={() => handleFactionClick(faction.id)}
                                    >
                                        <div
                                            className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-xl z-10"
                                            style={{ borderBottom: `2px solid ${CATEGORY_COLORS[faction.category as keyof typeof CATEGORY_COLORS]}` }}
                                        />
                                        <div className="aspect-[3/4] bg-white/5 rounded-xl border border-white/10 overflow-hidden relative">
                                            {/* 플레이스홀더 이미지 또는 실제 아이콘 */}
                                            <div className="absolute inset-0 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500">
                                                {/* 여기서는 GameCard 대신 심플한 이미지를 사용하거나, GameCard를 작게 렌더링 */}
                                                <img
                                                    src={faction.iconUrl || `/assets/factions/${faction.id}.png`}
                                                    alt={faction.displayName}
                                                    className="w-2/3 h-2/3 object-contain drop-shadow-lg"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '/card_placeholder_1765931222851.png';
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-3 left-3 z-20">
                                            <p className="text-white font-bold text-sm orbitron">{faction.displayName}</p>
                                            <p className="text-white/50 text-[10px] uppercase tracking-wider">
                                                {FACTION_LORE_DATA[faction.id]?.catchphrase || "Unknown AI"}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 상세 정보 모달 */}
            <AnimatePresence>
                {selectedFaction && selectedFactionData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md pointer-events-auto"
                            onClick={() => setSelectedFaction(null)}
                        />
                        <motion.div
                            layoutId={selectedFaction}
                            className="relative w-full max-w-5xl h-[80vh] bg-gray-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl pointer-events-auto flex flex-col md:flex-row"
                        >
                            {/* 좌측: 비주얼 & 스탯 */}
                            <div className="w-full md:w-1/3 bg-black/50 p-8 flex flex-col items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 opacity-20 bg-cover bg-center blur-md" style={{ backgroundImage: `url(${selectedFactionData.iconUrl})` }} />
                                <div className="z-10 transform scale-125 mb-8">
                                    <GameCard
                                        card={{
                                            id: 'demo',
                                            name: selectedFactionData.displayName,
                                            type: 'EFFICIENCY', // 예시
                                            rarity: 'legendary',
                                            level: 5,
                                            stats: { efficiency: 99, creativity: 99, function: 99, totalPower: 297 },
                                            templateId: `${selectedFaction}-demo`,
                                            ownerId: 'demo',
                                            experience: 0,
                                            isLocked: false,
                                            acquiredAt: new Date()
                                        }}
                                        isDisabled={false}
                                        isHolographic={true}
                                    />
                                </div>
                                <div className="z-10 w-full space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/50">Category</span>
                                        <span style={{ color: CATEGORY_COLORS[selectedFactionData.category as keyof typeof CATEGORY_COLORS] }}>
                                            {CATEGORY_NAMES[selectedFactionData.category as keyof typeof CATEGORY_NAMES]}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/50">Gen Interval</span>
                                        <span className="text-white">{selectedFactionData.generationInterval}m</span>
                                    </div>
                                </div>
                            </div>

                            {/* 우측: 로어 & 정보 */}
                            <div className="w-full md:w-2/3 p-8 overflow-y-auto custom-scrollbar bg-gradient-to-br from-gray-900 to-gray-800">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-4xl font-black text-white orbitron mb-2">{selectedFactionData.displayName}</h2>
                                        <p className="text-xl text-cyan-400 italic font-serif">
                                            "{selectedLore?.catchphrase || 'The Artificial Intelligence'}"
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedFaction(null)}
                                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    <section>
                                        <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <BookOpen size={16} /> Description
                                        </h3>
                                        <p className="text-white/80 leading-relaxed text-lg">
                                            {selectedLore?.description || selectedFactionData.description}
                                        </p>
                                    </section>

                                    {selectedLore?.history && (
                                        <section>
                                            <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Zap size={16} /> History
                                            </h3>
                                            <p className="text-white/60 leading-relaxed">
                                                {selectedLore.history}
                                            </p>
                                        </section>
                                    )}

                                    <div className="grid grid-cols-2 gap-6">
                                        <section>
                                            <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-3">Personality</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedLore?.personality.map((trait, i) => (
                                                    <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
                                                        #{trait}
                                                    </span>
                                                ))}
                                                {(!selectedLore || !selectedLore.personality) && <span className="text-white/30 text-sm">No data</span>}
                                            </div>
                                        </section>

                                        <section>
                                            <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-3">Relations</h3>
                                            <div className="space-y-2">
                                                <div className="flex gap-2 items-center">
                                                    <span className="text-xs text-green-400 font-bold w-12">ALLIES</span>
                                                    <div className="flex gap-1">
                                                        {selectedLore?.allies.map(ally => (
                                                            <span key={ally} className="text-xs text-white/60 bg-green-500/10 px-2 py-0.5 rounded">{ally.toUpperCase()}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    <span className="text-xs text-red-400 font-bold w-12">RIVALS</span>
                                                    <div className="flex gap-1">
                                                        {selectedLore?.rivals.map(rival => (
                                                            <span key={rival} className="text-xs text-white/60 bg-red-500/10 px-2 py-0.5 rounded">{rival.toUpperCase()}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
