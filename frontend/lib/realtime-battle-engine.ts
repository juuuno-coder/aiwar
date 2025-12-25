// 실시간 PvP 전투 엔진

import { Card, AIType } from './types';
import {
    BattleRoom,
    PlayerState,
    RealtimeBattleMode,
    BattleResult
} from './realtime-pvp-types';
import {
    updateBattleRoom,
    updatePlayerState,
    getBattleRoom
} from './realtime-pvp-service';
import { getGameState, updateGameState } from './game-state';

/**
 * 라운드 실행 및 승자 판정
 */
export async function executeRound(
    room: BattleRoom,
    roundIndex: number
): Promise<{ winner: 'player1' | 'player2' | 'draw'; player1Card: Card; player2Card: Card }> {
    const { player1, player2, battleMode } = room;

    // 카드 가져오기
    const p1CardIndex = player1.cardOrder[roundIndex];
    const p2CardIndex = player2.cardOrder[roundIndex];

    let player1Card = player1.selectedCards[p1CardIndex];
    let player2Card = player2.selectedCards[p2CardIndex];

    // Ambush 모드: 2, 4 라운드는 히든카드 사용
    if (battleMode === 'ambush' && (roundIndex === 1 || roundIndex === 3)) {
        const hiddenIndex = roundIndex === 1 ? 0 : 1;
        if (player1.hiddenCards && player1.hiddenCards[hiddenIndex]) {
            player1Card = player1.hiddenCards[hiddenIndex];
        }
        if (player2.hiddenCards && player2.hiddenCards[hiddenIndex]) {
            player2Card = player2.hiddenCards[hiddenIndex];
        }
    }

    // 전투 판정
    const winner = resolveBattle(player1Card, player2Card);

    return { winner, player1Card, player2Card };
}

/**
 * 전투 판정 (가위바위보 + 스탯)
 */
function resolveBattle(card1: Card, card2: Card): 'player1' | 'player2' | 'draw' {
    const type1 = card1.type || 'EFFICIENCY';
    const type2 = card2.type || 'EFFICIENCY';

    // 1. 타입 상성 체크
    const typeResult = checkTypeAdvantage(type1, type2);
    if (typeResult !== 'draw') {
        return typeResult;
    }

    // 2. 동일 타입: 해당 타입 스탯 비교
    const stat1 = getStatForType(card1, type1);
    const stat2 = getStatForType(card2, type2);

    if (stat1 > stat2) return 'player1';
    if (stat2 > stat1) return 'player2';

    // 3. 스탯도 동일: 총 전투력 비교
    const power1 = card1.stats.totalPower;
    const power2 = card2.stats.totalPower;

    if (power1 > power2) return 'player1';
    if (power2 > power1) return 'player2';

    return 'draw';
}

/**
 * 타입 상성 체크
 */
function checkTypeAdvantage(
    type1: AIType,
    type2: AIType
): 'player1' | 'player2' | 'draw' {
    if (type1 === type2) return 'draw';

    // EFFICIENCY > CREATIVITY
    if (type1 === 'EFFICIENCY' && type2 === 'CREATIVITY') return 'player1';
    if (type1 === 'CREATIVITY' && type2 === 'EFFICIENCY') return 'player2';

    // CREATIVITY > FUNCTION
    if (type1 === 'CREATIVITY' && type2 === 'FUNCTION') return 'player1';
    if (type1 === 'FUNCTION' && type2 === 'CREATIVITY') return 'player2';

    // FUNCTION > EFFICIENCY
    if (type1 === 'FUNCTION' && type2 === 'EFFICIENCY') return 'player1';
    if (type1 === 'EFFICIENCY' && type2 === 'FUNCTION') return 'player2';

    return 'draw';
}

/**
 * 타입별 스탯 가져오기
 */
function getStatForType(card: Card, type: AIType): number {
    switch (type) {
        case 'EFFICIENCY':
            return card.stats.efficiency || 0;
        case 'CREATIVITY':
            return card.stats.creativity || 0;
        case 'FUNCTION':
            return card.stats.function || 0;
        default:
            return 0;
    }
}

/**
 * 최종 승리 조건 확인
 */
export function checkVictory(room: BattleRoom): string | null {
    if (room.player1.wins >= room.winsNeeded) {
        return room.player1.playerId;
    }
    if (room.player2.wins >= room.winsNeeded) {
        return room.player2.playerId;
    }
    return null;
}

/**
 * 타임아웃 처리
 */
export async function handleTimeout(
    roomId: string,
    playerId: string
): Promise<void> {
    const room = await getBattleRoom(roomId);
    if (!room) return;

    // 타임아웃된 플레이어는 자동 패배
    const isPlayer1 = room.player1.playerId === playerId;
    const winnerId = isPlayer1 ? room.player2.playerId : room.player1.playerId;

    await updateBattleRoom(roomId, {
        winner: winnerId,
        finished: true,
        phase: 'finished'
    });

    // 보상 처리
    await processBattleRewards(roomId, winnerId);
}

/**
 * 연결 끊김 처리
 */
export async function handleDisconnect(
    roomId: string,
    playerId: string
): Promise<void> {
    const room = await getBattleRoom(roomId);
    if (!room) return;

    // 연결 끊긴 플레이어 표시
    await updatePlayerState(roomId, playerId, {
        connected: false
    });

    // 10초 후에도 재연결 안되면 자동 패배
    setTimeout(async () => {
        const updatedRoom = await getBattleRoom(roomId);
        if (!updatedRoom) return;

        const isPlayer1 = updatedRoom.player1.playerId === playerId;
        const player = isPlayer1 ? updatedRoom.player1 : updatedRoom.player2;

        if (!player.connected) {
            await handleTimeout(roomId, playerId);
        }
    }, 10000);
}

/**
 * 보상 계산 및 지급
 */
export async function processBattleRewards(
    roomId: string,
    winnerId: string
): Promise<BattleResult | null> {
    const room = await getBattleRoom(roomId);
    if (!room) return null;

    const isPlayer1Winner = room.player1.playerId === winnerId;
    const winner = isPlayer1Winner ? room.player1 : room.player2;
    const loser = isPlayer1Winner ? room.player2 : room.player1;

    // 카드 교환 (승자는 패자의 일반 카드 5장 획득)
    const { cardsGained, cardsLost } = await transferCards(
        winner.playerId,
        loser.playerId
    );

    // 코인 및 경험치 보상
    const winnerRewards = calculateWinnerRewards(room.battleMode);
    const loserRewards = calculateLoserRewards(room.battleMode);

    // 승자 보상 지급
    if (winner.playerId === getGameState().userId) {
        const state = getGameState();
        updateGameState({
            coins: state.coins + winnerRewards.coins,
            experience: state.experience + winnerRewards.experience
        });
    }

    // 패자 보상 지급 (위로 보상)
    if (loser.playerId === getGameState().userId) {
        const state = getGameState();
        updateGameState({
            coins: state.coins + loserRewards.coins,
            experience: state.experience + loserRewards.experience
        });
    }

    const result: BattleResult = {
        roomId,
        winnerId: winner.playerId,
        loserId: loser.playerId,
        battleMode: room.battleMode,
        rounds: room.currentRound,
        winnerScore: winner.wins,
        loserScore: loser.wins,
        rewards: {
            winner: {
                coins: winnerRewards.coins,
                experience: winnerRewards.experience,
                cardsGained
            },
            loser: {
                coins: loserRewards.coins,
                experience: loserRewards.experience,
                cardsLost
            }
        },
        timestamp: Date.now()
    };

    return result;
}

/**
 * 카드 교환 (승자 ← 패자)
 */
async function transferCards(
    winnerId: string,
    loserId: string
): Promise<{ cardsGained: Card[]; cardsLost: Card[] }> {
    // 실제 구현에서는 Firebase에서 카드 데이터를 가져와야 함
    // 여기서는 로컬 스토리지 기반으로 구현

    const state = getGameState();
    const myCards = state.cards || [];

    // 패자의 일반 카드 중 5장 랜덤 선택
    const transferableCards = myCards.filter(
        card => card.rarity === 'common' || card.rarity === 'rare'
    );

    const cardsToTransfer: Card[] = [];
    const numToTransfer = Math.min(5, transferableCards.length);

    for (let i = 0; i < numToTransfer; i++) {
        const randomIndex = Math.floor(Math.random() * transferableCards.length);
        cardsToTransfer.push(transferableCards[randomIndex]);
        transferableCards.splice(randomIndex, 1);
    }

    // 현재 플레이어가 패자인 경우 카드 제거
    if (loserId === state.userId) {
        const remainingCards = myCards.filter(
            card => !cardsToTransfer.find(c => c.id === card.id)
        );
        updateGameState({ cards: remainingCards });
    }

    // 현재 플레이어가 승자인 경우 카드 추가
    if (winnerId === state.userId) {
        updateGameState({ cards: [...myCards, ...cardsToTransfer] });
    }

    return {
        cardsGained: winnerId === state.userId ? cardsToTransfer : [],
        cardsLost: loserId === state.userId ? cardsToTransfer : []
    };
}

/**
 * 승자 보상 계산
 */
function calculateWinnerRewards(mode: RealtimeBattleMode): { coins: number; experience: number } {
    switch (mode) {
        case 'sudden-death':
            return { coins: 200, experience: 50 };
        case 'tactics':
            return { coins: 500, experience: 100 };
        case 'ambush':
            return { coins: 800, experience: 150 };
        default:
            return { coins: 200, experience: 50 };
    }
}

/**
 * 패자 보상 계산 (위로 보상)
 */
function calculateLoserRewards(mode: RealtimeBattleMode): { coins: number; experience: number } {
    switch (mode) {
        case 'sudden-death':
            return { coins: 50, experience: 10 };
        case 'tactics':
            return { coins: 100, experience: 20 };
        case 'ambush':
            return { coins: 150, experience: 30 };
        default:
            return { coins: 50, experience: 10 };
    }
}

/**
 * 다음 페이즈로 진행
 */
export async function advancePhase(roomId: string): Promise<void> {
    const room = await getBattleRoom(roomId);
    if (!room) return;

    let nextPhase = room.phase;

    switch (room.phase) {
        case 'waiting':
            nextPhase = 'selection';
            break;
        case 'selection':
            nextPhase = 'reveal';
            break;
        case 'reveal':
            nextPhase = 'ordering';
            break;
        case 'ordering':
            nextPhase = 'combat';
            break;
        case 'combat':
            // 승리 조건 확인
            const winnerId = checkVictory(room);
            if (winnerId) {
                nextPhase = 'finished';
                await updateBattleRoom(roomId, {
                    phase: nextPhase,
                    winner: winnerId,
                    finished: true,
                    phaseStartedAt: Date.now()
                });
                await processBattleRewards(roomId, winnerId);
                return;
            }
            // 다음 라운드
            nextPhase = 'combat';
            break;
    }

    await updateBattleRoom(roomId, {
        phase: nextPhase,
        phaseStartedAt: Date.now()
    });
}

/**
 * 양쪽 플레이어 준비 확인
 */
export function areBothPlayersReady(room: BattleRoom): boolean {
    return room.player1.ready && room.player2.ready;
}
