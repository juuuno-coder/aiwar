'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, AlertCircle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createTicket } from '@/lib/firebase-db';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAlert } from '@/context/AlertContext';

interface SupportFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'error' | 'idea';
    title: string;
}

export default function SupportFormModal({ isOpen, onClose, type, title }: SupportFormModalProps) {
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { profile } = useUserProfile();
    const { showAlert } = useAlert();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !description.trim()) return;

        setIsSubmitting(true);
        try {
            await createTicket({
                type,
                title: subject,
                description,
                userNickname: profile?.nickname || 'Unknown User'
            });

            showAlert({
                title: '접수 완료',
                message: '소중한 의견이 전달되었습니다. 감사합니다!',
                type: 'success'
            });

            setSubject('');
            setDescription('');
            onClose();
        } catch (error) {
            console.error('Failed to submit ticket:', error);
            showAlert({
                title: '접수 실패',
                message: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
                type: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={cn(
                            "relative w-full max-w-lg bg-[#0a0a1a] rounded-2xl border shadow-2xl overflow-hidden",
                            type === 'error' ? "border-red-500/30" : "border-yellow-500/30"
                        )}
                    >
                        {/* Header */}
                        <div className={cn(
                            "px-6 py-4 flex items-center justify-between border-b bg-opacity-20",
                            type === 'error' ? "bg-red-900/20 border-red-500/20" : "bg-yellow-900/20 border-yellow-500/20"
                        )}>
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center border",
                                    type === 'error' ? "bg-red-500/10 border-red-500/30 text-red-500" : "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
                                )}>
                                    {type === 'error' ? <AlertCircle size={20} /> : <Lightbulb size={20} />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{title}</h3>
                                    <p className="text-xs text-white/50">
                                        {type === 'error'
                                            ? '발견하신 오류를 상세히 적어주세요.'
                                            : '여러분의 반짝이는 아이디어를 기다립니다.'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-white/70">제목</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder={type === 'error' ? "어떤 오류인가요?" : "어떤 기능인가요?"}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-white/70">내용</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={type === 'error'
                                        ? "오류가 발생한 상황과 재현 방법을 자세히 알려주세요."
                                        : "아이디어에 대한 상세한 설명을 적어주세요."}
                                    className="w-full h-40 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors resize-none"
                                    required
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors text-sm font-bold"
                                    disabled={isSubmitting}
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !subject.trim() || !description.trim()}
                                    className={cn(
                                        "px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-lg",
                                        type === 'error'
                                            ? "bg-red-600 hover:bg-red-500 text-white shadow-red-600/20"
                                            : "bg-yellow-600 hover:bg-yellow-500 text-white shadow-yellow-600/20",
                                        "disabled:opacity-50 disabled:cursor-not-allowed"
                                    )}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            전송 중...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            보내기
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
