import { useState, useCallback, useEffect } from 'react';
import { RoundResult, VictoryState, calculateVictoryPoints, BattleType } from '@/lib/battle-victory-system';

export type AnimationPhase = 'idle' | 'draw' | 'clash' | 'result' | 'hidden-draw' | 'hidden-clash' | 'hidden-result' | 'victory';

export interface BattleAnimationState {
    currentRound: number;
    animationPhase: AnimationPhase;
    results: RoundResult[];
    victoryState: VictoryState;
    activePlayerCard: any | null;
    activeEnemyCard: any | null;
    activePlayerHiddenCard: any | null;
    activeEnemyHiddenCard: any | null;
}

export function useBattleAnimation(
    playerCards: any[],
    enemyCards: any[],
    battleType: BattleType = 'tactical',
    playerHiddenCards?: { round2?: any; round4?: any },
    enemyHiddenCards?: { round2?: any; round4?: any },
    onBattleEnd?: (victory: boolean) => void
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
        activePlayerHiddenCard: null,
        activeEnemyHiddenCard: null,
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
        const isHiddenRound = battleType === 'strategic' && (roundNumber === 2 || roundNumber === 4);

        // 히든 카드 가져오기
        const playerHiddenCard = isHiddenRound
            ? (roundNumber === 2 ? playerHiddenCards?.round2 : playerHiddenCards?.round4)
            : null;
        const enemyHiddenCard = isHiddenRound
            ? (roundNumber === 2 ? enemyHiddenCards?.round2 : enemyHiddenCards?.round4)
            : null;

        // Phase 1: 메인 카드 뽑기
        setState(prev => ({
            ...prev,
            animationPhase: 'draw',
            activePlayerCard: playerCard,
            activeEnemyCard: enemyCard,
        }));

        await new Promise(resolve => setTimeout(resolve, 500));

        // Phase 2: 메인 카드 충돌
        setState(prev => ({ ...prev, animationPhase: 'clash' }));
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Phase 3: 메인 카드 결과
        const mainWinner = determineWinner(playerCard, enemyCard);

        setState(prev => ({ ...prev, animationPhase: 'result' }));
        await new Promise(resolve => setTimeout(resolve, 800));

        let hiddenWinner: 'player' | 'enemy' | 'draw' | undefined;

        // 히든 라운드 처리
        if (isHiddenRound && playerHiddenCard && enemyHiddenCard) {
            // Phase 4: 히든 카드 뽑기
            setState(prev => ({
                ...prev,
                animationPhase: 'hidden-draw',
                activePlayerHiddenCard: playerHiddenCard,
                activeEnemyHiddenCard: enemyHiddenCard,
            }));

            await new Promise(resolve => setTimeout(resolve, 500));

            // Phase 5: 히든 카드 충돌
            setState(prev => ({ ...prev, animationPhase: 'hidden-clash' }));
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Phase 6: 히든 카드 결과
            hiddenWinner = determineWinner(playerHiddenCard, enemyHiddenCard);

            setState(prev => ({ ...prev, animationPhase: 'hidden-result' }));
            await new Promise(resolve => setTimeout(resolve, 800));
        }

        // 최종 라운드 결과 생성
        const roundResult: RoundResult = {
            roundNumber,
            winner: mainWinner,
            isHiddenRound,
            playerCard,
            enemyCard,
            hiddenCardWinner: hiddenWinner,
            playerHiddenCard,
            enemyHiddenCard,
        };

        const newResults = [...state.results, roundResult];
        const newVictoryState = calculateVictoryPoints(newResults, battleType);

        setState(prev => ({
            ...prev,
            results: newResults,
            victoryState: newVictoryState,
            currentRound: roundNumber,
        }));

        await new Promise(resolve => setTimeout(resolve, 500));

        // Phase 7: 승리 체크
        if (newVictoryState.isGameOver) {
            setState(prev => ({ ...prev, animationPhase: 'victory' }));
            setTimeout(() => {
                onBattleEnd?.(newVictoryState.finalWinner === 'player');
            }, 2000);
        } else {
            // 다음 라운드 준비
            setState(prev => ({
                ...prev,
                animationPhase: 'idle',
                activePlayerCard: null,
                activeEnemyCard: null,
                activePlayerHiddenCard: null,
                activeEnemyHiddenCard: null,
            }));
        }
    }, [state, playerCards, enemyCards, battleType, playerHiddenCards, enemyHiddenCards, determineWinner, onBattleEnd]);

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
