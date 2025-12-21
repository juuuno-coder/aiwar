'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SwitchProps {
    isChecked: boolean;
    onCheckedChange: () => void;
    color?: 'primary' | 'secondary' | 'success';
}

export function Switch({ isChecked, onCheckedChange, color = 'primary' }: SwitchProps) {
    const colorClasses = {
        primary: isChecked ? 'bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-gray-700',
        secondary: isChecked ? 'bg-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-gray-700',
        success: isChecked ? 'bg-green-600 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-gray-700',
    };

    return (
        <button
            onClick={onCheckedChange}
            className={cn(
                "w-12 h-6 rounded-full p-1 transition-all duration-500",
                colorClasses[color]
            )}
        >
            <motion.div
                animate={{ x: isChecked ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-4 h-4 bg-white rounded-full shadow-lg"
            />
        </button>
    );
}
