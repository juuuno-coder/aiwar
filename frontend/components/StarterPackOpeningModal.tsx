'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Lock, Zap, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/context/LanguageContext';

interface StarterPackOpeningModalProps {
    onOpen: () => void;
}

export default function StarterPackOpeningModal({ onOpen }: StarterPackOpeningModalProps) {
    const { t } = useTranslation();
    const [isOpening, setIsOpening] = useState(false);

    const handleOpen = () => {
        setIsOpening(true);
        // Play sound effect here if available
        setTimeout(() => {
            onOpen();
        }, 1500); // Wait for animation
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-3xl">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
            </div>

            <AnimatePresence>
                {!isOpening ? (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0, filter: "blur(20px)" }}
                        className="relative z-10 flex flex-col items-center cursor-pointer group"
                        onClick={handleOpen}
                    >
                        {/* The Pack/Crate */}
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
                            whileTap={{ scale: 0.95 }}
                            animate={{
                                y: [0, -20, 0],
                                rotate: [0, 0, 0] // Placeholder for idle animation
                            }}
                            transition={{
                                y: { repeat: Infinity, duration: 4, ease: "easeInOut" }
                            }}
                            className="relative w-64 h-64 md:w-80 md:h-80 mb-12"
                        >
                            {/* Glow Effects */}
                            <div className="absolute inset-0 bg-blue-500/30 blur-[60px] rounded-full animate-pulse" />

                            {/* Crate Visual Construction */}
                            <div className="relative w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 border border-blue-500/30 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.3)] overflow-hidden group-hover:shadow-[0_0_80px_rgba(59,130,246,0.5)] transition-all duration-500">
                                {/* Diagonal Stripes */}
                                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(59,130,246,0.05)_10px,rgba(59,130,246,0.05)_20px)]" />

                                {/* Center Icon */}
                                <div className="relative z-10 p-8 rounded-full bg-black/50 border border-blue-400/30 shadow-[0_0_30px_rgba(59,130,246,0.2)] group-hover:scale-110 transition-transform duration-500">
                                    <Package size={80} className="text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                                </div>

                                {/* Padlock / Secure Icon */}
                                <div className="absolute bottom-6 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-blue-500/30 flex items-center gap-2">
                                    <Lock size={12} className="text-blue-400" />
                                    <span className="text-[10px] font-mono text-blue-300 tracking-widest uppercase">
                                        SECURE_STORAGE
                                    </span>
                                </div>

                                {/* Corner Accents */}
                                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-blue-500 rounded-br-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </motion.div>

                        {/* Text Instructions */}
                        <div className="text-center space-y-2">
                            <motion.h2
                                className="text-3xl font-black text-white orbitron tracking-wider uppercase italic"
                                animate={{ textShadow: ["0 0 10px rgba(59,130,246,0.5)", "0 0 20px rgba(59,130,246,0.8)", "0 0 10px rgba(59,130,246,0.5)"] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                STARTER SUPPLY
                            </motion.h2>
                            <p className="text-blue-200/50 font-mono text-sm tracking-[0.2em] flex items-center justify-center gap-2 group-hover:text-blue-400 transition-colors">
                                <Zap size={14} className="animate-pulse" />
                                CLICK TO DECRYPT
                                <Zap size={14} className="animate-pulse" />
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    /* Opening Animation Stage */
                    <motion.div
                        className="relative z-20 flex flex-col items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="relative">
                            {/* Explosion Flash */}
                            <motion.div
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{ scale: [0, 20], opacity: [1, 0] }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white rounded-full blur-xl"
                            />

                            {/* Particle Burst (Simulated with simple shapes) */}
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                                    animate={{
                                        x: (Math.random() - 0.5) * 500,
                                        y: (Math.random() - 0.5) * 500,
                                        scale: 0,
                                        opacity: 0
                                    }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-400 rounded-full blur-sm"
                                />
                            ))}

                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-center"
                            >
                                <Sparkles className="w-24 h-24 text-white mx-auto mb-4 animate-spin-slow" />
                                <h2 className="text-4xl font-black text-white orbitron tracking-widest">
                                    ACCESS GRANTED
                                </h2>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

