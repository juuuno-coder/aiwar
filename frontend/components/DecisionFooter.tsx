'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface DecisionFooterProps {
    isOpen: boolean;
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'default' | 'warning' | 'danger';
}

export default function DecisionFooter({
    isOpen,
    title,
    description,
    confirmText = '확인',
    cancelText = '취소',
    onConfirm,
    onCancel,
    variant = 'default',
}: DecisionFooterProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const variantStyles = {
        default: {
            border: 'border-purple-500/20',
            confirmBg: 'bg-gradient-to-r from-purple-600 to-blue-600',
            confirmHover: 'hover:from-purple-500 hover:to-blue-500',
        },
        warning: {
            border: 'border-amber-500/20',
            confirmBg: 'bg-gradient-to-r from-amber-600 to-orange-600',
            confirmHover: 'hover:from-amber-500 hover:to-orange-500',
        },
        danger: {
            border: 'border-red-500/20',
            confirmBg: 'bg-gradient-to-r from-red-600 to-pink-600',
            confirmHover: 'hover:from-red-500 hover:to-pink-500',
        },
    };

    const styles = variantStyles[variant];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Footer */}
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={`fixed bottom-0 left-0 right-0 z-[101] bg-slate-900/95 backdrop-blur-xl border-t ${styles.border}`}
                    >
                        <div className="container mx-auto px-6 py-8">
                            <div className="max-w-3xl mx-auto">
                                {/* Title */}
                                <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>

                                {/* Description */}
                                {description && (
                                    <p className="text-slate-400 mb-6">{description}</p>
                                )}

                                {/* Buttons */}
                                <div className="flex items-center justify-end gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onCancel}
                                        className="px-8 py-3 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
                                    >
                                        {cancelText}
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onConfirm}
                                        className={`px-8 py-3 rounded-xl ${styles.confirmBg} ${styles.confirmHover} text-white font-medium transition-all shadow-lg shadow-purple-500/20`}
                                    >
                                        {confirmText}
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
