'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronRight, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Scene {
    id: string;
    background: string;
    character: string | null;
    narration: string | null;
    dialogue: {
        speaker: string;
        text: string;
    } | null;
    effect: string | null;
}

interface CutsceneData {
    chapterId: string;
    type: 'intro' | 'outro';
    title: string;
    scenes: Scene[];
}

interface Character {
    name: string;
    role: string;
    portrait: string;
}

interface CutscenePlayerProps {
    cutscene: CutsceneData;
    characters: Record<string, Character>;
    onComplete: () => void;
    onSkip?: () => void;
}

// 효과별 애니메이션 설정
const effectVariants: Record<string, any> = {
    fade_in: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 1.5 }
    },
    fade_out: {
        initial: { opacity: 1 },
        animate: { opacity: 0 },
        transition: { duration: 1.5 }
    },
    glitch: {
        initial: { x: 0, filter: 'none' },
        animate: {
            x: [0, -5, 5, -3, 3, 0],
            filter: ['none', 'hue-rotate(90deg)', 'none', 'hue-rotate(-90deg)', 'none']
        },
        transition: { duration: 0.5 }
    },
    character_appear: {
        initial: { opacity: 0, scale: 0.8, y: 50 },
        animate: { opacity: 1, scale: 1, y: 0 },
        transition: { duration: 0.6, ease: 'easeOut' }
    },
    sparkle: {
        initial: { opacity: 0 },
        animate: { opacity: [0, 1, 0.8, 1] },
        transition: { duration: 0.8 }
    },
    dramatic_zoom: {
        initial: { scale: 1.2, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { duration: 1 }
    },
    flash_white: {
        initial: { backgroundColor: 'rgba(255,255,255,0)' },
        animate: { backgroundColor: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0)'] },
        transition: { duration: 0.5 }
    }
};

// 배경 그라데이션 매핑
const backgroundStyles: Record<string, string> = {
    dark_cityscape_2030: 'bg-gradient-to-b from-slate-900 via-purple-900/50 to-black',
    holographic_screens: 'bg-gradient-to-br from-cyan-900/80 via-blue-900 to-black',
    data_center: 'bg-gradient-to-b from-blue-950 via-indigo-950 to-black',
    world_map_hologram: 'bg-gradient-to-r from-emerald-900/50 via-teal-900/50 to-cyan-900/50',
    command_center: 'bg-gradient-to-b from-slate-800 via-gray-900 to-black',
    victory_celebration: 'bg-gradient-to-b from-yellow-900/30 via-amber-900/20 to-black',
    holographic_reward: 'bg-gradient-to-br from-purple-900/50 via-pink-900/30 to-black',
    multiple_ai_logos: 'bg-gradient-to-b from-gray-900 via-slate-900 to-black',
    faction_selection: 'bg-gradient-to-br from-indigo-900/50 via-purple-900/30 to-black',
    alliance_map: 'bg-gradient-to-r from-red-900/30 via-gray-900 to-blue-900/30',
    level_up: 'bg-gradient-to-b from-yellow-600/30 via-orange-900/20 to-black',
    legendary_card_reveal: 'bg-gradient-to-br from-yellow-500/20 via-amber-900/30 to-black',
    training_ground: 'bg-gradient-to-b from-green-900/30 via-emerald-950 to-black',
    enemy_army: 'bg-gradient-to-b from-red-900/40 via-rose-950 to-black',
    unique_unit_teaser: 'bg-gradient-to-br from-pink-900/40 via-purple-950 to-black',
    synergy_diagram: 'bg-gradient-to-br from-blue-900/40 via-indigo-950 to-black',
    category_icons: 'bg-gradient-to-b from-gray-800 via-slate-900 to-black',
    final_battleground: 'bg-gradient-to-b from-red-950 via-orange-950/50 to-black',
    all_factions: 'bg-gradient-to-br from-purple-900/30 via-blue-950 to-black',
    champion_ceremony: 'bg-gradient-to-b from-yellow-600/40 via-amber-950 to-black',
    champion_title: 'bg-gradient-to-br from-yellow-500/30 via-orange-900/20 to-black',
    sunset_cityscape: 'bg-gradient-to-b from-orange-800/40 via-pink-900/30 to-purple-950',
    teaser_new_content: 'bg-black'
};

export default function CutscenePlayer({ cutscene, characters, onComplete, onSkip }: CutscenePlayerProps) {
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const [isMuted, setIsMuted] = useState(false);

    const currentScene = cutscene.scenes[currentSceneIndex];
    const isLastScene = currentSceneIndex === cutscene.scenes.length - 1;
    const textToDisplay = currentScene?.dialogue?.text || currentScene?.narration || '';

    // 타이핑 효과
    useEffect(() => {
        if (!textToDisplay) return;

        setIsTyping(true);
        setDisplayedText('');

        let index = 0;
        const interval = setInterval(() => {
            if (index < textToDisplay.length) {
                setDisplayedText(textToDisplay.slice(0, index + 1));
                index++;
            } else {
                setIsTyping(false);
                clearInterval(interval);
            }
        }, 30);

        return () => clearInterval(interval);
    }, [currentSceneIndex, textToDisplay]);

    const handleNext = useCallback(() => {
        if (isTyping) {
            // 타이핑 중이면 즉시 표시
            setDisplayedText(textToDisplay);
            setIsTyping(false);
            return;
        }

        if (isLastScene) {
            onComplete();
        } else {
            setCurrentSceneIndex(prev => prev + 1);
        }
    }, [isTyping, isLastScene, onComplete, textToDisplay]);

    const handleSkip = () => {
        if (onSkip) {
            onSkip();
        } else {
            onComplete();
        }
    };

    // 키보드 이벤트
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                handleNext();
            } else if (e.key === 'Escape') {
                handleSkip();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext]);

    const character = currentScene?.character ? characters[currentScene.character] : null;
    const effect = currentScene?.effect || 'fade_in';
    const effectConfig = effectVariants[effect] || effectVariants.fade_in;

    return (
        <div
            className="fixed inset-0 z-[100] bg-black cursor-pointer"
            onClick={handleNext}
        >
            {/* 배경 */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentScene?.background}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                        "absolute inset-0",
                        backgroundStyles[currentScene?.background] || 'bg-black'
                    )}
                />
            </AnimatePresence>

            {/* 파티클 효과 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white/30 rounded-full"
                        initial={{
                            x: Math.random() * 100 + '%',
                            y: '100%',
                            opacity: 0
                        }}
                        animate={{
                            y: '-10%',
                            opacity: [0, 0.5, 0]
                        }}
                        transition={{
                            duration: 5 + Math.random() * 5,
                            repeat: Infinity,
                            delay: Math.random() * 5
                        }}
                    />
                ))}
            </div>

            {/* 캐릭터 이미지 */}
            <AnimatePresence mode="wait">
                {character && (
                    <motion.div
                        key={character.name}
                        {...effectConfig}
                        className="absolute left-1/2 bottom-[35%] -translate-x-1/2 w-[300px] h-[400px]"
                    >
                        <div className="relative w-full h-full">
                            <Image
                                src={character.portrait}
                                alt={character.name}
                                fill
                                className="object-contain object-bottom drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                                sizes="300px"
                                priority
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 대화/나레이션 박스 */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-0 left-0 right-0 p-6 pb-12"
            >
                <div className="max-w-4xl mx-auto bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    {/* 화자 이름 */}
                    {currentScene?.dialogue?.speaker && (
                        <div className="mb-2">
                            <span className="text-sm font-bold text-cyan-400 orbitron uppercase tracking-wider">
                                {currentScene.dialogue.speaker}
                            </span>
                        </div>
                    )}

                    {/* 텍스트 */}
                    <p className="text-lg text-white/90 leading-relaxed min-h-[60px]">
                        {displayedText}
                        {isTyping && (
                            <span className="inline-block w-0.5 h-5 bg-cyan-400 ml-1 animate-pulse" />
                        )}
                    </p>
                </div>
            </motion.div>

            {/* 상단 UI */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
                {/* 챕터 타이틀 */}
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                        <span className="text-sm text-white/70 orbitron uppercase">
                            {cutscene.title}
                        </span>
                    </div>
                </div>

                {/* 컨트롤 */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
                    >
                        {isMuted ? <VolumeX size={18} className="text-white/70" /> : <Volume2 size={18} className="text-white/70" />}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleSkip(); }}
                        className="flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-sm text-white/70"
                    >
                        <SkipForward size={16} />
                        <span>스킵</span>
                    </button>
                </div>
            </div>

            {/* 하단 진행 표시 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {cutscene.scenes.map((_, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "w-2 h-2 rounded-full transition-all",
                            idx === currentSceneIndex
                                ? "bg-cyan-400 w-4"
                                : idx < currentSceneIndex
                                    ? "bg-white/50"
                                    : "bg-white/20"
                        )}
                    />
                ))}
            </div>

            {/* 다음 힌트 */}
            {!isTyping && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute bottom-20 right-8 flex items-center gap-1 text-white/50 text-sm"
                >
                    <span>터치하여 계속</span>
                    <ChevronRight size={16} className="animate-pulse" />
                </motion.div>
            )}
        </div>
    );
}
