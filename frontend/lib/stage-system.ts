// 대전 모드 스테이지 시스템
// 챕터별 난이도 진행, 다양한 전투 방식

// ============================================
// 스테이지 설정
// ============================================

// 적 AI 패턴 타입
export type EnemyPattern = 'predictable' | 'semi-predictable' | 'random';

// 적 타입
export type EnemyType = 'bad-ai' | 'bug' | 'hallucination';

// ============================================
// 스테이지별 고정 적 덱 패턴
// rock(보)을 scissors(가위)가 이김, scissors를 paper(주먹)가 이김, paper를 rock이 이김
// 게임 타입: EFFICIENCY(rock), CREATIVITY(paper), FUNCTION(scissors)
// ============================================
type EnemyAttribute = 'rock' | 'paper' | 'scissors';

/**
 * 스테이지별 고정 적 덱 패턴 반환
 * 스테이지 1-1: 보보보보보 (rock x5) - 가위 하나만 있어도 승리
 * 스테이지 1-4: 보보보보가위 - 전술승부도 쉬움
 * 점진적으로 난이도 상승
 */
export function getStageEnemyDeck(stageId: string): EnemyAttribute[] {
    const deckPatterns: Record<string, EnemyAttribute[]> = {
        // 챕터 1: 기초 훈련
        'stage-1-1': ['rock', 'rock', 'rock', 'rock', 'rock'],           // 전부 보 - 가위만 있으면 승리
        'stage-1-2': ['rock', 'rock', 'rock', 'rock', 'scissors'],       // 보4 가위1 - 여전히 쉬움
        'stage-1-3': ['rock', 'rock', 'rock', 'paper', 'scissors'],      // 보3 바위1 가위1
        'stage-1-4': ['rock', 'rock', 'rock', 'rock', 'scissors'],       // 보4 가위1 (3장 모드 시작)
        'stage-1-5': ['rock', 'rock', 'rock', 'paper', 'scissors'],      // 보3 바위1 가위1
        'stage-1-6': ['rock', 'rock', 'paper', 'paper', 'scissors'],     // 보2 바위2 가위1
        'stage-1-7': ['rock', 'rock', 'paper', 'scissors', 'scissors'],  // 보2 바위1 가위2
        'stage-1-8': ['rock', 'paper', 'paper', 'scissors', 'scissors'], // 보1 바위2 가위2
        'stage-1-9': ['rock', 'paper', 'paper', 'scissors', 'scissors'], // 보1 바위2 가위2
        'stage-1-10': ['rock', 'paper', 'paper', 'scissors', 'scissors'], // 보스: 균형

        // 챕터 2: 침투
        'stage-2-1': ['rock', 'rock', 'paper', 'paper', 'scissors'],
        'stage-2-2': ['rock', 'paper', 'paper', 'scissors', 'scissors'],
        'stage-2-3': ['rock', 'paper', 'scissors', 'scissors', 'scissors'],
        'stage-2-4': ['rock', 'rock', 'paper', 'scissors', 'scissors'],
        'stage-2-5': ['paper', 'paper', 'scissors', 'scissors', 'rock'],
        'stage-2-6': ['rock', 'paper', 'paper', 'scissors', 'scissors'],
        'stage-2-7': ['paper', 'paper', 'paper', 'scissors', 'scissors'],
        'stage-2-8': ['rock', 'paper', 'scissors', 'scissors', 'scissors'],
        'stage-2-9': ['paper', 'paper', 'scissors', 'scissors', 'scissors'],
        'stage-2-10': ['rock', 'paper', 'paper', 'scissors', 'scissors'], // 보스

        // 챕터 3: 반격
        'stage-3-1': ['paper', 'paper', 'scissors', 'scissors', 'rock'],
        'stage-3-2': ['rock', 'paper', 'paper', 'scissors', 'scissors'],
        'stage-3-3': ['rock', 'rock', 'paper', 'scissors', 'scissors'],
        'stage-3-4': ['paper', 'paper', 'paper', 'scissors', 'scissors'],
        'stage-3-5': ['rock', 'paper', 'scissors', 'scissors', 'scissors'],
        'stage-3-6': ['rock', 'paper', 'paper', 'scissors', 'scissors'],
        'stage-3-7': ['paper', 'scissors', 'scissors', 'scissors', 'rock'],
        'stage-3-8': ['rock', 'paper', 'paper', 'scissors', 'scissors'],
        'stage-3-9': ['paper', 'paper', 'scissors', 'scissors', 'scissors'],
        'stage-3-10': ['rock', 'paper', 'paper', 'scissors', 'scissors'], // 최종보스
    };

    return deckPatterns[stageId] || ['rock', 'paper', 'paper', 'scissors', 'scissors'];
}

export interface Enemy {
    id: string;
    name: string;
    power: number;
    attribute: 'rock' | 'paper' | 'scissors';
    type: EnemyType;
    isGlitchy?: boolean; // 버그: 속성이 바뀔 수 있음
    isHidden?: boolean;   // 할루시네이션: 공개 전까지 미분석
}

export interface StageConfig {
    stageId: number;
    chapter: number;                           // 챕터
    playerHandSize: number;                    // 덱 구성 시 선택 카드 수
    battleCardCount: 1 | 3 | 5;                // 전투 라운드/유닛 수
    enemyPowerBonus: number;                   // 적 파워 보너스 (%)
    rewardMultiplier: number;                  // 보상 배율
    isBoss: boolean;                           // 보스 여부
    bossBuffs?: string[];                      // 보스 버프
    enemyPattern: EnemyPattern;                // AI 패턴
    stageInChapter: number;                    // 챕터 내 번호
    description: string;                       // 설명
    asymmetricMatchup?: { p: number; e: number }; // 비대칭 매치업 (예: 2 vs 5)
}

/**
 * 스테이지 설정 계산
 * 
 * 챕터 1 (1-10): 튜토리얼
 *   - 1-3: 2장 중 1장 단판, 적 예측 가능
 *   - 4-9: 3장 중 1장 단판, 적 반예측
 *   - 10: 5장 중 1장 단판 보스, 반랜덤
 * 
 * 챕터 2 (11-20): 3장 전투 도입
 *   - 11-14: 5장 중 3장 (2승제)
 *   - 15: 5장 중 1장 단판 보스
 *   - 16-19: 5장 중 3장 (2승제) 랜덤
 *   - 20: 5장 중 5장 (3승제) 보스
 * 
 * 챕터 3+ (21+): 혼합 전투
 *   - 일반: 5장 중 3장
 *   - 중간 보스 (5단위): 5장 중 1장 단판
 *   - 최종 보스 (10단위): 5장 중 5장
 */
export function getStageConfig(stageId: number): StageConfig {
    const chapter = Math.ceil(stageId / 10);
    const stageInChapter = ((stageId - 1) % 10) + 1; // 1-10

    const isFinalBoss = stageInChapter === 10;
    const isMidBoss = stageInChapter === 5;
    const isBoss = isFinalBoss || isMidBoss;

    let playerHandSize: number;
    let battleCardCount: 1 | 3 | 5;
    let enemyPattern: EnemyPattern;
    let description: string;
    let enemyPowerBonus: number;
    let rewardMultiplier: number;

    // ============================================
    // 챕터 1: 튜토리얼 (스테이지 1-10)
    // ============================================
    if (chapter === 1) {
        // 스토리 시스템의 설정을 따르기 위해 기본값 확장
        playerHandSize = 5; // PvP 아레나와 동일하게 5장 핸드 제공
        battleCardCount = 5; // 기본적으로 5라운드(또는 방식에 따른 최대치) 지원
        enemyPattern = stageInChapter <= 5 ? 'predictable' : 'semi-predictable';
        description = isFinalBoss ? '챕터 1 보스: 단판 승부' : '전술 학습 단계';

        enemyPowerBonus = 0;
        rewardMultiplier = 1.0;
    }
    // ============================================
    // 챕터 2: 3장 전투 도입 (스테이지 11-20)
    // ============================================
    else if (chapter === 2) {
        if (isMidBoss) {
            // 스테이지 15: 중간 보스
            playerHandSize = 5;
            battleCardCount = 1;
            enemyPattern = 'random';
            description = '중간 보스: 5장 중 1장 단판';
        } else if (isFinalBoss) {
            // 스테이지 20: 챕터 2 보스
            playerHandSize = 5;
            battleCardCount = 5;
            enemyPattern = 'random';
            description = '챕터 2 보스: 5장 전투 3승제';
        } else {
            // 일반 스테이지: 3장 전투
            playerHandSize = 5;
            battleCardCount = 3;
            enemyPattern = stageInChapter <= 4 ? 'semi-predictable' : 'random';
            description = '3장 전투: 5장 중 3장 선택 2승제';
        }
        enemyPowerBonus = 10;
        rewardMultiplier = 1.5;
    }
    // ============================================
    // 챕터 3+: 혼합 전투
    // ============================================
    else {
        playerHandSize = 5; // 기본 5장 (double/ambush는 6장으로 자동 확장됨)
        if (isMidBoss) {
            // 중간 보스: 1장 단판
            battleCardCount = 1;
            enemyPattern = 'random';
            description = '중간 보스: 단판 승부';
        } else if (isFinalBoss) {
            // 최종 보스: 5장 전투
            battleCardCount = 5;
            enemyPattern = 'random';
            description = '최종 보스: 단판 승부';
        } else {
            // 일반: 3장 전투
            battleCardCount = 5; // 5라운드 기본
            enemyPattern = 'random';
            description = '고급 전략 전투';
        }

        // 챕터별 난이도 상승 (챕터 3은 더 강력하게)
        enemyPowerBonus = 15 + (chapter - 3) * 10;
        rewardMultiplier = 2.0 + (chapter - 3) * 1.0;
    }

    // 보스 추가 효과
    const bossBuffs: string[] = [];
    if (isBoss) {
        enemyPowerBonus += isFinalBoss ? 20 : 10;
        rewardMultiplier *= isFinalBoss ? 2.0 : 1.5;

        if (chapter >= 2) bossBuffs.push('강화된 AI');
        if (chapter >= 3) bossBuffs.push('상성 분석');
        if (chapter >= 4) bossBuffs.push('전투력 +15%');
        if (chapter >= 5) bossBuffs.push('회복 능력');
    }

    // 비대칭 매치업 로직 (특수 스테이지)
    let asymmetricMatchup: { p: number; e: number } | undefined;
    if (isBoss) {
        if (isFinalBoss) asymmetricMatchup = { p: 5, e: 5 }; // 최종 보스는 5:5
        else asymmetricMatchup = { p: 2, e: 5 };              // 중간 보스(5, 15, 25...)는 2 vs 5 시나리오
    }

    return {
        stageId,
        chapter,
        stageInChapter,
        playerHandSize,
        battleCardCount,
        enemyPowerBonus,
        rewardMultiplier,
        isBoss,
        bossBuffs: isBoss ? bossBuffs : undefined,
        enemyPattern,
        description,
        asymmetricMatchup
    };
}

// 적 생성
// ============================================
// 유실 방지를 위한 Enemy 인터페이스 통합 (상단에 정의된 것 사용)

const ENEMY_FACTIONS = [
    'chatgpt', 'gemini', 'claude', 'grok',
    'midjourney', 'dalle', 'stable-diffusion',
    'sora', 'runway', 'kling'
];

const ENEMY_NAMES = [
    '정찰 유닛', '전투 드론', '보안 프로토콜', '공격 알고리즘',
    '방어 매트릭스', '전술 AI', '사이버 워리어', '데이터 센티넬',
    '네트워크 가디언', '코어 프로세서'
];

/**
 * 스테이지에 맞는 적 생성
 * @param stageConfig 스테이지 설정
 * @param playerAvgPower 플레이어 평균 전투력
 * @param stageId 스테이지 ID (예: 'stage-1-1') - 고정 덱 패턴 사용시
 */
export function generateEnemies(stageConfig: StageConfig, playerAvgPower: number, stageId?: string): Enemy[] {
    const enemies: Enemy[] = [];
    // 초반 스테이지는 적 파워를 낮게 설정
    const chapterMultiplier = stageConfig.chapter === 1 ? 0.5 : 1;
    const basePower = playerAvgPower * (1 + stageConfig.enemyPowerBonus / 100) * chapterMultiplier;

    // 스테이지별 고정 덱 패턴 사용
    const fixedDeck = stageId ? getStageEnemyDeck(stageId) : null;

    // 적은 무조건 5기
    const count = 5;

    for (let i = 0; i < count; i++) {
        // 파워에 약간의 랜덤 변동 (±10%)
        const powerVariance = 0.9 + Math.random() * 0.2;
        const powerValue = Math.round(basePower * powerVariance);

        // 적 타입 결정 (챕터 1은 모두 일반)
        let type: EnemyType = 'bad-ai';
        if (stageConfig.chapter >= 2) {
            const rand = Math.random();
            if (rand > 0.8) type = 'bug';
            else if (rand > 0.6) type = 'hallucination';
        }
        if (stageConfig.isBoss) {
            type = i === 0 ? 'hallucination' : 'bug';
        }

        // 속성: 고정 덱이 있으면 사용, 없으면 랜덤
        const attribute = fixedDeck ? fixedDeck[i] : (['rock', 'paper', 'scissors'] as const)[Math.floor(Math.random() * 3)];

        enemies.push({
            id: `enemy-${stageConfig.stageId}-${i}`,
            name: stageConfig.isBoss && i === 0
                ? `보스: ${ENEMY_NAMES[stageConfig.stageInChapter % ENEMY_NAMES.length]}`
                : ENEMY_NAMES[Math.floor(Math.random() * ENEMY_NAMES.length)],
            power: powerValue,
            attribute,
            type,
            isGlitchy: type === 'bug',
            isHidden: type === 'hallucination'
        });
    }
    return enemies;
}

// ============================================
// 전투 결과 계산
// ============================================
export interface BattleRound {
    playerCard: { name: string; power: number; attribute: string };
    enemyCard: { name: string; power: number; attribute: string };
    attributeBonus: number; // -30, 0, +30
    playerFinalPower: number;
    enemyFinalPower: number;
    winner: 'player' | 'enemy' | 'draw';
}

export interface StageBattleResult {
    rounds: BattleRound[];
    playerWins: number;
    enemyWins: number;
    result: 'victory' | 'defeat';
    rewards: {
        coins: number;
        exp: number;
    };
}

/**
 * 상성 보너스 계산
 */
function getAttributeBonus(player: string, enemy: string): number {
    // rock > scissors > paper > rock
    if (
        (player === 'rock' && enemy === 'scissors') ||
        (player === 'scissors' && enemy === 'paper') ||
        (player === 'paper' && enemy === 'rock')
    ) {
        return 30; // 30% 보너스
    }
    if (
        (enemy === 'rock' && player === 'scissors') ||
        (enemy === 'scissors' && player === 'paper') ||
        (enemy === 'paper' && player === 'rock')
    ) {
        return -30; // 30% 페널티
    }
    return 0;
}

/**
 * 스테이지 전투 시뮬레이션
 * 전투 승패 결정: 1) 상성 우선 (확정 승패), 2) 동률 시 전투력 비교
 */
export function simulateStageBattle(
    playerCards: { name: string; power: number; attribute: string }[],
    enemies: Enemy[],
    stageConfig: StageConfig
): StageBattleResult {
    const rounds: BattleRound[] = [];
    let playerWins = 0;
    let enemyWins = 0;

    const roundCount = stageConfig.battleCardCount;
    const winsNeeded = Math.ceil(roundCount / 2);

    const playerUnits = [...playerCards];
    const enemyUnits = [...enemies];

    // 비대칭 매치업 처리: 유닛 수가 다를 경우 순차적 서바이벌 매치
    // 플레이어나 적 유닛이 모두 소진될 때까지 계속 대결
    let pIdx = 0;
    let eIdx = 0;

    while (pIdx < playerUnits.length && eIdx < enemyUnits.length) {
        const playerCard = playerUnits[pIdx];
        const enemyCard = enemyUnits[eIdx];

        // 적 타입별 특성 적용
        let currentEnemyAttr = enemyCard.attribute;
        let enemyEffectivePower = enemyCard.power;

        if (enemyCard.type === 'bug' && Math.random() > 0.7) {
            // 버그: 속성이 랜덤하게 바뀜
            currentEnemyAttr = (['rock', 'paper', 'scissors'] as const)[Math.floor(Math.random() * 3)];
        }

        if (enemyCard.type === 'hallucination' && Math.random() > 0.5) {
            // 할루시네이션: 전투 직전 파워가 왜곡됨
            enemyEffectivePower *= (0.8 + Math.random() * 0.4);
        }

        const attributeBonus = getAttributeBonus(playerCard.attribute, currentEnemyAttr);

        let winner: 'player' | 'enemy' | 'draw';

        if (attributeBonus > 0) winner = 'player';
        else if (attributeBonus < 0) winner = 'enemy';
        else {
            if (playerCard.power > enemyEffectivePower) winner = 'player';
            else if (playerCard.power < enemyEffectivePower) winner = 'enemy';
            else winner = 'draw';
        }

        rounds.push({
            playerCard: { ...playerCard },
            enemyCard: { ...enemyCard, attribute: currentEnemyAttr, power: Math.round(enemyEffectivePower) },
            attributeBonus,
            playerFinalPower: playerCard.power,
            enemyFinalPower: Math.round(enemyEffectivePower),
            winner
        });

        if (winner === 'player') {
            playerWins++;
            eIdx++; // 적 유닛 소멸, 다음 적 소환
        } else if (winner === 'enemy') {
            enemyWins++;
            pIdx++; // 우리 유닛 소멸, 다음 아군 소환
        } else {
            // 동률 시 둘 다 소멸하거나 유지 (여기서는 둘 다 다음으로)
            pIdx++;
            eIdx++;
        }
    }

    const result = playerWins >= winsNeeded ? 'victory' : 'defeat';

    // 적 유닛 생성 (항상 5명으로 고정 - 사용자 요청)
    const enemyCount = 5;

    // 보상 계산
    const baseCoins = 50 + stageConfig.stageId * 10;
    const baseExp = 10 + stageConfig.stageId * 2;

    const rewards = {
        coins: result === 'victory' ? Math.round(baseCoins * stageConfig.rewardMultiplier) : Math.round(baseCoins * 0.2),
        exp: result === 'victory' ? Math.round(baseExp * stageConfig.rewardMultiplier) : Math.round(baseExp * 0.3)
    };

    return {
        rounds,
        playerWins,
        enemyWins,
        result,
        rewards
    };
}

// ============================================
// 스테이지 진행 상태
// ============================================
export interface StageProgress {
    currentStage: number;
    highestCleared: number;
    totalVictories: number;
    totalDefeats: number;
}

export function createInitialStageProgress(): StageProgress {
    return {
        currentStage: 1,
        highestCleared: 0,
        totalVictories: 0,
        totalDefeats: 0
    };
}
