// 히든 카드 선택 컴포넌트

'use client';

import { Card } from '@/lib/types';
import GameCard from './GameCard';
import CyberButton from './CyberButton';
import { useState } from 'react';
import TypeBadge from './TypeBadge';

interface HiddenCardSelectorProps {
    availableCards: Card[];
    mainCard: Card;
    onSelect: (card: Card | null) => void;
    onClose: () => void;
}

export default function HiddenCardSelector({
    availableCards,
    mainCard,
    onSelect,
    onClose
}: HiddenCardSelectorProps) {
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);

    const handleConfirm = () => {
        onSelect(selectedCard);
        onClose();
    };

    const handleSkip = () => {
        onSelect(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] animate-fade-in p-4 backdrop-blur-md">
            <div className="bg-gray-900 border-2 border-purple-500/50 rounded-2xl p-6 md:p-10 max-w-7xl w-full mx-auto animate-slide-up shadow-[0_0_50px_rgba(168,85,247,0.3)] flex flex-col max-h-[95vh]">
                {/* 헤더 */}
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-black text-gradient uppercase tracking-tighter mb-2">
                        ⚡ 히든 카드 선택 (HIDDEN CARD)
                    </h2>
                    <p className="text-gray-400 font-bold">
                        전술 우위를 점하기 위한 히든 카드를 선택하세요.
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* 좌측: 메인 카드 및 선택 정보 */}
                        <div className="lg:col-span-4 flex flex-col items-center justify-center border-r border-white/5 pr-0 lg:pr-10">
                            <div className="mb-6 text-center">
                                <h3 className="text-sm font-black text-purple-400 mb-4 uppercase tracking-[0.3em]">현재 메인 카드</h3>
                                <div className="transform scale-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                    <GameCard card={mainCard} />
                                </div>
                            </div>

                            {selectedCard && (
                                <div className="w-full mt-6 p-6 bg-green-500/10 rounded-xl border border-green-500/30 animate-pulse">
                                    <div className="text-[10px] text-green-400 font-black mb-3 uppercase tracking-widest">선택된 전략 자산</div>
                                    <div className="flex items-center justify-between">
                                        <TypeBadge type={selectedCard.type} size="md" />
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-white">{selectedCard.stats.totalPower}</div>
                                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter text-gradient">COMBAT POWER</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 우측: 사용 가능한 카드 목록 */}
                        <div className="lg:col-span-8">
                            <h3 className="text-sm font-black text-blue-400 mb-6 uppercase tracking-[0.3em]">
                                가용 히든 카드 목록 ({availableCards.length})
                            </h3>

                            {availableCards.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-black/20 rounded-2xl border border-dashed border-white/10">
                                    <span className="text-4xl mb-4">📭</span>
                                    <div className="text-gray-500 font-bold text-lg">사용 가능한 카드가 없습니다</div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5 gap-4">
                                    {availableCards.map((card) => (
                                        <div
                                            key={card.id}
                                            className={`cursor-pointer transition-all duration-300 transform active:scale-95 ${selectedCard?.id === card.id
                                                ? 'ring-4 ring-green-500 scale-105 z-10 shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                                                : 'hover:scale-105 opacity-80 hover:opacity-100'
                                                }`}
                                            onClick={() => setSelectedCard(card)}
                                        >
                                            <GameCard card={card} isSelected={selectedCard?.id === card.id} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 하단 버튼 제어 */}
                <div className="mt-8 pt-8 border-t border-white/5 flex gap-6 justify-center">
                    <CyberButton
                        variant="outline"
                        size="lg"
                        onClick={handleSkip}
                        className="w-48"
                    >
                        선택 안 함
                    </CyberButton>
                    <CyberButton
                        variant="primary"
                        size="lg"
                        onClick={handleConfirm}
                        disabled={!selectedCard}
                        className="w-64"
                    >
                        {selectedCard ? '전투 투입 확정' : '카드를 선택하세요'}
                    </CyberButton>
                </div>
            </div>
        </div>
    );
}
