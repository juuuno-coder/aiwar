'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { cn } from '@/lib/utils';

interface CyberPageLayoutProps {
    children: React.ReactNode;
    title: string;
    englishTitle?: string;
    subtitle?: string;
    description?: string;
    color?: 'cyan' | 'purple' | 'pink' | 'amber' | 'yellow' | 'green' | 'red' | 'blue';
    showBack?: boolean;
    backPath?: string;
    action?: React.ReactNode;
}

const colorConfig = {
    cyan: {
        text: 'text-cyan-400',
        glow: 'shadow-[0_0_20px_rgba(34,211,238,0.3)]',
        border: 'border-cyan-500/30',
        bg: 'bg-cyan-500/10',
        line: 'bg-cyan-500',
    },
    purple: {
        text: 'text-purple-400',
        glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
        border: 'border-purple-500/30',
        bg: 'bg-purple-500/10',
        line: 'bg-purple-500',
    },
    pink: {
        text: 'text-pink-400',
        glow: 'shadow-[0_0_20px_rgba(236,72,153,0.3)]',
        border: 'border-pink-500/30',
        bg: 'bg-pink-500/10',
        line: 'bg-pink-500',
    },
    amber: {
        text: 'text-amber-400',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
        border: 'border-amber-500/30',
        bg: 'bg-amber-500/10',
        line: 'bg-amber-500',
    },
    yellow: {
        text: 'text-yellow-400',
        glow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]',
        border: 'border-yellow-500/30',
        bg: 'bg-yellow-500/10',
        line: 'bg-yellow-500',
    },
    green: {
        text: 'text-green-400',
        glow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]',
        border: 'border-green-500/30',
        bg: 'bg-green-500/10',
        line: 'bg-green-500',
    },
    red: {
        text: 'text-red-400',
        glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
        border: 'border-red-500/30',
        bg: 'bg-red-500/10',
        line: 'bg-red-500',
    },
    blue: {
        text: 'text-blue-400',
        glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
        border: 'border-blue-500/30',
        bg: 'bg-blue-500/10',
        line: 'bg-blue-500',
    },
};

export default function CyberPageLayout({
    children,
    title,
    englishTitle,
    subtitle,
    description,
    color = 'cyan',
    showBack = true,
    backPath,
    action,
}: CyberPageLayoutProps) {
    const router = useRouter();
    const colors = colorConfig[color];

    const handleBack = () => {
        if (backPath) {
            router.push(backPath);
        } else {
            router.back();
        }
    };

    return (
        <div className="relative min-h-screen bg-black text-white overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

            {/* Top Glow Effect - Simplified for performance */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-b from-cyan-500/5 to-transparent rounded-full blur-2xl" />

            {/* Scanlines */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.01] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />

            {/* Background Beams - Global Effect (Slightly more transparent) */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
                <BackgroundBeams />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
                {/* Page Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-10"
                >
                    {/* Top Row: Title + Back Button */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            {/* Accent Line */}
                            <div className={cn("w-1 h-10 rounded-full", colors.line, colors.glow)} />

                            <div>
                                {/* Subtitle */}
                                {subtitle && (
                                    <p className={cn("text-[10px] font-mono uppercase tracking-[0.3em] mb-1", colors.text)}>
                                        {subtitle}
                                    </p>
                                )}
                                {/* Title */}
                                <div className="flex items-baseline gap-3">
                                    <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter text-white font-sans">
                                        {title}
                                    </h1>
                                    {englishTitle && (
                                        <span className="text-sm md:text-lg font-bold orbitron text-white/30 tracking-widest uppercase">
                                            {englishTitle}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {action}

                            {showBack && (
                                <button
                                    onClick={handleBack}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all group"
                                >
                                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                                    <span className="text-[9px] font-mono uppercase tracking-widest">BACK</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    {description && (
                        <p className="text-sm text-white/40 max-w-4xl leading-relaxed pl-5 border-l border-white/10">
                            {description}
                        </p>
                    )}

                    {/* Separator Line */}
                    <div className="mt-6 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
                </motion.header>

                {/* Page Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    {children}
                </motion.div>
            </div>
        </div>
    );
}
