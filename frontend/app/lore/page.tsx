'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { Meteors } from '@/components/ui/aceternity/effects';
import PageHeader from '@/components/PageHeader';
import FactionLoreModal from '@/components/FactionLoreModal';
import TimelineView from '@/components/TimelineView';
import { getFactionIcon, getCardCharacterImage } from '@/lib/card-images';
import { cn } from '@/lib/utils';
import { BookOpen, Clock, Filter } from 'lucide-react';

// JSON 데이터 가져오기
import factionLoreData from '@/data/faction-lore.json';

type Category = 'all' | 'super' | 'image' | 'video' | 'audio' | 'coding';

const categoryMap: Record<string, Category> = {
    gemini: 'super',
    chatgpt: 'super',
    claude: 'super',
    grok: 'super',
    midjourney: 'image',
    dalle: 'image',
    'stable-diffusion': 'image',
    flux: 'image',
    kling: 'video',
    runway: 'video',
    pika: 'video',
    sora: 'video',
    suno: 'audio',
    udio: 'audio',
    elevenlabs: 'audio',
    musicgen: 'audio',
    cursor: 'coding',
    copilot: 'coding',
    replit: 'coding',
    codeium: 'coding',
};

const categoryLabels: Record<Category, { name: string; color: string }> = {
    all: { name: '전체', color: 'bg-white/20' },
    super: { name: '슈퍼 모델', color: 'bg-gradient-to-r from-yellow-500/30 to-amber-500/30' },
    image: { name: '이미지', color: 'bg-gradient-to-r from-purple-500/30 to-pink-500/30' },
    video: { name: '영상', color: 'bg-gradient-to-r from-red-500/30 to-orange-500/30' },
    audio: { name: '음악', color: 'bg-gradient-to-r from-green-500/30 to-emerald-500/30' },
    coding: { name: '코딩', color: 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30' },
};

export default function LorePage() {
    const [selectedCategory, setSelectedCategory] = useState<Category>('all');
    const [selectedFaction, setSelectedFaction] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'factions' | 'timeline'>('factions');

    const factions = factionLoreData.factions;
    const timeline = factionLoreData.timeline;

    const filteredFactions = selectedCategory === 'all'
        ? factions
        : factions.filter(f => categoryMap[f.id] === selectedCategory);

    const handleFactionClick = (faction: any) => {
        setSelectedFaction(faction);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen py-12 px-6 lg:px-12 bg-[#050505] relative overflow-hidden">
            <BackgroundBeams className="opacity-35" />
            <Meteors number={8} />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* 헤더 */}
                <PageHeader
                    title="AI 도감"
                    englishTitle="AI LORE"
                    description="AI 군단의 역사와 세계관을 탐험하세요"
                    color="cyan"
                />

                {/* 탭 전환 */}
                <div className="flex gap-2 mb-8">
                    <button
                        onClick={() => setActiveTab('factions')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                            activeTab === 'factions'
                                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                                : "bg-white/5 text-white/60 hover:bg-white/10"
                        )}
                    >
                        <BookOpen size={18} />
                        군단 도감
                    </button>
                    <button
                        onClick={() => setActiveTab('timeline')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                            activeTab === 'timeline'
                                ? "bg-purple-500/20 text-purple-400 border border-purple-500/50"
                                : "bg-white/5 text-white/60 hover:bg-white/10"
                        )}
                    >
                        <Clock size={18} />
                        AI 연대기
                    </button>
                </div>

                {activeTab === 'factions' ? (
                    <>
                        {/* 카테고리 필터 */}
                        <div className="flex flex-wrap gap-2 mb-8">
                            <Filter size={18} className="text-white/40 mr-2 self-center" />
                            {Object.entries(categoryLabels).map(([key, { name, color }]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedCategory(key as Category)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-sm font-medium transition-all",
                                        selectedCategory === key
                                            ? `${color} text-white border border-white/30`
                                            : "bg-white/5 text-white/60 hover:bg-white/10"
                                    )}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>

                        {/* 군단 그리드 */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredFactions.map((faction, index) => (
                                <motion.div
                                    key={faction.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => handleFactionClick(faction)}
                                    className="group cursor-pointer"
                                >
                                    <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all">
                                        {/* 이미지 영역 */}
                                        <div className="relative h-40 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                                            {getCardCharacterImage(faction.id, faction.displayName) ? (
                                                <Image
                                                    src={getCardCharacterImage(faction.id, faction.displayName)!}
                                                    alt={faction.displayName}
                                                    fill
                                                    className="object-cover object-top group-hover:scale-110 transition-transform duration-500"
                                                    sizes="200px"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    {getFactionIcon(faction.id) ? (
                                                        <Image
                                                            src={getFactionIcon(faction.id)!}
                                                            alt={faction.displayName}
                                                            width={60}
                                                            height={60}
                                                            className="opacity-50"
                                                        />
                                                    ) : (
                                                        <span className="text-5xl opacity-30">🤖</span>
                                                    )}
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                                            {/* 카테고리 뱃지 */}
                                            <div className={cn(
                                                "absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                                categoryLabels[categoryMap[faction.id]]?.color || 'bg-white/20'
                                            )}>
                                                {categoryLabels[categoryMap[faction.id]]?.name || '기타'}
                                            </div>
                                        </div>

                                        {/* 정보 영역 */}
                                        <div className="p-4">
                                            <h3 className="text-white font-bold truncate">{faction.koreanName}</h3>
                                            <p className="text-white/40 text-xs truncate mt-1">{faction.slogan}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </>
                ) : (
                    /* 타임라인 뷰 */
                    <div className="mt-8">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-white mb-2">AI 역사 연대기</h3>
                            <p className="text-white/60">2023년부터 현재까지, AI 군단의 역사를 따라가보세요.</p>
                        </div>
                        <TimelineView events={timeline} />

                        {/* 세계관 설명 */}
                        <div className="mt-12 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                            <h4 className="text-xl font-bold text-white mb-4">🌍 {factionLoreData.worldSetting.title}</h4>
                            <p className="text-white/70 leading-relaxed mb-4">{factionLoreData.worldSetting.premise}</p>
                            <p className="text-white/60 leading-relaxed">{factionLoreData.worldSetting.conflict}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* 군단 상세 모달 */}
            <FactionLoreModal
                faction={selectedFaction}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                allFactions={factions}
            />
        </div>
    );
}
