import { Card, AIType } from '../types';

export interface DuelResult {
    winner: 'player' | 'enemy' | 'draw';
    playerScore: number;
    enemyScore: number;
    isRpsWin: boolean; // Player had RPS advantage
    isRpsLoss: boolean; // Enemy had RPS advantage
    log: string;
}

// RPS Logic: Function > Efficiency > Creativity > Function
export const calculateDuel = (playerCard: Card, enemyCard: Card): DuelResult => {
    let playerScore = playerCard.stats.totalPower;
    let enemyScore = enemyCard.stats.totalPower;

    // Random Variation (+/- 5%) to prevent static ties
    const pVar = playerScore * 0.05;
    const eVar = enemyScore * 0.05;
    playerScore += Math.floor((Math.random() * pVar * 2) - pVar);
    enemyScore += Math.floor((Math.random() * eVar * 2) - eVar);

    let isRpsWin = false;
    let isRpsLoss = false;

    const pType = playerCard.type || 'FUNCTION'; // Default if missing
    const eType = enemyCard.type || 'FUNCTION';

    // RPS Logic (Multiplier: 1.3x for Advantage)
    // Function > Efficiency
    // Efficiency > Creativity
    // Creativity > Function
    if (
        (pType === 'FUNCTION' && eType === 'EFFICIENCY') ||
        (pType === 'EFFICIENCY' && eType === 'CREATIVITY') ||
        (pType === 'CREATIVITY' && eType === 'FUNCTION')
    ) {
        playerScore = Math.floor(playerScore * 1.3);
        isRpsWin = true;
    } else if (
        (eType === 'FUNCTION' && pType === 'EFFICIENCY') ||
        (eType === 'EFFICIENCY' && pType === 'CREATIVITY') ||
        (eType === 'CREATIVITY' && pType === 'FUNCTION')
    ) {
        enemyScore = Math.floor(enemyScore * 1.3);
        isRpsLoss = true;
    }

    let winner: 'player' | 'enemy' | 'draw' = 'draw';
    if (playerScore > enemyScore) winner = 'player';
    if (enemyScore > playerScore) winner = 'enemy';

    const typeIcons: Record<string, string> = { FUNCTION: '✊', EFFICIENCY: '✌️', CREATIVITY: '🖐️' };

    // Log generation
    const log = `[${typeIcons[pType]}] ${playerCard.name} (${playerScore}) vs [${typeIcons[eType]}] ${enemyCard.name} (${enemyScore}) -> ${winner.toUpperCase()} WINS`;

    return {
        winner,
        playerScore,
        enemyScore,
        isRpsWin,
        isRpsLoss,
        log
    };
};
