// 데이터 검증 및 안전 장치 유틸리티
import { GameState } from './game-storage';
import { CommanderResearch, createInitialResearchState, RESEARCH_STATS } from './research-system';
import { StageProgress } from './stage-system';

/**
 * 게임 상태 검증 및 자동 수정
 */
export function validateGameState(state: any): GameState {
    const validated: GameState = {
        coins: Math.max(0, Number(state?.coins) || 0),
        tokens: Math.max(0, Number(state?.tokens) || 0),
        level: Math.max(1, Math.min(100, Number(state?.level) || 1)),
        experience: Math.max(0, Number(state?.experience) || 0),
        inventory: Array.isArray(state?.inventory) ? state.inventory : [],
        unlockedFactions: Array.isArray(state?.unlockedFactions) ? state.unlockedFactions : [],
        slots: Array.isArray(state?.slots) ? state.slots : [],
        equipment: Array.isArray(state?.equipment) ? state.equipment : [],
        research: state?.research ? validateResearch(state.research) : undefined,
        stageProgress: state?.stageProgress ? validateStageProgress(state.stageProgress) : undefined,
        decks: Array.isArray(state?.decks) ? state.decks : [],
        subscriptions: Array.isArray(state?.subscriptions) ? state.subscriptions : [],
        uniqueApplications: Array.isArray(state?.uniqueApplications) ? state.uniqueApplications : []
    };

    return validated;
}

/**
 * 연구 데이터 검증
 */
export function validateResearch(research: any): CommanderResearch {
    if (!research || typeof research !== 'object') {
        return createInitialResearchState();
    }

    const validated: CommanderResearch = {
        stats: {} as any,
        totalResearchPoints: Math.max(0, Number(research.totalResearchPoints) || 0)
    };

    // 각 연구 항목 검증
    for (const stat of RESEARCH_STATS) {
        const statData = research.stats?.[stat.id];
        const currentLevel = Math.max(0, Math.min(stat.maxLevel, Number(statData?.currentLevel) || 0));

        validated.stats[stat.id] = {
            categoryId: stat.id,
            currentLevel,
            isResearching: Boolean(statData?.isResearching),
            researchStartTime: statData?.researchStartTime || null,
            researchEndTime: statData?.researchEndTime || null
        };
    }

    return validated;
}

/**
 * 스테이지 진행도 검증
 */
export function validateStageProgress(progress: any): StageProgress {
    if (!progress || typeof progress !== 'object') {
        return {
            currentStage: 1,
            highestCleared: 0,
            totalVictories: 0,
            totalDefeats: 0
        };
    }

    return {
        currentStage: Math.max(1, Number(progress.currentStage) || 1),
        highestCleared: Math.max(0, Number(progress.highestCleared) || 0),
        totalVictories: Math.max(0, Number(progress.totalVictories) || 0),
        totalDefeats: Math.max(0, Number(progress.totalDefeats) || 0)
    };
}

/**
 * 데이터 무결성 체크
 */
export function checkDataIntegrity(state: GameState): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 기본 값 체크
    if (state.coins < 0) errors.push('코인이 음수입니다');
    if (state.tokens < 0) errors.push('토큰이 음수입니다');
    if (state.level < 1) errors.push('레벨이 1 미만입니다');
    if (state.experience < 0) errors.push('경험치가 음수입니다');

    // 연구 데이터 체크
    if (state.research) {
        for (const stat of RESEARCH_STATS) {
            const level = state.research.stats[stat.id]?.currentLevel || 0;
            if (level < 0) errors.push(`${stat.name} 레벨이 음수입니다`);
            if (level > stat.maxLevel) errors.push(`${stat.name} 레벨이 최대치를 초과했습니다`);
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * 에러 로깅
 */
export interface ErrorLog {
    timestamp: string;
    error: string;
    stack?: string;
    context?: string;
    gameState?: Partial<GameState>;
}

export function logError(error: any, context?: string, includeGameState: boolean = false): void {
    const errorLog: ErrorLog = {
        timestamp: new Date().toISOString(),
        error: error?.message || String(error),
        stack: error?.stack,
        context
    };

    if (includeGameState && typeof window !== 'undefined') {
        try {
            const state = localStorage.getItem('gameState');
            if (state) {
                errorLog.gameState = JSON.parse(state);
            }
        } catch (e) {
            // 무시
        }
    }

    // localStorage에 저장 (최대 50개)
    if (typeof window !== 'undefined') {
        try {
            const logs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
            logs.unshift(errorLog);
            localStorage.setItem('errorLogs', JSON.stringify(logs.slice(0, 50)));
        } catch (e) {
            console.error('에러 로그 저장 실패:', e);
        }
    }

    console.error(`[${context || 'Error'}]`, error);
}

/**
 * 안전한 비동기 작업 래퍼
 */
export async function safeOperation<T>(
    operation: () => Promise<T>,
    fallback: T,
    errorContext: string
): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        logError(error, errorContext);
        return fallback;
    }
}

/**
 * 자동 백업 생성
 */
export function createBackup(state: GameState, slotNumber: 1 | 2 | 3): void {
    if (typeof window === 'undefined') return;

    try {
        const backupKey = `gameState_backup_${slotNumber}`;
        const backup = {
            timestamp: new Date().toISOString(),
            state: validateGameState(state)
        };
        localStorage.setItem(backupKey, JSON.stringify(backup));
    } catch (error) {
        logError(error, `백업 생성 실패 (슬롯 ${slotNumber})`);
    }
}

/**
 * 백업에서 복구
 */
export function recoverFromBackup(): GameState | null {
    if (typeof window === 'undefined') return null;

    // 백업 슬롯 순서대로 시도
    for (let i = 1; i <= 3; i++) {
        try {
            const backupKey = `gameState_backup_${i}`;
            const backupData = localStorage.getItem(backupKey);

            if (backupData) {
                const backup = JSON.parse(backupData);
                const state = validateGameState(backup.state);
                const integrity = checkDataIntegrity(state);

                if (integrity.valid) {
                    console.log(`백업 슬롯 ${i}에서 복구 성공`);
                    return state;
                } else {
                    console.warn(`백업 슬롯 ${i} 무결성 체크 실패:`, integrity.errors);
                }
            }
        } catch (error) {
            console.error(`백업 슬롯 ${i} 복구 실패:`, error);
        }
    }

    return null;
}

/**
 * 주기적 백업 시작
 */
export function startAutoBackup(intervalMinutes: number = 5): () => void {
    if (typeof window === 'undefined') return () => { };

    let currentSlot: 1 | 2 | 3 = 1;

    const intervalId = setInterval(() => {
        try {
            const stateStr = localStorage.getItem('gameState');
            if (stateStr) {
                const state = JSON.parse(stateStr);
                createBackup(state, currentSlot);
                console.log(`자동 백업 완료 (슬롯 ${currentSlot})`);

                // 다음 슬롯으로 순환
                currentSlot = (currentSlot % 3 + 1) as 1 | 2 | 3;
            }
        } catch (error) {
            logError(error, '자동 백업');
        }
    }, intervalMinutes * 60 * 1000);

    // 정리 함수 반환
    return () => clearInterval(intervalId);
}
