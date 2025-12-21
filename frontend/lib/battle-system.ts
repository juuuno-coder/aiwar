// 전투 시스템 유틸리티 (5전 3선승제)

import { Card } from './types';

export type BattleRoundType = 'video' | 'content' | 'story' | 'image' | 'idea';

export interface BattleRound {
    roundNumber: number; // 1-5
    type: BattleRoundType;
    typeName: string; // "영상 전투", "콘텐츠 전투" 등
    playerCard: Card | Card[];
    enemyCard: Card | Card[];
    playerScore: number;
    enemyScore: number;
    winner: 'player' | 'enemy' | 'draw';
    description: string;
}

export interface BattleResult {
    rounds: BattleRound[];
    playerWins: number;
    enemyWins: number;
    draws: number;
    finalWinner: 'player' | 'enemy';
    rewards: {
        tokens: number;
        experience: number;
        cards?: Card[];
    };
}

/**
 * 라운드 타입별 이름
 */
export const ROUND_TYPE_NAMES: Record<BattleRoundType, string> = {
    video: '영상 전투',
    content: '콘텐츠 전투',
    story: '스토리 전투',
    image: '이미지 전투',
    idea: '아이디어 전투'
};

/**
 * 랜덤 라운드 순서 생성
 */
export function generateRandomRounds(): BattleRoundType[] {
    const types: BattleRoundType[] = ['video', 'content', 'story', 'image', 'idea'];

    // Fisher-Yates 셔플
    for (let i = types.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [types[i], types[j]] = [types[j], types[i]];
    }

    return types;
}

/**
 * 카드의 끝자리 숫자 계산
 */
function getLastDigit(power: number): number {
    return power % 10;
}

/**
 * 영상 전투 시뮬레이션
 */
function simulateVideoRound(playerCards: Card[], enemyCards: Card[]): {
    playerCard: Card;
    enemyCard: Card;
    playerScore: number;
    enemyScore: number;
    winner: 'player' | 'enemy' | 'draw';
} {
    // 영상 모델 카드 필터링 (templateId에 video 포함)
    const playerVideoCards = playerCards.filter(c =>
        c.templateId?.includes('kling') ||
        c.templateId?.includes('runway') ||
        c.templateId?.includes('pika') ||
        c.templateId?.includes('sora')
    );

    const enemyVideoCards = enemyCards.filter(c =>
        c.templateId?.includes('kling') ||
        c.templateId?.includes('runway') ||
        c.templateId?.includes('pika') ||
        c.templateId?.includes('sora')
    );

    // 영상 카드가 없으면 랜덤 카드 사용
    const playerCard = playerVideoCards.length > 0
        ? playerVideoCards[Math.floor(Math.random() * playerVideoCards.length)]
        : playerCards[Math.floor(Math.random() * playerCards.length)];

    const enemyCard = enemyVideoCards.length > 0
        ? enemyVideoCards[Math.floor(Math.random() * enemyVideoCards.length)]
        : enemyCards[Math.floor(Math.random() * enemyCards.length)];

    const playerScore = getLastDigit(playerCard.stats?.totalPower || 0);
    const enemyScore = getLastDigit(enemyCard.stats?.totalPower || 0);

    let winner: 'player' | 'enemy' | 'draw';
    if (playerScore > enemyScore) {
        winner = 'player';
    } else if (enemyScore > playerScore) {
        winner = 'enemy';
    } else {
        winner = 'draw';
    }

    return { playerCard, enemyCard, playerScore, enemyScore, winner };
}

/**
 * 콘텐츠 전투 시뮬레이션 (3개 카드 합)
 */
function simulateContentRound(playerCards: Card[], enemyCards: Card[]): {
    playerCard: Card[];
    enemyCard: Card[];
    playerScore: number;
    enemyScore: number;
    winner: 'player' | 'enemy' | 'draw';
} {
    // 랜덤하게 3개 카드 선택
    const playerSelected = [];
    const enemySelected = [];

    for (let i = 0; i < 3; i++) {
        playerSelected.push(playerCards[Math.floor(Math.random() * playerCards.length)]);
        enemySelected.push(enemyCards[Math.floor(Math.random() * enemyCards.length)]);
    }

    const playerTotal = playerSelected.reduce((sum, card) => sum + (card.stats?.totalPower || 0), 0);
    const enemyTotal = enemySelected.reduce((sum, card) => sum + (card.stats?.totalPower || 0), 0);

    const playerScore = getLastDigit(playerTotal);
    const enemyScore = getLastDigit(enemyTotal);

    let winner: 'player' | 'enemy' | 'draw';
    if (playerScore > enemyScore) {
        winner = 'player';
    } else if (enemyScore > playerScore) {
        winner = 'enemy';
    } else {
        winner = 'draw';
    }

    return { playerCard: playerSelected, enemyCard: enemySelected, playerScore, enemyScore, winner };
}

/**
 * 스토리 전투 시뮬레이션 (슈퍼 모델)
 */
function simulateStoryRound(playerCards: Card[], enemyCards: Card[]): {
    playerCard: Card;
    enemyCard: Card;
    playerScore: number;
    enemyScore: number;
    winner: 'player' | 'enemy' | 'draw';
} {
    // 슈퍼 모델 카드 필터링
    const playerSuperCards = playerCards.filter(c =>
        c.templateId?.includes('gemini') ||
        c.templateId?.includes('chatgpt') ||
        c.templateId?.includes('claude') ||
        c.templateId?.includes('grok')
    );

    const enemySuperCards = enemyCards.filter(c =>
        c.templateId?.includes('gemini') ||
        c.templateId?.includes('chatgpt') ||
        c.templateId?.includes('claude') ||
        c.templateId?.includes('grok')
    );

    const playerCard = playerSuperCards.length > 0
        ? playerSuperCards[Math.floor(Math.random() * playerSuperCards.length)]
        : playerCards[Math.floor(Math.random() * playerCards.length)];

    const enemyCard = enemySuperCards.length > 0
        ? enemySuperCards[Math.floor(Math.random() * enemySuperCards.length)]
        : enemyCards[Math.floor(Math.random() * enemyCards.length)];

    const playerScore = getLastDigit(playerCard.stats?.totalPower || 0);
    const enemyScore = getLastDigit(enemyCard.stats?.totalPower || 0);

    let winner: 'player' | 'enemy' | 'draw';
    if (playerScore > enemyScore) {
        winner = 'player';
    } else if (enemyScore > playerScore) {
        winner = 'enemy';
    } else {
        winner = 'draw';
    }

    return { playerCard, enemyCard, playerScore, enemyScore, winner };
}

/**
 * 이미지 전투 시뮬레이션
 */
function simulateImageRound(playerCards: Card[], enemyCards: Card[]): {
    playerCard: Card;
    enemyCard: Card;
    playerScore: number;
    enemyScore: number;
    winner: 'player' | 'enemy' | 'draw';
} {
    // 이미지 모델 카드 필터링
    const playerImageCards = playerCards.filter(c =>
        c.templateId?.includes('midjourney') ||
        c.templateId?.includes('dalle') ||
        c.templateId?.includes('stable') ||
        c.templateId?.includes('flux')
    );

    const enemyImageCards = enemyCards.filter(c =>
        c.templateId?.includes('midjourney') ||
        c.templateId?.includes('dalle') ||
        c.templateId?.includes('stable') ||
        c.templateId?.includes('flux')
    );

    const playerCard = playerImageCards.length > 0
        ? playerImageCards[Math.floor(Math.random() * playerImageCards.length)]
        : playerCards[Math.floor(Math.random() * playerCards.length)];

    const enemyCard = enemyImageCards.length > 0
        ? enemyImageCards[Math.floor(Math.random() * enemyImageCards.length)]
        : enemyCards[Math.floor(Math.random() * enemyCards.length)];

    const playerScore = getLastDigit(playerCard.stats?.totalPower || 0);
    const enemyScore = getLastDigit(enemyCard.stats?.totalPower || 0);

    let winner: 'player' | 'enemy' | 'draw';
    if (playerScore > enemyScore) {
        winner = 'player';
    } else if (enemyScore > playerScore) {
        winner = 'enemy';
    } else {
        winner = 'draw';
    }

    return { playerCard, enemyCard, playerScore, enemyScore, winner };
}

/**
 * 아이디어 전투 시뮬레이션 (창의성 + 랜덤)
 */
function simulateIdeaRound(playerCards: Card[], enemyCards: Card[]): {
    playerCard: Card;
    enemyCard: Card;
    playerScore: number;
    enemyScore: number;
    winner: 'player' | 'enemy' | 'draw';
} {
    const playerCard = playerCards[Math.floor(Math.random() * playerCards.length)];
    const enemyCard = enemyCards[Math.floor(Math.random() * enemyCards.length)];

    // 창의성 = 전투력 + 랜덤 보너스 (0-20)
    const playerBonus = Math.floor(Math.random() * 21);
    const enemyBonus = Math.floor(Math.random() * 21);

    const playerScore = getLastDigit((playerCard.stats?.totalPower || 0) + playerBonus);
    const enemyScore = getLastDigit((enemyCard.stats?.totalPower || 0) + enemyBonus);

    let winner: 'player' | 'enemy' | 'draw';
    if (playerScore > enemyScore) {
        winner = 'player';
    } else if (enemyScore > playerScore) {
        winner = 'enemy';
    } else {
        winner = 'draw';
    }

    return { playerCard, enemyCard, playerScore, enemyScore, winner };
}

/**
 * 5전 3선승제 전투 시뮬레이션
 */
export function simulate5RoundBattle(
    playerCards: Card[],
    enemyCards: Card[]
): BattleResult {
    const roundTypes = generateRandomRounds();
    const rounds: BattleRound[] = [];
    let playerWins = 0;
    let enemyWins = 0;
    let draws = 0;

    for (let i = 0; i < 5; i++) {
        const roundType = roundTypes[i];
        let roundResult: any;

        switch (roundType) {
            case 'video':
                roundResult = simulateVideoRound(playerCards, enemyCards);
                break;
            case 'content':
                roundResult = simulateContentRound(playerCards, enemyCards);
                break;
            case 'story':
                roundResult = simulateStoryRound(playerCards, enemyCards);
                break;
            case 'image':
                roundResult = simulateImageRound(playerCards, enemyCards);
                break;
            case 'idea':
                roundResult = simulateIdeaRound(playerCards, enemyCards);
                break;
        }

        if (roundResult.winner === 'player') {
            playerWins++;
        } else if (roundResult.winner === 'enemy') {
            enemyWins++;
        } else {
            draws++;
        }

        rounds.push({
            roundNumber: i + 1,
            type: roundType,
            typeName: ROUND_TYPE_NAMES[roundType],
            playerCard: roundResult.playerCard,
            enemyCard: roundResult.enemyCard,
            playerScore: roundResult.playerScore,
            enemyScore: roundResult.enemyScore,
            winner: roundResult.winner,
            description: `${ROUND_TYPE_NAMES[roundType]} - ${roundResult.winner === 'player' ? '승리' : roundResult.winner === 'enemy' ? '패배' : '무승부'}`
        });

        // 3승 달성 시 조기 종료
        if (playerWins >= 3 || enemyWins >= 3) {
            break;
        }
    }

    const finalWinner = playerWins >= 3 ? 'player' : 'enemy';

    // 보상 계산
    const rewards = {
        tokens: finalWinner === 'player' ? 300 + Math.floor(Math.random() * 200) : 90 + Math.floor(Math.random() * 60),
        experience: finalWinner === 'player' ? 50 + Math.floor(Math.random() * 30) : 15,
        cards: finalWinner === 'player' && Math.random() < 0.1 ? [] : undefined // 10% 확률로 카드 드롭
    };

    return {
        rounds,
        playerWins,
        enemyWins,
        draws,
        finalWinner,
        rewards
    };
}
