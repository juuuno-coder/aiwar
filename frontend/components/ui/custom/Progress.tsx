import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number;
    maxValue?: number;
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default';
    label?: React.ReactNode;
    showValueLabel?: boolean;
    classNames?: {
        track?: string;
        indicator?: string;
        label?: string;
        value?: string;
    };
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(({
    value,
    maxValue = 100,
    size = 'md',
    color = 'default',
    label,
    showValueLabel = false,
    className,
    classNames,
    ...props
}, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));

    const sizeStyles = {
        sm: "h-1",
        md: "h-3",
        lg: "h-5",
    };

    const colorStyles = {
        default: "bg-zinc-500",
        primary: "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]",
        secondary: "bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.5)]",
        success: "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]",
        warning: "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]",
        danger: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]",
    };

    return (
        <div ref={ref} className={cn("flex flex-col gap-2 w-full", className)} {...props}>
            {(label || showValueLabel) && (
                <div className="flex justify-between text-xs font-medium px-1">
                    {label && <span className={cn("text-zinc-400", classNames?.label)}>{label}</span>}
                    {showValueLabel && (
                        <span className={cn("text-zinc-300", classNames?.value)}>
                            {value}{maxValue !== 100 ? ` / ${maxValue}` : '%'}
                        </span>
                    )}
                </div>
            )}
            <div className={cn("w-full bg-zinc-800/50 rounded-full overflow-hidden", sizeStyles[size], classNames?.track)}>
                <motion.div
                    className={cn("h-full rounded-full transition-all", colorStyles[color], classNames?.indicator)}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </div>
        </div>
    );
});

Progress.displayName = "Progress";
