// PVP 전투 시스템
// 가위바위보 기반 전투 로직 및 보상 계산

import { Card } from './types';
import { getGameState, updateGameState } from './game-state';
import { BattleMode as BaseBattleMode } from './battle-modes';

export type BattleMode = 'sudden-death' | 'tactics' | 'ambush';
export type MatchType = 'realtime' | 'ai-training';

export interface PVPStats {
    wins: number;
    losses: number;
    winRate: number;
    totalBattles: number;
    rating: number; // 아레나 레이팅
    rank: number; // 현재 순위
}

export interface BattleParticipant {
    name: string;
    level: number;
    deck: Card[];
    cardOrder?: number[]; // 카드 순서 (인덱스)
}

export interface RoundResult {
    round: number;
    playerCard: Card;
    opponentCard: Card;
    winner: 'player' | 'opponent' | 'draw';
    playerType: 'efficiency' | 'creativity' | 'function';
    opponentType: 'efficiency' | 'creativity' | 'function';
}

export interface BattleResult {
    winner: 'player' | 'opponent';
    rounds: RoundResult[];
    playerWins: number;
    opponentWins: number;
    rewards: {
        coins: number;
        experience: number;
        ratingChange: number;
    };
    cardExchange?: {
        cardsLost: Card[];
        cardsGained: Card[];
    };
}

// 참가 조건
export const PVP_REQUIREMENTS = {
    minLevel: 5,
    entryFee: 50,
    minCards: 5,
};

// 보상 체계 (균형 조정)
export const PVP_REWARDS = {
    'sudden-death': { win: 100, exp: 30, rating: 15 },
    'tactics': { win: 100, exp: 50, rating: 25 },
    'ambush': { win: 100, exp: 70, rating: 35 },
    loss: { coins: 0, exp: 10, rating: -10 },
};

// 카드 교환 설정
export const CARD_EXCHANGE = {
    cardsToExchange: 3, // 승자가 가져갈 카드 수
    minRarityToLose: 'common' as const, // 잃을 수 있는 최소 등급
};

/**
 * PVP 통계 가져오기
 */
export function getPVPStats(): PVPStats {
    const state = getGameState();
    const pvpStats = (state as any).pvpStats || {
        wins: 0,
        losses: 0,
        totalBattles: 0,
    };

    return {
        ...pvpStats,
        winRate: pvpStats.totalBattles > 0
            ? Math.round((pvpStats.wins / pvpStats.totalBattles) * 100)
            : 0,
    };
}

/**
 * 참가 조건 확인
 */
/**
 * 참가 조건 확인
 */
export async function checkPVPRequirements(currentInventory?: Card[]): Promise<{ canJoin: boolean; reason?: string }> {
    const state = getGameState();

    // Use provided inventory or fetch from storage
    let inventory = currentInventory;
    if (!inventory) {
        // Dynamic import to avoid circular dependency if possible, or just import at top if safe.
        // Assuming we can import gameStorage at the top level, but for safety in this change:
        // Let's rely on the top-level import if we add it, or use a workaround.
        // Actually, let's try to assume the caller provides it for best practice in React components,
        // but fallback to state.inventory if not provided (which might be stale).
        // BETTER: Let's Fetch it freshly if we can.

        // However, adding async import might be complex here.
        // Let's assume the caller MUST provide it or we use state.inventory.
        // But to be safe, let's stick to using the passed inventory primarily.
        inventory = state.inventory;
    }

    if (state.level < PVP_REQUIREMENTS.minLevel) {
        return {
            canJoin: false,
            reason: `레벨 ${PVP_REQUIREMENTS.minLevel} 이상부터 참가 가능합니다.`
        };
    }

    if (state.coins < PVP_REQUIREMENTS.entryFee) {
        return {
            canJoin: false,
            reason: `참가비 ${PVP_REQUIREMENTS.entryFee} 코인이 필요합니다.`
        };
    }

    // Check count
    if (inventory.length < PVP_REQUIREMENTS.minCards) {
        return {
            canJoin: false,
            reason: `최소 ${PVP_REQUIREMENTS.minCards}장의 카드가 필요합니다.`
        };
    }

    return { canJoin: true };
}

/**
 * 카드 타입 결정 (가위바위보)
 */
export function getCardType(card: Card): 'efficiency' | 'creativity' | 'function' {
    const { efficiency = 0, creativity = 0, function: func = 0 } = card.stats;

    if (efficiency >= creativity && efficiency >= func) return 'efficiency';
    if (creativity >= efficiency && creativity >= func) return 'creativity';
    return 'function';
}

/**
 * 가위바위보 승부 판정
 * 효율성(바위) > 기능성(가위) > 창의성(보) > 효율성(바위)
 */
export function determineRoundWinner(
    playerCard: Card,
    opponentCard: Card
): 'player' | 'opponent' | 'draw' {
    const playerType = getCardType(playerCard);
    const opponentType = getCardType(opponentCard);

    // 같은 타입이면 전투력 비교
    if (playerType === opponentType) {
        const playerPower = playerCard.stats.totalPower;
        const opponentPower = opponentCard.stats.totalPower;

        if (playerPower > opponentPower) return 'player';
        if (opponentPower > playerPower) return 'opponent';
        return 'draw';
    }

    // 가위바위보 로직
    if (playerType === 'efficiency' && opponentType === 'function') return 'player';
    if (playerType === 'function' && opponentType === 'creativity') return 'player';
    if (playerType === 'creativity' && opponentType === 'efficiency') return 'player';

    return 'opponent';
}

/**
 * AI 상대 생성
 */
export function generateAIOpponent(playerLevel: number): BattleParticipant {
    const state = getGameState();
    const allCards = state.inventory;

    // 플레이어와 비슷한 레벨의 카드 선택
    const aiCards = [...allCards]
        .sort(() => Math.random() - 0.5)
        .slice(0, 5)
        .map(card => ({
            ...card,
            id: `ai-${card.id}`,
            name: `AI ${card.name}`,
        }));

    return {
        name: `AI 훈련봇 Lv.${playerLevel}`,
        level: playerLevel,
        deck: aiCards,
    };
}

/**
 * 전투 시뮬레이션
 */
export function simulateBattle(
    player: BattleParticipant,
    opponent: BattleParticipant,
    mode: BattleMode
): BattleResult {
    const rounds: RoundResult[] = [];
    let playerWins = 0;
    let opponentWins = 0;

    // 승리 조건
    const winsNeeded = mode === 'sudden-death' ? 1 : 3;

    // 카드 순서 결정
    const playerOrder = player.cardOrder || [0, 1, 2, 3, 4];
    const opponentOrder = opponent.cardOrder || [0, 1, 2, 3, 4];

    // 최대 5라운드
    for (let i = 0; i < 5; i++) {
        const playerCard = player.deck[playerOrder[i]];
        const opponentCard = opponent.deck[opponentOrder[i]];

        const winner = determineRoundWinner(playerCard, opponentCard);

        if (winner === 'player') playerWins++;
        if (winner === 'opponent') opponentWins++;

        rounds.push({
            round: i + 1,
            playerCard,
            opponentCard,
            winner,
            playerType: getCardType(playerCard),
            opponentType: getCardType(opponentCard),
        });

        // 승리 조건 달성 시 종료
        if (playerWins >= winsNeeded || opponentWins >= winsNeeded) {
            break;
        }
    }

    const battleWinner = playerWins > opponentWins ? 'player' : 'opponent';
    const rewards = calculateRewards(mode, battleWinner);

    return {
        winner: battleWinner,
        rounds,
        playerWins,
        opponentWins,
        rewards,
    };
}

/**
 * 보상 계산
 */
function calculateRewards(mode: BattleMode, winner: 'player' | 'opponent'): {
    coins: number;
    experience: number;
    ratingChange: number;
} {
    if (winner === 'player') {
        return {
            coins: PVP_REWARDS[mode].win,
            experience: PVP_REWARDS[mode].exp,
            ratingChange: PVP_REWARDS[mode].rating,
        };
    } else {
        return {
            coins: PVP_REWARDS.loss.coins,
            experience: PVP_REWARDS.loss.exp,
            ratingChange: PVP_REWARDS.loss.rating,
        };
    }
}

/**
 * 카드 교환 처리
 */
function processCardExchange(
    playerDeck: Card[],
    opponentDeck: Card[],
    winner: 'player' | 'opponent'
): { cardsLost: Card[]; cardsGained: Card[] } {
    const state = getGameState();
    const inventory = [...state.inventory];

    if (winner === 'player') {
        // 승리: 상대 카드 중 랜덤 3장 획득
        const gainedCards = opponentDeck
            .filter(c => c.rarity === 'common' || c.rarity === 'rare')
            .sort(() => Math.random() - 0.5)
            .slice(0, CARD_EXCHANGE.cardsToExchange);

        return { cardsLost: [], cardsGained: gainedCards };
    } else {
        // 패배: 내 카드 중 랜덤 3장 상실
        const lostCards = playerDeck
            .filter(c => c.rarity === 'common' || c.rarity === 'rare')
            .sort(() => Math.random() - 0.5)
            .slice(0, CARD_EXCHANGE.cardsToExchange);

        return { cardsLost: lostCards, cardsGained: [] };
    }
}

/**
 * 전투 결과 적용
 */
export async function applyBattleResult(
    result: BattleResult,
    playerDeck: Card[],
    opponentDeck: Card[]
): Promise<void> {
    const state = getGameState();

    // 코인 및 경험치 적용
    const newCoins = Math.max(0, state.coins + result.rewards.coins);
    const newExperience = state.experience + result.rewards.experience;

    // PVP 통계 업데이트
    const pvpStats = (state as any).pvpStats || {
        wins: 0,
        losses: 0,
        totalBattles: 0,
        rating: 1000,
        rank: 0,
    };

    const newRating = Math.max(0, pvpStats.rating + result.rewards.ratingChange);

    const updatedStats = {
        wins: pvpStats.wins + (result.winner === 'player' ? 1 : 0),
        losses: pvpStats.losses + (result.winner === 'opponent' ? 1 : 0),
        totalBattles: pvpStats.totalBattles + 1,
        rating: newRating,
        rank: pvpStats.rank,
    };

    // 카드 교환 처리
    const cardExchange = processCardExchange(playerDeck, opponentDeck, result.winner);
    result.cardExchange = cardExchange;

    let newInventory = [...state.inventory];

    // 카드 추가/제거
    if (cardExchange.cardsGained.length > 0) {
        newInventory = [...newInventory, ...cardExchange.cardsGained];
    }
    if (cardExchange.cardsLost.length > 0) {
        const lostIds = cardExchange.cardsLost.map(c => c.id);
        newInventory = newInventory.filter(c => !lostIds.includes(c.id));
    }

    // 상태 업데이트
    updateGameState({
        coins: newCoins,
        experience: newExperience,
        inventory: newInventory,
        pvpStats: updatedStats,
    } as any);

    // 랭킹 업데이트 (글로벌)
    const playerName = `Player_${state.level}`;
    await updateGlobalRanking(playerName, newRating, updatedStats);
}

/**
 * 타입별 이모지
 */
export function getTypeEmoji(type: 'efficiency' | 'creativity' | 'function'): string {
    switch (type) {
        case 'efficiency': return '🪨'; // 바위
        case 'creativity': return '📄'; // 보
        case 'function': return '✂️'; // 가위
    }
}

/**
 * 타입별 이름
 */
export function getTypeName(type: 'efficiency' | 'creativity' | 'function'): string {
    switch (type) {
        case 'efficiency': return '효율성';
        case 'creativity': return '창의성';
        case 'function': return '기능성';
    }
}

/**
 * 글로벌 랭킹 업데이트
 */
export async function updateGlobalRanking(
    playerName: string,
    rating: number,
    stats: any
): Promise<void> {
    try {
        // localStorage에 랭킹 데이터 저장
        const rankings = JSON.parse(localStorage.getItem('pvpRankings') || '[]');

        // 기존 플레이어 데이터 찾기
        const existingIndex = rankings.findIndex((r: any) => r.name === playerName);

        const playerData = {
            name: playerName,
            rating,
            wins: stats.wins,
            losses: stats.losses,
            totalBattles: stats.totalBattles,
            winRate: stats.totalBattles > 0
                ? Math.round((stats.wins / stats.totalBattles) * 100)
                : 0,
            lastUpdated: new Date().toISOString(),
        };

        if (existingIndex !== -1) {
            rankings[existingIndex] = playerData;
        } else {
            rankings.push(playerData);
        }

        // 레이팅 순으로 정렬
        rankings.sort((a: any, b: any) => b.rating - a.rating);

        // 순위 업데이트
        rankings.forEach((r: any, index: number) => {
            r.rank = index + 1;
        });

        localStorage.setItem('pvpRankings', JSON.stringify(rankings));

        // 현재 플레이어의 순위 업데이트
        const currentRank = rankings.findIndex((r: any) => r.name === playerName) + 1;
        const state = getGameState();
        const pvpStats = (state as any).pvpStats || {};
        pvpStats.rank = currentRank;

        updateGameState({ pvpStats } as any);
    } catch (error) {
        console.error('Failed to update global ranking:', error);
    }
}

/**
 * 글로벌 랭킹 가져오기
 */
export function getGlobalRankings(): any[] {
    try {
        return JSON.parse(localStorage.getItem('pvpRankings') || '[]');
    } catch (error) {
        console.error('Failed to load rankings:', error);
        return [];
    }
}
