'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/custom/Button';
import { cn } from '@/lib/utils';
import { Play, FastForward, SkipForward, X } from 'lucide-react';
import Image from 'next/image';

// 스토리 데이터 타입 정의
export interface Dialogue {
    speaker: string;
    text: string;
}

export interface CutsceneScene {
    id: string;
    background: string;
    character: string | null;
    narration: string | null;
    dialogue: Dialogue | null;
    effect: string | null;
}

export interface CutsceneData {
    chapterId: string;
    type: 'intro' | 'outro';
    title: string;
    scenes: CutsceneScene[];
}

export interface CharacterData {
    name: string;
    role: string;
    portrait: string;
}

interface CutscenePlayerProps {
    cutscene: CutsceneData;
    characters: Record<string, CharacterData>;
    onComplete: () => void;
    onSkip?: () => void;
}

export default function CutscenePlayer({ cutscene, characters, onComplete, onSkip }: CutscenePlayerProps) {
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const typingSpeed = 30; // ms per char

    const currentScene = cutscene.scenes[currentSceneIndex];
    const fullText = currentScene.dialogue ? currentScene.dialogue.text : currentScene.narration || '';

    // 텍스트 타이핑 효과
    useEffect(() => {
        if (!fullText) return;

        setDisplayedText('');
        setIsTyping(true);
        let index = 0;

        const timer = setInterval(() => {
            if (index < fullText.length) {
                setDisplayedText((prev) => prev + fullText.charAt(index));
                index++;
            } else {
                setIsTyping(false);
                clearInterval(timer);
            }
        }, typingSpeed);

        return () => clearInterval(timer);
    }, [currentSceneIndex, fullText]);

    const handleNext = () => {
        if (isTyping) {
            // 타이핑 중이면 즉시 완료
            setDisplayedText(fullText);
            setIsTyping(false);
        } else {
            // 다음 장면으로
            if (currentSceneIndex < cutscene.scenes.length - 1) {
                setCurrentSceneIndex(prev => prev + 1);
            } else {
                onComplete();
            }
        }
    };

    // 배경 이미지 매핑 (실제 이미지 경로로 대체 필요)
    const getBackgroundUrl = (bgId: string) => {
        // 임시: 배경 ID에 따라 다른 색상/그라디언트 또는 플레이스홀더 반환
        // 실제 구현 시 public/assets/backgrounds/... 등의 경로 사용
        if (bgId.includes('city')) return 'url("/assets/backgrounds/city_cyberpunk.jpg")';
        if (bgId.includes('center')) return 'url("/assets/backgrounds/datacenter.jpg")';
        return `linear-gradient(to bottom, #000000, #1a1a2e)`; // Fallback
    };

    const getCharacterPortrait = (charId: string | null) => {
        if (!charId || !characters[charId]) return null;
        return characters[charId].portrait;
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden">
            {/* 배경 */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
                style={{
                    backgroundImage: getBackgroundUrl(currentScene.background),
                    filter: currentScene.effect === 'glitch' ? 'hue-rotate(90deg)' : 'brightness(0.6)'
                }}
            >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

                {/* 배경 효과 오버레이 */}
                {currentScene.effect === 'flash_white' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 bg-white z-10"
                    />
                )}
            </div>

            {/* 상단 정보 */}
            <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-20">
                <div className="bg-black/60 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
                    <span className="text-cyan-400 font-bold orbitron mr-3">{cutscene.title}</span>
                    <span className="text-white/40 text-sm">{currentSceneIndex + 1} / {cutscene.scenes.length}</span>
                </div>

                <Button
                    variant="ghost"
                    className="text-white/40 hover:text-white hover:bg-white/10"
                    onClick={() => onSkip && onSkip()}
                >
                    <SkipForward size={20} className="mr-2" /> SKIP
                </Button>
            </div>

            {/* 중앙 콘텐츠: 캐릭터 등 */}
            <div className="flex-1 w-full relative z-10 flex items-end justify-center pb-[30vh]">
                <AnimatePresence mode="wait">
                    {currentScene.character && (
                        <motion.div
                            key={currentScene.character}
                            initial={{ opacity: 0, x: 50, y: 20 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="relative h-[60vh] w-auto aspect-[3/4]"
                        >
                            {/* 캐릭터 이미지 (임시로 이름 표시) */}
                            {getCharacterPortrait(currentScene.character)?.startsWith('/') ? (
                                <img
                                    src={getCharacterPortrait(currentScene.character)!}
                                    alt={currentScene.character}
                                    className="h-full w-full object-contain drop-shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                                    onError={(e) => {
                                        // 이미지 로드 실패 시 폴백
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="h-full w-full bg-cyan-500/10 border-2 border-cyan-500/30 rounded-2xl flex items-center justify-center">
                                    <span className="text-4xl text-cyan-400 font-black uppercase orbitron">
                                        {characters[currentScene.character]?.name || currentScene.character}
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 하단 대화창 */}
            <div
                className="absolute bottom-0 left-0 right-0 h-[30vh] bg-gradient-to-t from-black via-black/90 to-transparent pt-12 pb-12 px-4 md:px-20 z-20 cursor-pointer"
                onClick={handleNext}
            >
                <div className="max-w-4xl mx-auto w-full">
                    {currentScene.dialogue ? (
                        // 대화 모드
                        <div className="bg-black/60 border border-white/20 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative">
                            {/* 화자 이름 태그 */}
                            <div className="absolute -top-5 left-8 bg-cyan-600 px-6 py-2 rounded-lg border border-cyan-400 shadow-[0_0_15px_rgba(8,145,178,0.6)]">
                                <span className="font-bold text-white tracking-wider text-sm md:text-base">
                                    {currentScene.dialogue.speaker}
                                </span>
                            </div>

                            <p className="text-lg md:text-2xl text-white leading-relaxed font-secondary">
                                {displayedText}
                                <motion.span
                                    animate={{ opacity: [0, 1, 0] }}
                                    transition={{ repeat: Infinity, duration: 0.8 }}
                                    className="inline-block w-2 H-6 bg-cyan-400 ml-1 align-middle"
                                />
                            </p>
                        </div>
                    ) : currentScene.narration ? (
                        // 내레이션 모드
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-black/40 px-10 py-6 rounded-3xl border border-white/10"
                            >
                                <p className="text-xl md:text-3xl text-white/90 font-serif italic">
                                    "{displayedText}"
                                </p>
                            </motion.div>
                        </div>
                    ) : null}

                    {/* 클릭 유도 인디케이터 */}
                    <motion.div
                        className="absolute bottom-8 right-12 text-white/50 text-sm flex items-center gap-2"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        <span>Click to continue</span>
                        <Play size={14} className="fill-white/50" />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
