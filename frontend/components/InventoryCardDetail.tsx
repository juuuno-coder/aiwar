'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { InventoryCard } from '@/lib/inventory-system';
import { cn } from '@/lib/utils';
import { Card3D, CardBody, CardItem } from '@/components/ui/aceternity/3d-card';
import { Lock, Sparkles, Zap, Play } from 'lucide-react';
import { getCardName } from '@/data/card-translations';
import { useTranslation } from '@/context/LanguageContext';
import { useState, useRef } from 'react';

import { trainCommander } from '@/lib/commander-system';
import { useAlert } from '@/context/AlertContext';

interface InventoryCardDetailProps {
    card: InventoryCard;
    onClose: () => void;
    onEnhance: (cardId: string) => void;
    onFuse: (cardId: string) => void;
    onUpdate?: (updatedCard: InventoryCard) => void;
}

export default function InventoryCardDetail({ card, onClose, onEnhance, onFuse, onUpdate }: InventoryCardDetailProps) {
    const { language } = useTranslation();
    const { showAlert } = useAlert();
    const [localCard, setLocalCard] = useState(card);
    const isHighTier = ['legendary', 'unique', 'commander'].includes(localCard.rarity || '');
    const hasVideo = !!localCard.videoUrl;
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isTraining, setIsTraining] = useState(false);

    const handleTrain = async () => {
        setIsTraining(true);
        const result = await trainCommander(localCard);
        setIsTraining(false);

        if (result.success && result.newCard) {
            setLocalCard(result.newCard);
            if (onUpdate) onUpdate(result.newCard);

            if (result.levelUp) {
                showAlert({
                    title: 'LEVEL UP!',
                    message: `Commander reached Lv.${result.newCard.level}! Stats increased.`,
                    type: 'success'
                });
            } else {
                // Simple toast or small feedback could be better, but Alert for now
                // showAlert({ title: 'Training', message: `Affinity +${result.affinityGained}`, type: 'success' });
            }
        } else {
            showAlert({ title: 'Error', message: result.message, type: 'error' });
        }
    };

    const handleMouseEnter = () => {
        if (hasVideo && videoRef.current) {
            videoRef.current.play().catch(e => console.log('Video play failed', e));
            setIsVideoPlaying(true);
        }
    };

    const handleMouseLeave = () => {
        if (hasVideo && videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setIsVideoPlaying(false);
        }
    };

    // Card Content Renderer
    const renderCardContent = () => (
        <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl">
            {/* Background Image / Video */}
            <div className="absolute inset-0">
                {card.imageUrl ? (
                    <img
                        src={card.imageUrl}
                        alt={card.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                        <span className="text-4xl">🤖</span>
                    </div>
                )}

                {/* Video Overlay */}
                {hasVideo && (
                    <video
                        ref={videoRef}
                        src={localCard.videoUrl}
                        loop
                        muted
                        playsInline
                        className={cn(
                            "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
                            isVideoPlaying ? "opacity-100" : "opacity-0"
                        )}
                    />
                )}
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

            {/* Card Info Overlay (Top) */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
                {/* Rarity Badge */}
                <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border shadow-lg",
                    card.rarity === 'commander' ? "bg-red-500/20 text-red-400 border-red-500/50" :
                        card.rarity === 'unique' ? "bg-pink-500/20 text-pink-400 border-pink-500/50" :
                            card.rarity === 'legendary' ? "bg-amber-500/20 text-amber-400 border-amber-500/50" :
                                card.rarity === 'epic' ? "bg-purple-500/20 text-purple-400 border-purple-500/50" :
                                    card.rarity === 'rare' ? "bg-blue-500/20 text-blue-400 border-blue-500/50" :
                                        "bg-white/10 text-white/60 border-white/20"
                )}>
                    {localCard.rarity}
                </div>

                {/* Level Badge */}
                <div className="flex flex-col items-end">
                    <div className="text-3xl font-black italic text-white font-orbitron drop-shadow-lg">
                        <span className="text-sm align-top opacity-60 mr-1">LV.</span>{localCard.level || 1}
                    </div>
                    {/* Affinity Bar for Commanders */}
                    {localCard.rarity === 'commander' && (
                        <div className="w-24 h-1.5 bg-black/50 rounded-full mt-1 overflow-hidden border border-white/20">
                            <div
                                className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                                style={{ width: `${localCard.affinity || 0}%` }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Rarity Effect (Particles) */}
            {isHighTier && (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-transparent via-transparent to-white/10 opacity-30 animate-pulse" />
                </div>
            )}

            {/* Play Icon Hint */}
            {hasVideo && !isVideoPlaying && (
                <div className="absolute center inset-0 flex items-center justify-center pointer-events-none opacity-50">
                    <div className="bg-black/40 p-3 rounded-full backdrop-blur-sm border border-white/20">
                        <Play size={24} fill="white" className="text-white" />
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl"
            onClick={onClose}
        >
            {/* Main Card Display Area */}
            <div
                className="relative flex-1 w-full max-w-4xl flex items-center justify-center p-8"
                onClick={(e) => e.stopPropagation()}
            >
                {isHighTier ? (
                    <Card3D containerClassName="w-[300px] h-[420px] sm:w-[350px] sm:h-[490px] md:w-[400px] md:h-[560px]">
                        <CardBody className="bg-transparent relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full rounded-xl p-0 border">
                            <CardItem translateZ="50" className="w-full h-full">
                                {renderCardContent()}
                            </CardItem>
                        </CardBody>
                    </Card3D>
                ) : (
                    <motion.div
                        initial={{ scale: 0.8, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                        className="w-[300px] h-[420px] sm:w-[350px] sm:h-[490px] shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-xl relative group"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        {renderCardContent()}
                    </motion.div>
                )}
            </div>

            {/* Bottom Controls */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-black/60 border-t border-white/10 backdrop-blur-xl p-6 pb-10 rounded-t-3xl flex items-center justify-between gap-6"
            >
                {/* Info Text */}
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white font-orbitron mb-1 truncate">
                        {getCardName(localCard.templateId || localCard.id || '', localCard.name || '', language as 'ko' | 'en')}
                    </h2>
                    <p className="text-white/50 text-sm line-clamp-1">
                        {localCard.description || "No description available."}
                    </p>
                    {localCard.rarity === 'commander' && (
                        <p className="text-pink-400 text-xs font-bold mt-1">
                            Affinity: {localCard.affinity || 0}%
                        </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    {localCard.rarity === 'commander' && (
                        <button
                            onClick={handleTrain}
                            disabled={isTraining}
                            className="flex items-center gap-2 px-6 py-3 bg-pink-500/10 border border-pink-500/40 text-pink-400 rounded-lg text-sm font-bold uppercase hover:bg-pink-500/20 hover:scale-105 transition-all shadow-[0_0_15px_rgba(236,72,153,0.2)] disabled:opacity-50"
                        >
                            {isTraining ? '...' : (language === 'ko' ? '교감' : 'Train')}
                        </button>
                    )}
                    <button
                        onClick={() => onEnhance(card.id)}
                        className="flex items-center gap-2 px-6 py-3 bg-amber-500/10 border border-amber-500/40 text-amber-400 rounded-lg text-sm font-bold uppercase hover:bg-amber-500/20 hover:scale-105 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    >
                        <Zap size={16} />
                        {language === 'ko' ? '강화' : 'Enhance'}
                    </button>

                    <button
                        onClick={() => onFuse(card.id)}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-500/10 border border-purple-500/40 text-purple-400 rounded-lg text-sm font-bold uppercase hover:bg-purple-500/20 hover:scale-105 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                    >
                        <Sparkles size={16} />
                        {language === 'ko' ? '합성' : 'Fuse'}
                    </button>

                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg text-white/40 hover:text-white hover:bg-white/20 transition-all font-bold text-xl"
                    >
                        ✕
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
