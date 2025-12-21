'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    title: string;
    englishTitle: string;
    description: string;
    action?: React.ReactNode;
    color?: 'purple' | 'blue' | 'pink' | 'cyan' | 'orange' | 'green' | 'gray';
}

const colorStyles = {
    purple: "bg-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.4)]",
    blue: "bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]",
    pink: "bg-pink-600 shadow-[0_0_15px_rgba(236,72,153,0.4)]",
    cyan: "bg-cyan-600 shadow-[0_0_15px_rgba(6,182,212,0.4)]",
    orange: "bg-orange-600 shadow-[0_0_15px_rgba(249,115,22,0.4)]",
    green: "bg-green-600 shadow-[0_0_15px_rgba(34,197,94,0.4)]",
    gray: "bg-gray-600 shadow-[0_0_15px_rgba(75,85,99,0.4)]",
};

const textColors = {
    purple: "text-purple-400",
    blue: "text-blue-400",
    pink: "text-pink-400",
    cyan: "text-cyan-400",
    orange: "text-orange-400",
    green: "text-green-400",
    gray: "text-gray-400",
};

export default function PageHeader({
    title,
    englishTitle,
    description,
    action,
    color = 'purple'
}: PageHeaderProps) {
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto mb-10 space-y-4"
        >
            <div className="flex justify-between items-end border-b border-white/10 pb-4">
                <div className="flex items-baseline gap-4">
                    <h1 className="text-4xl font-black text-white italic tracking-tighter">{title}</h1>
                    <span className={cn("text-xs font-bold orbitron uppercase tracking-[0.3em] opacity-50", textColors[color])}>
                        {englishTitle}
                    </span>
                </div>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black orbitron uppercase tracking-widest leading-none">Back</span>
                </button>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-start gap-3 flex-1">
                    <div className={cn("w-1 h-6 rounded-full mt-1 shrink-0", colorStyles[color])} />
                    <p className="text-gray-500 font-bold max-w-2xl leading-relaxed text-[13px]">
                        {description}
                    </p>
                </div>
                {action && (
                    <div className="shrink-0 w-full md:w-auto">
                        {action}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
