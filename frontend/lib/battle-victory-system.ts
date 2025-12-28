/**
 * 전투 승점 시스템
 * - 일반 라운드 승리: +1점
 * - 전략 전투 히든 라운드 (2, 4): 2장 대결 (메인 + 히든)
 *   * 2승: +2점
 *   * 1승 1패: 히든 카드 승부로 결정, +1점
 * - 3점 먼저 획득 시 즉시 승리
 */

export type BattleType = 'strategic' | 'tactical';

export interface RoundResult {
    roundNumber: number;
    winner: 'player' | 'enemy' | 'draw';
    isHiddenRound: boolean;
    playerCard: any;
    enemyCard: any;
    // 히든 라운드용 추가 정보
    hiddenCardWinner?: 'player' | 'enemy' | 'draw';
    playerHiddenCard?: any;
    enemyHiddenCard?: any;
}

export interface VictoryState {
    playerScore: number;
    enemyScore: number;
    playerWonCards: any[];
    enemyWonCards: any[];
    isGameOver: boolean;
    finalWinner: 'player' | 'enemy' | null;
}

/**
 * 승점 계산
 */
export function calculateVictoryPoints(
    results: RoundResult[],
    battleType: BattleType = 'tactical',
    targetScore: number = 3
): VictoryState {
    let playerScore = 0;
    let enemyScore = 0;
    const playerWonCards: any[] = [];
    const enemyWonCards: any[] = [];

    for (const result of results) {
        // 히든 라운드 (2, 4) - 전략 전투에만 적용
        if (battleType === 'strategic' && result.isHiddenRound && result.hiddenCardWinner) {
            const mainWinner = result.winner;
            const hiddenWinner = result.hiddenCardWinner;

            // 2승 (메인 + 히든 모두 승리): +2점
            if (mainWinner === 'player' && hiddenWinner === 'player') {
                playerScore += 2;
                playerWonCards.push(result.playerCard);
                if (result.playerHiddenCard) playerWonCards.push(result.playerHiddenCard);
            } else if (mainWinner === 'enemy' && hiddenWinner === 'enemy') {
                enemyScore += 2;
                enemyWonCards.push(result.enemyCard);
                if (result.enemyHiddenCard) enemyWonCards.push(result.enemyHiddenCard);
            }
            // 1승 1패: 히든 카드 승부로 결정, +1점
            else if (hiddenWinner === 'player') {
                playerScore += 1;
                if (result.playerHiddenCard) playerWonCards.push(result.playerHiddenCard);
            } else if (hiddenWinner === 'enemy') {
                enemyScore += 1;
                if (result.enemyHiddenCard) enemyWonCards.push(result.enemyHiddenCard);
            }
        }
        // 일반 라운드
        else {
            if (result.winner === 'draw') continue;

            // 승리 카드 추가
            if (result.winner === 'player') {
                playerWonCards.push(result.playerCard);
                playerScore += 1;
            } else {
                enemyWonCards.push(result.enemyCard);
                enemyScore += 1;
            }
        }
    }

    // 승리 조건 체크
    const isGameOver = playerScore >= targetScore || enemyScore >= targetScore;
    const finalWinner = isGameOver
        ? playerScore >= targetScore
            ? 'player'
            : 'enemy'
        : null;

    return {
        playerScore,
        enemyScore,
        playerWonCards,
        enemyWonCards,
        isGameOver,
        finalWinner,
    };
}

/**
 * 라운드 결과 생성
 */
export function createRoundResult(
    roundNumber: number,
    playerCard: any,
    enemyCard: any,
    winner: 'player' | 'enemy' | 'draw'
): RoundResult {
    const isHiddenRound = roundNumber === 2 || roundNumber === 4;

    return {
        roundNumber,
        winner,
        isHiddenRound,
        playerCard,
        enemyCard,
    };
}

/**
 * 현재 라운드까지의 승점 상태 가져오기
 */
export function getVictoryStateAtRound(
    results: RoundResult[],
    currentRound: number,
    battleType: BattleType = 'tactical',
    targetScore: number = 3
): VictoryState {
    const relevantResults = results.filter(r => r.roundNumber <= currentRound);
    return calculateVictoryPoints(relevantResults, battleType, targetScore);
}

/**
 * 히든 라운드 보너스 획득 가능 여부 체크
 */
export function canGetHiddenBonus(
    results: RoundResult[],
    player: 'player' | 'enemy'
): {
    canGetBonus: boolean;
    round2Won: boolean;
    round4Won: boolean;
} {
    const round2Result = results.find(r => r.roundNumber === 2);
    const round4Result = results.find(r => r.roundNumber === 4);

    const round2Won = round2Result?.winner === player;
    const round4Won = round4Result?.winner === player;

    return {
        canGetBonus: round2Won && round4Won,
        round2Won,
        round4Won,
    };
}
