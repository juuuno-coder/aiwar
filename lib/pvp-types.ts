// PvP 시스템 타입 정의

export interface PvPPlayer {
  id: string;
  name: string;
  level: number;
  rating: number; // ELO 레이팅
  selectedCards: string[]; // 카드 ID 배열 (5장)
  totalPower: number;
}

export interface PvPMatch {
  id: string;
  player1: PvPPlayer;
  player2: PvPPlayer;
  status: 'waiting' | 'in-progress' | 'completed';
  winner?: string; // 플레이어 ID
  startTime: number;
  endTime?: number;
  rewards?: PvPRewards;
}

export interface PvPRewards {
  coins: number;
  experience: number;
  ratingChange: number;
  cards?: string[]; // 보너스 카드 ID
}

export interface PvPMatchHistory {
  matchId: string;
  opponentName: string;
  opponentLevel: number;
  result: 'win' | 'lose' | 'draw';
  ratingChange: number;
  rewards: PvPRewards;
  timestamp: number;
}

export interface PvPStats {
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  currentRating: number;
  highestRating: number;
  currentStreak: number;
  longestWinStreak: number;
}

export interface MatchmakingQueue {
  playerId: string;
  playerLevel: number;
  playerRating: number;
  queueTime: number;
}
