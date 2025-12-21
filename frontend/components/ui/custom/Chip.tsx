import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ChipProps extends Omit<HTMLMotionProps<"div">, "children"> {
    children?: React.ReactNode;
    variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'dot';
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    startContent?: React.ReactNode;
    endContent?: React.ReactNode;
    classNames?: {
        base?: string;
        content?: string;
    };
    // Adding compatibility props that might be used
    onClose?: () => void;
}

export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(({
    children,
    className,
    variant = 'solid',
    color = 'default',
    size = 'md',
    startContent,
    endContent,
    classNames,
    onClose,
    ...props
}, ref) => {

    const baseStyles = "inline-flex items-center justify-between box-border whitespace-nowrap align-middle rounded-full transition-all";

    const variants = {
        solid: {
            default: "bg-zinc-700 text-zinc-200",
            primary: "bg-cyan-500 text-black",
            secondary: "bg-purple-600 text-white",
            success: "bg-green-500 text-black",
            warning: "bg-yellow-500 text-black",
            danger: "bg-red-500 text-white",
        },
        flat: {
            default: "bg-zinc-700/40 text-zinc-300",
            primary: "bg-cyan-500/20 text-cyan-400",
            secondary: "bg-purple-500/20 text-purple-300",
            success: "bg-green-500/20 text-green-400",
            warning: "bg-yellow-500/20 text-yellow-400",
            danger: "bg-red-500/20 text-red-400",
        },
        bordered: {
            default: "border border-zinc-700 text-zinc-300",
            primary: "border border-cyan-500 text-cyan-400",
            secondary: "border border-purple-500 text-purple-400",
            success: "border border-green-500 text-green-400",
            warning: "border border-yellow-500 text-yellow-400",
            danger: "border border-red-500 text-red-400",
        }
    };

    const sizes = {
        sm: "px-2 h-6 text-xs",
        md: "px-3 h-7 text-sm",
        lg: "px-4 h-8 text-base",
    };

    // Fallback to solid if variant/color combo not defined
    const variantStyles = (variants[variant as keyof typeof variants] || variants.solid)[color] || variants.solid.default;
    const sizeStyles = sizes[size];

    return (
        <motion.div
            ref={ref}
            className={cn(
                baseStyles,
                variantStyles,
                sizeStyles,
                className,
                classNames?.base
            )}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            {...props}
        >
            {startContent && <span className="mr-1">{startContent}</span>}
            <span className={cn("flex-1 text-inherit font-bold orbitron", classNames?.content)}>
                {children}
            </span>
            {endContent && <span className="ml-1">{endContent}</span>}
        </motion.div>
    );
});

Chip.displayName = "Chip";
