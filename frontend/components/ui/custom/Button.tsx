import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useSound } from '@/context/SoundContext';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    children: React.ReactNode;
    variant?: 'solid' | 'ghost' | 'light' | 'flat' | 'shadow';
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    isLoading?: boolean;
    startContent?: React.ReactNode;
    endContent?: React.ReactNode;
    isDisabled?: boolean;
    onPress?: () => void; // HeroUI compatibility
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
    children,
    className,
    variant = 'solid',
    color = 'default',
    size = 'md',
    fullWidth = false,
    isLoading = false,
    startContent,
    endContent,
    isDisabled = false,
    onPress,
    onClick,
    ...props
}, ref) => {

    const baseStyles = "relative inline-flex items-center justify-center rounded-xl font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden orbitron tracking-wider";

    const variants = {
        solid: {
            default: "bg-zinc-800 text-white hover:bg-zinc-700",
            primary: "bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]",
            secondary: "bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)]",
            success: "bg-green-500 text-black hover:bg-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]",
            warning: "bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]",
            danger: "bg-red-500 text-white hover:bg-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]",
        },
        ghost: {
            default: "border border-zinc-700 text-zinc-300 hover:bg-zinc-800",
            primary: "border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400",
            secondary: "border border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400",
            success: "border border-green-500/50 text-green-400 hover:bg-green-500/10",
            warning: "border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10",
            danger: "border border-red-500/50 text-red-400 hover:bg-red-500/10",
        },
        light: {
            default: "bg-transparent text-zinc-400 hover:text-white",
            primary: "bg-transparent text-cyan-400 hover:text-cyan-300",
            secondary: "bg-transparent text-purple-400 hover:text-purple-300",
            success: "bg-transparent text-green-400 hover:text-green-300",
            warning: "bg-transparent text-yellow-400 hover:text-yellow-300",
            danger: "bg-transparent text-red-400 hover:text-red-300",
        },
        flat: {
            default: "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800",
            primary: "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20",
            secondary: "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20",
            success: "bg-green-500/10 text-green-400 hover:bg-green-500/20",
            warning: "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20",
            danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20",
        },
        shadow: {
            default: "bg-zinc-800 text-white hover:bg-zinc-700 shadow-lg",
            primary: "bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]",
            secondary: "bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.4)]",
            success: "bg-green-500 text-black hover:bg-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)]",
            warning: "bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.4)]",
            danger: "bg-red-500 text-white hover:bg-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]",
        }
    };

    const sizes = {
        sm: "h-8 text-xs px-3",
        md: "h-10 text-sm px-4",
        lg: "h-12 text-base px-6",
    };

    // Safe lookup with fallback to solid
    const selectedVariant = variants[variant as keyof typeof variants] || variants.solid;
    const variantStyles = selectedVariant[color] || selectedVariant['default'];
    const sizeStyles = sizes[size];

    const { playSfx } = useSound(); // Use Sound Hook

    const handlePress = (e: React.MouseEvent<HTMLButtonElement> | any) => {
        if (!isDisabled && !isLoading) {
            playSfx('click');
            if (onClick) onClick(e);
            if (onPress) onPress();
        }
    };

    return (
        <motion.button
            ref={ref}
            whileTap={!isDisabled && !isLoading ? { scale: 0.97 } : undefined}
            className={cn(
                baseStyles,
                variantStyles,
                sizeStyles,
                fullWidth ? "w-full" : "",
                className
            )}
            disabled={isDisabled || isLoading}
            onClick={handlePress} // Use wrapper handler
            {...props}
        >
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-inherit">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                </div>
            )}
            <span className={cn("flex items-center gap-2", isLoading && "opacity-0")}>
                {startContent}
                {children}
                {endContent}
            </span>
        </motion.button>
    );
});

Button.displayName = "Button";
