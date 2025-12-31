'use client';

import { Modal, ModalBody, ModalHeader, ModalFooter } from './ui/custom/Modal';
import { Card as CardType } from '@/lib/types';
import GameCard from './GameCard';
import { Button } from './ui/custom/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, PackageCheck } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { useEscapeKey } from '@/hooks/useEscapeKey';

interface UnitReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    units: CardType[];
}

export default function UnitReceiptModal({ isOpen, onClose, units }: UnitReceiptModalProps) {
    useEscapeKey(isOpen, onClose);

    const { t, language } = useTranslation();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size={units.length >= 5 ? '2xl' : units.length > 3 ? 'xl' : 'lg'} // Force larger size for 5 cards
            className="bg-[#050505]/95 backdrop-blur-2xl border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] max-h-[95vh] w-[95vw] max-w-7xl" // Added explicit width overrides
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />

            <ModalHeader className="border-none pt-8 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                    <PackageCheck className="text-blue-400" size={32} />
                </div>
                <h2 className="text-3xl font-black text-white orbitron italic tracking-tighter text-center">
                    {language === 'ko' ? '신규 유닛 데이터 수령' : 'UNIT DATA ACQUIRED'}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                    <div className="w-10 h-0.5 bg-blue-500/30" />
                    <span className="text-[10px] text-blue-400 font-bold orbitron uppercase tracking-[0.3em]">
                        Total {units.length} Modules Synchronized
                    </span>
                    <div className="w-10 h-0.5 bg-blue-500/30" />
                </div>
            </ModalHeader>

            <ModalBody className="py-8">
                <div className={cn(
                    "grid gap-4 md:gap-8 items-center justify-center auto-rows-auto", // Increased gap
                    units.length === 1 ? "grid-cols-1 max-w-[280px] mx-auto" :
                        units.length <= 3 ? "grid-cols-2 md:grid-cols-3" :
                            "grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
                )}>
                    <AnimatePresence>
                        {units.map((unit, index) => (
                            <motion.div
                                key={unit.id}
                                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: index * 0.1, type: "spring", stiffness: 260, damping: 20 }}
                                className="flex justify-center"
                            >
                                <div className="scale-90 hover:scale-100 transition-transform duration-300">
                                    <GameCard card={unit} />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </ModalBody>

            <ModalFooter className="border-none pb-8 pt-4 justify-center">
                <Button
                    onPress={onClose}
                    size="lg"
                    className="h-14 px-16 bg-white text-black font-black orbitron rounded-2xl hover:bg-gray-200 transition-all shadow-[0_10px_40px_rgba(255,255,255,0.1)] group"
                    startContent={<Sparkles size={18} className="group-hover:animate-spin" />}
                >
                    {language === 'ko' ? '카드 받기' : 'RECEIVE CARDS'}
                </Button>
            </ModalFooter>
        </Modal>
    );
}
