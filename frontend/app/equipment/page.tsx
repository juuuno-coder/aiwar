'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card as CardType, Equipment } from '@/lib/types';
import { gameStorage } from '@/lib/game-storage';
import { equipItem, unequipItem, generateEquipment } from '@/lib/equipment-utils';
import {
    Card,
    CardBody,
    CardHeader,
} from "@/components/ui/custom/Card";
import { Button } from "@/components/ui/custom/Button";
import { Progress } from "@/components/ui/custom/Progress";
import { Chip } from "@/components/ui/custom/Chip";
import { Divider } from "@/components/ui/custom/Divider";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield,
    Cpu,
    Zap,
    Star,
    ArrowLeft,
    Plus,
    X,
    ChevronRight,
    HardDrive,
    Binary,
    Factory,
    Users,
    Database,
    Database as DatabaseIcon2
} from "lucide-react";
import TypeBadge from '@/components/TypeBadge';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { TextGenerateEffect } from '@/components/ui/aceternity/text-generate-effect';
import { useUser } from '@/context/UserContext';
import { cn } from '@/lib/utils';

export default function EquipmentPage() {
    const router = useRouter();
    const { refreshData } = useUser();
    const [userCards, setUserCards] = useState<CardType[]>([]);
    const [equipmentInventory, setEquipmentInventory] = useState<Equipment[]>([]);
    const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const savedCards = await gameStorage.getCards();
        setUserCards(savedCards || []);

        let loadedEquipment = await gameStorage.getEquipment();
        if (!loadedEquipment || loadedEquipment.length === 0) {
            const dummyEquipment = [
                generateEquipment('standard'),
                generateEquipment('standard'),
                generateEquipment('advanced'),
                generateEquipment('elite'),
                generateEquipment('standard'),
            ];
            for (const eq of dummyEquipment) {
                await gameStorage.addEquipment(eq);
            }
            loadedEquipment = dummyEquipment;
        }
        setEquipmentInventory(loadedEquipment);
        setLoading(false);
    };

    const handleEquip = async (eq: Equipment) => {
        if (!selectedCard) return;
        const result = equipItem(selectedCard, eq);
        if (result.success && result.updatedCard && result.updatedEquipment) {
            await gameStorage.updateCard(result.updatedCard.id, result.updatedCard);
            await gameStorage.updateEquipment(result.updatedEquipment);
            await refreshData(); // Sync global state (e.g. if equipment affects power shown elsewhere)
            setUserCards(prev => prev.map(c => c.id === result.updatedCard!.id ? result.updatedCard! : c));
            setSelectedCard(result.updatedCard);
            setEquipmentInventory(prev => prev.map(e => e.id === result.updatedEquipment!.id ? result.updatedEquipment! : e));
        }
    };

    const handleUnequip = async (eqId: string) => {
        if (!selectedCard) return;
        const result = unequipItem(selectedCard, eqId);
        if (result.success && result.updatedCard && result.updatedEquipment) {
            await gameStorage.updateCard(result.updatedCard.id, result.updatedCard);
            await gameStorage.updateEquipment(result.updatedEquipment);
            await refreshData(); // Sync global state
            setUserCards(prev => prev.map(c => c.id === result.updatedCard!.id ? result.updatedCard! : c));
            setSelectedCard(result.updatedCard);
            setEquipmentInventory(prev => prev.map(e => e.id === result.updatedEquipment!.id ? result.updatedEquipment! : e));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <div className="flex flex-col items-center gap-4">
                    <Progress
                        value={0}
                        size="sm"
                        aria-label="Loading..."
                        className="max-w-md w-64"
                        classNames={{
                            indicator: "bg-gradient-to-r from-cyan-500 to-blue-500"
                        }}
                    />
                    <span className="orbitron text-xs font-black text-cyan-500 animate-pulse tracking-widest">INITIALIZING ENGINEERING LAB...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-10 px-6 lg:px-12 bg-[#050505] relative overflow-hidden">
            <BackgroundBeams className="opacity-40" />

            {/* 스캐닝 그리드 오버레이 */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />

            {/* 헤더 */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-1 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.6)]" />
                        <span className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.4em] orbitron">Engineering Lab // Division 01</span>
                    </div>
                    <TextGenerateEffect words="HARDWARE WORKSHOP" className="text-5xl font-black text-white orbitron tracking-tighter italic" />
                    <p className="mt-2 text-gray-500 font-bold max-w-md text-sm border-l-2 border-white/10 pl-4">AI 모델의 하드웨어 코어를 분석하고 최상급 모듈을 칼리브레이션하여 성능 한계를 돌파하십시오.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-end">
                        <span className="text-[8px] text-gray-600 font-black orbitron tracking-widest uppercase mb-1">Active Modules</span>
                        <div className="flex gap-1.5">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="w-4 h-1 rounded-full bg-cyan-500/20" />
                            ))}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        onPress={() => router.push('/')}
                        startContent={<ArrowLeft size={16} />}
                        className="font-black orbitron text-gray-400 border-white/10 hover:bg-white/5 hover:text-white h-14 px-8"
                    >
                        BACK TO HUB
                    </Button>
                </div>
            </motion.div>

            <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)] min-h-[700px]">
                {/* 1. 유닛 선택 리스트 */}
                <div className="lg:col-span-3 h-full">
                    <Card className="bg-black/40 backdrop-blur-xl border border-white/10 h-full shadow-2xl">
                        <CardHeader className="p-5 pb-0">
                            <h3 className="text-xs font-black text-gray-400 orbitron tracking-widest flex items-center gap-2">
                                <Users size={14} /> AI MODELS
                            </h3>
                        </CardHeader>
                        <Divider className="my-4 bg-white/5" />
                        <CardBody className="p-2 pt-0 overflow-hidden">
                            <div className="h-full w-full overflow-y-auto pr-2 custom-scrollbar">
                                <div className="space-y-1 pb-2">
                                    {userCards.map((card) => (
                                        <button
                                            key={card.id}
                                            onClick={() => setSelectedCard(card)}
                                            className={cn(
                                                "w-full text-left p-3 rounded-xl border transition-all duration-300 group relative overflow-hidden",
                                                selectedCard?.id === card.id
                                                    ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                                                    : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10"
                                            )}
                                        >
                                            <div className="relative z-10 flex justify-between items-center">
                                                <div className="flex flex-col gap-1">
                                                    <span className={cn(
                                                        "text-xs font-black orbitron tracking-wide transition-colors",
                                                        selectedCard?.id === card.id ? "text-white" : "text-gray-400 group-hover:text-gray-200"
                                                    )}>
                                                        {card.name}
                                                    </span>
                                                    <span className="text-[9px] text-gray-600 font-bold">LV.{card.level}</span>
                                                </div>
                                                <div className="flex flex-col items-end gap-1.5">
                                                    <TypeBadge type={card.type} size="sm" showName={false} />
                                                    <div className="flex gap-0.5">
                                                        {[...Array(3)].map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className={cn(
                                                                    "w-1 h-3 rounded-full transition-colors",
                                                                    i < (card.equipment?.length || 0) ? "bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.8)]" : "bg-white/10"
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            {selectedCard?.id === card.id && (
                                                <motion.div
                                                    layoutId="activeGlow"
                                                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent pointer-events-none"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* 2. 상세 프리뷰 및 슬롯 */}
                <div className="lg:col-span-6 h-full">
                    <AnimatePresence mode="wait">
                        {selectedCard ? (
                            <motion.div
                                key={selectedCard.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="h-full"
                            >
                                <Card className="h-full bg-[#080808]/80 backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_rgba(6,182,212,0.05)] relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
                                    <div className="absolute top-0 right-0 p-32 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

                                    <CardBody className="p-8 flex flex-col items-center relative z-10 w-full overflow-y-auto no-scrollbar">
                                        <div className="w-full flex justify-between items-start mb-6">
                                            <TypeBadge type={selectedCard.type} size="lg" />
                                            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 orbitron">
                                                ID: {selectedCard.id.slice(0, 8).toUpperCase()}
                                            </div>
                                        </div>

                                        <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
                                            <div className="absolute inset-0 border border-cyan-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
                                            <div className="absolute inset-2 border border-blue-500/30 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                                            <div className="text-6xl filter drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                                                {selectedCard.isCommander ? '👑' : '🤖'}
                                            </div>
                                        </div>

                                        <h2 className="text-3xl font-black text-white orbitron tracking-tight italic mb-1">{selectedCard.name}</h2>
                                        <div className="text-[10px] text-cyan-400 font-bold orbitron tracking-[0.3em] mb-10 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                                            SYSTEM ARCHITECTURE ONLINE
                                        </div>

                                        {/* 스탯 바 */}
                                        <div className="w-full space-y-5 mb-10 bg-white/5 p-6 rounded-2xl border border-white/5">
                                            <LabStat color="primary" label="EFFICIENCY" value={selectedCard.stats.efficiency} />
                                            <LabStat color="secondary" label="CREATIVITY" value={selectedCard.stats.creativity} />
                                            <LabStat color="success" label="FUNCTION" value={selectedCard.stats.function} />
                                            <Divider className="bg-white/5 my-2" />
                                            <div className="flex justify-between items-center px-1 pt-1">
                                                <span className="text-[10px] text-gray-500 font-black orbitron tracking-widest">TOTAL OUTPUT</span>
                                                <span className="text-2xl font-black text-white orbitron italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                                                    {selectedCard.stats.totalPower}
                                                </span>
                                            </div>
                                        </div>

                                        {/* 슬롯 영역 */}
                                        <div className="w-full space-y-4 pb-8">
                                            <div className="flex justify-between items-end px-2">
                                                <h4 className="text-[10px] text-gray-500 font-black orbitron tracking-widest">HARDWARE SLOTS</h4>
                                                <span className="text-[10px] text-gray-600 font-bold">{selectedCard.equipment?.length || 0} / 3 ACTIVE</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                {[0, 1, 2].map(slotIdx => {
                                                    const eq = selectedCard.equipment?.[slotIdx];
                                                    return (
                                                        <div key={slotIdx} className="relative group aspect-square">
                                                            <div className={cn(
                                                                "w-full h-full rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden",
                                                                eq
                                                                    ? "bg-[#0A0A0A] border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] group-hover:border-cyan-500/60"
                                                                    : "bg-black/20 border-dashed border-white/10 group-hover:bg-white/5 group-hover:border-white/20"
                                                            )}>
                                                                {eq ? (
                                                                    <>
                                                                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
                                                                        <div className="text-2xl mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                                                            {eq.type === 'GPU' ? '🖥️' : eq.type === 'TPU' ? '🧠' : eq.type === 'NPU' ? '⚡' : '❄️'}
                                                                        </div>
                                                                        <span className="text-[8px] font-black text-cyan-300 orbitron truncate px-2 w-full text-center relative z-10">{eq.name}</span>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="solid"
                                                                            color="danger"
                                                                            onPress={() => handleUnequip(eq.id)}
                                                                            className="absolute top-1 right-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 min-w-0 shadow-lg justify-center px-0"
                                                                        >
                                                                            <X size={10} />
                                                                        </Button>
                                                                    </>
                                                                ) : (
                                                                    <div className="flex flex-col items-center opacity-30 group-hover:opacity-60 transition-opacity">
                                                                        <Plus size={16} />
                                                                        <span className="text-[8px] orbitron font-bold mt-1 tracking-widest">OPEN</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center bg-white/[0.02] rounded-3xl border border-white/5 text-gray-600 backdrop-blur-sm">
                                <div className="p-8 rounded-full bg-white/5 mb-6 animate-pulse">
                                    <Binary size={48} className="text-gray-500 opacity-50" />
                                </div>
                                <p className="orbitron text-sm font-black tracking-[0.2em] text-gray-500 uppercase">SELECT UNIT FOR MAINTENANCE</p>
                                <p className="text-xs text-gray-600 mt-2 font-bold opacity-60">좌측 목록에서 유닛을 선택하여 장비를 관리하십시오.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 3. 장비 인벤토리 */}
                <div className="lg:col-span-3 h-full">
                    <Card className="bg-black/40 backdrop-blur-xl border border-white/10 h-full shadow-2xl">
                        <CardHeader className="p-5 pb-0 flex justify-between items-center">
                            <h3 className="text-xs font-black text-gray-400 orbitron tracking-widest flex items-center gap-2">
                                <DatabaseIcon2 size={14} /> STORAGE
                            </h3>
                            <Chip size="sm" variant="flat" className="bg-white/5 text-[9px] h-5 font-bold text-gray-400">
                                {equipmentInventory.filter(e => !e.equippedCardId).length} ITEMS
                            </Chip>
                        </CardHeader>
                        <Divider className="my-4 bg-white/5" />
                        <CardBody className="p-2 pt-0">
                            <div className="h-full px-2 pb-2 overflow-y-auto custom-scrollbar">
                                {equipmentInventory.filter(e => !e.equippedCardId).length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center opacity-30 py-20 gap-3">
                                        <Database size={32} />
                                        <p className="text-[10px] font-black orbitron tracking-widest">NO HARDWARE</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {equipmentInventory.filter(e => !e.equippedCardId).map((eq) => (
                                            <div
                                                key={eq.id}
                                                className="bg-[#0A0A0A] border border-white/5 rounded-xl p-3 hover:border-cyan-500/30 transition-all group relative overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/5 transition-colors" />
                                                <div className="flex flex-row gap-3 items-center relative z-10">
                                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl shadow-inner border border-white/5">
                                                        {eq.type === 'GPU' ? '🖥️' : eq.type === 'TPU' ? '🧠' : eq.type === 'NPU' ? '⚡' : '❄️'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                            <span className="text-[10px] font-black text-gray-200 orbitron truncate">{eq.name}</span>
                                                            <div className={cn(
                                                                "w-1.5 h-1.5 rounded-full",
                                                                eq.rarity === 'quantum' ? 'bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.8)]' :
                                                                    eq.rarity === 'elite' ? 'bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.8)]' :
                                                                        'bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]'
                                                            )} />
                                                        </div>
                                                        <div className="flex justify-between items-end">
                                                            <span className="text-[8px] text-gray-500 font-bold uppercase">{eq.type} MODULE</span>
                                                            <Button
                                                                size="sm"
                                                                color="primary"
                                                                variant="flat"
                                                                isDisabled={!selectedCard || (selectedCard.equipment && selectedCard.equipment.length >= 3)}
                                                                onPress={() => handleEquip(eq)}
                                                                className={cn(
                                                                    "h-6 px-3 font-black orbitron text-[8px] min-w-0",
                                                                    !selectedCard ? "bg-white/5 text-gray-600" : "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
                                                                )}
                                                            >
                                                                {!selectedCard ? 'SELECT UNIT' : 'EQUIP'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function LabStat({ color, label, value }: { color: "primary" | "secondary" | "success" | "warning" | "danger", label: string, value: number }) {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
                <span className="text-[9px] text-gray-500 font-black orbitron tracking-widest">{label}</span>
                <span className="text-[10px] font-bold text-white orbitron">{value}</span>
            </div>
            <Progress
                size="sm"
                color={color}
                value={value}
                className="h-1.5"
                classNames={{
                    track: "bg-black/40",
                    indicator: cn(
                        "shadow-[0_0_8px_currentcolor]",
                        color === 'primary' ? "bg-cyan-500" :
                            color === 'secondary' ? "bg-violet-500" : "bg-emerald-500"
                    )
                }}
            />
        </div>
    );
}
