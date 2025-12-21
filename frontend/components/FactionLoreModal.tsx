'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import Image from 'next/image';
import { X, Users, Swords, Shield, Sparkles, Target, TrendingUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCardCharacterImage, getFactionIcon } from '@/lib/card-images';
import { getFactionUpdate } from '@/lib/faction-updates';

interface FactionLore {
    id: string;
    displayName: string;
    koreanName: string;
    slogan: string;
    origin: string;
    philosophy: string;
    leader: {
        name: string;
        title: string;
        personality: string;
    };
    territory: string;
    allies: string[];
    rivals: string[];
    specialAbility: string;
    lore: string;
}

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

    const characterImage = getCardCharacterImage(faction.id, faction.displayName);
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
                    {/* 배경 오버레이 */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                        onClick={onClose}
                    />

                    {/* 모달 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        className="fixed inset-4 md:inset-10 lg:inset-20 z-[61] overflow-hidden"
                    >
                        <div className="w-full h-full bg-gradient-to-br from-gray-900 via-slate-900 to-black rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                            {/* 닫기 버튼 */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
                            >
                                <X size={20} className="text-white" />
                            </button>

                            <div className="flex flex-col lg:flex-row h-full">
                                {/* 좌측: 캐릭터 이미지 */}
                                <div className="lg:w-1/3 h-64 lg:h-full relative bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-black">
                                    {characterImage ? (
                                        <Image
                                            src={characterImage}
                                            alt={faction.displayName}
                                            fill
                                            className="object-cover object-top"
                                            sizes="(max-width: 1024px) 100vw, 33vw"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            {factionIcon ? (
                                                <Image
                                                    src={factionIcon}
                                                    alt={faction.displayName}
                                                    width={150}
                                                    height={150}
                                                    className="opacity-50"
                                                />
                                            ) : (
                                                <span className="text-8xl opacity-30">🤖</span>
                                            )}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                                    {/* 군단 이름 오버레이 */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                        <h2 className="text-3xl font-black text-white orbitron italic tracking-tight">
                                            {faction.koreanName}
                                        </h2>
                                        <p className="text-white/60 text-sm mt-1">
                                            {faction.displayName} {update?.version ? `v${update.version}` : ''}
                                        </p>
                                        <p className="text-cyan-400 text-xs mt-1 orbitron">
                                            "{faction.slogan}"
                                        </p>
                                    </div>
                                </div>

                                {/* 우측: 상세 정보 */}
                                <div className="lg:w-2/3 h-full overflow-y-auto p-6 lg:p-8">
                                    {/* 기원 */}
                                    <section className="mb-6">
                                        <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-2">
                                            <Sparkles size={18} className="text-yellow-400" />
                                            기원
                                        </h3>
                                        <p className="text-white/70 leading-relaxed">{faction.origin}</p>
                                    </section>

                                    {/* 철학 */}
                                    <section className="mb-6">
                                        <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-2">
                                            <Target size={18} className="text-purple-400" />
                                            철학
                                        </h3>
                                        <p className="text-white/70 leading-relaxed">{faction.philosophy}</p>
                                    </section>

                                    {/* 지도자 */}
                                    <section className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                                        <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-3">
                                            <Shield size={18} className="text-cyan-400" />
                                            지도자: {faction.leader.name}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-white/50">칭호</span>
                                                <p className="text-white font-medium">{faction.leader.title}</p>
                                            </div>
                                            <div>
                                                <span className="text-white/50">성격</span>
                                                <p className="text-white font-medium">{faction.leader.personality}</p>
                                            </div>
                                        </div>
                                    </section>

                                    {/* 관계 */}
                                    <section className="mb-6">
                                        <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-3">
                                            <Users size={18} className="text-green-400" />
                                            관계
                                        </h3>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <span className="text-sm text-white/50">우호:</span>
                                            {getAllyNames().length > 0 ? getAllyNames().map(name => (
                                                <span key={name} className="px-2 py-1 bg-green-900/30 text-green-400 rounded-full text-xs">
                                                    {name}
                                                </span>
                                            )) : (
                                                <span className="text-white/30 text-sm">없음</span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-sm text-white/50">경쟁:</span>
                                            {getRivalNames().length > 0 ? getRivalNames().map(name => (
                                                <span key={name} className="px-2 py-1 bg-orange-900/30 text-orange-400 rounded-full text-xs">
                                                    {name}
                                                </span>
                                            )) : (
                                                <span className="text-white/30 text-sm">없음</span>
                                            )}
                                        </div>
                                    </section>

                                    {/* 최신 업데이트 */}
                                    {(() => {
                                        const update = getFactionUpdate(faction.id);
                                        if (!update) return null;
                                        return (
                                            <section className={cn(
                                                "mb-6 p-4 rounded-xl border",
                                                update.impact === 'buff'
                                                    ? "bg-gradient-to-r from-green-900/30 to-emerald-900/20 border-green-500/30"
                                                    : update.impact === 'nerf'
                                                        ? "bg-gradient-to-r from-red-900/30 to-orange-900/20 border-red-500/30"
                                                        : "bg-gradient-to-r from-blue-900/30 to-cyan-900/20 border-blue-500/30"
                                            )}>
                                                <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-2">
                                                    <TrendingUp size={18} className={
                                                        update.impact === 'buff' ? "text-green-400" :
                                                            update.impact === 'nerf' ? "text-red-400" : "text-blue-400"
                                                    } />
                                                    최신 업데이트
                                                    {update.version && (
                                                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                                                            v{update.version}
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className={cn(
                                                    "font-medium mb-2",
                                                    update.impact === 'buff' ? "text-green-300" :
                                                        update.impact === 'nerf' ? "text-red-300" : "text-blue-300"
                                                )}>
                                                    {update.headline}
                                                </p>
                                                <p className="text-white/60 text-sm leading-relaxed">
                                                    {update.details}
                                                </p>
                                                <div className="mt-2 flex items-center gap-1 text-xs text-white/40">
                                                    <Calendar size={12} />
                                                    <span>{update.date}</span>
                                                </div>
                                            </section>
                                        );
                                    })()}

                                    {/* 특수 능력 */}
                                    <section className="mb-6 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/20 rounded-xl border border-purple-500/30">
                                        <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-2">
                                            <Swords size={18} className="text-pink-400" />
                                            특수 능력
                                        </h3>
                                        <p className="text-pink-300 font-medium">{faction.specialAbility}</p>
                                    </section>

                                    {/* 뒷이야기 */}
                                    <section className="mb-6">
                                        <h3 className="text-lg font-bold text-white mb-2">📖 뒷이야기</h3>
                                        <p className="text-white/60 leading-relaxed italic">"{faction.lore}"</p>
                                    </section>

                                    {/* 영토 */}
                                    <section className="text-sm text-white/40">
                                        <span>📍 영토: {faction.territory}</span>
                                    </section>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
