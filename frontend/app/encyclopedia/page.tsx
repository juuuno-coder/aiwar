'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CyberPageLayout from '@/components/CyberPageLayout';
import { Card as CardType, CardTemplate, AIFaction } from '@/lib/types';
import { storage } from '@/lib/utils';
import { CARD_DATABASE, COMMANDERS } from '@/data/card-database';
import aiFactionsData from '@/data/ai-factions.json';
import { cn } from '@/lib/utils';
import { Lock, Play } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

type Tab = 'UNITS' | 'LEGIONS' | 'COMMANDERS';

type SelectedItem =
    | { type: 'UNIT'; data: CardTemplate; isOwned: boolean }
    | { type: 'LEGION'; data: AIFaction; isOwned: boolean }
    | { type: 'COMMANDER'; data: CardTemplate; isOwned: boolean };

export default function EncyclopediaPage() {
    const { language } = useTranslation();
    const [activeTab, setActiveTab] = useState<Tab>('UNITS');
    const [ownedCardIds, setOwnedCardIds] = useState<Set<string>>(new Set());
    const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

    // 번역 객체
    const translations = {
        ko: {
            title: '군단 도감',
            englishTitle: 'ENCYCLOPEDIA',
            description: '모든 유닛, 군단, 지휘관의 완전한 아카이브',
            tabs: {
                UNITS: '유닛',
                LEGIONS: '군단',
                COMMANDERS: '지휘관'
            },
            rarity: '등급',
            specialty: '특성',
            cmdAcc: '명령 (정확도)',
            tacSpd: '전술 (속도)',
            strategist: '전략가'
        },
        en: {
            title: 'Encyclopedia',
            englishTitle: 'NEURAL DB',
            description: 'Complete archive of all Units, Legions, and Commanders',
            tabs: {
                UNITS: 'UNITS',
                LEGIONS: 'LEGIONS',
                COMMANDERS: 'COMMANDERS'
            },
            rarity: 'Rarity',
            specialty: 'Specialty',
            cmdAcc: 'CMD (Acc)',
            tacSpd: 'TAC (Spd)',
            strategist: 'STRATEGIST'
        }
    };

    const tr = translations[language as keyof typeof translations] || translations.ko;

    useEffect(() => {
        // Load owned cards
        const userCards = storage.get<CardType[]>('userCards', []);
        const ownedIds = new Set(userCards.map(c => c.templateId));
        setOwnedCardIds(ownedIds);
    }, []);

    const renderUnits = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {CARD_DATABASE.map((card, i) => {
                const isOwned = ownedCardIds.has(card.id);
                return (
                    <motion.div
                        key={card.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setSelectedItem({ type: 'UNIT', data: card, isOwned })}
                        className={cn(
                            "aspect-[3/4] relative rounded-lg border overflow-hidden cursor-pointer group transition-all",
                            isOwned
                                ? "border-cyan-500/30 bg-black/40 hover:border-cyan-500/60 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                                : "border-white/5 bg-white/5 grayscale opacity-60"
                        )}
                    >
                        {card.imageUrl && (
                            <div className="absolute inset-0 z-0">
                                <img
                                    src={card.imageUrl}
                                    alt={card.name}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                            </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90 z-10" />

                        <div className="absolute top-2 right-2 z-20 flex gap-1">
                            {card.videoUrl && (
                                <div className="bg-red-500/80 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
                                    <Play size={6} fill="white" /> LIVE
                                </div>
                            )}

                            <div className={cn("w-2 h-2 rounded-full",
                                card.rarity === 'common' ? 'bg-gray-500' :
                                    card.rarity === 'rare' ? 'bg-blue-500 shadow-[0_0_5px_#3b82f6]' :
                                        card.rarity === 'epic' ? 'bg-purple-500 shadow-[0_0_5px_#a855f7]' :
                                            card.rarity === 'legendary' ? 'bg-amber-500 shadow-[0_0_5px_#f59e0b]' : 'bg-white'
                            )} />
                        </div>

                        <div className="absolute bottom-0 w-full p-3 z-20">
                            <div className="text-[10px] font-mono text-white/70 mb-1">{card.aiFactionId.toUpperCase()}</div>
                            <div className="font-bold text-white text-sm truncate drop-shadow-md">{card.name}</div>
                        </div>

                        {!isOwned && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Lock className="text-white/20" size={32} />
                            </div>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );

    const renderLegions = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiFactionsData.factions.map((faction: any, i: number) => (
                <motion.div
                    key={faction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setSelectedItem({ type: 'LEGION', data: faction, isOwned: true })}
                    className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-white/20 cursor-pointer transition-all"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="text-4xl">🤖</div>
                        <div>
                            <h3 className="font-bold text-white text-lg">{faction.displayName}</h3>
                            <div className="flex gap-2 text-[10px] font-mono text-white/40 mt-1">
                                {faction.specialty.map((s: string) => <span key={s} className="bg-white/10 px-1 rounded">{s}</span>)}
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-white/50 line-clamp-3">{faction.description}</p>
                </motion.div>
            ))}
        </div>
    );

    const renderCommanders = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COMMANDERS.map((cmd, i) => (
                <motion.div
                    key={cmd.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setSelectedItem({ type: 'COMMANDER', data: cmd, isOwned: true })}
                    className="relative aspect-square rounded-xl overflow-hidden border border-amber-500/20 group cursor-pointer"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                    <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center text-6xl opacity-30 group-hover:opacity-50 transition-opacity">
                        👑
                    </div>

                    <div className="absolute bottom-0 w-full p-6 z-20">
                        <h3 className="font-bold orbitron text-amber-400 text-xl mb-1">{cmd.name}</h3>
                        <p className="text-xs font-mono text-white/60">
                            {cmd.specialty.toUpperCase()} {tr.strategist}
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
    );

    return (
        <CyberPageLayout
            title={tr.title}
            englishTitle={tr.englishTitle}
            description={tr.description}
            color="cyan"
        >
            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
                {(['UNITS', 'LEGIONS', 'COMMANDERS'] as Tab[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-4 py-2 text-sm font-mono tracking-widest transition-all rounded-lg",
                            activeTab === tab
                                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                                : "text-white/40 hover:text-white hover:bg-white/5"
                        )}
                    >
                        {tr.tabs[tab]}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
                {activeTab === 'UNITS' && renderUnits()}
                {activeTab === 'LEGIONS' && renderLegions()}
                {activeTab === 'COMMANDERS' && renderCommanders()}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg"
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="aspect-video bg-black/50 relative flex items-center justify-center border-b border-white/5 overflow-hidden">
                                {'videoUrl' in selectedItem.data && selectedItem.data.videoUrl ? (
                                    <video
                                        src={selectedItem.data.videoUrl}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                ) : 'imageUrl' in selectedItem.data && selectedItem.data.imageUrl ? (
                                    <img
                                        src={selectedItem.data.imageUrl}
                                        alt={selectedItem.data.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-6xl animate-pulse">
                                        {selectedItem.type === 'UNIT' ? '🃏' : selectedItem.type === 'LEGION' ? '🤖' : '👑'}
                                    </div>
                                )}

                                {!selectedItem.isOwned && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10">
                                        <Lock size={48} className="text-white/20" />
                                    </div>
                                )}
                            </div>

                            <div className="p-8">
                                <h2 className="text-3xl font-black orbitron text-white mb-2">
                                    {selectedItem.type === 'LEGION' ? selectedItem.data.displayName : selectedItem.data.name}
                                </h2>

                                <p className="text-white/60 mb-6 leading-relaxed">
                                    {selectedItem.data.description}
                                </p>

                                {selectedItem.type === 'UNIT' && 'rarity' in selectedItem.data && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 p-3 rounded">
                                            <div className="text-[10px] text-white/40 uppercase">{tr.rarity}</div>
                                            <div className="text-sm font-bold text-white capitalize">{selectedItem.data.rarity}</div>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded">
                                            <div className="text-[10px] text-white/40 uppercase">{tr.specialty}</div>
                                            <div className="text-sm font-bold text-white capitalize">{selectedItem.data.specialty}</div>
                                        </div>
                                    </div>
                                )}

                                {selectedItem.type === 'COMMANDER' && (
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="flex justify-between bg-white/5 p-2 rounded">
                                                <span className="text-white/50">{tr.cmdAcc}</span>
                                                <span className="text-amber-400">{selectedItem.data.baseStats.accuracy.min}</span>
                                            </div>
                                            <div className="flex justify-between bg-white/5 p-2 rounded">
                                                <span className="text-white/50">{tr.tacSpd}</span>
                                                <span className="text-amber-400">{selectedItem.data.baseStats.speed.min}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </CyberPageLayout>
    );
}
