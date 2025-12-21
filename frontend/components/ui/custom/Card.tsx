import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    isPressable?: boolean;
    isDisabled?: boolean;
    onPress?: () => void; // HeroUI compatibility
    fullWidth?: boolean; // Added for HeroUI compatibility
    variant?: 'default' | 'gradient' | 'glow';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
    children,
    className,
    isPressable,
    isDisabled,
    onPress,
    onClick,
    fullWidth,
    variant = 'default',
    ...props
}, ref) => {
    const variantStyles = {
        default: "bg-black/40 border-white/10",
        gradient: "bg-gradient-to-br from-white/10 to-transparent border-white/10 shadow-2xl",
        glow: "bg-purple-900/10 border-purple-500/20 shadow-[0_0_20px_rgba(112,0,255,0.05)]",
    };

    return (
        <div
            ref={ref}
            className={cn(
                "relative flex flex-col overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300",
                variantStyles[variant],
                isPressable && !isDisabled && "cursor-pointer hover:border-white/20 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] active:scale-[0.99]",
                isDisabled && "opacity-50 cursor-not-allowed",
                className
            )}
            onClick={!isDisabled && isPressable ? (onClick || onPress) : undefined}
            {...props}
        >
            {children}
        </div>
    );
});
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6 pb-2", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-2 pb-2 flex-grow", className)} {...props} />
));
CardBody.displayName = "CardBody";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-2", className)} {...props} />
));
CardFooter.displayName = "CardFooter";
