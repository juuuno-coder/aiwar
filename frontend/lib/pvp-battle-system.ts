import { Card, BattleMode, Stats, Rarity } from './types';
import { getGameState, updateGameState } from './game-state';
import { gameStorage } from './game-storage';
import { BattleMode as BaseBattleMode } from './battle-modes';
import { generateRandomCard } from './card-generation-system';
import { getLeaderboardData } from './firebase-db';

export type { BattleMode } from './types';
export type MatchType = 'realtime' | 'ai-training';

/**
 * PVP 통계 인터페이스
 */
export interface PVPStats {
    finished: boolean;
    isGhost?: boolean;
    createdAt: number;
    winRate: number;
    totalBattles: number;
    rating: number;
    rank: number;
    wins: number;
    losses: number;
    pvpMatches: number;
}

/**
 * 전투 참여자 정보
 */
export interface BattleParticipant {
    name: string;
    level: number;
    deck: Card[];
    cardOrder?: number[];
    avatar?: string;
    style?: string;
}

/**
 * 라운드 결과 정보
 */
export interface RoundResult {
    round: number | string;
    playerCard: Card;
    opponentCard: Card;
    winner: 'player' | 'opponent' | 'draw';
    playerType: 'efficiency' | 'creativity' | 'function';
    opponentType: 'efficiency' | 'creativity' | 'function';
}

/**
 * 전투 결과 정보
 */
export interface BattleResult {
    winner: 'player' | 'opponent' | 'draw';
    rounds: RoundResult[];
    playerWins: number;
    opponentWins: number;
    rewards: {
        coins: number;
        experience: number;
        ratingChange: number;
    };
    dailyStats?: {
        aiWinsToday: number;
        aiMatchesToday: number;
        lastDailyReset: number;
        matchCount: Record<string, number>;
    };
    pvpStats?: {
        wins: number;
        losses: number;
        totalBattles: number;
        rating: number;
        pvpMatches: number;
        finished: boolean;
        createdAt: number;
        winRate: number;
        rank: number;
        isGhost?: boolean;
    };
    cardExchange?: {
        cardsLost: Card[];
        cardsGained: Card[];
    };
}

/**
 * 참가 조건
 */
export const PVP_REQUIREMENTS = {
    minLevel: 1,
    entryFee: 50,
    minCards: 5,
};

/**
 * 보상 체계
 */
export const PVP_REWARDS = {
    'sudden-death': { win: 100, exp: 30, rating: 15 },
    'tactics': { win: 100, exp: 50, rating: 25 },
    'ambush': { win: 100, exp: 70, rating: 35 },
    'double': { win: 100, exp: 60, rating: 30 },
    loss: { coins: 0, exp: 10, rating: -10 },
    draw: { coins: 20, exp: 20, rating: 0 }
};

/**
 * 카드 교환 설정
 */
export const CARD_EXCHANGE = {
    cardsToExchange: 3,
    minRarityToLose: 'common' as const,
};

/**
 * 전투 결과 적용
 */
export async function applyBattleResult(
    result: BattleResult,
    playerDeck: Card[],
    opponentDeck: Card[],
    isRanked: boolean = false,
    isGhost: boolean = false
): Promise<void> {
    console.log(`📊 Applying battle result (Ranked: ${isRanked}, Ghost: ${isGhost})...`);

    try {
        const state = getGameState();
        const currentPvpStats = state.pvpStats || {
            wins: 0,
            losses: 0,
            totalBattles: 0,
            rating: 1000,
            pvpMatches: 0,
            finished: false,
            createdAt: Date.now(),
            winRate: 0,
            rank: 0,
        };

        const currentRating = currentPvpStats.rating || 1000;
        let ratingChange = isRanked ? result.rewards.ratingChange : 0;

        let rewardMultiplier = 1.0;
        if (isGhost || !isRanked) {
            rewardMultiplier = 0.5;
            ratingChange = Math.floor(ratingChange * 0.5);
            console.log(`📉 50% rewards applied (Ghost/Practice Mode)`);
        }

        const newRating = Math.max(0, currentRating + ratingChange);

        const newPvpStats = {
            ...currentPvpStats,
            wins: currentPvpStats.wins + (result.winner === 'player' ? 1 : 0),
            losses: currentPvpStats.losses + (result.winner === 'opponent' ? 1 : 0),
            totalBattles: currentPvpStats.totalBattles + 1,
            pvpMatches: currentPvpStats.pvpMatches + (isRanked ? 1 : 0),
            rating: newRating,
            finished: true,
            isGhost: isGhost,
        };

        let coinsEarned = Math.floor(result.rewards.coins * rewardMultiplier);
        let expEarned = Math.floor(result.rewards.experience * rewardMultiplier);

        const updatedState = {
            ...state,
            coins: state.coins + coinsEarned,
            experience: state.experience + expEarned,
            pvpStats: newPvpStats,
        };

        // Daily stats update for Practice mode
        if (!isRanked && state.dailyStats) {
            updatedState.dailyStats = {
                ...state.dailyStats,
                aiWinsToday: (state.dailyStats.aiWinsToday || 0) + (result.winner === 'player' ? 1 : 0),
                aiMatchesToday: (state.dailyStats.aiMatchesToday || 0) + 1
            };
        }

        // Card exchange logic
        if (result.winner === 'player' && isRanked && result.cardExchange) {
            for (const lostCard of result.cardExchange.cardsLost) {
                const index = updatedState.inventory.findIndex(c => c.id === lostCard.id);
                if (index !== -1) updatedState.inventory.splice(index, 1);
            }
            updatedState.inventory.push(...result.cardExchange.cardsGained);
        }

        await updateGameState(updatedState);

        if (coinsEarned > 0) await gameStorage.addCoins(coinsEarned);
        if (expEarned > 0) await gameStorage.addExperience(expEarned);

        console.log(`✅ Battle result processed. Rating: ${currentRating} -> ${newRating}`);
    } catch (error) {
        console.error("❌ Failed to apply battle result:", error);
    }
}

/**
 * 카드 타입 결정
 */
export function getCardType(card: Card): 'efficiency' | 'creativity' | 'function' {
    if (!card) return 'efficiency';
    if (card.type === 'EFFICIENCY') return 'efficiency';
    if (card.type === 'CREATIVITY') return 'creativity';
    if (card.type === 'FUNCTION') return 'function';

    const { efficiency = 0, creativity = 0, function: func = 0 } = card.stats;
    if (efficiency >= creativity && efficiency >= func) return 'efficiency';
    if (creativity >= efficiency && creativity >= func) return 'creativity';
    return 'function';
}

/**
 * 라운드 승자 판정
 */
export function determineRoundWinner(playerCard: Card, opponentCard: Card): 'player' | 'opponent' | 'draw' {
    if (!playerCard && !opponentCard) return 'draw';
    if (!playerCard) return 'opponent';
    if (!opponentCard) return 'player';

    const playerType = getCardType(playerCard);
    const opponentType = getCardType(opponentCard);

    if (playerType !== opponentType) {
        if (playerType === 'efficiency' && opponentType === 'function') return 'player';
        if (playerType === 'function' && opponentType === 'creativity') return 'player';
        if (playerType === 'creativity' && opponentType === 'efficiency') return 'player';
        return 'opponent';
    }

    const pStat = playerCard.stats[playerType] || 0;
    const oStat = opponentCard.stats[opponentType] || 0;

    if (pStat > oStat) return 'player';
    if (oStat > pStat) return 'opponent';

    if (playerCard.stats.totalPower > opponentCard.stats.totalPower) return 'player';
    if (opponentCard.stats.totalPower > playerCard.stats.totalPower) return 'opponent';

    return 'draw';
}

/**
 * PVP 통계 가져오기
 */
export function getPVPStats(): PVPStats {
    const state = getGameState();
    const pvpStats = state.pvpStats || {
        wins: 0,
        losses: 0,
        totalBattles: 0,
        rating: 1000,
        pvpMatches: 0,
        finished: false,
        createdAt: Date.now(),
        winRate: 0,
        rank: 0,
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
export async function checkPVPRequirements(currentInventory?: Card[], currentLevel?: number, currentCoins?: number): Promise<{ canJoin: boolean; reason?: string }> {
    const state = typeof window !== 'undefined' ? getGameState() : { level: 0, coins: 0, inventory: [] } as any;

    let inventory = currentInventory || state.inventory || [];
    let level = currentLevel !== undefined ? currentLevel : state.level;
    let coins = currentCoins !== undefined ? currentCoins : state.coins;

    if (level < PVP_REQUIREMENTS.minLevel) {
        return {
            canJoin: false,
            reason: `레벨 ${PVP_REQUIREMENTS.minLevel} 이상부터 참가 가능합니다.`
        };
    }

    if (coins < PVP_REQUIREMENTS.entryFee) {
        return {
            canJoin: false,
            reason: `참가비 ${PVP_REQUIREMENTS.entryFee} 코인이 필요합니다.`
        };
    }

    if (inventory.length < PVP_REQUIREMENTS.minCards) {
        return {
            canJoin: false,
            reason: `최소 ${PVP_REQUIREMENTS.minCards}장의 카드가 필요합니다.`
        };
    }

    return { canJoin: true };
}

/**
 * AI 연습 모드용 상대 덱 생성
 */
export function generateOpponentDeck(playerLevel: number, cardPool?: Card[], targetSize: number = 5): BattleParticipant {
    const isEasy = playerLevel < 4;
    const styles = [
        { name: '맹장형', type: 'EFFICIENCY', desc: '공격적인 성향' },
        { name: '지장형', type: 'CREATIVITY', desc: '창의적인 전술' },
        { name: '덕장형', type: 'FUNCTION', desc: '기능성 중시' },
        { name: '운장형', type: 'BALANCED', desc: '밸런스 중시' }
    ];
    const style = styles[Math.floor(Math.random() * styles.length)];

    const aiCards = Array.from({ length: targetSize }).map((_, i) => {
        let rarity: Rarity = 'common';
        const roll = Math.random();
        if (isEasy) rarity = roll > 0.8 ? 'rare' : 'common';
        else rarity = roll > 0.7 ? 'epic' : roll > 0.3 ? 'rare' : 'common';

        const card = generateRandomCard(rarity);
        card.id = `ai-gen-${Date.now()}-${i}`;
        card.level = Math.max(1, playerLevel + (isEasy ? -1 : 1));
        return card;
    });

    return {
        name: `[AI] ${style.name}`,
        level: playerLevel,
        deck: aiCards,
        style: style.desc
    };
}

/**
 * 전투 시뮬레이션 (연습 모드용)
 */
export function simulateBattle(player: BattleParticipant, opponent: BattleParticipant, mode: BattleMode): BattleResult {
    let playerWins = 0;
    let opponentWins = 0;
    const rounds: RoundResult[] = [];
    const pOrder = player.cardOrder || [0, 1, 2, 3, 4];
    const oOrder = opponent.cardOrder || [0, 1, 2, 3, 4];

    for (let i = 0; i < 5; i++) {
        const pCard = player.deck[pOrder[i]];
        const oCard = opponent.deck[oOrder[i]];
        if (!pCard || !oCard) continue;

        const winner = determineRoundWinner(pCard, oCard);
        if (winner === 'player') playerWins++;
        else if (winner === 'opponent') opponentWins++;

        rounds.push({
            round: i + 1,
            playerCard: pCard,
            opponentCard: oCard,
            winner,
            playerType: getCardType(pCard),
            opponentType: getCardType(oCard)
        });

        if (mode === 'sudden-death' && winner !== 'draw') break;
    }

    const battleWinner = playerWins > opponentWins ? 'player' : playerWins < opponentWins ? 'opponent' : 'draw';

    return {
        winner: battleWinner,
        rounds,
        playerWins,
        opponentWins,
        rewards: calculateRewards(mode, battleWinner)
    };
}

function calculateRewards(mode: BattleMode, winner: 'player' | 'opponent' | 'draw'): {
    coins: number;
    experience: number;
    ratingChange: number;
} {
    const rewards = winner === 'player' ? (PVP_REWARDS[mode] || PVP_REWARDS['sudden-death']) :
        winner === 'draw' ? PVP_REWARDS.draw :
            PVP_REWARDS.loss;

    return {
        coins: (rewards as any).win || (rewards as any).coins || 0,
        experience: (rewards as any).exp || (rewards as any).experience || 0,
        ratingChange: (rewards as any).rating || (rewards as any).ratingChange || 0,
    };
}

export function getTypeEmoji(type: 'efficiency' | 'creativity' | 'function'): string {
    return type === 'efficiency' ? '🪨' : type === 'creativity' ? '📄' : '✂️';
}

export function getTypeName(type: 'efficiency' | 'creativity' | 'function'): string {
    return type === 'efficiency' ? '효율성' : type === 'creativity' ? '창의성' : '기능성';
}
