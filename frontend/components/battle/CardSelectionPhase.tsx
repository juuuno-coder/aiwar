/**
 * 카드 선택 단계 컴포넌트
 * 
 * 플레이어와 상대방이 각각 5장의 카드를 선택하는 단계
 */

'use client';

import { useState } from 'react';
import { Card } from '@/lib/types';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/custom/Button';
import { cn } from '@/lib/utils';
import { Sparkles, Check } from 'lucide-react';

interface CardSelectionPhaseProps {
    availableCards: Card[];
    maxSelection: number;
    onComplete: (selectedCards: Card[]) => void;
    title?: string;
    description?: string;
}

export default function CardSelectionPhase({
    availableCards,
    maxSelection,
    onComplete,
    title = "카드 선택",
    description = "전투에 사용할 카드를 선택하세요"
}: CardSelectionPhaseProps) {
    const [selectedCards, setSelectedCards] = useState<Card[]>([]);

    const handleCardClick = (card: Card) => {
        if (selectedCards.find(c => c.id === card.id)) {
            // 이미 선택된 카드 -> 선택 해제
            setSelectedCards(selectedCards.filter(c => c.id !== card.id));
        } else if (selectedCards.length < maxSelection) {
            // 새로 선택
            setSelectedCards([...selectedCards, card]);
        }
    };

    const handleConfirm = () => {
        if (selectedCards.length === maxSelection) {
            onComplete(selectedCards);
        }
    };

    const isSelected = (card: Card) => selectedCards.some(c => c.id === card.id);
    const canConfirm = selectedCards.length === maxSelection;

    return (
        <div className="w-full h-full flex flex-col p-6">
            {/* 헤더 */}
            <div className="mb-6">
                <h2 className="text-3xl font-black text-white orbitron mb-2">{title}</h2>
                <p className="text-white/60">{description}</p>
                <div className="mt-4 flex items-center gap-4">
                    <div className="text-sm text-white/80">
                        선택: <span className="font-bold text-cyan-400">{selectedCards.length}</span> / {maxSelection}
                    </div>
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${(selectedCards.length / maxSelection) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* 카드 그리드 */}
            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {availableCards.map((card, index) => {
                        const selected = isSelected(card);
                        const selectionIndex = selectedCards.findIndex(c => c.id === card.id);

                        return (
                            <motion.div
                                key={card.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleCardClick(card)}
                                className={cn(
                                    "relative cursor-pointer transition-all",
                                    selected && "scale-95"
                                )}
                            >
                                {/* 카드 */}
                                <div
                                    className={cn(
                                        "relative aspect-[2/3] rounded-xl border-2 overflow-hidden transition-all",
                                        selected
                                            ? "border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                                            : "border-white/20 hover:border-white/40"
                                    )}
                                >
                                    {/* 카드 배경 */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />

                                    {/* 카드 정보 */}
                                    <div className="relative h-full p-3 flex flex-col">
                                        <div className="text-xs text-white/60 mb-1">{card.templateId}</div>
                                        <div className="text-sm font-bold text-white mb-2 line-clamp-2">
                                            {card.name || card.templateId}
                                        </div>
                                        <div className="mt-auto">
                                            <div className="text-xs text-white/60 mb-1">전투력</div>
                                            <div className="text-lg font-black text-cyan-400">
                                                {card.stats?.totalPower || 0}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 선택 표시 */}
                                    {selected && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute top-2 right-2 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg"
                                        >
                                            <Check size={20} className="text-white" />
                                        </motion.div>
                                    )}

                                    {/* 선택 순서 */}
                                    {selected && (
                                        <div className="absolute bottom-2 left-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                            <span className="text-xs font-black text-gray-900">{selectionIndex + 1}</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* 확인 버튼 */}
            <div className="mt-6">
                <Button
                    color="primary"
                    size="lg"
                    className="w-full h-14 text-lg font-black orbitron"
                    onPress={handleConfirm}
                    isDisabled={!canConfirm}
                >
                    <Sparkles className="mr-2" />
                    선택 완료
                </Button>
            </div>
        </div>
    );
}
