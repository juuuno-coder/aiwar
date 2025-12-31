'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bug, Lightbulb, Coffee, ArrowRight, Github, Mail, MessageSquare } from 'lucide-react';
import CyberPageLayout from '@/components/CyberPageLayout';
import { cn } from '@/lib/utils';
import SupportFormModal from '@/components/SupportFormModal';

export default function SupportPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'error' | 'idea'>('error');
    const [modalTitle, setModalTitle] = useState('');

    const openModal = (type: 'error' | 'idea', title: string) => {
        setModalType(type);
        setModalTitle(title);
        setIsModalOpen(true);
    };

    const supportOptions = [
        {
            title: "오류 제보하기",
            description: "게임 이용 중 버그나 오류를 발견하셨나요? 상세한 내용을 제보해주시면 빠르게 수정하겠습니다.",
            icon: <Bug size={32} />,
            color: "red",
            actionText: "Report Bug",
            onClick: () => openModal('error', '오류 제보하기'),
            borderColor: "border-red-500/50",
            glowColor: "shadow-red-500/20",
            bgGradient: "from-red-900/10 to-transparent",
            textColor: "text-red-400"
        },
        {
            title: "아이디어 제안하기",
            description: "더 재미있는 게임을 위한 아이디어가 있으신가요? 여러분의 소중한 의견을 들려주세요.",
            icon: <Lightbulb size={32} />,
            color: "yellow",
            actionText: "Share Idea",
            onClick: () => openModal('idea', '아이디어 제안하기'),
            borderColor: "border-yellow-500/50",
            glowColor: "shadow-yellow-500/20",
            bgGradient: "from-yellow-900/10 to-transparent",
            textColor: "text-yellow-400"
        },
        {
            title: "개발자 후원하기",
            description: "인디 게임 개발자에게 커피 한 잔은 큰 힘이 됩니다. 후원해주시는 모든 분들께 감사드립니다.",
            icon: <Coffee size={32} />,
            color: "pink",
            actionText: "Buy Me a Coffee",
            href: "https://buymeacoffee.com",
            borderColor: "border-pink-500/50",
            glowColor: "shadow-pink-500/20",
            bgGradient: "from-pink-900/10 to-transparent",
            textColor: "text-pink-400"
        }
    ];

    return (
        <CyberPageLayout
            title="SUPPORT CENTER"
            englishTitle="USER FEEDBACK & DONATION"
            subtitle="COMMUNITY"
            description="더 나은 게임 환경을 위해 여러분의 목소리를 듣습니다. 오류 제보, 기능 제안, 그리고 따뜻한 후원은 개발에 큰 힘이 됩니다."
            color="cyan"
        >
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Intro Section */}
                <div className="text-center space-y-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-2xl font-bold text-white mb-2">Build the Future Together</h2>
                        <p className="text-white/60 max-w-2xl mx-auto">
                            AI WAR는 플레이어 여러분과 함께 만들어가는 게임입니다.<br />
                            여러분의 참여가 게임을 진화시킵니다.
                        </p>
                    </motion.div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {supportOptions.map((option, index) => (
                        <motion.div
                            key={index}
                            onClick={option.onClick ? option.onClick : () => window.open(option.href, '_blank')}
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
                                {option.icon}
                            </div>

                            {/* Text */}
                            <h3 className={cn("text-xl font-bold mb-3 font-orbitron", option.textColor)}>
                                {option.title}
                            </h3>
                            <p className="text-white/60 text-sm mb-8 leading-relaxed relative z-10 min-h-[40px]">
                                {option.description}
                            </p>

                            {/* Action Button */}
                            <div className="mt-auto relative z-10">
                                <div className={cn(
                                    "flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all border",
                                    option.textColor,
                                    option.borderColor,
                                    "group-hover:bg-white/10"
                                )}>
                                    {option.actionText}
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

            <SupportFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                type={modalType}
                title={modalTitle}
            />
        </CyberPageLayout>
    );
}
