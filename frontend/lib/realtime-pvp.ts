// 실시간 PvP 매칭 시스템
// Firebase Realtime Database 또는 Firestore를 사용하여 실시간 매칭을 구현합니다.

import { db, isFirebaseConfigured } from './firebase';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { Card } from './types';
import { getCurrentUser } from './auth-utils';

export interface MatchmakingPlayer {
    odId: string;
    odername: string;
    odkname: string;
    rating: number;
    deck: Card[];
    searchingAt: Timestamp;
    status: 'searching' | 'matched' | 'in_game';
    matchedWith?: string;
    matchId?: string;
}

export interface PvPMatch {
    id: string;
    player1: MatchmakingPlayer;
    player2: MatchmakingPlayer;
    status: 'waiting' | 'placement' | 'battling' | 'finished';
    currentRound: number;
    player1Order?: number[];
    player2Order?: number[];
    results?: any[];
    winner?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

const MATCHMAKING_COLLECTION = 'matchmaking_queue';
const MATCHES_COLLECTION = 'pvp_matches';
const RATING_RANGE = 200; // 매칭 레이팅 범위

// 매칭 대기열에 등록
export async function joinMatchmaking(deck: Card[]): Promise<string | null> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase not configured for matchmaking');
        return null;
    }

    const user = getCurrentUser();
    if (!user) {
        console.warn('User not logged in');
        return null;
    }

    // PvP 스탯 가져오기
    const pvpStats = JSON.parse(localStorage.getItem('pvp_stats') || '{}');
    const rating = pvpStats.currentRating || 1000;

    const playerId = user.id;
    const playerRef = doc(db, MATCHMAKING_COLLECTION, playerId);

    const playerData: Omit<MatchmakingPlayer, 'searchingAt'> & { searchingAt: any } = {
        odId: playerId,
        odername: user.username,
        odkname: user.nickname || user.username,
        rating,
        deck,
        status: 'searching',
        searchingAt: serverTimestamp()
    };

    await setDoc(playerRef, playerData);

    return playerId;
}

// 매칭 대기열에서 나가기
export async function leaveMatchmaking(): Promise<void> {
    if (!isFirebaseConfigured || !db) return;

    const user = getCurrentUser();
    if (!user) return;

    const playerRef = doc(db, MATCHMAKING_COLLECTION, user.id);
    await deleteDoc(playerRef);
}

// 매칭 상대 찾기
export async function findMatch(): Promise<MatchmakingPlayer | null> {
    if (!isFirebaseConfigured || !db) return null;

    const user = getCurrentUser();
    if (!user) return null;

    const pvpStats = JSON.parse(localStorage.getItem('pvp_stats') || '{}');
    const myRating = pvpStats.currentRating || 1000;

    // 비슷한 레이팅의 플레이어 찾기
    const queueRef = collection(db, MATCHMAKING_COLLECTION);
    const q = query(
        queueRef,
        where('status', '==', 'searching'),
        orderBy('searchingAt', 'asc'),
        limit(10)
    );

    const snapshot = await getDocs(q);

    for (const docSnap of snapshot.docs) {
        const player = docSnap.data() as MatchmakingPlayer;

        // 자기 자신 제외
        if (player.odId === user.id) continue;

        // 레이팅 범위 체크
        if (Math.abs(player.rating - myRating) <= RATING_RANGE) {
            return player;
        }
    }

    return null;
}

// 매치 생성
export async function createMatch(opponent: MatchmakingPlayer, myDeck: Card[]): Promise<string | null> {
    if (!isFirebaseConfigured || !db) return null;

    const user = getCurrentUser();
    if (!user) return null;

    const pvpStats = JSON.parse(localStorage.getItem('pvp_stats') || '{}');
    const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const match: Omit<PvPMatch, 'createdAt' | 'updatedAt'> & { createdAt: any, updatedAt: any } = {
        id: matchId,
        player1: {
            odId: user.id,
            odername: user.username,
            odkname: user.nickname || user.username,
            rating: pvpStats.currentRating || 1000,
            deck: myDeck,
            searchingAt: Timestamp.now(),
            status: 'matched',
            matchId
        },
        player2: {
            ...opponent,
            status: 'matched',
            matchId
        },
        status: 'placement',
        currentRound: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    const matchRef = doc(db, MATCHES_COLLECTION, matchId);
    await setDoc(matchRef, match);

    // 매칭 대기열에서 양 플레이어 업데이트
    const player1Ref = doc(db, MATCHMAKING_COLLECTION, user.id);
    const player2Ref = doc(db, MATCHMAKING_COLLECTION, opponent.odId);

    await setDoc(player1Ref, { status: 'matched', matchId }, { merge: true });
    await setDoc(player2Ref, { status: 'matched', matchId }, { merge: true });

    return matchId;
}

// 매치 상태 구독
export function subscribeToMatch(matchId: string, callback: (match: PvPMatch | null) => void): () => void {
    if (!isFirebaseConfigured || !db) {
        callback(null);
        return () => { };
    }

    const matchRef = doc(db, MATCHES_COLLECTION, matchId);

    return onSnapshot(matchRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data() as PvPMatch);
        } else {
            callback(null);
        }
    });
}

// 카드 배치 순서 제출
export async function submitPlacement(matchId: string, order: number[]): Promise<boolean> {
    if (!isFirebaseConfigured || !db) return false;

    const user = getCurrentUser();
    if (!user) return false;

    const matchRef = doc(db, MATCHES_COLLECTION, matchId);
    const matchSnap = await getDoc(matchRef);

    if (!matchSnap.exists()) return false;

    const match = matchSnap.data() as PvPMatch;
    const isPlayer1 = match.player1.odId === user.id;

    const updateData: any = {
        updatedAt: serverTimestamp()
    };

    if (isPlayer1) {
        updateData.player1Order = order;
    } else {
        updateData.player2Order = order;
    }

    // 양쪽 다 제출했는지 확인
    const currentPlayer1Order = isPlayer1 ? order : match.player1Order;
    const currentPlayer2Order = !isPlayer1 ? order : match.player2Order;

    if (currentPlayer1Order && currentPlayer2Order) {
        updateData.status = 'battling';
        updateData.currentRound = 1;
    }

    await setDoc(matchRef, updateData, { merge: true });

    return true;
}

// 매치 결과 저장
export async function saveMatchResult(matchId: string, winner: string, results: any[]): Promise<boolean> {
    if (!isFirebaseConfigured || !db) return false;

    const matchRef = doc(db, MATCHES_COLLECTION, matchId);

    await setDoc(matchRef, {
        status: 'finished',
        winner,
        results,
        updatedAt: serverTimestamp()
    }, { merge: true });

    // 매칭 대기열에서 제거
    const user = getCurrentUser();
    if (user) {
        const playerRef = doc(db, MATCHMAKING_COLLECTION, user.id);
        await deleteDoc(playerRef);
    }

    return true;
}

// 매칭 상태 구독 (대기열에서)
export function subscribeToMatchmaking(callback: (player: MatchmakingPlayer | null) => void): () => void {
    if (!isFirebaseConfigured || !db) {
        callback(null);
        return () => { };
    }

    const user = getCurrentUser();
    if (!user) {
        callback(null);
        return () => { };
    }

    const playerRef = doc(db, MATCHMAKING_COLLECTION, user.id);

    return onSnapshot(playerRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data() as MatchmakingPlayer);
        } else {
            callback(null);
        }
    });
}
