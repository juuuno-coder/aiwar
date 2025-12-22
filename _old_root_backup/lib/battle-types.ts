// 전투 시스템 타입 정의

export interface Card {
    id: string;
    name: string;
    power: number;
    level: number;
    rarity: string;
    faction: string;
}

export interface BattleRound {
    roundNumber: number;
    playerCard: Card;
    enemyCard: Card;
    playerPower: number;
    enemyPower: number;
    playerLastDigit: number;
    enemyLastDigit: number;
    winner: 'player' | 'enemy' | 'draw';
}

export interface BattleResult {
    rounds: BattleRound[];
    playerWins: number;
    enemyWins: number;
    finalWinner: 'player' | 'enemy';
    rewards: {
        coins: number;
        experience: number;
        cards?: Card[];
    };
}

export interface BattleState {
    phase: 'selection' | 'battle' | 'result';
    selectedCards: Card[];
    enemyCards: Card[];
    currentRound: number;
    result?: BattleResult;
}
