/**
 * 1장 전투 모드 페이지
 * 
 * 단판 승부 전투 모드
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/lib/types';
import { BattlePhase } from '@/lib/battle-types';
import CyberPageLayout from '@/components/CyberPageLayout';
import CardSelectionPhase from '@/components/battle/CardSelectionPhase';
import RevealPhase from '@/components/battle/RevealPhase';
import SingleCardBattle from '@/components/battle/SingleCardBattle';
import { gameStorage } from '@/lib/game-storage';
import { useUser } from '@/context/UserContext';
import { useAlert } from '@/context/AlertContext';
import { calculateBattleRewards } from '@/lib/battle-logic';
import { motion } from 'framer-motion';
import { Trophy, Coins, Star } from 'lucide-react';
import { Button } from '@/components/ui/custom/Button';

export default function OneCardBattlePage() {
    const router = useRouter();
    const { addCoins, addExperience } = useUser();
    const { showAlert } = useAlert();

    const [phase, setPhase] = useState<BattlePhase>('card-selection');
    const [playerCards, setPlayerCards] = useState<Card[]>([]);
    const [opponentCards, setOpponentCards] = useState<Card[]>([]);
    const [availableCards, setAvailableCards] = useState<Card[]>([]);
    const [battleResult, setBattleResult] = useState<any>(null);
    const [rewards, setRewards] = useState<any>(null);

    useEffect(() => {
        loadCards();
    }, []);

    const loadCards = async () => {
        try {
            const state = await gameStorage.loadGameState();
            const cards = state.inventory || [];

            if (cards.length < 1) {
                showAlert({
                    title: '카드 부족',
                    message: '최소 1장의 카드가 필요합니다.',
                    type: 'error'
                });
                router.push('/main');
                return;
            }

            setAvailableCards(cards);

            // AI 상대 카드 생성 (임시)
            const aiCards = cards.slice(0, 1).map(card => ({
                ...card,
                id: `ai-${card.id}`
            }));
            setOpponentCards(aiCards);
        } catch (error) {
            console.error('Failed to load cards:', error);
            showAlert({
                title: '오류',
                message: '카드를 불러오는데 실패했습니다.',
                type: 'error'
            });
        }
    };

    const handleCardSelection = (selectedCards: Card[]) => {
        setPlayerCards(selectedCards);
        setPhase('card-reveal');
    };

    const handleRevealComplete = () => {
        setPhase('battle');
    };

    const handleBattleComplete = async (result: any) => {
        setBattleResult(result);

        // 보상 계산 (비동기 처리)
        const battleRewards = await calculateBattleRewards(
            '1-card',
            result.winner,
            playerCards[0]?.rarity || 'common',
            'normal',
            false
        );

        setRewards(battleRewards);

        // 보상 지급
        if (result.winner === 'player') {
            await addCoins(battleRewards.coins);
            await addExperience(battleRewards.experience);
        }

        setPhase('result');
    };

    const handleRestart = () => {
        setPhase('card-selection');
        setPlayerCards([]);
        setBattleResult(null);
        setRewards(null);
        loadCards();
    };

    const handleExit = () => {
        router.push('/battle');
    };

    return (
        <CyberPageLayout
            title="1장 전투"
            englishTitle="SINGLE CARD BATTLE"
            description="단판 승부로 승부를 가립니다"
            color="red"
            backPath="/battle"
        >
            <div className="relative w-full h-[calc(100vh-200px)] min-h-[600px]">
                {phase === 'card-selection' && (
                    <CardSelectionPhase
                        availableCards={availableCards}
                        maxSelection={1}
                        onComplete={handleCardSelection}
                        title="전투 카드 선택"
                        description="전투에 사용할 1장의 카드를 선택하세요"
                    />
                )}

                {phase === 'card-reveal' && (
                    <RevealPhase
                        playerCards={playerCards}
                        opponentCards={opponentCards}
                        revealDuration={15}
                        onComplete={handleRevealComplete}
                    />
                )}

                {phase === 'battle' && (
                    <SingleCardBattle
                        playerCards={playerCards}
                        opponentCards={opponentCards}
                        onComplete={handleBattleComplete}
                    />
                )}

                {phase === 'result' && battleResult && rewards && (
                    <ResultScreen
                        result={battleResult}
                        rewards={rewards}
                        onRestart={handleRestart}
                        onExit={handleExit}
                    />
                )}
            </div>
        </CyberPageLayout>
    );
}

// 결과 화면
function ResultScreen({
    result,
    rewards,
    onRestart,
    onExit
}: {
    result: any;
    rewards: any;
    onRestart: () => void;
    onExit: () => void;
}) {
    const isWin = result.winner === 'player';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full flex flex-col items-center justify-center p-6"
        >
            {/* 승리/패배 표시 */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="mb-8"
            >
                <div className="text-center">
                    <Trophy className={`w-24 h-24 mx-auto mb-4 ${isWin ? 'text-yellow-400' : 'text-gray-500'}`} />
                    <h2 className={`text-5xl font-black orbitron mb-2 ${isWin ? 'text-cyan-400' : 'text-red-400'}`}>
                        {isWin ? '승리!' : '패배'}
                    </h2>
                    <p className="text-white/60">
                        {result.judgment.verdictReason === 'type' && '타입 상성으로 결정'}
                        {result.judgment.verdictReason === 'detail' && '세부 전투력으로 결정'}
                        {result.judgment.verdictReason === 'total' && '총 전투력으로 결정'}
                    </p>
                </div>
            </motion.div>

            {/* 보상 */}
            {isWin && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="w-full max-w-md mb-8"
                >
                    <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                        <h3 className="text-xl font-black text-white orbitron mb-4 flex items-center gap-2">
                            <Star className="text-yellow-400" />
                            보상
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Coins className="text-yellow-400" size={20} />
                                    <span className="text-white">코인</span>
                                </div>
                                <span className="text-xl font-black text-yellow-400">
                                    +{rewards.coins.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Star className="text-cyan-400" size={20} />
                                    <span className="text-white">경험치</span>
                                </div>
                                <span className="text-xl font-black text-cyan-400">
                                    +{rewards.experience.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* 버튼 */}
            <div className="flex gap-4">
                <Button
                    color="primary"
                    size="lg"
                    className="px-8 h-12 font-black orbitron"
                    onPress={onRestart}
                >
                    다시 도전
                </Button>
                <Button
                    color="default"
                    size="lg"
                    className="px-8 h-12 font-black orbitron"
                    onPress={onExit}
                >
                    나가기
                </Button>
            </div>
        </motion.div>
    );
}
