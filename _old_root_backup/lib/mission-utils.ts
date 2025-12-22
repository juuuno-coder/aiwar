// 미션 진행도 추적 유틸리티

import { storage } from './utils';
import { Mission, DailyMissions } from './mission-types';

// 오늘 날짜 가져오기
function getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// 미션 진행도 업데이트
export function updateMissionProgress(
    type: Mission['type'],
    increment: number = 1
): void {
    const today = getTodayDate();
    const savedMissions = storage.get<DailyMissions>('dailyMissions', { date: '', missions: [] });

    // 오늘 날짜가 아니면 업데이트하지 않음
    if (savedMissions.date !== today || savedMissions.missions.length === 0) {
        return;
    }

    // 해당 타입의 미션 찾아서 진행도 업데이트
    const updatedMissions = savedMissions.missions.map(mission => {
        if (mission.type === type && !mission.completed) {
            const newCurrent = Math.min(mission.current + increment, mission.target);
            const completed = newCurrent >= mission.target;
            return {
                ...mission,
                current: newCurrent,
                completed,
            };
        }
        return mission;
    });

    storage.set('dailyMissions', { date: today, missions: updatedMissions });
}

// 미션 완료 개수 가져오기
export function getCompletedMissionCount(): number {
    const today = getTodayDate();
    const savedMissions = storage.get<DailyMissions>('dailyMissions', { date: '', missions: [] });

    if (savedMissions.date !== today) {
        return 0;
    }

    return savedMissions.missions.filter(m => m.completed && !m.claimed).length;
}
