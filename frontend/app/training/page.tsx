'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Card,
    CardBody,
    CardHeader,
} from "@/components/ui/custom/Card";
import { Button } from "@/components/ui/custom/Button";
import { Progress } from "@/components/ui/custom/Progress";
// Divider, Chip, Tooltip, Avatar are imported but Chip/Divider are used, others checked for usage.
// Divider is not used in the provided code component body? Let me check.
// Chip IS used.
import { Chip } from "@/components/ui/custom/Chip";
import {
    Zap,
    Sparkles,
    Target,
    Layers,
    ArrowRight,
    Box,
    Cpu,
    LucideIcon,
    ArrowLeft,
    CheckCircle2,
    X
} from "lucide-react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter
} from "@/components/ui/custom/Modal";

import { Card as CardType } from '@/lib/types';
import { gameStorage } from '@/lib/game-storage';
import { calculateTrainingPreview, executeTraining } from '@/lib/training-utils';
import { cn } from '@/lib/utils';
import TypeBadge from '@/components/TypeBadge';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { Meteors } from '@/components/ui/aceternity/effects';
import { TextGenerateEffect } from '@/components/ui/aceternity/text-generate-effect';

// Removed unused imports: Divider, ScrollShadow, Tooltip, Avatar (checked they were unused in original code)

import { useUser } from '@/context/UserContext';
import { useTranslation } from '@/context/LanguageContext';

export default function TrainingPage() {
    const { t, language } = useTranslation();
    const router = useRouter();
    const { tokens, addTokens, refreshData } = useUser();

    // State
    const [allCards, setAllCards] = useState<CardType[]>([]);
    const [targetCard, setTargetCard] = useState<CardType | null>(null);
    const [materialCards, setMaterialCards] = useState<CardType[]>([]);
    const [preview, setPreview] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Initial Load
    useEffect(() => {
        loadCards();
    }, []);

    // Load Cards from Storage
    const loadCards = async () => {
        const cards = await gameStorage.getCards();
        // 정렬: 레벨 높은 순
        const sorted = cards.sort((a, b) => b.level - a.level);
        setAllCards(sorted);
    };

    // Update Preview when selection changes
    useEffect(() => {
        if (targetCard && materialCards.length > 0) {
            const result = calculateTrainingPreview(targetCard, materialCards);
            setPreview(result);
        } else {
            setPreview(null);
        }
    }, [targetCard, materialCards]);

    // Handlers
    const handleSelectTarget = (card: CardType) => {
        setTargetCard(card);
        setMaterialCards([]);
    };

    const handleToggleMaterial = (card: CardType) => {
        if (targetCard?.id === card.id) return;

        if (materialCards.find(c => c.id === card.id)) {
            setMaterialCards(prev => prev.filter(c => c.id !== card.id));
        } else {
            if (materialCards.length >= 10) return;
            setMaterialCards(prev => [...prev, card]);
        }
    };

    const handleExecuteTraining = async () => {
        if (!targetCard || materialCards.length === 0 || !preview) return;

        if (tokens < preview.tokenCost) return;

        setIsProcessing(true);
        setTimeout(async () => {
            const updatedCard = executeTraining(targetCard, materialCards);

            // Deduct tokens
            await addTokens(-preview.tokenCost);

            for (const mat of materialCards) {
                await gameStorage.removeCard(mat.id);
            }
            await gameStorage.updateCard(updatedCard.id, updatedCard);

            // Sync Global State
            await refreshData();
            await loadCards();

            // Success Reset
            setTargetCard(null);
            setMaterialCards([]);
            setPreview(null);
            setShowSuccessModal(true);
            setIsProcessing(false);
        }, 1500);
    };

    const availableMaterials = allCards.filter(card => card.id !== targetCard?.id);


    return (
        <div className="min-h-screen py-10 px-6 lg:px-12 bg-[#050505] relative overflow-hidden">
            <BackgroundBeams className="opacity-40" />

            {/* 전술 교육 센터 데코레이션 */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />

            {/* 헤더 */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-1 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
                        <span className="text-[10px] text-blue-400 font-black uppercase tracking-[0.4em] orbitron">Tactical Education Center</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <TextGenerateEffect words={language === 'ko' ? "AI 강화 센터" : "AI TRAINING"} className="text-5xl font-black text-white orbitron tracking-tighter italic" />
                        <div className="h-10 w-[1px] bg-white/10 hidden md:block" />
                        <div className="hidden md:block">
                            <span className="text-[8px] text-gray-600 font-black orbitron tracking-widest uppercase block mb-1">Status</span>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                <span className="text-[9px] text-green-500 font-black orbitron tracking-widest uppercase">Active</span>
                            </div>
                        </div>
                    </div>
                    <p className="mt-2 text-gray-500 font-bold max-w-md text-sm border-l-2 border-white/10 pl-4">
                        {language === 'ko'
                            ? '강력한 전술 데이터를 주입하여 AI 모델의 잠재력을 육성하십시오. 희생된 데이터는 양분이 되어 더 높은 수준의 존재를 만듭니다.'
                            : 'Inject powerful tactical data to cultivate the potential of AI models. Sacrificed data becomes nourishment to create higher-level entities.'}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 backdrop-blur-2xl flex items-center gap-4 shadow-xl">
                        <div className="text-right">
                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">{t('common.coins')}</p>
                            <p className="text-2xl font-black text-pink-500 orbitron leading-none">
                                {tokens.toLocaleString()} <span className="text-[10px] text-white opacity-40">{language === 'ko' ? '코인' : 'COINS'}</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center border border-pink-500/20">
                            <Zap className="text-pink-400" size={20} />
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-220px)] min-h-[700px]">
                {/* 왼쪽: 대상 유닛 섹션 */}
                <div className="lg:col-span-4 flex flex-col gap-6 h-full">
                    <Card className="flex-1 bg-black/60 backdrop-blur-3xl border border-white/5 p-8 flex flex-col relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-transparent opacity-30" />

                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-white orbitron italic tracking-widest">{language === 'ko' ? '강화 대상' : 'ENHANCEMENT TARGET'}</h3>
                            <Target size={20} className="text-blue-500" />
                        </div>

                        {targetCard ? (
                            <div className="flex-1 flex flex-col">
                                <div className="relative group/unit mb-8">
                                    <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full opacity-0 group-hover/unit:opacity-100 transition-opacity" />
                                    <div className="p-4 bg-black/40 border border-blue-500/30 rounded-2xl relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-xl bg-blue-500/10 flex items-center justify-center text-3xl border border-blue-500/20">
                                                {targetCard.isCommander ? '👑' : '🤖'}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-white orbitron uppercase italic">{targetCard.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <TypeBadge type={targetCard.type} size="sm" />
                                                    <span className="text-pink-400 font-bold text-[10px] orbitron">LV.{targetCard.level}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            color="danger"
                                            onPress={() => setTargetCard(null)}
                                            className="absolute -top-2 -right-2 rounded-full h-6 w-6 min-w-0 p-0 shadow-lg"
                                        >
                                            <X size={12} />
                                        </Button>
                                    </div>
                                </div>

                                {materialCards.length > 0 && preview && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="mt-auto space-y-6 bg-white/[0.02] border border-white/5 rounded-2xl p-6"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-gray-500 font-black orbitron tracking-widest uppercase">{t('training.preview.exp')}</span>
                                            <span className="text-sm font-black text-blue-400 orbitron">+{preview.totalExpGain} EXP</span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[10px] text-gray-400 font-black orbitron tracking-widest uppercase">{t('training.preview.level')}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black text-gray-500 orbitron">{targetCard.level}</span>
                                                    <ArrowRight size={12} className="text-gray-700" />
                                                    <span className="text-xs font-black text-green-400 orbitron">{preview.expectedLevel}</span>
                                                </div>
                                            </div>
                                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-500" style={{ width: `${preview.expectedPercent}%` }} />
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-500 font-black orbitron tracking-widest uppercase">{language === 'ko' ? '필요 연구 데이터' : 'REQUIRED RESEARCH DATA'}</span>
                                                    <span className={cn("text-xs font-black orbitron", tokens < (materialCards.length * 10) ? "text-red-500" : "text-yellow-500")}>
                                                        {(materialCards.length * 10)} <span className="text-[8px] text-gray-600">/ {tokens}</span>
                                                    </span>
                                                </div>
                                                <Button
                                                    color="secondary"
                                                    variant="shadow"
                                                    className="orbitron font-black italic px-8 h-12 shadow-[0_0_20px_rgba(236,72,153,0.3)] bg-gradient-to-r from-pink-600 to-purple-600 border-none"
                                                    onPress={handleExecuteTraining}
                                                    isLoading={isProcessing}
                                                    isDisabled={tokens < (materialCards.length * 10)}
                                                >
                                                    {isProcessing ? (language === 'ko' ? '동기화 중...' : 'SYNCHRONIZING...') : (language === 'ko' ? '훈련 데이터 업데이트' : 'UPDATE TRAINING DATA')}
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl group-hover:border-blue-500/20 transition-colors">
                                <Box size={48} className="text-gray-700 mb-4 opacity-50" />
                                <p className="orbitron text-xs font-black text-gray-500 tracking-widest uppercase">{t('training.selectTarget')}</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* 오른쪽: 리스트 섹션 */}
                <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
                    <Card className="flex-1 bg-black/40 border-white/10 backdrop-blur-xl flex flex-col min-h-0 overflow-hidden">
                        <CardHeader className="p-6 border-b border-white/5 flex flex-col items-start gap-4 flex-shrink-0">
                            <div className="flex justify-between items-center w-full">
                                <h3 className="text-lg font-black text-white orbitron italic">{t('training.inventory')}</h3>
                                <Chip size="sm" variant="flat" className="bg-white/5 text-gray-400 font-bold orbitron">
                                    {allCards.length} TOTAL
                                </Chip>
                            </div>
                        </CardHeader>
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {allCards.map((card, idx) => {
                                    const isTarget = targetCard?.id === card.id;
                                    const isSelectedMaterial = materialCards.some(m => m.id === card.id);
                                    const isLocked = isTarget;

                                    return (
                                        <motion.div
                                            key={card.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 + (idx % 10) * 0.05 }}
                                        >
                                            <div
                                                onClick={() => targetCard ? !isLocked && handleToggleMaterial(card) : handleSelectTarget(card)}
                                                className={cn(
                                                    "p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 group",
                                                    isTarget ? "bg-blue-600/20 border-blue-500" :
                                                        isSelectedMaterial ? "bg-red-500/10 border-red-500/50" :
                                                            "bg-white/[0.03] border-white/5 hover:border-white/20",
                                                    isLocked && "opacity-50 grayscale-[50%] cursor-not-allowed"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl flex items-center justify-center text-2xl border border-white/5 flex-shrink-0",
                                                    isTarget ? "bg-blue-500/30" : "bg-black/40"
                                                )}>
                                                    {card.isCommander ? '👑' : '🤖'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-black text-white text-sm orbitron uppercase tracking-tighter italic truncate">
                                                            {card.name}
                                                        </span>
                                                        <span className="text-[10px] text-gray-500 font-bold orbitron">LV.{card.level}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <TypeBadge type={card.type} size="sm" showName={false} />
                                                        <div className="flex items-center gap-1 text-[10px] text-gray-500 orbitron">
                                                            <Sparkles size={10} className="text-purple-400" />
                                                            <span>PWR: {card.stats.totalPower}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 셀렉션 인디케이터 */}
                                                {targetCard && (
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full border flex items-center justify-center transition-all flex-shrink-0",
                                                        isSelectedMaterial ? "bg-red-500 border-red-500 scale-110 shadow-[0_0_15px_rgba(239,68,68,0.4)]" : "border-white/10 group-hover:border-white/30"
                                                    )}>
                                                        {isSelectedMaterial && <CheckCircle2 size={14} className="text-white" />}
                                                    </div>
                                                )}
                                                {!targetCard && (
                                                    <div className="w-6 h-6 rounded-lg bg-blue-500/0 border border-white/5 group-hover:bg-blue-500/20 group-hover:border-blue-500/50 transition-all flex items-center justify-center text-blue-400 opacity-0 group-hover:opacity-100 flex-shrink-0">
                                                        <Target size={14} />
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* 성공 모달 */}
            <Modal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                className="bg-[#0A0A0A] border border-blue-500/30"
                size="md"
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1 items-center pt-8">
                        <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 border border-blue-500/40">
                            <CheckCircle2 size={40} className="text-blue-500 animate-bounce" />
                        </div>
                        <h2 className="text-2xl font-black text-white orbitron italic tracking-tight">{t('training.complete')}</h2>
                        <p className="text-[10px] text-blue-400 font-bold orbitron tracking-widest uppercase">SYSTEM SYNCHRONIZATION SUCCESSFUL</p>
                    </ModalHeader>
                    <ModalBody className="py-6 px-10">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-black text-gray-500 orbitron">ENHANCEMENT STATUS</span>
                                <Chip size="sm" color="success" variant="flat" className="font-bold orbitron">STABLE</Chip>
                            </div>
                            <div className="h-px bg-white/5" />
                            <p className="text-sm text-gray-400 text-center leading-relaxed font-bold">
                                {language === 'ko'
                                    ? '대상 AI 모델이 투입된 데이터를 완벽하게 소화하여 전술 회로의 효율성이 향상되었습니다.'
                                    : 'The target AI model has perfectly assimilated the input data, enhancing tactical circuit efficiency.'}
                            </p>
                        </div>
                    </ModalBody>
                    <ModalFooter className="pb-8 px-10">
                        <Button
                            fullWidth
                            color="primary"
                            variant="shadow"
                            className="h-14 orbitron font-black italic shadow-[0_0_20px_rgba(59,130,246,0.2)] bg-blue-600 border-none"
                            onPress={() => setShowSuccessModal(false)}
                        >
                            ACKNOWLEDGE
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}

function StatHud({ label, value, highlight = false }: { label: string, value: any, highlight?: boolean }) {
    return (
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 relative overflow-hidden group">
            <div className={cn(
                "absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 opacity-0 transition-opacity",
                highlight && "from-blue-500/5 to-purple-500/5 opacity-100"
            )} />
            <div className="relative z-10">
                <p className="text-[10px] text-gray-500 font-bold orbitron tracking-widest mb-1">{label}</p>
                <p className={cn(
                    "text-2xl font-black orbitron italic",
                    highlight ? "text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]" : "text-white/60"
                )}>{value}</p>
            </div>
        </div>
    );
}

function GuidelineItem({ icon: Icon, title, text }: { icon: LucideIcon, title: string, text: string }) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Icon size={18} />
                </div>
                <h4 className="text-sm font-black text-white orbitron tracking-tight">{title}</h4>
            </div>
            <p className="text-xs text-gray-500 font-bold leading-relaxed">{text}</p>
        </div>
    );
}
