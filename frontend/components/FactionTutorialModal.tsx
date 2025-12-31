'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Zap, Users, ArrowRight, CheckCircle2, MousePointer2 } from 'lucide-react';
import { Button } from '@/components/ui/custom/Button';
import { useTranslation } from '@/context/LanguageContext';

interface FactionTutorialModalProps {
    onClose: () => void;
}

export default function FactionTutorialModal({ onClose }: FactionTutorialModalProps) {
    const { t } = useTranslation();
    const [step, setStep] = useState(0);
    const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

    // Tutorial Steps Content
    const steps: { icon: React.ReactNode; titleKey: any; descKey: any; targetId: string | null }[] = [
        {
            icon: <Users size={48} className="text-blue-400" />,
            titleKey: 'tutorial.faction.step1.title',
            descKey: 'tutorial.faction.step1.desc',
            targetId: 'sidebar-nav-factions'
        },
        {
            icon: <Zap size={48} className="text-yellow-400" />,
            titleKey: 'tutorial.faction.step2.title',
            descKey: 'tutorial.faction.step2.desc',
            targetId: 'sidebar-nav-generation'
        },
        {
            icon: <CheckCircle2 size={48} className="text-green-400" />,
            titleKey: 'tutorial.faction.step3.title',
            descKey: 'tutorial.faction.step3.desc',
            targetId: null // No highlight for final step
        }
    ];

    // Effect to track target element position
    useEffect(() => {
        const updatePosition = () => {
            const targetId = steps[step].targetId;
            if (targetId) {
                const element = document.getElementById(targetId);
                if (element) {
                    setHighlightRect(element.getBoundingClientRect());
                } else {
                    setHighlightRect(null);
                }
            } else {
                setHighlightRect(null);
            }
        };

        // Initial check and set interval to track movement (sidebar sliding, etc)
        updatePosition();
        const interval = setInterval(updatePosition, 100);
        window.addEventListener('resize', updatePosition);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', updatePosition);
        };
    }, [step]);

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60">
            {/* Spotlight Overlay Layer */}
            {highlightRect && (
                <div className="absolute inset-0 pointer-events-none z-10">
                    <motion.div
                        layoutId="tutorial-spotlight"
                        className="absolute border-4 border-yellow-400/80 rounded-xl shadow-[0_0_50px_rgba(250,204,21,0.5)] z-20"
                        style={{
                            top: highlightRect.top - 4,
                            left: highlightRect.left - 4,
                            width: highlightRect.width + 8,
                            height: highlightRect.height + 8,
                        }}
                        initial={{ opacity: 0, scale: 1.2 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Floating Pointer Arrow */}
                        <motion.div
                            className="absolute -right-24 top-1/2 -translate-y-1/2 flex items-center gap-2"
                            initial={{ x: 10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <span className="text-yellow-400 font-bold orbitron text-xs whitespace-nowrap bg-black/80 px-2 py-1 rounded border border-yellow-400/30">
                                CLICK HERE
                            </span>
                            <MousePointer2 className="text-yellow-400 -rotate-90 fill-yellow-400/20" size={32} />
                        </motion.div>
                    </motion.div>
                </div>
            )}

            {/* Modal Content - Offset to not block the left sidebar if identifying Sidebar items */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className={`relative w-full max-w-xl bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] z-30 transition-all duration-500 ${
                    // If focusing on sidebar (left), shift modal to the right slightly
                    highlightRect ? 'ml-[300px]' : ''
                    }`}
            >
                {/* Header / Progress */}
                <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                    <motion.div
                        className="h-full bg-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                    />
                </div>

                <div className="p-8 md:p-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col items-center text-center space-y-4"
                        >
                            {/* Icon Circle */}
                            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                                {steps[step].icon}
                            </div>

                            {/* Text Content */}
                            <div>
                                <h2 className="text-2xl font-black text-white orbitron tracking-wide mb-2">
                                    {t(steps[step].titleKey)}
                                </h2>
                                <p className="text-gray-400 leading-relaxed text-sm">
                                    {t(steps[step].descKey)}
                                </p>
                            </div>

                            {/* Divider with Arrow if needed logic */}
                        </motion.div>
                    </AnimatePresence>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5 w-full">
                        <div className="flex gap-2">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-blue-500' : 'bg-white/20'}`}
                                />
                            ))}
                        </div>

                        <Button
                            onClick={handleNext}
                            className="bg-white text-black hover:bg-gray-200 font-black orbitron px-8 py-4 rounded-xl text-xs"
                            endContent={step === steps.length - 1 ? <CheckCircle2 size={16} /> : <ChevronRight size={16} />}
                        >
                            {step === steps.length - 1 ? t('tutorial.faction.finish') : t('tutorial.next')}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
