-- AI 대전 게임 데이터베이스 스키마

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 유저 테이블
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  nickname VARCHAR(50),
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  tokens INTEGER DEFAULT 2000,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP DEFAULT NOW()
);

-- 유저 통계
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_battles INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  win_streak INTEGER DEFAULT 0,
  max_win_streak INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  pvp_rating INTEGER DEFAULT 1000,
  rank INTEGER,
  cards_enhanced INTEGER DEFAULT 0,
  pvp_matches INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 인벤토리
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  card_data JSONB NOT NULL,
  acquired_at TIMESTAMP DEFAULT NOW()
);

-- 해금된 AI 군단
CREATE TABLE IF NOT EXISTS unlocked_factions (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  faction_id VARCHAR(50),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, faction_id)
);

-- 슬롯 배치
CREATE TABLE IF NOT EXISTS user_slots (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  slots JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 스토리 진행도
CREATE TABLE IF NOT EXISTS story_progress (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  completed_missions TEXT[] DEFAULT '{}',
  claimed_rewards TEXT[] DEFAULT '{}',
  current_chapter VARCHAR(50),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 랭킹 (매일 업데이트)
CREATE TABLE IF NOT EXISTS daily_rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rank INTEGER NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(50),
  nickname VARCHAR(50),
  pvp_rating INTEGER,
  wins INTEGER,
  level INTEGER,
  ranking_date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, ranking_date)
);

-- 대전 기록
CREATE TABLE IF NOT EXISTS battle_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  player2_id UUID,
  winner_id UUID,
  battle_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 업적 진행도
CREATE TABLE IF NOT EXISTS achievements (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(50),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  PRIMARY KEY (user_id, achievement_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_rankings_date ON daily_rankings(ranking_date, rank);
CREATE INDEX IF NOT EXISTS idx_rankings_user ON daily_rankings(user_id, ranking_date);
CREATE INDEX IF NOT EXISTS idx_inventory_user ON inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_battle_history_player ON battle_history(player1_id, created_at);

-- 랭킹 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_user_ranking()
RETURNS TRIGGER AS $$
BEGIN
  -- 랭킹 재계산
  WITH ranked_users AS (
    SELECT 
      user_id,
      ROW_NUMBER() OVER (ORDER BY pvp_rating DESC, wins DESC) as new_rank
    FROM user_stats
  )
  INSERT INTO daily_rankings (rank, user_id, username, nickname, pvp_rating, wins, level, ranking_date)
  SELECT 
    ru.new_rank,
    u.id,
    u.username,
    u.nickname,
    us.pvp_rating,
    us.wins,
    u.level,
    CURRENT_DATE
  FROM ranked_users ru
  JOIN users u ON ru.user_id = u.id
  JOIN user_stats us ON u.id = us.user_id
  ON CONFLICT (user_id, ranking_date) 
  DO UPDATE SET 
    rank = EXCLUDED.rank,
    pvp_rating = EXCLUDED.pvp_rating,
    wins = EXCLUDED.wins,
    level = EXCLUDED.level,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_ranking ON user_stats;
CREATE TRIGGER trigger_update_ranking
AFTER UPDATE OF pvp_rating, wins ON user_stats
FOR EACH ROW
EXECUTE FUNCTION update_user_ranking();

-- RLS (Row Level Security) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocked_factions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_progress ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 자신의 데이터만 조회/수정 가능
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own stats" ON user_stats
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own inventory" ON inventory
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own factions" ON unlocked_factions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own slots" ON user_slots
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own story progress" ON story_progress
  FOR ALL USING (auth.uid() = user_id);

-- 랭킹은 모두가 볼 수 있음
CREATE POLICY "Rankings are public" ON daily_rankings
  FOR SELECT USING (true);
