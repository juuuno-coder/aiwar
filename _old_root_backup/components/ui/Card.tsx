import React from 'react';

interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'gradient' | 'glow';
    className?: string;
    onClick?: () => void;
    hover?: boolean;
}

export default function Card({
    children,
    variant = 'default',
    className = '',
    onClick,
    hover = true
}: CardProps) {
    const baseStyles = 'rounded-xl p-6 transition-all duration-300';

    const variants = {
        default: 'bg-gray-800/50 border-2 border-gray-700',
        gradient: 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-2 border-purple-500/30',
        glow: 'bg-gray-800/50 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20',
    };

    const hoverStyles = hover ? 'hover:scale-105 hover:border-purple-500/50 cursor-pointer' : '';

    return (
        <div
            className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
