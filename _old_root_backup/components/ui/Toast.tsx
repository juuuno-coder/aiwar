'use client';

import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose: () => void;
}

export default function Toast({
    message,
    type = 'info',
    duration = 3000,
    onClose,
}: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const types = {
        success: {
            bg: 'from-green-600 to-teal-600',
            icon: '✓',
            border: 'border-green-500',
        },
        error: {
            bg: 'from-red-600 to-orange-600',
            icon: '✕',
            border: 'border-red-500',
        },
        info: {
            bg: 'from-blue-600 to-cyan-600',
            icon: 'ℹ',
            border: 'border-blue-500',
        },
        warning: {
            bg: 'from-yellow-600 to-orange-600',
            icon: '⚠',
            border: 'border-yellow-500',
        },
    };

    const config = types[type];

    return (
        <div
            className={`fixed top-24 right-6 z-50 transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                }`}
        >
            <div className={`bg-gradient-to-r ${config.bg} rounded-xl p-4 shadow-2xl border-2 ${config.border} min-w-[300px] max-w-md`}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
                        {config.icon}
                    </div>
                    <p className="text-white font-medium flex-1">{message}</p>
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            setTimeout(onClose, 300);
                        }}
                        className="text-white/70 hover:text-white transition-colors"
                    >
                        ×
                    </button>
                </div>
            </div>
        </div>
    );
}

// Toast Manager Hook
export function useToast() {
    const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: ToastType }>>([]);

    const showToast = (message: string, type: ToastType = 'info') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
    };

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    const ToastContainer = () => (
        <>
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </>
    );

    return { showToast, ToastContainer };
}
