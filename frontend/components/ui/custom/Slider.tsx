'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
    value: number;
    maxValue: number;
    step: number;
    onChange: (value: number) => void;
    color?: 'primary' | 'secondary';
    className?: string;
}

export function Slider({ value, maxValue, step, onChange, color = 'primary', className }: SliderProps) {
    const trackRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        const updateValue = (clientX: number) => {
            if (!trackRef.current) return;
            const rect = trackRef.current.getBoundingClientRect();
            const pos = (clientX - rect.left) / rect.width;
            const newValue = Math.min(maxValue, Math.max(0, pos * maxValue));
            onChange(newValue);
        };

        const onMouseMove = (moveEvent: MouseEvent) => updateValue(moveEvent.clientX);
        const onTouchMove = (moveEvent: TouchEvent) => updateValue(moveEvent.touches[0].clientX);

        const onUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('touchmove', onTouchMove);
        window.addEventListener('touchend', onUp);

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        updateValue(clientX);
    };

    const percentage = (value / maxValue) * 100;

    return (
        <div
            ref={trackRef}
            className={cn("relative h-6 flex items-center cursor-pointer group", className)}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
        >
            {/* Track Background */}
            <div className="absolute w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                {/* Track Fill */}
                <div
                    className={cn(
                        "h-full transition-all duration-150",
                        color === 'primary' ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {/* Thumb */}
            <div
                className={cn(
                    "absolute w-4 h-4 rounded-full bg-white shadow-xl transition-all duration-150",
                    "group-hover:scale-125 border-2",
                    color === 'primary' ? 'border-blue-400' : 'border-purple-400'
                )}
                style={{ left: `calc(${percentage}% - 8px)` }}
            />
        </div>
    );
}
