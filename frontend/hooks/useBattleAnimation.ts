import { useState, useCallback, useEffect } from 'react';
import { RoundResult, VictoryState, calculateVictoryPoints, createRoundResult, BattleType } from '@/lib/battle-victory-system';

export type AnimationPhase = 'idle' | 'draw' | 'clash' | 'result' | 'victory';

export interface BattleAnimationState {
    currentRound: number;
    animationPhase: AnimationPhase;
    results: RoundResult[];
    victoryState: VictoryState;
    activePlayerCard: any | null;
    activeEnemyCard: any | null;
}

export function useBattleAnimation(
    playerCards: any[],
    enemyCards: any[],
    battleType: BattleType = 'tactical',
    onBattleEnd: (victory: boolean) => void
) {
    const [state, setState] = useState<BattleAnimationState>({
        currentRound: 0,
        animationPhase: 'idle',
        results: [],
        victoryState: {
            playerScore: 0,
            enemyScore: 0,
            playerWonCards: [],
            enemyWonCards: [],
            isGameOver: false,
            finalWinner: null,
        },
        activePlayerCard: null,
        activeEnemyCard: null,
    });

    /**
     * 가위바위보 판정
     */
    const determineWinner = useCallback((playerCard: any, enemyCard: any): 'player' | 'enemy' | 'draw' => {
        const playerType = playerCard.type || 'EFFICIENCY';
        const enemyType = enemyCard.type || 'EFFICIENCY';

        if (playerType === enemyType) return 'draw';

        const winConditions: Record<string, string> = {
            'EFFICIENCY': 'CREATIVITY',  // 바위 > 가위
            'CREATIVITY': 'FUNCTION',    // 가위 > 보
            'FUNCTION': 'EFFICIENCY',    // 보 > 바위
        };

        return winConditions[playerType] === enemyType ? 'player' : 'enemy';
    }, []);

    /**
     * 라운드 실행
     */
    const playRound = useCallback(async () => {
        const roundNumber = state.currentRound + 1;

        if (roundNumber > playerCards.length) return;
        if (state.victoryState.isGameOver) return;

        const playerCard = playerCards[roundNumber - 1];
        const enemyCard = enemyCards[roundNumber - 1];

        // Phase 1: 카드 뽑기
        setState(prev => ({
            ...prev,
            animationPhase: 'draw',
            activePlayerCard: playerCard,
            activeEnemyCard: enemyCard,
        }));

        await new Promise(resolve => setTimeout(resolve, 500));

        // Phase 2: 충돌
        setState(prev => ({ ...prev, animationPhase: 'clash' }));
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Phase 3: 결과 판정
        const winner = determineWinner(playerCard, enemyCard);
        const roundResult = createRoundResult(roundNumber, playerCard, enemyCard, winner);
        const newResults = [...state.results, roundResult];
        const newVictoryState = calculateVictoryPoints(newResults, battleType);

        setState(prev => ({
            ...prev,
            animationPhase: 'result',
            results: newResults,
            victoryState: newVictoryState,
            currentRound: roundNumber,
        }));

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Phase 4: 승리 체크
        if (newVictoryState.isGameOver) {
            setState(prev => ({ ...prev, animationPhase: 'victory' }));
            setTimeout(() => {
                onBattleEnd(newVictoryState.finalWinner === 'player');
            }, 2000);
        } else {
            // 다음 라운드 준비
            setState(prev => ({
                ...prev,
                animationPhase: 'idle',
                activePlayerCard: null,
                activeEnemyCard: null,
            }));
        }
    }, [state, playerCards, enemyCards, determineWinner, onBattleEnd]);

    /**
     * 자동 진행
     */
    useEffect(() => {
        if (state.animationPhase === 'idle' && !state.victoryState.isGameOver) {
            const timer = setTimeout(() => {
                playRound();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [state.animationPhase, state.victoryState.isGameOver, playRound]);

    return {
        state,
        playRound,
    };
}
