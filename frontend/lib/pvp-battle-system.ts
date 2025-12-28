// PVP 전투 시스템
// 가위바위보 기반 전투 로직 및 보상 계산

import { Card } from './types';
import { getGameState, updateGameState } from './game-state';
import { gameStorage } from './game-storage';
import { BattleMode as BaseBattleMode } from './battle-modes';
import { generateRandomCard } from './card-generation-system';

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
    avatar?: string; // Commander Avatar ID or URL
    style?: string; // Play style description
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
    minLevel: 1,  // 테스트용으로 1로 낮춤 (원래 5)
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
    if (opponentRank > playerRank) return 'opponent';

    return 'draw';
}

/**
 * AI 상대 생성 (더미 지휘관 시스템 적용)
 */
export function generateAIOpponent(playerLevel: number = 1, cardPool: Card[] = [], playerRating: number = 0): BattleParticipant {
    // 1. 랜덤 지휘관 선택
    const commander = DUMMY_COMMANDERS[Math.floor(Math.random() * DUMMY_COMMANDERS.length)];
    const displayName = `${commander.title} ${commander.name}`;

    let aiCards: Card[] = [];

    // 0. 초보자 배려 모드 (레이팅 1100 미만)
    // 패턴: 보(Paper) 4개, 가위(Scissors) 1개 (보보보보가위)
    if (playerRating < 1100) {
        console.log("👶 Easy Mode AI Activated (Rating < 1100)");

        // 보 (Paper) = CREATIVITY
        const paperCard = {
            id: 'easy-paper',
            name: '초보자용 보',
            rarity: 'common',
            type: 'CREATIVITY',
            level: Math.max(1, playerLevel - 1), // 플레이어보다 낮은 레벨
            stats: { efficiency: 0, creativity: 10, function: 0, totalPower: 10 }
        };

        // 가위 (Scissors) = FUNCTION
        const scissorsCard = {
            id: 'easy-scissors',
            name: '초보자용 가위',
            rarity: 'common',
            type: 'FUNCTION',
            level: Math.max(1, playerLevel - 1),
            stats: { efficiency: 0, creativity: 0, function: 10, totalPower: 10 }
        };

        // 4 Paper + 1 Scissors
        aiCards = [
            { ...paperCard, id: `ai-easy-1` },
            { ...paperCard, id: `ai-easy-2` },
            { ...paperCard, id: `ai-easy-3` },
            { ...paperCard, id: `ai-easy-4` },
            { ...scissorsCard, id: `ai-easy-5` }
        ] as any; // Cast to satisfy specific card properties if needed

        return {
            name: "초보자 도우미 봇",
            level: Math.max(1, playerLevel - 1),
            deck: aiCards,
            style: "초보자를 위해 단순한 패턴(보보보보가위)을 사용합니다."
        };
    }

    // 2. 덱 구성 시도 (기존 풀 활용)
    // 풀이 충분하다면 지휘관 성향에 맞는 카드 위주로 선택
    if (cardPool && Array.isArray(cardPool) && cardPool.length >= 10) {
        // 10장 이상이어야 성향 선택 여지가 있음
        const validPool = cardPool.filter(c => c && c.stats);

        if (commander.preferredType !== 'BALANCED') {
            // 선호 타입 우선 필터링
            const preferredCards = validPool.filter(c => getCardType(c).toUpperCase() === commander.preferredType);
            // 나머지는 일반
            const otherCards = validPool.filter(c => getCardType(c).toUpperCase() !== commander.preferredType);

            // 선호 카드에서 3~4장 선택, 나머지에서 채우기
            const targetPreferredCount = 3 + Math.floor(Math.random() * 2);

            const selectedPreferred = [...preferredCards].sort(() => Math.random() - 0.5).slice(0, targetPreferredCount);
            const selectedOther = [...otherCards].sort(() => Math.random() - 0.5).slice(0, 5 - selectedPreferred.length);

            aiCards = [...selectedPreferred, ...selectedOther];
        } else {
            // 밸런스형: 완전 랜덤
            aiCards = [...validPool].sort(() => Math.random() - 0.5).slice(0, 5);
        }
    }

    // 풀이 5장 미만이거나, 위 로직에서 5장을 못 채웠다면 풀 전체 랜덤 사용 시도
    if (aiCards.length < 5 && cardPool && cardPool.length >= 5) {
        aiCards = [...cardPool].sort(() => Math.random() - 0.5).slice(0, 5);
    }

    // AI 카드 ID 및 속성 정규화
    if (aiCards.length === 5) {
        aiCards = aiCards.map((card, index) => {
            let aiType = card.type;
            if (!aiType) {
                const typeStr = getCardType(card);
                if (typeStr === 'efficiency') aiType = 'EFFICIENCY';
                else if (typeStr === 'creativity') aiType = 'CREATIVITY';
                else aiType = 'FUNCTION';
            }
            return {
                ...card,
                id: `ai-${card.id}-${Date.now()}-${index}`,
                name: `AI ${card.name || 'Unit'}`,
                ownerId: 'ai-bot',
                type: aiType
            };
        });
    } else {
        // 3. 풀이 아예 없거나 부족하면 순수 랜덤 생성 (Fallback)
        aiCards = Array.from({ length: 5 }).map((_, i) => {
            const card = generateRandomCard('pro'); // AI는 항상 Pro 등급 이상의 카드 사용
            card.id = `ai-gen-${Date.now()}-${i}`;
            card.ownerId = 'ai-bot';
            card.level = playerLevel || 1;

            // 지휘관 성향 반영하여 스탯 보정 (가상)
            if (commander.preferredType === 'EFFICIENCY') card.stats.efficiency = (card.stats.efficiency || 0) + 10;
            if (commander.preferredType === 'CREATIVITY') card.stats.creativity = (card.stats.creativity || 0) + 10;
            if (commander.preferredType === 'FUNCTION') card.stats.function = (card.stats.function || 0) + 10;

            // 타입 재설정
            const maxStat = Math.max(card.stats.efficiency || 0, card.stats.creativity || 0, card.stats.function || 0);
            if (maxStat === (card.stats.efficiency || 0)) card.type = 'EFFICIENCY';
            else if (maxStat === (card.stats.creativity || 0)) card.type = 'CREATIVITY';
            else card.type = 'FUNCTION';

            return card;
        });
    }

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
        // 단판승부: 순차 라운드 (R1, R2, R4, R5)
        const roundSequence = [0, 1, 3, 4];

        console.log(`⚙️ Sudden Death: Sequential rounds [1,2,4,5]`);

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
                console.log(`✅ Winner in Round ${roundIndex + 1}: ${winner}`);
                break;
            }

            console.log(`⚖️ Round ${roundIndex + 1}: Draw, next card...`);
        }
    } else {
        // 전술승부: 5라운드 진행, 비기면 전투력 비교
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
                round: i + 1,
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
                id: `loot-${Date.now()}-${i}`,
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
        const playerName = `Player_${state.level}`;
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
            console.log(`✨ Added ${result.rewards.experience} exp (Level Up: ${leveledUp})`);
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
