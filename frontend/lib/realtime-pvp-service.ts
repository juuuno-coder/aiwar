// Firebase Realtime Database 서비스 for 실시간 PvP

import {
    getDatabase,
    ref,
    set,
    get,
    update,
    remove,
    onValue,
    off,
    push,
    query,
    orderByChild,
    equalTo,
    limitToFirst,
    serverTimestamp,
    onDisconnect
} from 'firebase/database';
import {
    MatchmakingQueue,
    BattleRoom,
    PlayerState,
    RealtimeBattleMode,
    MatchResult,
    BattlePhase
} from './realtime-pvp-types';
import { Card } from './types';
import { getGameState } from './game-state';

const db = getDatabase();

// ==================== 매칭 시스템 ====================

/**
 * 매칭 큐에 참가
 */
export async function joinMatchmaking(
    battleMode: RealtimeBattleMode,
    playerName: string,
    playerLevel: number,
    deckPower: number
): Promise<{ success: boolean; message: string }> {
    try {
        const state = getGameState();
        const playerId = state.userId || 'guest';

        const queueEntry: MatchmakingQueue = {
            playerId,
            playerName,
            playerLevel,
            deckPower,
            battleMode,
            joinedAt: Date.now(),
            status: 'waiting'
        };

        // 큐에 추가
        const queueRef = ref(db, `matchmaking/${battleMode}/${playerId}`);
        await set(queueRef, queueEntry);

        // 연결 끊김 시 자동 제거
        onDisconnect(queueRef).remove();

        return { success: true, message: '매칭 대기 중...' };
    } catch (error) {
        console.error('Failed to join matchmaking:', error);
        return { success: false, message: '매칭 참가 실패' };
    }
}

/**
 * 매칭 큐에서 이탈
 */
export async function leaveMatchmaking(
    battleMode: RealtimeBattleMode,
    playerId: string
): Promise<void> {
    const queueRef = ref(db, `matchmaking/${battleMode}/${playerId}`);
    await remove(queueRef);
}

/**
 * 매칭 상대 찾기 (레벨 기반)
 */
export async function findMatch(
    battleMode: RealtimeBattleMode,
    myPlayerId: string,
    myLevel: number
): Promise<MatchResult> {
    try {
        const queueRef = ref(db, `matchmaking/${battleMode}`);
        const snapshot = await get(queueRef);

        if (!snapshot.exists()) {
            return { success: false, message: '대기 중인 플레이어가 없습니다.' };
        }

        const players = snapshot.val();

        // 자신을 제외하고 레벨이 비슷한 플레이어 찾기 (±5 레벨)
        for (const [playerId, player] of Object.entries(players) as [string, MatchmakingQueue][]) {
            if (playerId === myPlayerId) continue;
            if (player.status === 'matched') continue;

            const levelDiff = Math.abs(player.playerLevel - myLevel);
            if (levelDiff <= 5) {
                // 매칭 성공! 전투 방 생성
                const roomId = await createBattleRoom(battleMode, myPlayerId, playerId);

                // 두 플레이어 모두 매칭 상태로 변경
                await update(ref(db, `matchmaking/${battleMode}/${myPlayerId}`), { status: 'matched' });
                await update(ref(db, `matchmaking/${battleMode}/${playerId}`), { status: 'matched' });

                return {
                    success: true,
                    roomId,
                    opponentId: playerId,
                    opponentName: player.playerName
                };
            }
        }

        return { success: false, message: '적합한 상대를 찾지 못했습니다.' };
    } catch (error) {
        console.error('Failed to find match:', error);
        return { success: false, message: '매칭 실패' };
    }
}

/**
 * 매칭 리스너 (자동 매칭)
 */
export function listenForMatch(
    battleMode: RealtimeBattleMode,
    playerId: string,
    onMatch: (result: MatchResult) => void
): () => void {
    const queueRef = ref(db, `matchmaking/${battleMode}/${playerId}`);

    const unsubscribe = onValue(queueRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val() as MatchmakingQueue;
            if (data.status === 'matched') {
                // 매칭 성공 - 전투 방 찾기
                findBattleRoomForPlayer(playerId).then((roomId) => {
                    if (roomId) {
                        onMatch({ success: true, roomId });
                    }
                });
            }
        }
    });

    return () => off(queueRef);
}

// ==================== 전투 방 관리 ====================

/**
 * 전투 방 생성
 */
async function createBattleRoom(
    battleMode: RealtimeBattleMode,
    player1Id: string,
    player2Id: string
): Promise<string> {
    const roomsRef = ref(db, 'battles');
    const newRoomRef = push(roomsRef);
    const roomId = newRoomRef.key!;

    const state = getGameState();

    // 전투 설정
    const config = getBattleConfig(battleMode);

    const room: BattleRoom = {
        roomId,
        battleMode,
        phase: 'waiting',
        player1: createEmptyPlayerState(player1Id, state.username || 'Player 1', state.level),
        player2: createEmptyPlayerState(player2Id, 'Player 2', 1), // 상대 정보는 나중에 업데이트
        currentRound: 0,
        maxRounds: config.maxRounds,
        winsNeeded: config.winsNeeded,
        phaseStartedAt: Date.now(),
        phaseTimeout: 30,
        finished: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    await set(newRoomRef, room);

    // 5분 후 자동 삭제 설정
    setTimeout(() => {
        cleanupBattleRoom(roomId);
    }, 5 * 60 * 1000);

    return roomId;
}

/**
 * 플레이어의 전투 방 찾기
 */
async function findBattleRoomForPlayer(playerId: string): Promise<string | null> {
    const roomsRef = ref(db, 'battles');
    const snapshot = await get(roomsRef);

    if (!snapshot.exists()) return null;

    const rooms = snapshot.val();
    for (const [roomId, room] of Object.entries(rooms) as [string, BattleRoom][]) {
        if (room.player1.playerId === playerId || room.player2.playerId === playerId) {
            return roomId;
        }
    }

    return null;
}

/**
 * 전투 방 정보 가져오기
 */
export async function getBattleRoom(roomId: string): Promise<BattleRoom | null> {
    const roomRef = ref(db, `battles/${roomId}`);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) return null;
    return snapshot.val() as BattleRoom;
}

/**
 * 전투 방 상태 업데이트
 */
export async function updateBattleRoom(
    roomId: string,
    updates: Partial<BattleRoom>
): Promise<void> {
    const roomRef = ref(db, `battles/${roomId}`);
    await update(roomRef, {
        ...updates,
        updatedAt: Date.now()
    });
}

/**
 * 플레이어 상태 업데이트
 */
export async function updatePlayerState(
    roomId: string,
    playerId: string,
    updates: Partial<PlayerState>
): Promise<void> {
    const room = await getBattleRoom(roomId);
    if (!room) return;

    const isPlayer1 = room.player1.playerId === playerId;
    const playerKey = isPlayer1 ? 'player1' : 'player2';

    const roomRef = ref(db, `battles/${roomId}/${playerKey}`);
    await update(roomRef, updates);
}

/**
 * 전투 방 리스너
 */
export function listenToBattleRoom(
    roomId: string,
    onUpdate: (room: BattleRoom) => void
): () => void {
    const roomRef = ref(db, `battles/${roomId}`);

    const unsubscribe = onValue(roomRef, (snapshot) => {
        if (snapshot.exists()) {
            onUpdate(snapshot.val() as BattleRoom);
        }
    });

    return () => off(roomRef);
}

/**
 * 전투 방 정리
 */
export async function cleanupBattleRoom(roomId: string): Promise<void> {
    const roomRef = ref(db, `battles/${roomId}`);
    const room = await getBattleRoom(roomId);

    if (room && room.finished) {
        // 매칭 큐에서도 제거
        await leaveMatchmaking(room.battleMode, room.player1.playerId);
        await leaveMatchmaking(room.battleMode, room.player2.playerId);

        // 방 삭제
        await remove(roomRef);
    }
}

// ==================== 헬퍼 함수 ====================

function createEmptyPlayerState(
    playerId: string,
    playerName: string,
    playerLevel: number
): PlayerState {
    return {
        playerId,
        playerName,
        playerLevel,
        selectedCards: [],
        cardOrder: [],
        ready: false,
        wins: 0,
        roundResults: [],
        connected: true,
        lastHeartbeat: Date.now()
    };
}

function getBattleConfig(mode: RealtimeBattleMode) {
    switch (mode) {
        case 'sudden-death':
            return { maxRounds: 1, winsNeeded: 1 };
        case 'tactics':
        case 'ambush':
            return { maxRounds: 5, winsNeeded: 3 };
        default:
            return { maxRounds: 5, winsNeeded: 3 };
    }
}

// ==================== 하트비트 (연결 유지) ====================

/**
 * 하트비트 전송
 */
export async function sendHeartbeat(roomId: string, playerId: string): Promise<void> {
    await updatePlayerState(roomId, playerId, {
        lastHeartbeat: Date.now(),
        connected: true
    });
}

/**
 * 연결 끊김 감지
 */
export function checkPlayerConnection(player: PlayerState): boolean {
    const now = Date.now();
    const timeSinceHeartbeat = now - player.lastHeartbeat;
    return timeSinceHeartbeat < 10000; // 10초 이내
}
