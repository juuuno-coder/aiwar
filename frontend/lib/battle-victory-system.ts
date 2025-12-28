/**
 * 전투 승점 시스템
 * - 일반 라운드 승리: +1점
 * - 히든 라운드(2, 4) 연속 승리: +2점
 * - 3점 먼저 획득 시 즉시 승리
 */

export interface RoundResult {
    roundNumber: number;
    winner: 'player' | 'enemy' | 'draw';
    isHiddenRound: boolean;
    playerCard: any;
    enemyCard: any;
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
    targetScore: number = 3
): VictoryState {
    let playerScore = 0;
    let enemyScore = 0;
    const playerWonCards: any[] = [];
    const enemyWonCards: any[] = [];

    // 히든 라운드 연속 승리 체크용
    let hiddenRound2Winner: 'player' | 'enemy' | 'draw' | null = null;
    let hiddenRound4Winner: 'player' | 'enemy' | 'draw' | null = null;

    for (const result of results) {
        if (result.winner === 'draw') continue;

        // 히든 라운드 승자 기록
        if (result.roundNumber === 2) {
            hiddenRound2Winner = result.winner;
        } else if (result.roundNumber === 4) {
            hiddenRound4Winner = result.winner;
        }

        // 승리 카드 추가
        if (result.winner === 'player') {
            playerWonCards.push(result.playerCard);
        } else {
            enemyWonCards.push(result.enemyCard);
        }

        // 일반 승점 계산
        if (result.winner === 'player') {
            playerScore += 1;
        } else {
            enemyScore += 1;
        }
    }

    // 히든 라운드 보너스 (2, 4 라운드 모두 이긴 경우 +1점 추가)
    if (hiddenRound2Winner === 'player' && hiddenRound4Winner === 'player') {
        playerScore += 1;
    } else if (hiddenRound2Winner === 'enemy' && hiddenRound4Winner === 'enemy') {
        enemyScore += 1;
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
    targetScore: number = 3
): VictoryState {
    const relevantResults = results.filter(r => r.roundNumber <= currentRound);
    return calculateVictoryPoints(relevantResults, targetScore);
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
