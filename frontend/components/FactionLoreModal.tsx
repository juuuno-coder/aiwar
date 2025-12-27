'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Users, Swords, Shield, Sparkles, Target, TrendingUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCardCharacterImage, getFactionIcon } from '@/lib/card-images';
import { getFactionUpdate } from '@/lib/faction-updates';
import { FactionLore } from '@/lib/faction-lore';

interface FactionLoreModalProps {
    faction: FactionLore | null;
    isOpen: boolean;
    onClose: () => void;
    allFactions: FactionLore[];
}

export default function FactionLoreModal({ faction, isOpen, onClose, allFactions }: FactionLoreModalProps) {
    // ESC 키로 닫기
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!faction) return null;

    // FactionLore has 'name' but page uses 'displayName'. 
    // The FactionLore interface in lib/faction-lore.ts has 'name'. 
    // The faction object passed from page.tsx comes from FACTION_LORE_DATA which matches FactionLore.
    // However, page.tsx was using 'displayName' from AI Faction Data.
    // We should use properties available in FactionLore.

    // Check if image exists, otherwise fallback
    // FactionLore interface might not have displayName, so use name or koreanName
    const displayTitle = faction.koreanName || faction.name;
    const englishTitle = faction.name;

    // For images, we need the ID.
    const characterImage = getCardCharacterImage(faction.id);
    const factionIcon = getFactionIcon(faction.id);
    const update = getFactionUpdate(faction.id);

    const getAllyNames = () => faction.allies.map(id =>
        allFactions.find(f => f.id === id)?.koreanName || id
    );

    const getRivalNames = () => faction.rivals.map(id =>
        allFactions.find(f => f.id === id)?.koreanName || id
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Background Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        className="fixed inset-4 md:inset-10 lg:inset-20 z-[61] overflow-hidden pointer-events-none flex items-center justify-center"
                    >
                        <div className="w-full h-full max-w-6xl max-h-[85vh] bg-gradient-to-br from-gray-900 via-slate-900 to-black rounded-3xl border border-white/10 shadow-2xl overflow-hidden pointer-events-auto flex flex-col lg:flex-row relative">

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-white/20 rounded-full transition-all border border-white/10 backdrop-blur-md"
                            >
                                <X size={20} className="text-white" />
                            </button>

                            {/* Left Column: Visual (Hero Image) */}
                            <div className="lg:w-5/12 h-64 lg:h-full relative bg-black">
                                {characterImage ? (
                                    <Image
                                        src={characterImage}
                                        alt={englishTitle}
                                        fill
                                        className="object-cover object-top"
                                        sizes="(max-width: 1024px) 100vw, 40vw"
                                        priority
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                        <span className="text-8xl opacity-20 filter grayscale">🤖</span>
                                    </div>
                                )}

                                {/* Gradient Overlay for Text Readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent lg:via-transparent lg:to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/80" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90 lg:opacity-60" />

                                {/* Mobile Title Overlay (Hidden on Desktop) */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 lg:hidden">
                                    <h2 className="text-3xl font-black text-white orbitron italic tracking-tight mb-1">
                                        {displayTitle}
                                    </h2>
                                    <p className="text-cyan-400 text-xs font-bold font-mono">
                                        {englishTitle}
                                    </p>
                                </div>
                            </div>

                            {/* Right Column: Information */}
                            <div className="lg:w-7/12 h-full overflow-y-auto custom-scrollbar bg-black/40 backdrop-blur-sm">
                                <div className="p-6 lg:p-10">

                                    {/* Desktop Header */}
                                    <div className="hidden lg:flex items-start justify-between mb-8 border-b border-white/10 pb-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                {factionIcon && (
                                                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 p-1.5">
                                                        <Image src={factionIcon} alt="icon" width={32} height={32} className="w-full h-full object-contain" />
                                                    </div>
                                                )}
                                                <h2 className="text-4xl font-black text-white orbitron tracking-tight">
                                                    {displayTitle}
                                                </h2>
                                            </div>
                                            <p className="text-xl text-white/50 font-light tracking-wide pl-1">
                                                {faction.catchphrase}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Content Grid */}
                                    <div className="space-y-8">

                                        {/* Lore / Description */}
                                        <section>
                                            <h3 className="flex items-center gap-2 text-sm font-bold text-cyan-400 mb-3 uppercase tracking-widest font-mono">
                                                <Sparkles size={14} />
                                                Background Story
                                            </h3>
                                            <p className="text-gray-300 leading-relaxed text-lg font-light">
                                                {faction.description}
                                            </p>
                                            <div className="mt-4 p-4 bg-white/5 rounded-xl border-l-2 border-cyan-500 italic text-white/60 text-sm">
                                                "{faction.history}"
                                            </div>
                                        </section>

                                        {/* Leader & Philosophy */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <section className="bg-white/5 rounded-xl p-5 border border-white/10">
                                                <h3 className="flex items-center gap-2 text-sm font-bold text-purple-400 mb-3 uppercase tracking-widest font-mono">
                                                    <Shield size={14} />
                                                    Leader
                                                </h3>
                                                {/* Note: FactionLore defines leader as string not object in lib/faction-lore.ts 
                                                   Checking lib definition: 
                                                   leader: string; (Wait, user viewed file Step 8884 says 1-205 lines viewed.
                                                   Let's check current 'lib/faction-lore.ts' content to be safe.
                                                   I will assume string for now or object based on view.
                                                   Wait, previous code used faction.leader.name 
                                                   Let me quickly check types.ts or faction-lore.ts via knowledge or just render safely.
                                                   The previous view of `lib/faction-lore.ts` showed `leader: string;` in line 59 (Wait, I can't see it).
                                                   But `FactionLoreModal` used `faction.leader.name`.
                                                   I will use a safe render approach or check the file.
                                                   Actually `task_boundary` just said "Undoing 'UserInfo'..." wait that was me planning.
                                                   I'll assume the previous code was correct about the structure for a moment, but if `lib/faction-lore.ts` defines leader as string, then `faction.leader.name` would be wrong.
                                                   
                                                   Let's check the file `lib/faction-lore.ts` again to be 100% sure about the type.
                                                   It's better to be safe than error.
                                                */}
                                                <div className="text-white font-medium text-lg">
                                                    {/* Safe Render Logic */}
                                                    {typeof faction.leader === 'string' ? faction.leader : (faction.leader as any)?.name}
                                                </div>
                                                {typeof faction.leader !== 'string' && (faction.leader as any)?.title && (
                                                    <div className="text-white/40 text-sm mt-1">
                                                        {(faction.leader as any).title}
                                                    </div>
                                                )}
                                            </section>

                                            <section className="bg-white/5 rounded-xl p-5 border border-white/10">
                                                <h3 className="flex items-center gap-2 text-sm font-bold text-yellow-400 mb-3 uppercase tracking-widest font-mono">
                                                    <Target size={14} />
                                                    Philosophy
                                                </h3>
                                                <p className="text-white/80">
                                                    {faction.personality}
                                                </p>
                                            </section>
                                        </div>

                                        {/* Special Ability */}
                                        <section className="p-5 bg-gradient-to-r from-purple-900/40 to-blue-900/20 rounded-xl border border-purple-500/30">
                                            <h3 className="flex items-center gap-2 text-sm font-bold text-pink-400 mb-2 uppercase tracking-widest font-mono">
                                                <Swords size={14} />
                                                Special Ability
                                            </h3>
                                            <p className="text-white font-medium text-lg">
                                                {faction.specialAbility}
                                            </p>
                                        </section>

                                        {/* Relationships */}
                                        <section>
                                            <h3 className="flex items-center gap-2 text-sm font-bold text-green-400 mb-3 uppercase tracking-widest font-mono">
                                                <Users size={14} />
                                                Diplomacy
                                            </h3>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-bold text-white/40 w-12">ALLIES</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {getAllyNames().length > 0 ? getAllyNames().map(name => (
                                                            <span key={name} className="px-2.5 py-1 bg-green-900/20 text-green-400 border border-green-500/20 rounded text-xs font-bold">
                                                                {name}
                                                            </span>
                                                        )) : <span className="text-white/20 text-sm">-</span>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-bold text-white/40 w-12">RIVALS</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {getRivalNames().length > 0 ? getRivalNames().map(name => (
                                                            <span key={name} className="px-2.5 py-1 bg-red-900/20 text-red-400 border border-red-500/20 rounded text-xs font-bold">
                                                                {name}
                                                            </span>
                                                        )) : <span className="text-white/20 text-sm">-</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Recent Updates (News) */}
                                        {update && (
                                            <section className="mt-8 pt-6 border-t border-white/10">
                                                <h3 className="flex items-center gap-2 text-sm font-bold text-blue-400 mb-4 uppercase tracking-widest font-mono">
                                                    <TrendingUp size={14} />
                                                    Faction Updates
                                                </h3>
                                                <div className={cn(
                                                    "p-4 rounded-xl border relative overflow-hidden group",
                                                    update.impact === 'buff' ? "bg-green-950/30 border-green-500/20" :
                                                        update.impact === 'nerf' ? "bg-red-950/30 border-red-500/20" :
                                                            "bg-blue-950/30 border-blue-500/20"
                                                )}>
                                                    <div className="flex justify-between items-start mb-2 relative z-10">
                                                        <span className={cn(
                                                            "font-bold text-lg",
                                                            update.impact === 'buff' ? "text-green-400" :
                                                                update.impact === 'nerf' ? "text-red-400" :
                                                                    "text-blue-400"
                                                        )}>
                                                            {update.headline}
                                                        </span>
                                                        <span className="text-[10px] font-mono opacity-50 bg-black/30 px-2 py-1 rounded">
                                                            {update.date}
                                                        </span>
                                                    </div>
                                                    <p className="text-white/70 text-sm relative z-10">
                                                        {update.details}
                                                    </p>
                                                </div>
                                            </section>
                                        )}
                                    </div>

                                    {/* Footer Padding */}
                                    <div className="h-10" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
