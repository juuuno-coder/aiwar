'use client';

import { Modal, ModalBody, ModalHeader } from './ui/custom/Modal';
import { AIFaction } from '@/lib/types';
import { Button } from './ui/custom/Button';
import { motion } from 'framer-motion';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { Search, Info } from 'lucide-react';
import { useState } from 'react';

interface FactionSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    factions: AIFaction[];
    onSelect: (factionId: string) => void;
    subscribedFactionIds: string[];
}

const koreanNames: Record<string, string> = {
    'gemini': '제미나이', 'chatgpt': '챗GPT', 'claude': '클로드', 'grok': '그록',
    'midjourney': '미드저니', 'dalle': '달리', 'stable-diffusion': '스테이블 디퓨전', 'flux': '플럭스',
    'kling': '클링', 'runway': '런웨이', 'pika': '피카', 'sora': '소라',
    'suno': '수노', 'udio': '유디오', 'elevenlabs': '일레븐랩스', 'musicgen': '뮤직젠',
    'cursor': '커서', 'copilot': '코파일럿', 'replit': '레플릿', 'codeium': '코디움',
};

const categoryIcons: Record<string, string> = {
    'super': '🧠', 'image': '🎨', 'video': '🎬', 'audio': '🎵', 'coding': '💻',
};

export default function FactionSelectionModal({ isOpen, onClose, factions, onSelect, subscribedFactionIds }: FactionSelectionModalProps) {
    const { t, language } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredFactions = factions.filter(f =>
        f.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (koreanNames[f.id] || '').includes(searchTerm)
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            className="bg-[#0a0a0a]/95 backdrop-blur-3xl border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
        >
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />

            <ModalHeader className="border-none pt-8 px-8 flex flex-col items-start gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white orbitron italic tracking-tighter">
                        {language === 'ko' ? '운영 중인 군단 연결' : 'CONNECT ACTIVE FACTION'}
                    </h2>
                    <p className="text-[10px] text-gray-500 font-bold orbitron uppercase tracking-[0.2em] mt-1">
                        Select an AI module to start neural generation
                    </p>
                </div>

                <div className="w-full relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder={language === 'ko' ? '군단 검색...' : 'Search factions...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all orbitron"
                    />
                </div>
            </ModalHeader>

            <ModalBody className="px-8 py-4 custom-scrollbar max-h-[50vh]">
                <div className="grid grid-cols-1 gap-2">
                    {filteredFactions.map((faction, index) => {
                        const isSubscribed = subscribedFactionIds.includes(faction.id);
                        const koName = koreanNames[faction.id] || faction.displayName;

                        return (
                            <motion.button
                                key={faction.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={() => !isSubscribed && onSelect(faction.id)}
                                disabled={isSubscribed}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-2xl border transition-all group relative overflow-hidden",
                                    isSubscribed
                                        ? "bg-white/5 border-white/5 opacity-40 cursor-not-allowed"
                                        : "bg-white/5 border-white/10 hover:border-blue-500/50 hover:bg-white/10"
                                )}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                        {categoryIcons[faction.category] || '🤖'}
                                    </div>
                                    <div className="text-left">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-white orbitron">{koName}</span>
                                            {isSubscribed && (
                                                <span className="text-[8px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded orbitron uppercase font-bold tracking-widest leading-none">
                                                    Linked
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[9px] text-gray-500 font-bold orbitron uppercase tracking-wider">
                                            {faction.displayName} • {faction.category.toUpperCase()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-1 relative z-10">
                                    <div className="flex gap-1">
                                        {faction.specialty.map(s => (
                                            <span key={s} className="text-[7px] font-black orbitron text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded tracking-tighter uppercase leading-none border border-blue-400/20">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                    <span className="text-[8px] text-gray-600 font-bold orbitron">INTERVAL: {faction.generationInterval}M</span>
                                </div>

                                {!isSubscribed && (
                                    <div className="absolute inset-y-0 right-0 w-1 bg-blue-500 transform translate-x-full group-hover:translate-x-0 transition-transform" />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </ModalBody>

            <div className="p-8 pt-0 mt-4">
                <div className="bg-blue-500/5 rounded-2xl p-4 border border-blue-500/10 flex items-start gap-3">
                    <Info className="text-blue-400 mt-0.5" size={16} />
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                        {language === 'ko'
                            ? '구독 중인 군단은 이미 활성화된 모듈이 있는 경우 선택할 수 없습니다. 한 슬롯에는 하나의 군단만 연결할 수 있습니다.'
                            : 'Factions that are already subscribed and active in other modules cannot be selected. Only one faction can be linked to a single slot.'}
                    </p>
                </div>
            </div>
        </Modal>
    );
}
