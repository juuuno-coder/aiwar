import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string;
    name?: string;
    size?: 'sm' | 'md' | 'lg';
    isBordered?: boolean;
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
    fallback?: React.ReactNode;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(({
    src,
    name,
    size = 'md',
    isBordered = false,
    color = 'default',
    radius = 'full',
    fallback,
    className,
    ...props
}, ref) => {
    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-14 h-14 text-base",
    };

    const colorClasses = {
        default: "ring-zinc-500",
        primary: "ring-cyan-500",
        secondary: "ring-purple-600",
        success: "ring-green-500",
        warning: "ring-yellow-500",
        danger: "ring-red-500",
    };

    const radiusClasses = {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full",
    };

    return (
        <div
            ref={ref}
            className={cn(
                "relative inline-flex shrink-0 items-center justify-center bg-zinc-700 text-zinc-200 overflow-hidden align-middle",
                sizeClasses[size],
                radiusClasses[radius],
                isBordered && `ring-2 ring-offset-2 ring-offset-black ${colorClasses[color]}`,
                className
            )}
            {...props}
        >
            {src ? (
                <img
                    src={src}
                    alt={name || "avatar"}
                    className="w-full h-full object-cover"
                />
            ) : (
                <span className="font-semibold text-center">
                    {name ? name.charAt(0).toUpperCase() : (fallback || "?")}
                </span>
            )}
        </div>
    );
});

Avatar.displayName = "Avatar";
