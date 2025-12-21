'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, SkipForward } from 'lucide-react';
import { StoryStep } from '@/lib/story-data';
import { cn } from '@/lib/utils'; // Assuming you have a utils file for classnames

interface DialogueOverlayProps {
    script: StoryStep[];
    onComplete: () => void;
}

export default function DialogueOverlay({ script, onComplete }: DialogueOverlayProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const currentStep = script[currentIndex];

    // Typing effect
    useEffect(() => {
        if (!currentStep) return;

        setDisplayedText('');
        setIsTyping(true);
        let charIndex = 0;

        const interval = setInterval(() => {
            if (charIndex < currentStep.text.length) {
                setDisplayedText((prev) => prev + currentStep.text[charIndex]);
                charIndex++;
            } else {
                setIsTyping(false);
                clearInterval(interval);
            }
        }, 30); // Typing speed

        return () => clearInterval(interval);
    }, [currentIndex, currentStep]);

    const handleNext = () => {
        if (isTyping) {
            // Instant finish typing
            setDisplayedText(currentStep.text);
            setIsTyping(false);
        } else {
            // Next step
            if (currentIndex < script.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                onComplete();
            }
        }
    };

    if (!currentStep) return null;

    const isCenter = currentStep.side === 'center';
    const isPlayer = currentStep.speaker.name === 'Player';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm"
            onClick={handleNext}
        >
            {/* Background Gradient for focus */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 pointer-events-none" />

            {/* Character Image Area */}
            <div className="absolute inset-0 flex items-end justify-center pointer-events-none pb-32">
                <AnimatePresence mode='wait'>
                    {currentStep.speaker.image && !isCenter && (
                        <motion.img
                            key={currentStep.speaker.image} // Re-animate on character change
                            src={currentStep.speaker.image}
                            alt={currentStep.speaker.name}
                            initial={{ x: currentStep.side === 'left' ? -100 : 100, opacity: 0, scale: 0.9 }}
                            animate={{ x: currentStep.side === 'left' ? '-20%' : '20%', opacity: 1, scale: 1 }}
                            exit={{ x: currentStep.side === 'left' ? -100 : 100, opacity: 0, scale: 0.9 }}
                            transition={{ type: "spring", damping: 20, stiffness: 100 }}
                            className={cn(
                                "h-[80vh] object-contain drop-shadow-[0_0_50px_rgba(0,0,0,0.5)]",
                                currentStep.side === 'left' ? "mr-auto" : "ml-auto" // Simple positioning
                            )}
                            style={{
                                filter: isPlayer ? 'brightness(0.8)' : 'brightness(1.1)', // Highlight active speaker slightly if needed
                            }}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Skip Button */}
            <button
                onClick={(e) => { e.stopPropagation(); onComplete(); }}
                className="absolute top-8 right-8 text-white/40 hover:text-white flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors z-50"
            >
                <SkipForward size={14} />
                <span className="text-xs font-bold orbitron tracking-widest">SKIP SEQUENCE</span>
            </button>

            {/* Dialogue Box */}
            <div className="relative z-50 w-full max-w-5xl mx-auto mb-10 px-6">
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={cn(
                        "relative bg-black/80 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-md overflow-hidden min-h-[180px]",
                        isCenter ? "border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]" : "border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)]"
                    )}
                >
                    {/* Speaker Info */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-[2px] w-8 bg-gradient-to-r from-transparent to-cyan-500" />
                        <span className={cn(
                            "text-xl font-black orbitron tracking-widest uppercase",
                            isCenter ? "text-cyan-400" : "text-purple-400"
                        )}>
                            {currentStep.speaker.name}
                        </span>
                        {currentStep.speaker.title && (
                            <span className="text-xs text-white/40 font-bold uppercase tracking-wider border-l border-white/20 pl-3">
                                {currentStep.speaker.title}
                            </span>
                        )}
                    </div>

                    {/* Text Area */}
                    <p className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed font-sans">
                        {displayedText}
                        {isTyping && <span className="inline-block w-2 h-6 ml-1 bg-cyan-400 align-middle animate-pulse" />}
                    </p>

                    {/* Next Indicator */}
                    {!isTyping && (
                        <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="absolute bottom-6 right-8 text-white/40"
                        >
                            <ChevronRight size={24} />
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}
