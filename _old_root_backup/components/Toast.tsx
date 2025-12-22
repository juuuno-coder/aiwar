'use client';

import { useEffect } from 'react';

export interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
    onClose: () => void;
}

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-[var(--accent-green)] border-green-400';
            case 'error':
                return 'bg-[var(--accent-red)] border-red-400';
            case 'warning':
                return 'bg-yellow-600 border-yellow-400';
            default:
                return 'bg-[var(--primary-blue)] border-blue-400';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            default:
                return 'ℹ';
        }
    };

    return (
        <div
            className={`fixed top-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-lg border-2 shadow-lg animate-slide-in ${getTypeStyles()}`}
            style={{
                animation: 'slideIn 0.3s ease-out',
            }}
        >
            <span className="text-2xl">{getIcon()}</span>
            <p className="text-white font-semibold">{message}</p>
            <button
                onClick={onClose}
                className="ml-4 text-white hover:opacity-75 transition-opacity"
            >
                ✕
            </button>
        </div>
    );
}
