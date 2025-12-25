/**
 * 1장 전투 컴포넌트
 * 
 * 5장 중 1장을 선택하여 단판 승부
 */

'use client';

import { useState } from 'react';
import { Card } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/custom/Button';
import { cn } from '@/lib/utils';
import { Swords, Zap } from 'lucide-react';
import { judgeBattle, getVerdictReasonText } from '@/lib/battle-logic';
import { BattleJudgment } from '@/lib/battle-types';

interface SingleCardBattleProps {
    playerCards: Card[];
    opponentCards: Card[];
    onComplete: (result: BattleResult) => void;
}

interface BattleResult {
    winner: 'player' | 'opponent' | 'draw';
    playerCard: Card;
    opponentCard: Card;
    judgment: BattleJudgment;
}

export default function SingleCardBattle({
    playerCards,
    opponentCards,
    onComplete
}: SingleCardBattleProps) {
    const [phase, setPhase] = useState<'selection' | 'opponent-thinking' | 'battle' | 'result'>('selection');
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const [opponentCard, setOpponentCard] = useState<Card | null>(null);
    const [result, setResult] = useState<BattleResult | null>(null);

    const handleCardSelect = (card: Card) => {
        setSelectedCard(card);
    };

    const handleConfirm = () => {
        if (!selectedCard) return;

        // 상대방 카드 선택 (AI)
        setPhase('opponent-thinking');

        setTimeout(() => {
            const randomOpponentCard = opponentCards[Math.floor(Math.random() * opponentCards.length)];
            setOpponentCard(randomOpponentCard);

            // 전투 시작
            setPhase('battle');

            setTimeout(() => {
                // 전투 판정
                const judgment = judgeBattle(selectedCard, randomOpponentCard);
                const battleResult: BattleResult = {
                    winner: judgment.finalVerdict,
                    playerCard: selectedCard,
                    opponentCard: randomOpponentCard,
                    judgment
                };

                setResult(battleResult);
                setPhase('result');
            }, 2000);
        }, 1500);
    };

    const handleComplete = () => {
        if (result) {
            onComplete(result);
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6">
            <AnimatePresence mode="wait">
                {phase === 'selection' && (
                    <SelectionPhase
                        key="selection"
                        cards={playerCards}
                        selectedCard={selectedCard}
                        onSelect={handleCardSelect}
                        onConfirm={handleConfirm}
                    />
                )}

                {phase === 'opponent-thinking' && (
                    <ThinkingPhase key="thinking" />
                )}

                {phase === 'battle' && selectedCard && opponentCard && (
                    <BattlePhase
                        key="battle"
                        playerCard={selectedCard}
                        opponentCard={opponentCard}
                    />
                )}

                {phase === 'result' && result && (
                    <ResultPhase
                        key="result"
                        result={result}
                        onComplete={handleComplete}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// 카드 선택 단계
function SelectionPhase({
    cards,
    selectedCard,
    onSelect,
    onConfirm
}: {
    cards: Card[];
    selectedCard: Card | null;
    onSelect: (card: Card) => void;
    onConfirm: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-6xl"
        >
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-white orbitron mb-2">출전 카드 선택</h2>
                <p className="text-white/60">5장 중 1장을 선택하세요</p>
            </div>

            <div className="grid grid-cols-5 gap-4 mb-8">
                {cards.map((card, index) => {
                    const isSelected = selectedCard?.id === card.id;

                    return (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => onSelect(card)}
                            className={cn(
                                "cursor-pointer transition-all",
                                isSelected && "scale-105"
                            )}
                        >
                            <div
                                className={cn(
                                    "aspect-[2/3] rounded-xl border-2 overflow-hidden transition-all",
                                    isSelected
                                        ? "border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.6)]"
                                        : "border-white/20 hover:border-white/40"
                                )}
                            >
                                <div className="h-full bg-gradient-to-br from-gray-900 to-gray-800 p-4 flex flex-col">
                                    <div className="text-xs text-white/60 mb-2">{card.templateId}</div>
                                    <div className="text-sm font-bold text-white mb-2 line-clamp-2">
                                        {card.name || card.templateId}
                                    </div>
                                    <div className="mt-auto space-y-2">
                                        <div>
                                            <div className="text-xs text-white/60">타입</div>
                                            <div className="text-sm font-bold text-white">{card.type || 'N/A'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-white/60">전투력</div>
                                            <div className="text-xl font-black text-cyan-400">
                                                {card.stats?.totalPower || 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <Button
                color="primary"
                size="lg"
                className="w-full max-w-md mx-auto h-14 text-lg font-black orbitron"
                onPress={onConfirm}
                isDisabled={!selectedCard}
            >
                <Swords className="mr-2" />
                전투 시작
            </Button>
        </motion.div>
    );
}

// 상대방 선택 중
function ThinkingPhase() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
        >
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <h3 className="text-2xl font-black text-white orbitron">상대방 선택 중...</h3>
        </motion.div>
    );
}

// 전투 진행
function BattlePhase({ playerCard, opponentCard }: { playerCard: Card; opponentCard: Card }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-4xl"
        >
            <div className="text-center mb-8">
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                >
                    <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-3xl font-black text-white orbitron">전투 중...</h2>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <BattleCard card={playerCard} label="내 카드" color="cyan" />
                <BattleCard card={opponentCard} label="상대 카드" color="red" />
            </div>
        </motion.div>
    );
}

// 전투 카드 표시
function BattleCard({ card, label, color }: { card: Card; label: string; color: 'cyan' | 'red' }) {
    return (
        <div>
            <div className="text-sm text-white/60 mb-3">{label}</div>
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                    "aspect-[2/3] rounded-xl border-2 overflow-hidden",
                    color === 'cyan' ? "border-cyan-500" : "border-red-500"
                )}
            >
                <div className={cn(
                    "h-full p-6 flex flex-col",
                    color === 'cyan' ? "bg-gradient-to-br from-cyan-900/40 to-blue-900/40" : "bg-gradient-to-br from-red-900/40 to-orange-900/40"
                )}>
                    <div className="text-xs text-white/60 mb-2">{card.templateId}</div>
                    <div className="text-lg font-bold text-white mb-4">
                        {card.name || card.templateId}
                    </div>
                    <div className="mt-auto space-y-3">
                        <div>
                            <div className="text-xs text-white/60">타입</div>
                            <div className="text-xl font-bold text-white">{card.type || 'N/A'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-white/60">전투력</div>
                            <div className={cn(
                                "text-3xl font-black",
                                color === 'cyan' ? "text-cyan-400" : "text-red-400"
                            )}>
                                {card.stats?.totalPower || 0}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// 결과 표시
function ResultPhase({ result, onComplete }: { result: BattleResult; onComplete: () => void }) {
    const isWin = result.winner === 'player';
    const isDraw = result.winner === 'draw';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-4xl"
        >
            {/* 결과 헤더 */}
            <div className="text-center mb-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className={cn(
                        "text-6xl font-black orbitron mb-4",
                        isWin ? "text-cyan-400" : isDraw ? "text-yellow-400" : "text-red-400"
                    )}
                >
                    {isWin ? "승리!" : isDraw ? "무승부" : "패배"}
                </motion.div>
                <p className="text-white/60">
                    {getVerdictReasonText(result.judgment.verdictReason)}로 결정
                </p>
            </div>

            {/* 카드 비교 */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <BattleCard card={result.playerCard} label="내 카드" color="cyan" />
                <BattleCard card={result.opponentCard} label="상대 카드" color="red" />
            </div>

            {/* 계속 버튼 */}
            <Button
                color={isWin ? "success" : "primary"}
                size="lg"
                className="w-full max-w-md mx-auto h-14 text-lg font-black orbitron"
                onPress={onComplete}
            >
                계속하기
            </Button>
        </motion.div>
    );
}
