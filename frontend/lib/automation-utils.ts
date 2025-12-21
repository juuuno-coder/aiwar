// 자동화 시스템 유틸리티

import { getGameState, saveGameState, addCard, AutoGenerationTimer } from './game-state';
import { generateCard } from './utils';

/**
 * 타이머 초기화
 */
export function initializeTimers(): void {
    const state = getGameState();

    if (!state.timers) {
        state.timers = {
            autoGeneration: [],
            lastMissionCheck: Date.now(),
            lastAchievementCheck: Date.now()
        };
    }

    // 해금된 군단에 대해 타이머 생성
    for (const factionId of state.unlockedFactions) {
        const existing = state.timers.autoGeneration.find((t: AutoGenerationTimer) => t.factionId === factionId);
        if (!existing) {
            state.timers.autoGeneration.push({
                factionId,
                lastGenerated: Date.now(),
                interval: 3600000, // 1시간 (밀리초)
                enabled: false // 기본적으로 비활성화
            });
        }
    }

    saveGameState(state);
}

/**
 * 특정 군단의 자동 생성 활성화/비활성화
 */
export function toggleAutoGeneration(factionId: string, enabled: boolean): void {
    const state = getGameState();

    if (!state.timers) {
        initializeTimers();
    }

    const timer = state.timers!.autoGeneration.find((t: AutoGenerationTimer) => t.factionId === factionId);
    if (timer) {
        timer.enabled = enabled;
        if (enabled) {
            timer.lastGenerated = Date.now();
        }
        saveGameState(state);
    }
}

/**
 * 자동 생성 간격 설정 (분 단위)
 */
export function setAutoGenerationInterval(factionId: string, minutes: number): void {
    const state = getGameState();

    if (!state.timers) {
        initializeTimers();
    }

    const timer = state.timers!.autoGeneration.find((t: AutoGenerationTimer) => t.factionId === factionId);
    if (timer) {
        timer.interval = minutes * 60 * 1000; // 분을 밀리초로 변환
        saveGameState(state);
    }
}

/**
 * 자동 생성 체크 및 실행
 */
export function checkAutoGeneration(): {
    generated: Array<{ factionId: string; card: any }>;
    notifications: string[];
} {
    const state = getGameState();
    const now = Date.now();
    const generated: Array<{ factionId: string; card: any }> = [];
    const notifications: string[] = [];

    if (!state.timers) {
        initializeTimers();
        return { generated, notifications };
    }

    for (const timer of state.timers.autoGeneration) {
        if (!timer.enabled) continue;

        const elapsed = now - timer.lastGenerated;

        if (elapsed >= timer.interval) {
            // 카드 생성
            const card = generateCard();
            addCard(card);

            generated.push({
                factionId: timer.factionId,
                card
            });

            notifications.push(`${timer.factionId} 군단에서 새로운 유닛이 생성되었습니다!`);

            // 타이머 리셋
            timer.lastGenerated = now;
        }
    }

    if (generated.length > 0) {
        saveGameState(state);
    }

    return { generated, notifications };
}

/**
 * 다음 생성까지 남은 시간 (밀리초)
 */
export function getTimeUntilNextGeneration(factionId: string): number {
    const state = getGameState();

    if (!state.timers) {
        return 0;
    }

    const timer = state.timers.autoGeneration.find((t: AutoGenerationTimer) => t.factionId === factionId);
    if (!timer || !timer.enabled) {
        return 0;
    }

    const now = Date.now();
    const elapsed = now - timer.lastGenerated;
    const remaining = timer.interval - elapsed;

    return Math.max(0, remaining);
}

/**
 * 모든 타이머 상태 가져오기
 */
export function getAllTimerStatus(): Array<{
    factionId: string;
    enabled: boolean;
    interval: number;
    timeUntilNext: number;
    progress: number; // 0-100
}> {
    const state = getGameState();

    if (!state.timers) {
        initializeTimers();
        return [];
    }

    return state.timers.autoGeneration.map((timer: AutoGenerationTimer) => {
        const timeUntilNext = getTimeUntilNextGeneration(timer.factionId);
        const elapsed = timer.interval - timeUntilNext;
        const progress = timer.enabled ? Math.min(100, (elapsed / timer.interval) * 100) : 0;

        return {
            factionId: timer.factionId,
            enabled: timer.enabled,
            interval: timer.interval,
            timeUntilNext,
            progress
        };
    });
}

/**
 * 시간 포맷팅 (밀리초 -> "1시간 30분")
 */
export function formatTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        const remainingMinutes = minutes % 60;
        return `${hours}시간 ${remainingMinutes}분`;
    } else if (minutes > 0) {
        const remainingSeconds = seconds % 60;
        return `${minutes}분 ${remainingSeconds}초`;
    } else {
        return `${seconds}초`;
    }
}

/**
 * 미션 자동 체크
 */
export function checkMissionsAuto(): string[] {
    const completedMissions: string[] = [];

    // 스토리 미션은 story-utils에서 처리
    // 여기서는 일반 미션만 체크

    // TODO: 일반 미션 시스템 구현 시 추가

    return completedMissions;
}

/**
 * 업적 자동 체크
 */
export function checkAchievementsAuto(): string[] {
    const completedAchievements: string[] = [];

    // TODO: 업적 시스템과 연동하여 자동 체크

    return completedAchievements;
}

/**
 * 백그라운드 자동화 실행 (주기적으로 호출)
 */
export function runAutomation(): {
    generated: Array<{ factionId: string; card: any }>;
    missions: string[];
    achievements: string[];
    notifications: string[];
} {
    const generationResult = checkAutoGeneration();
    const missions = checkMissionsAuto();
    const achievements = checkAchievementsAuto();

    const allNotifications = [
        ...generationResult.notifications,
        ...missions.map(m => `미션 완료: ${m}`),
        ...achievements.map(a => `업적 달성: ${a}`)
    ];

    return {
        generated: generationResult.generated,
        missions,
        achievements,
        notifications: allNotifications
    };
}
