'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import { X } from 'lucide-react';

interface TutorialStep {
    targetId?: string; // UI 요소의 ID (Highlight용)
    title: string;
    description: string;
    position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

const STEPS: TutorialStep[] = [
    {
        title: "WELCOME COMMANDER",
        description: "AI 대전에 오신 것을 환영합니다.\n이곳은 인류 최후의 AI 지휘 사령부입니다.",
        position: 'center'
    },
    {
        targetId: 'menu-inventory', // 카드 보관소
        title: "INVENTORY",
        description: "전투에 사용할 AI 카드와 유닛들을 관리하는 곳입니다.\n가장 먼저 덱을 편성해야 합니다.",
        position: 'bottom'
    },
    {
        targetId: 'menu-battle', // 작전 지역
        title: "BATTLE FIELD",
        description: "PVP 대전 및 스토리 미션을 수행하는 작전 지역입니다.\n승리하여 데이터 코인을 획득하세요.",
        position: 'bottom'
    },
    {
        targetId: 'season-banner', // 시즌 배너
        title: "CAMPAIGN",
        description: "메인 스토리가 진행되는 시즌 캠페인입니다.\nAI 전쟁의 진실을 파헤치세요.",
        position: 'top'
    }
];

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function TutorialOverlay({ isOpen, onClose }: Props) {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setCurrentStep(0);
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onClose();
        }
    };

    if (!isOpen) return null;

    const step = STEPS[currentStep];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Highlight Effect (나중에 구현: clip-path 등으로 구멍 뚫기) */}

                <motion.div
                    key={currentStep}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-zinc-900 border border-cyan-500/50 rounded-2xl p-8 max-w-md w-full relative shadow-[0_0_50px_rgba(6,182,212,0.2)] text-center"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-white"
                    >
                        <X size={20} />
                    </button>

                    <div className="text-cyan-500 font-mono text-sm mb-2 tracking-widest">
                        STEP {currentStep + 1} / {STEPS.length}
                    </div>

                    <h2 className="text-2xl font-black text-white italic mb-4 orbitron">
                        {step.title}
                    </h2>

                    <p className="text-gray-300 leading-relaxed mb-8 whitespace-pre-line">
                        {step.description}
                    </p>

                    <Button
                        onClick={handleNext}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-lg py-6"
                    >
                        {currentStep === STEPS.length - 1 ? "START MISSION" : "NEXT"}
                    </Button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
