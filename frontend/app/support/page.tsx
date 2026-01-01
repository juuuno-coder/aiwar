'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { Bug, Lightbulb, Coffee, ArrowRight, Github, Mail, MessageSquare } from 'lucide-react';
import CyberPageLayout from '@/components/CyberPageLayout';
import { cn } from '@/lib/utils';
import SupportFormModal from '@/components/SupportFormModal';
import { Input } from '@/components/ui/custom/Input';
import { Textarea } from '@/components/ui/custom/Textarea';

export default function SupportPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'error' | 'idea'>('error');
    const [modalTitle, setModalTitle] = useState('');
    const [modalData, setModalData] = useState<{ type: 'report' | 'idea', title: string } | null>(null);
    const { t } = useTranslation();

    const openModal = (type: 'error' | 'idea', title: string) => {
        setModalType(type);
        setModalTitle(title);
        setIsModalOpen(true);
    };

    // New state for the inline modal form
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenModal = (type: 'report' | 'idea', title: string) => {
        setModalData({ type, title });
        setSubject('');
        setContent('');
    };

    const handleCloseModal = () => {
        setModalData(null);
        setIsSubmitting(false);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Submitting:', { type: modalData?.type, subject, content });
        handleCloseModal();
        alert('Your feedback has been submitted!'); // Or a more sophisticated notification
    };

    const menuItems = [
        {
            id: 'report',
            title: t('support.menu.report.title'),
            desc: t('support.menu.report.desc'),
            icon: '🚨',
            actionIndex: t('support.menu.report.action'),
            type: 'modal' as const,
            onClick: () => handleOpenModal('report', t('support.menu.report.title')),
            borderColor: "border-red-500/50",
            glowColor: "shadow-red-500/20",
            bgGradient: "from-red-900/10 to-transparent",
            textColor: "text-red-400"
        },
        {
            id: 'idea',
            title: t('support.menu.idea.title'),
            desc: t('support.menu.idea.desc'),
            icon: '💡',
            actionIndex: t('support.menu.idea.action'),
            type: 'modal' as const,
            onClick: () => handleOpenModal('idea', t('support.menu.idea.title')),
            borderColor: "border-yellow-500/50",
            glowColor: "shadow-yellow-500/20",
            bgGradient: "from-yellow-900/10 to-transparent",
            textColor: "text-yellow-400"
        },
        {
            id: 'donate',
            title: t('support.menu.donate.title'),
            desc: t('support.menu.donate.desc'),
            icon: '☕',
            actionIndex: t('support.menu.donate.action'),
            type: 'link' as const,
            url: 'https://buymeacoffee.com/juuunocorder',
            onClick: () => window.open('https://buymeacoffee.com/juuunocorder', '_blank'),
            borderColor: "border-pink-500/50",
            glowColor: "shadow-pink-500/20",
            bgGradient: "from-pink-900/10 to-transparent",
            textColor: "text-pink-400"
        }
    ];

    // The original supportOptions array is partially replaced/modified in the instruction.
    // I'm interpreting the instruction to mean the `menuItems` should be used for the cards,
    // and the `supportOptions` array should be removed or fully replaced by `menuItems`.
    // Given the instruction's partial replacement, I'll use `menuItems` for the card rendering.
    const supportOptions = menuItems; // Aligning with the spirit of the change

    return (
        <CyberPageLayout
            title={t('support.title')}
            englishTitle={t('support.englishTitle')}
            subtitle={t('support.subtitle')}
            description={t('support.description')}
            color="blue"
        >
            <div className="max-w-4xl mx-auto pb-20">
                {/* 상단 안내 */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Bug className="w-32 h-32 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4 relative z-10">{t('support.intro.title')}</h2>
                    <p className="text-gray-400 whitespace-pre-wrap relative z-10">
                        {t('support.intro.desc')}
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {supportOptions.map((option, index) => (
                        <motion.div
                            key={index}
                            onClick={option.onClick} // Use the onClick from menuItems
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + (index * 0.1) }}
                            className={cn(
                                "group relative p-8 rounded-2xl border bg-black/40 backdrop-blur-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col items-center text-center cursor-pointer",
                                option.borderColor,
                                option.glowColor
                            )}
                        >
                            {/* Background Gradient */}
                            <div className={cn("absolute inset-0 bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-opacity duration-500", option.bgGradient)} />

                            {/* Icon */}
                            <div className={cn(
                                "w-16 h-16 rounded-full flex items-center justify-center mb-6 relative z-10 transition-transform duration-300 group-hover:scale-110 border bg-black/50 shadow-lg",
                                option.borderColor,
                                option.textColor
                            )}>
                                {option.icon === '🚨' && <Bug size={32} />}
                                {option.icon === '💡' && <Lightbulb size={32} />}
                                {option.icon === '☕' && <Coffee size={32} />}
                            </div>

                            {/* Text */}
                            <h3 className={cn("text-xl font-bold mb-3 font-orbitron", option.textColor)}>
                                {option.title}
                            </h3>
                            <p className="text-white/60 text-sm mb-8 leading-relaxed relative z-10 min-h-[40px]">
                                {option.desc} {/* Use desc from menuItems */}
                            </p>

                            {/* Action Button */}
                            <div className="mt-auto relative z-10">
                                <div className={cn(
                                    "flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all border",
                                    option.textColor,
                                    option.borderColor,
                                    "group-hover:bg-white/10"
                                )}>
                                    {option.actionIndex} {/* Use actionIndex from menuItems */}
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Additional Channels */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="border-t border-white/10 pt-10 mt-10"
                >
                    <div className="flex flex-wrap justify-center gap-8 opacity-60 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2 text-white/50 hover:text-white transition-colors cursor-pointer">
                            <Mail size={16} />
                            <span>support@aiwar.com</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/50 hover:text-white transition-colors cursor-pointer">
                            <Github size={16} />
                            <span>GitHub Community</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/50 hover:text-white transition-colors cursor-pointer">
                            <MessageSquare size={16} />
                            <span>Discord Server</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* New inline modal structure */}
            {modalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-gray-900 border border-blue-500/30 rounded-lg p-6 max-w-lg w-full shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                        <h3 className="text-xl font-bold text-white mb-2">
                            {modalData.type === 'report' ? t('support.modal.report.title') : t('support.modal.idea.title')}
                        </h3>
                        <p className="text-sm text-gray-400 mb-6">
                            {modalData.type === 'report'
                                ? t('support.modal.report.desc')
                                : t('support.modal.idea.desc')}
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-blue-400 mb-1">{t('support.modal.label.subject')}</label>
                                <Input
                                    value={subject}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
                                    placeholder={modalData.type === 'report' ? t('support.modal.report.placeholder.subject') : t('support.modal.idea.placeholder.subject')}
                                    className="bg-black/50 border-blue-500/30"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-blue-400 mb-1">{t('support.modal.label.desc')}</label>
                                <Textarea
                                    value={content}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                                    placeholder={modalData.type === 'report'
                                        ? t('support.modal.report.placeholder.desc')
                                        : t('support.modal.idea.placeholder.desc')}
                                    className="bg-black/50 border-blue-500/30 h-32 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                {t('support.modal.button.cancel')}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded flex items-center gap-2"
                            >
                                {isSubmitting ? 'Sending...' : t('support.modal.button.submit')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* The original SupportFormModal is still present in the instruction's output,
                but the new inline modal seems to replace its functionality.
                I will keep it as per the instruction, assuming it might be used elsewhere or
                the instruction implies a partial transition. */}
            <SupportFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                type={modalType}
                title={modalTitle}
            />
        </CyberPageLayout>
    );
}
