'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Cpu,
    Shield,
    Swords,
    FlaskConical,
    Zap,
    Terminal,
    ChevronRight,
    SkipForward
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HoverBorderGradient } from '@/components/ui/aceternity/hover-border-gradient';
import { useTranslation } from '@/context/LanguageContext';

interface WelcomeTutorialModalProps {
    onClose: () => void;
}

export default function WelcomeTutorialModal({ onClose }: WelcomeTutorialModalProps) {
    const { t } = useTranslation();
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: t('tutorial.step1.title'),
            subtitle: t('tutorial.step1.subtitle'),
            content: t('tutorial.step1.content'),
            icon: <Cpu className="w-16 h-16 text-cyan-400" />,
            color: "cyan"
        },
        {
            title: t('tutorial.step2.title'),
            subtitle: t('tutorial.step2.subtitle'),
            content: t('tutorial.step2.content'),
            icon: <Shield className="w-16 h-16 text-purple-400" />,
            color: "purple"
        },
        {
            title: t('tutorial.step3.title'),
            subtitle: t('tutorial.step3.subtitle'),
            content: t('tutorial.step3.content'),
            icon: <Swords className="w-16 h-16 text-red-500" />,
            color: "red"
        },
        {
            title: t('tutorial.step4.title'),
            subtitle: t('tutorial.step4.subtitle'),
            content: t('tutorial.step4.content'),
            icon: <FlaskConical className="w-16 h-16 text-amber-400" />,
            color: "amber"
        },
        {
            title: t('tutorial.step5.title'),
            subtitle: t('tutorial.step5.subtitle'),
            content: t('tutorial.step5.content'),
            icon: <Zap className="w-16 h-16 text-green-400" />,
            color: "green"
        }
    ];

    const currentStep = steps[step];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full max-w-2xl bg-black border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
                {/* Helper Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />

                {/* Header Bar */}
                <div className="relative z-10 bg-white/5 border-b border-white/10 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Terminal size={18} className="text-cyan-400" />
                        <span className="font-mono text-xs text-cyan-400 tracking-[0.2em] uppercase">
                            SYSTEM_TUTORIAL // V.2.0.4
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="relative z-10 p-8 min-h-[400px] flex flex-col">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 flex flex-col items-center text-center"
                        >
                            {/* Icon Ring */}
                            <div className={cn(
                                "mb-8 p-6 rounded-full border-2 bg-black/50 backdrop-blur-xl relative group transition-all duration-500",
                                `border-${currentStep.color}-500/30 text-${currentStep.color}-400`,
                                currentStep.color === 'cyan' && "shadow-[0_0_30px_rgba(34,211,238,0.2)]",
                                currentStep.color === 'purple' && "shadow-[0_0_30px_rgba(192,132,252,0.2)]",
                                currentStep.color === 'red' && "shadow-[0_0_30px_rgba(248,113,113,0.2)]",
                                currentStep.color === 'amber' && "shadow-[0_0_30px_rgba(251,191,36,0.2)]",
                                currentStep.color === 'green' && "shadow-[0_0_30px_rgba(74,222,128,0.2)]"
                            )}>
                                <div className={cn("absolute inset-0 rounded-full opacity-20 animate-ping", `bg-${currentStep.color}-500`)} />
                                {currentStep.icon}
                            </div>

                            {/* Titles */}
                            <h2 className={cn(
                                "text-3xl md:text-4xl font-black orbitron mb-2 uppercase tracking-wide",
                                `text-${currentStep.color}-400`
                            )}>
                                {currentStep.title}
                            </h2>
                            <p className="font-mono text-xs text-white/50 tracking-[0.3em] mb-8 uppercase">
                                {currentStep.subtitle}
                            </p>

                            {/* Text Content */}
                            <p className="text-gray-300 text-lg leading-relaxed max-w-lg mb-8 font-light">
                                {currentStep.content}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Progress & Controls */}
                    <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-6">
                        {/* Progress Indicators */}
                        <div className="flex justify-center gap-2">
                            {steps.map((_, i) => (
                                <motion.div
                                    key={i}
                                    className={cn(
                                        "h-1 rounded-full transition-all duration-300",
                                        i === step ? `w-8 bg-${steps[step].color}-500` : "w-2 bg-white/20"
                                    )}
                                />
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between gap-4">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-xs font-mono text-white/30 hover:text-white transition-colors flex items-center gap-2"
                            >
                                <SkipForward size={14} /> {t('tutorial.skip')}
                            </button>

                            <HoverBorderGradient
                                onClick={handleNext}
                                containerClassName="rounded-full"
                                className="bg-black text-white flex items-center gap-2 px-8 py-3 font-bold orbitron text-sm tracking-widest"
                            >
                                {step === steps.length - 1 ? (
                                    <> {t('tutorial.initialize')} <Zap size={16} className="text-green-400" /></>
                                ) : (
                                    <> {t('tutorial.next')} <ChevronRight size={16} /></>
                                )}
                            </HoverBorderGradient>
                        </div>
                    </div>
                </div>

                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-2xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-500/50 rounded-br-2xl pointer-events-none" />
            </motion.div>
        </div>
    );
}
