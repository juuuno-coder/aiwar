'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { Card } from '@/lib/types';
import GachaRevealModal from '@/components/GachaRevealModal';
import {
    Terminal, Swords, Shield, Zap, Gift, ChevronRight, X, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserProfile } from '@/hooks/useUserProfile';

interface TutorialStep {
    id: string;
    title: string;
    content: string;
    icon?: string;
    color?: string;
    highlight?: string;
    position?: 'top' | 'bottom' | 'center';
    action: 'next' | 'claim' | 'close';
    reward?: string;
}

const parseMarkdownTutorial = (md: string): TutorialStep[] => {
    const steps: TutorialStep[] = [];
    const rawSteps = md.split('# step:').filter(s => s.trim());

    rawSteps.forEach(raw => {
        const lines = raw.split('\n');
        const id = lines[0].trim();
        const step: any = { id };

        lines.slice(1).forEach(line => {
            if (line.startsWith('## title:')) step.title = line.replace('## title:', '').trim();
            else if (line.startsWith('## content:')) step.content = line.replace('## content:', '').trim();
            else if (line.startsWith('## icon:')) step.icon = line.replace('## icon:', '').trim();
            else if (line.startsWith('## color:')) step.color = line.replace('## color:', '').trim();
            else if (line.startsWith('## highlight:')) step.highlight = line.replace('## highlight:', '').trim();
            else if (line.startsWith('## position:')) step.position = line.replace('## position:', '').trim();
            else if (line.startsWith('## action:')) step.action = line.replace('## action:', '').trim();
            else if (line.startsWith('## reward:')) step.reward = line.replace('## reward:', '').trim();
        });

        if (step.id) steps.push(step);
    });

    return steps;
};

export default function UnifiedTutorialModal() {
    const { user, claimStarterPack } = useUser();
    // const { user } = useUserProfile(); // Incorrect hook

    const [steps, setSteps] = useState<TutorialStep[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Reward State
    const [claimedCards, setClaimedCards] = useState<Card[]>([]);
    const [showRewardModal, setShowRewardModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Initial Load & Check
    useEffect(() => {
        if (!user) return;

        const checkTutorialStatus = async () => {
            // Check LocalStorage or User Profile for completion status
            const isCompleted = localStorage.getItem(`tutorial_completed_${user.uid}`);

            if (isCompleted) {
                setIsLoading(false);
                return;
            }

            try {
                const res = await fetch('/data/tutorial.md');
                const text = await res.text();
                const parsedSteps = parseMarkdownTutorial(text);
                setSteps(parsedSteps);
                setIsVisible(true);
            } catch (e) {
                console.error("Failed to load tutorial:", e);
            } finally {
                setIsLoading(false);
            }
        };

        checkTutorialStatus();
    }, [user]);

    // Handle Highlight Effect
    useEffect(() => {
        if (!isVisible || !steps[currentStepIndex]) return;

        const step = steps[currentStepIndex];

        // Remove previous highlights
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight', 'relative', 'z-[60]');
        });

        // Create/Update Overlay
        // (Overlay handled by render currently, but we might need DOM manipulation for exact cutout)

        if (step.highlight) {
            const el = document.querySelector(step.highlight);
            if (el) {
                el.classList.add('tutorial-highlight', 'relative', 'z-[60]');
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        return () => {
            document.querySelectorAll('.tutorial-highlight').forEach(el => {
                el.classList.remove('tutorial-highlight', 'relative', 'z-[60]');
            });
        };
    }, [currentStepIndex, isVisible, steps]);

    const handleAction = async () => {
        if (isProcessing) return;
        const step = steps[currentStepIndex];

        if (step.action === 'next') {
            if (currentStepIndex < steps.length - 1) {
                setCurrentStepIndex(prev => prev + 1);
            } else {
                completeTutorial();
            }
        } else if (step.action === 'claim') {
            setIsProcessing(true);
            try {
                await handleClaimReward();
            } finally {
                setIsProcessing(false);
            }
        } else if (step.action === 'close') {
            completeTutorial();
        }
    };

    const handleClaimReward = async () => {
        if (!user) return;

        try {
            // Claim Logic
            const cards = await claimStarterPack('신입 지휘관');

            if (cards && cards.length > 0) {
                console.log("✅ Starter Pack claimed successfully via Tutorial");
                setClaimedCards(cards);
                setShowRewardModal(true);
                setIsVisible(false);
            } else {
                // [Logic] claimStarterPack returns [] if already claimed with content,
                // or if it failed. But now it rescues broken users.
                // So [] means "Actually already claimed and has content".
                console.log("ℹ️ Starter Pack already claimed or rescue not needed.");
                completeTutorial();
            }
        } catch (e) {
            console.error("Reward Claim Error", e);
            completeTutorial();
        }
    };

    const handleRewardClose = () => {
        setShowRewardModal(false);
        completeTutorial();
    };

    const completeTutorial = () => {
        if (!user) return;
        localStorage.setItem(`tutorial_completed_${user.uid}`, 'true');
        setIsVisible(false);
        // Clean up DOM
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight', 'relative', 'z-[60]');
        });
    };

    const getIcon = (name?: string, color?: string) => {
        const props = { className: cn("w-12 h-12 mb-4", color ? `text-${color}-400` : "text-white") };
        switch (name) {
            case 'Terminal': return <Terminal {...props} />;
            case 'Swords': return <Swords {...props} />;
            case 'Shield': return <Shield {...props} />;
            case 'Zap': return <Zap {...props} />;
            case 'Gift': return <Gift {...props} />;
            default: return <AlertCircle {...props} />;
        }
    };

    if (isLoading || (!isVisible && !showRewardModal)) return null;

    // Render Reward Modal if active
    if (showRewardModal) {
        return (
            <GachaRevealModal
                isOpen={true}
                cards={claimedCards}
                onClose={handleRewardClose}
                packType="premium" // Using premium pack style for starter
                bonusReward={{ type: 'coins', amount: 1000 }}
            />
        );
    }

    const currentStep = steps[currentStepIndex];
    if (!currentStep) return null;

    return (
        <AnimatePresence>
            {isVisible && currentStep && (
                <div className="fixed inset-0 z-[50] flex flex-col items-center justify-center">
                    {/* Backdrop with Hole Support - Using simplified semi-transparent bg for now as hole-punching needs canvas or complex clip-path */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-all duration-300"
                    />

                    {/* Tutorial Content Card */}
                    <motion.div
                        key={currentStep.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                            "relative w-[90%] max-w-md bg-gradient-to-b from-gray-900 via-gray-900 to-black border rounded-2xl p-6 shadow-2xl z-[70]",
                            currentStep.color ? `border-${currentStep.color}-500/50 shadow-${currentStep.color}-500/20` : "border-white/20",
                            currentStep.position === 'top' ? 'mb-auto mt-20' :
                                currentStep.position === 'bottom' ? 'mt-auto mb-32' : '' // Adjust for Mobile Nav
                        )}
                    >
                        {/* Skip Button */}
                        <button
                            onClick={completeTutorial}
                            className="absolute top-4 right-4 text-white/40 hover:text-white text-xs underline transition-colors"
                        >
                            Skip Tutorial
                        </button>

                        <div className="flex flex-col items-center text-center">
                            {getIcon(currentStep.icon, currentStep.color)}

                            <h2 className={cn(
                                "text-2xl font-bold mb-2",
                                currentStep.color ? `text-${currentStep.color}-400` : "text-white"
                            )}>
                                {currentStep.title}
                            </h2>

                            <div
                                className="text-white/80 mb-6 text-sm leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: currentStep.content }}
                            />

                            <div className="flex gap-3 w-full">
                                {currentStepIndex > 0 && (
                                    <button
                                        onClick={() => setCurrentStepIndex(prev => prev - 1)}
                                        className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 transition-colors"
                                    >
                                        Prev
                                    </button>
                                )}
                                <button
                                    onClick={handleAction}
                                    disabled={isProcessing}
                                    className={cn(
                                        "flex-1 px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2",
                                        isProcessing ? "opacity-50 cursor-not-allowed bg-gray-600" :
                                            currentStep.color
                                                ? `bg-${currentStep.color}-600 hover:bg-${currentStep.color}-500 shadow-${currentStep.color}-500/30 text-white`
                                                : "bg-white text-black hover:bg-gray-200"
                                    )}
                                >
                                    {isProcessing ? 'Processing...' : currentStep.action === 'claim' ? '보급품 수령' : 'Next'}
                                    {!isProcessing && <ChevronRight size={16} />}
                                </button>
                            </div>

                            {/* Step Indicator */}
                            <div className="flex gap-2 mt-6">
                                {steps.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "w-2 h-2 rounded-full transition-all",
                                            idx === currentStepIndex
                                                ? (currentStep.color ? `bg-${currentStep.color}-400 w-6` : "bg-white w-6")
                                                : "bg-white/20"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
