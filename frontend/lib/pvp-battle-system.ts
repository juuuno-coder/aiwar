// PVP 전투 시스템
// 가위바위보 기반 전투 로직 및 보상 계산

import { Card, BattleMode, Stats, Rarity } from './types';
import { getGameState, updateGameState } from './game-state';
import { gameStorage } from './game-storage';
import { BattleMode as BaseBattleMode } from './battle-modes';
import { generateRandomCard } from './card-generation-system';

export type { BattleMode } from './types';
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
    avatar?: string; // Commander Avatar ID or URL
    style?: string; // Play style description
}

export interface RoundResult {
    round: number | string;
    playerCard: Card;
    opponentCard: Card;
    winner: 'player' | 'opponent' | 'draw';
    playerType: 'efficiency' | 'creativity' | 'function';
    opponentType: 'efficiency' | 'creativity' | 'function';
}

export interface RoundPlacement {
    round1: Card | null;
    round2Main: Card | null;
    round3Main: Card | null;
    round3Hidden: Card | null;
    round4Main: Card | null;
    round5: Card | null;
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
    minLevel: 1,  // 테스트용으로 1로 낮춤 (원래 5)
    entryFee: 50,
    minCards: 5,
};

// 보상 체계 (균형 조정)
export const PVP_REWARDS = {
    'sudden-death': { win: 100, exp: 30, rating: 15 },
    'tactics': { win: 100, exp: 50, rating: 25 },
    'ambush': { win: 100, exp: 70, rating: 35 },
    'double': { win: 100, exp: 60, rating: 30 },
    loss: { coins: 0, exp: 10, rating: -10 },
};

// 카드 교환 설정
export const CARD_EXCHANGE = {
    cardsToExchange: 3, // 승자가 가져갈 카드 수
    minRarityToLose: 'common' as const, // 잃을 수 있는 최소 등급
};

/**
 * 더미 지휘관 데이터
 */
interface DummyCommander {
    name: string;
    title: string;
    preferredType: 'EFFICIENCY' | 'CREATIVITY' | 'FUNCTION' | 'BALANCED';
    difficulty: 'easy' | 'normal' | 'hard';
    description: string;
}

const DUMMY_COMMANDERS: DummyCommander[] = [
    {
        name: 'PX-01 프로토타입',
        title: '훈련용 AI',
        preferredType: 'BALANCED',
        difficulty: 'easy',
        description: '기본적인 전술 훈련을 위해 설계된 초기형 AI입니다.'
    },
    {
        name: '아이언 월(Iron Wall)',
        title: '효율의 방패',
        preferredType: 'EFFICIENCY', // Rock preference
        difficulty: 'normal',
        description: '단단한 효율성 카드를 선호하여 상대의 공격을 무력화합니다.'
    },
    {
        name: '크리에이티브 카오스',
        title: '변칙의 예술가',
        preferredType: 'CREATIVITY', // Paper preference
        difficulty: 'normal',
        description: '예측 불가능한 창의성 카드로 허를 찌르는 전략을 구사합니다.'
    },
    {
        name: '샤프 엣지(Sharp Edge)',
        title: '정밀 타격기',
        preferredType: 'FUNCTION', // Scissors preference
        difficulty: 'hard',
        description: '날카로운 기능성 카드로 상대의 약점을 파고듭니다.'
    },
    {
        name: '그랜드 마스터 알파',
        title: '전장의 지배자',
        preferredType: 'BALANCED',
        difficulty: 'hard',
        description: '모든 상황에 완벽하게 대응하는 고도화된 전략 AI입니다.'
    }
];

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
export async function checkPVPRequirements(currentInventory?: Card[], currentLevel?: number, currentCoins?: number): Promise<{ canJoin: boolean; reason?: string }> {
    const state = typeof window !== 'undefined' ? getGameState() : { level: 0, coins: 0, inventory: [] };

    // Use provided inventory/stats or fetch from state
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
 * 카드 타입 결정 (가위바위보)
 */
export function getCardType(card: Card): 'efficiency' | 'creativity' | 'function' {
    // 🛡️ Null check - 카드가 없으면 기본값 반환
    if (!card) {
        console.warn('⚠️ getCardType: Received undefined/null card');
        return 'efficiency'; // 기본값
    }

    // 1. Explicit Type Check
    if (card.type) {
        if (card.type === 'EFFICIENCY') return 'efficiency';
        if (card.type === 'CREATIVITY') return 'creativity';
        if (card.type === 'FUNCTION') return 'function';
    }

    // 2. Stats Fallback
    const { efficiency = 0, creativity = 0, function: func = 0 } = card.stats;

    if (efficiency >= creativity && efficiency >= func) return 'efficiency';
    if (creativity >= efficiency && creativity >= func) return 'creativity';
    return 'function';
}

// Helper for rarity rank
function getRarityRank(rarity?: string): number {
    const ranks: Record<string, number> = {
        'common': 1, 'rare': 2, 'epic': 3, 'legendary': 4, 'unique': 5, 'commander': 6
    };
    return ranks[rarity || 'common'] || 1;
}

/**
 * 가위바위보 승부 판정
 * 순서: 상성 > 주 스탯 > 총 전투력 > 레벨 > 등급
 */
export function determineRoundWinner(
    playerCard: Card,
    opponentCard: Card
): 'player' | 'opponent' | 'draw' {
    // 🛡️ Null check
    if (!playerCard && !opponentCard) return 'draw';
    if (!playerCard) return 'opponent';
    if (!opponentCard) return 'player';

    const playerType = getCardType(playerCard);
    const opponentType = getCardType(opponentCard);

    // 1. 가위바위보 상성 판정 (타입이 다르면)
    if (playerType !== opponentType) {
        if (playerType === 'efficiency' && opponentType === 'function') return 'player'; // 바위 > 가위
        if (playerType === 'function' && opponentType === 'creativity') return 'player'; // 가위 > 보
        if (playerType === 'creativity' && opponentType === 'efficiency') return 'player'; // 보 > 바위
        return 'opponent';
    }

    // 2. 같은 타입: 주 스탯(해당 타입의 스탯) 비교
    let playerMainStat = 0;
    let opponentMainStat = 0;

    if (playerType === 'efficiency') {
        playerMainStat = playerCard.stats?.efficiency || 0;
        opponentMainStat = opponentCard.stats?.efficiency || 0;
    } else if (playerType === 'creativity') {
        playerMainStat = playerCard.stats?.creativity || 0;
        opponentMainStat = opponentCard.stats?.creativity || 0;
    } else { // function
        playerMainStat = playerCard.stats?.function || 0;
        opponentMainStat = opponentCard.stats?.function || 0;
    }

    if (playerMainStat > opponentMainStat) return 'player';
    if (opponentMainStat > playerMainStat) return 'opponent';

    // 3. 총 전투력 비교
    const playerTotal = playerCard.stats.totalPower;
    const opponentTotal = opponentCard.stats.totalPower;
    if (playerTotal > opponentTotal) return 'player';
    if (opponentTotal > playerTotal) return 'opponent';

    // 4. 레벨 비교
    const playerLevel = playerCard.level || 1;
    const opponentLevel = opponentCard.level || 1;
    if (playerLevel > opponentLevel) return 'player';
    if (opponentLevel > playerLevel) return 'opponent';

    // 5. 등급 비교
    const playerRank = getRarityRank(playerCard.rarity);
    const opponentRank = getRarityRank(opponentCard.rarity);
    if (playerRank > opponentRank) return 'player';
    if (opponentRank > opponentRank) return 'opponent';

    return 'draw';
}

/**
 * AI 상대 생성 (더미 지휘관 시스템 적용)
 */
export function generateOpponentDeck(
    playerLevel: number,
    cardPool?: Card[],
    targetSize: number = 5
): BattleParticipant {
    // Determine AI Difficulty based on Level (can replace with Rating if passed)
    // Level 1-3: Easy (Common/Rare, unoptimized)
    // Level 4+: Hard (Higher rarity, optimized stats)
    const isEasyMode = playerLevel < 4;

    const COMMANDER_TYPES = [
        { name: '맹장형', description: '공격적인 성향의 지휘관', preferredType: 'EFFICIENCY' },
        { name: '지장형', description: '창의적인 전술의 지휘관', preferredType: 'CREATIVITY' },
        { name: '덕장형', description: '기능성을 중시하는 지휘관', preferredType: 'FUNCTION' },
        { name: '운장형', description: '밸런스를 중시하는 지휘관', preferredType: 'BALANCED' }
    ];

    const commander = COMMANDER_TYPES[Math.floor(Math.random() * COMMANDER_TYPES.length)];
    const displayName = `[AI] ${commander.name} ${commander.preferredType === 'BALANCED' ? '' : commander.preferredType} `;

    let aiCards: Card[] = [];

    // Generator Helper
    const generateAICard = (index: number): Card => {
        // Easy Mode: Common (70%), Rare (30%)
        // Hard Mode: Rare (40%), Epic (40%), Legendary/Commander (20%)
        const roll = Math.random();
        let rarity: Rarity = 'common';

        if (isEasyMode) {
            rarity = roll > 0.7 ? 'rare' : 'common';
        } else {
            if (roll > 0.8) rarity = 'legendary';
            else if (roll > 0.4) rarity = 'epic';
            else rarity = 'rare';
        }

        const card = generateRandomCard(rarity);
        card.id = `ai - gen - ${Date.now()} -${index} `;
        card.ownerId = 'ai-bot';

        // Level Scaling
        // Easy: Player Level or -1
        // Hard: Player Level + Random(0~2)
        const levelOffset = isEasyMode ? -1 : Math.floor(Math.random() * 3);
        card.level = Math.max(1, playerLevel + levelOffset);

        // Stat Multiplier based on Level
        // Base stats are usually low (5-10). We scale them up.
        const statMultiplier = 1 + (card.level - 1) * 0.15;

        // Apply Commander Preference (Bonus Stats)
        if (commander.preferredType === 'EFFICIENCY') card.stats.efficiency = (card.stats.efficiency || 5) + (isEasyMode ? 5 : 15);
        if (commander.preferredType === 'CREATIVITY') card.stats.creativity = (card.stats.creativity || 5) + (isEasyMode ? 5 : 15);
        if (commander.preferredType === 'FUNCTION') card.stats.function = (card.stats.function || 5) + (isEasyMode ? 5 : 15);

        // Finalize Stats
        card.stats.efficiency = Math.floor((card.stats.efficiency || 5) * statMultiplier);
        card.stats.creativity = Math.floor((card.stats.creativity || 5) * statMultiplier);
        card.stats.function = Math.floor((card.stats.function || 5) * statMultiplier);
        card.stats.totalPower = card.stats.efficiency + card.stats.creativity + card.stats.function;

        // Determine Type based on highest stat
        const maxStat = Math.max(card.stats.efficiency, card.stats.creativity, card.stats.function);
        if (maxStat === card.stats.efficiency) card.type = 'EFFICIENCY';
        else if (maxStat === card.stats.creativity) card.type = 'CREATIVITY';
        else card.type = 'FUNCTION';

        return card;
    };

    // Generate Deck
    aiCards = Array.from({ length: targetSize }).map((_, i) => generateAICard(i));

    return {
        name: displayName,
        level: playerLevel,
        deck: aiCards,
        style: commander.description
    };
}

/**
 * 전투 시뮬레이션
 * - 단판승부: R1 → R2 → R4 → R5 순차 진행, 비기면 다음 카드
 * - 전술승부: 5라운드 진행, 비기면 전투력 비교
 */
export function simulateBattle(
    player: BattleParticipant,
    opponent: BattleParticipant,
    mode: BattleMode
): BattleResult {
    const rounds: RoundResult[] = [];
    let playerWins = 0;
    let opponentWins = 0;

    // 카드 순서 결정
    const playerOrder = player.cardOrder || [0, 1, 2, 3, 4];
    const opponentOrder = opponent.cardOrder || [0, 1, 2, 3, 4];

    if (mode === 'sudden-death') {
        // 단판승부: R1 ~ R5 순차 진행 (기존 [0, 1, 3, 4] -> [0, 1, 2, 3, 4]로 수정하여 UI 순서와 일치시킴)
        const roundSequence = [0, 1, 2, 3, 4];

        console.log(`⚙️ Sudden Death: Sequential rounds[1 - 5]: `, roundSequence);

        for (const roundIndex of roundSequence) {
            const playerIndex = playerOrder[roundIndex];
            const opponentIndex = opponentOrder[roundIndex];

            if (playerIndex === undefined || opponentIndex === undefined ||
                playerIndex < 0 || playerIndex >= player.deck.length ||
                opponentIndex < 0 || opponentIndex >= opponent.deck.length) {
                console.warn(`⚠️ Round ${roundIndex + 1}: Invalid card index`);
                continue;
            }

            const playerCard = player.deck[playerIndex];
            const opponentCard = opponent.deck[opponentIndex];

            if (!playerCard || !opponentCard) {
                console.warn(`⚠️ Round ${roundIndex + 1}: Missing card data`);
                continue;
            }

            // 타입만 비교 (전투력 비교 없음)
            const playerType = getCardType(playerCard);
            const opponentType = getCardType(opponentCard);

            let winner: 'player' | 'opponent' | 'draw' = 'draw';

            // 순수 가위바위보 판정
            if (playerType !== opponentType) {
                if (playerType === 'efficiency' && opponentType === 'function') winner = 'player';
                else if (playerType === 'function' && opponentType === 'creativity') winner = 'player';
                else if (playerType === 'creativity' && opponentType === 'efficiency') winner = 'player';
                else winner = 'opponent';
            }

            if (winner === 'player') playerWins++;
            if (winner === 'opponent') opponentWins++;

            rounds.push({
                round: roundIndex + 1,
                playerCard,
                opponentCard,
                winner,
                playerType,
                opponentType,
            });

            // 승자가 결정되면 즉시 종료
            if (winner !== 'draw') {
                console.log(`✅ Winner in Round ${roundIndex + 1}: ${winner} `);
                break;
            }

            console.log(`⚖️ Round ${roundIndex + 1}: Draw, next card...`);
        }
    } else if (mode === 'ambush') {
        // 전략승부: 5라운드, R3에 히든 카드(매복) 사용 (총 6장)
        // 덱 구성: 0~4(메인), 5(R3히든)
        // R3에서 메인과 히든이 각각 전투를 치름 (최대 2승 가능)
        const winsNeeded = 4; // 총 승점 6점(R1,2,4,5 + R3x2) 중 과반? 혹은 그냥 승수 체크
        // R1(1) + R2(1) + R3(2) + R4(1) + R5(1) = 6 points total. Need > 3?

        console.log(`⚙️ Ambush: 5 rounds(R3 Dual Battle)`);

        for (let i = 0; i < 5; i++) {
            const playerIndex = playerOrder[i];
            const opponentIndex = opponentOrder[i];

            if (playerIndex === undefined || opponentIndex === undefined) continue;

            const playerCard = player.deck[playerIndex];
            const opponentCard = opponent.deck[opponentIndex];

            // 1차 전투 판정 (모든 라운드 공통)
            let winner = determineRoundWinner(playerCard, opponentCard);

            if (winner === 'player') playerWins++;
            if (winner === 'opponent') opponentWins++;

            rounds.push({
                round: i === 2 ? '3-1' : i + 1,
                playerCard,
                opponentCard,
                winner,
                playerType: getCardType(playerCard),
                opponentType: getCardType(opponentCard),
            });

            // R3 Special Logic: Dual Battle
            if (i === 2) { // Round 3 (Index 2)
                const hiddenIndex = 5; // 6th card
                if (player.deck[hiddenIndex]) {
                    const hiddenCard = player.deck[hiddenIndex];
                    console.log(`🥷 Ambush Dual Battle in Round 3!`);

                    // 2차 전투 판정 (히든 카드 vs 상대 R3 카드)
                    // 상대는 R3 카드를 2번 상대함
                    const hiddenWinner = determineRoundWinner(hiddenCard, opponentCard);

                    rounds.push({
                        round: '3-2', // Round 3-2 (Hidden)
                        playerCard: hiddenCard,
                        opponentCard: opponentCard, // Same opponent card
                        winner: hiddenWinner,
                        playerType: getCardType(hiddenCard),
                        opponentType: getCardType(opponentCard),
                    });

                    // Scoring Logic with Negation
                    if (hiddenWinner === 'player') {
                        playerWins++;
                        // Ambush Success: If player wins 3-2, opponent's 3-1 win is negated (0 points)
                        if (winner === 'opponent') {
                            opponentWins--; // Cancel point
                            console.log('✅ Ambush Correction: Opponent R3-1 win negated by R3-2 Player Win');
                        }
                    } else if (hiddenWinner === 'opponent') {
                        opponentWins++;
                    }
                }
            }

            // Ambush Early Exit: 3점 선취 시 종료 (퍼펙트 승리 등)
            if (playerWins >= 3 || opponentWins >= 3) {
                console.log(`✅ Ambush: ${playerWins >= 3 ? 'Player' : 'Opponent'} reached 3 wins! Early exit.`);
                break;
            }
        }
    } else if (mode === 'double') {
        // 복식승부: UI 상호작용으로 진행되므로 시뮬레이션에서는 빈 결과 반환
        return {
            winner: 'player',
            rounds: [],
            playerWins: 0,
            opponentWins: 0,
            rewards: { coins: 0, experience: 0, ratingChange: 0 }
        };
    } else {
        // 전술승부 (Tactics): 5라운드 정공법
        const winsNeeded = 3;
        console.log(`⚙️ Tactics: 5 rounds, 3 wins needed`);

        for (let i = 0; i < 5; i++) {
            const playerIndex = playerOrder[i];
            const opponentIndex = opponentOrder[i];

            if (playerIndex === undefined || opponentIndex === undefined ||
                playerIndex < 0 || playerIndex >= player.deck.length ||
                opponentIndex < 0 || opponentIndex >= opponent.deck.length) {
                console.warn(`⚠️ Round ${i + 1}: Invalid card index`);
                continue;
            }

            const playerCard = player.deck[playerIndex];
            const opponentCard = opponent.deck[opponentIndex];

            if (!playerCard || !opponentCard) {
                console.warn(`⚠️ Round ${i + 1}: Missing card data`);
                continue;
            }

            // 전투력 비교 포함한 전체 판정
            const winner = determineRoundWinner(playerCard, opponentCard);

            if (winner === 'player') playerWins++;
            if (winner === 'opponent') opponentWins++;

            rounds.push({
                round: i === 2 ? '3-1' : i + 1,
                playerCard,
                opponentCard,
                winner,
                playerType: getCardType(playerCard),
                opponentType: getCardType(opponentCard),
            });

            // 승리 조건 달성 시 종료
            if (playerWins >= winsNeeded || opponentWins >= winsNeeded) {
                console.log(`✅ ${playerWins >= winsNeeded ? 'Player' : 'Opponent'} wins!`);
                break;
            }
        }
    }

    // 최종 승자 판정
    let battleWinner: 'player' | 'opponent';

    if (playerWins > opponentWins) {
        battleWinner = 'player';
    } else if (opponentWins > playerWins) {
        battleWinner = 'opponent';
    } else {
        // 무승부는 패배 처리
        console.log('⚠️ Tie - treating as opponent win');
        battleWinner = 'opponent';
    }

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
        // 승리: 상대 카드 중 랜덤 3장 획득 (AI전은 가상 카드만 획득 가능하므로 실제 인벤토리에 'guest' 카드로 추가되거나 해야함)
        // 여기서는 단순화를 위해 AI 카드는 획득 불가 처리하거나, 
        // 등급이 낮은 카드를 보상으로 주는 로직.
        // AI 카드는 실제 DB에 없으므로, 여기서 복제하여 새 카드로 획득시킴.
        const gainedCards = opponentDeck
            .filter(c => c.rarity === 'common' || c.rarity === 'rare')
            .sort(() => Math.random() - 0.5)
            .slice(0, CARD_EXCHANGE.cardsToExchange)
            .map((c, i) => ({
                ...c,
                id: `loot - ${Date.now()} -${i} `,
                ownerId: 'player',
                acquiredAt: new Date()
            }));

        return { cardsLost: [], cardsGained: gainedCards };
    } else {
        // 패배: 내 카드 스탯 감소나 코인 손실? 카드 상실은 너무 가혹하므로 잠시 비활성화 할 수도 있음.
        // 기획상 '카드 상실'이 있다면 실행.
        // 현재는 'common' 등급만 잃게 설정되어 있음.
        const lostCards = playerDeck
            .filter(c => c.rarity === 'common')
            .sort(() => Math.random() - 0.5)
            .slice(0, 1); // 1장만

        return { cardsLost: lostCards, cardsGained: [] };
    }
}

/**
 * 전투 결과 적용 (각 단계 독립적으로 실행)
 */
export async function applyBattleResult(
    result: BattleResult,
    playerDeck: Card[],
    opponentDeck: Card[]
): Promise<void> {
    console.log("📊 Applying battle result...");

    // 1. 로컬 상태 업데이트 (PVP 통계)
    let newRating = 1000;
    let updatedStats = { wins: 0, losses: 0, totalBattles: 0, rating: 1000, rank: 0 };

    try {
        const state = getGameState();
        const pvpStats = (state as any).pvpStats || {
            wins: 0,
            losses: 0,
            totalBattles: 0,
            rating: 1000,
            rank: 0,
        };

        newRating = Math.max(0, pvpStats.rating + result.rewards.ratingChange);

        updatedStats = {
            wins: pvpStats.wins + (result.winner === 'player' ? 1 : 0),
            losses: pvpStats.losses + (result.winner === 'opponent' ? 1 : 0),
            totalBattles: pvpStats.totalBattles + 1,
            rating: newRating,
            rank: pvpStats.rank,
        };

        updateGameState({
            pvpStats: updatedStats,
        } as any);

        console.log("✅ Local PVP stats updated");
    } catch (error) {
        console.error("❌ Failed to update local PVP stats:", error);
    }

    // 2. 글로벌 랭킹 업데이트 (실패해도 계속 진행)
    try {
        const state = getGameState();
        const playerName = `Player_${state.level} `;
        await updateGlobalRanking(playerName, newRating, updatedStats);
        console.log("✅ Global ranking updated");
    } catch (error) {
        console.error("❌ Failed to update global ranking:", error);
    }

    // 3. 보상 지급 (Coins & XP)
    try {
        if (result.rewards.coins > 0) {
            await gameStorage.addCoins(result.rewards.coins);
            console.log(`💰 Added ${result.rewards.coins} coins`);
        }
        if (result.rewards.experience > 0) {
            const { leveledUp } = await gameStorage.addExperience(result.rewards.experience);
            console.log(`✨ Added ${result.rewards.experience} exp(Level Up: ${leveledUp})`);
        }
    } catch (error) {
        console.error("❌ Failed to apply rewards:", error);
    }

    console.log("🏁 Battle result processing complete");
}

/**
 * 타입별 이모지
 */
export function getTypeEmoji(type: 'efficiency' | 'creativity' | 'function'): string {
    switch (type) {
        case 'efficiency': return '🪨'; // 바위
        case 'creativity': return '📄'; // 보
        case 'function': return '✂️'; // 가위
        default: return '❓';
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
        default: return '알수없음';
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
