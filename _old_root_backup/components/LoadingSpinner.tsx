'use client';

import { useState } from 'react';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    text?: string;
}

export default function LoadingSpinner({ size = 'medium', text }: LoadingSpinnerProps) {
    const sizeClasses = {
        small: 'w-8 h-8',
        medium: 'w-16 h-16',
        large: 'w-24 h-24',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className={`${sizeClasses[size]} relative`}>
                <div className="absolute inset-0 border-4 border-[var(--dark-card)] rounded-full"></div>
                <div
                    className="absolute inset-0 border-4 border-transparent border-t-[var(--primary-blue)] rounded-full animate-spin"
                    style={{ animation: 'spin 1s linear infinite' }}
                ></div>
            </div>
            {text && (
                <p className="text-[var(--text-secondary)] text-sm animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
}
