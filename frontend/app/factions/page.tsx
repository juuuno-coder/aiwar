'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CyberPageLayout from '@/components/CyberPageLayout';
import { AIFaction, FactionSlot } from '@/lib/types';
import { storage, getRemainingMinutes, formatTime, generateId, getRandomRarity, generateRandomStats } from '@/lib/utils';
import aiFactionsData from '@/data/ai-factions.json';
import { HoverBorderGradient } from '@/components/ui/aceternity/hover-border-gradient';
import { cn } from '@/lib/utils';

export default function FactionsPage() {
    const [factions] = useState<AIFaction[]>(aiFactionsData.factions as any);
    const [slots, setSlots] = useState<FactionSlot[]>([]);
    const [userCoins, setUserCoins] = useState(1000);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const savedSlots = storage.get<FactionSlot[]>('factionSlots', []);
        const savedCoins = storage.get<number>('userCoins', 1000);
        if (savedSlots.length === 0) {
            const initialSlots: FactionSlot[] = [
                { id: generateId(), userId: 'user-001', slotNumber: 1, aiFactionId: 'gemini', lastGeneration: new Date(), nextGeneration: new Date(Date.now() + 30 * 60 * 1000) },
                ...Array.from({ length: 4 }, (_, i) => ({ id: generateId(), userId: 'user-001', slotNumber: i + 2, aiFactionId: null, lastGeneration: null, nextGeneration: null })),
            ];
            setSlots(initialSlots);
            storage.set('factionSlots', initialSlots);
        } else {
            setSlots(savedSlots.map(slot => ({
                ...slot,
                lastGeneration: slot.lastGeneration ? new Date(slot.lastGeneration) : null,
                nextGeneration: slot.nextGeneration ? new Date(slot.nextGeneration) : null,
            })));
        }
        setUserCoins(savedCoins);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => { if (slots.length > 0) storage.set('factionSlots', slots); }, [slots]);
    useEffect(() => { storage.set('userCoins', userCoins); }, [userCoins]);

    const recruitFaction = (factionId: string) => {
        const faction = factions.find(f => f.id === factionId);
        if (!faction) return;
        if (userCoins < faction.unlockCost) { alert('코인이 부족합니다!'); return; }
        const emptySlot = slots.find(s => s.aiFactionId === null);
        if (!emptySlot) { alert('빈 슬롯이 없습니다!'); return; }
        setUserCoins(prev => prev - faction.unlockCost);
        setSlots(slots.map(slot => slot.id === emptySlot.id ? { ...slot, aiFactionId: factionId, lastGeneration: new Date(), nextGeneration: new Date(Date.now() + faction.generationInterval * 60 * 1000) } : slot));
    };

    const claimUnit = (slotId: string) => {
        const slot = slots.find(s => s.id === slotId);
        if (!slot || !slot.aiFactionId || !slot.nextGeneration) return;
        if (getRemainingMinutes(slot.nextGeneration) > 0) { alert('생성이 완료되지 않았습니다!'); return; }
        const faction = factions.find(f => f.id === slot.aiFactionId);
        if (!faction) return;
        const rarity = getRandomRarity(faction.rarityWeights);
        const stats = generateRandomStats(rarity);
        storage.set('userCards', [...storage.get('userCards', []), { id: generateId(), templateId: `${faction.id}-${Date.now()}`, ownerId: 'user-001', level: 1, experience: 0, stats, acquiredAt: new Date(), isLocked: false }]);
        setSlots(slots.map(s => s.id === slotId ? { ...s, lastGeneration: new Date(), nextGeneration: new Date(Date.now() + faction.generationInterval * 60 * 1000) } : s));
        alert(`${rarity.toUpperCase()} 유닛 획득! (PWR: ${stats.totalPower})`);
    };

    return (
        <CyberPageLayout
            title="AI_LEGION_HQ"
            subtitle="Faction Management"
            description="AI 군단을 영입하고 유닛을 생성하세요. 각 군단은 고유한 특성과 생성 주기를 가집니다."
            color="green"
            action={
                <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2">
                    <span className="text-2xl">💰</span>
                    <div>
                        <p className="text-[9px] font-mono text-white/40 uppercase">COINS</p>
                        <p className="text-lg font-bold orbitron text-amber-400">{userCoins.toLocaleString()}</p>
                    </div>
                </div>
            }
        >
            {/* Slots Section */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-6 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                    <h2 className="text-sm font-mono text-white/60 uppercase tracking-widest">ACTIVE_SLOTS</h2>
                </div>
                <div className="grid grid-cols-5 gap-4">
                    {slots.map((slot, i) => {
                        const faction = slot.aiFactionId ? factions.find(f => f.id === slot.aiFactionId) : null;
                        const remaining = slot.nextGeneration ? getRemainingMinutes(slot.nextGeneration) : 0;
                        const isReady = remaining === 0 && slot.aiFactionId !== null;
                        return (
                            <motion.div
                                key={slot.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className={cn(
                                    "bg-white/5 border rounded-xl p-4 text-center transition-all",
                                    isReady ? "border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]" : "border-white/10"
                                )}
                            >
                                <p className="text-[9px] font-mono text-white/30 mb-2">SLOT_{slot.slotNumber}</p>
                                {faction ? (
                                    <>
                                        <div className="text-3xl mb-2">🤖</div>
                                        <p className="font-bold text-white text-sm mb-1">{faction.displayName}</p>
                                        <p className="text-[9px] text-white/40 mb-3">{faction.specialty.join(', ')}</p>
                                        {isReady ? (
                                            <button onClick={() => claimUnit(slot.id)} className="w-full py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded text-[10px] font-mono uppercase tracking-widest hover:bg-green-500/30 transition-all">
                                                CLAIM ✨
                                            </button>
                                        ) : (
                                            <div>
                                                <p className="text-[9px] text-white/30 font-mono">NEXT_GEN</p>
                                                <p className="text-xl font-bold orbitron text-cyan-400">{formatTime(remaining)}</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="py-6">
                                        <div className="text-3xl mb-2 opacity-30">⚪</div>
                                        <p className="text-sm text-white/30">EMPTY</p>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Available Factions */}
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-6 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                    <h2 className="text-sm font-mono text-white/60 uppercase tracking-widest">AVAILABLE_LEGIONS</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {factions.map((faction, i) => {
                        const isOwned = slots.some(s => s.aiFactionId === faction.id);
                        const canAfford = userCoins >= faction.unlockCost;
                        const hasEmptySlot = slots.some(s => s.aiFactionId === null);
                        return (
                            <motion.div
                                key={faction.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={cn(
                                    "bg-white/5 border border-white/10 rounded-xl p-5 flex items-center gap-4 transition-all",
                                    isOwned && "opacity-50"
                                )}
                            >
                                <div className="text-4xl">🤖</div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-white mb-1">{faction.displayName}</h3>
                                    <p className="text-sm text-white/40 mb-2">{faction.description}</p>
                                    <div className="flex items-center gap-4 text-[10px] text-white/30 font-mono">
                                        <span>SPEC: {faction.specialty.join(', ')}</span>
                                        <span>CYCLE: {faction.generationInterval}min</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {isOwned ? (
                                        <span className="text-green-400 font-mono text-sm">✓ OWNED</span>
                                    ) : (
                                        <>
                                            <p className="text-lg font-bold text-amber-400 mb-2">💰 {faction.unlockCost.toLocaleString()}</p>
                                            <button
                                                onClick={() => recruitFaction(faction.id)}
                                                disabled={!canAfford || !hasEmptySlot}
                                                className={cn(
                                                    "px-4 py-2 rounded text-[10px] font-mono uppercase tracking-widest transition-all",
                                                    canAfford && hasEmptySlot
                                                        ? "bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30"
                                                        : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
                                                )}
                                            >
                                                {!hasEmptySlot ? 'NO_SLOT' : !canAfford ? 'INSUFFICIENT' : 'RECRUIT'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </CyberPageLayout>
    );
}
