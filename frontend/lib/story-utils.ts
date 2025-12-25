// 스토리 모드 유틸리티

import { Card } from './types';
import storyData from '@/data/story-data.json';
import { getGameState, saveGameState, addTokens, addCard, completeMission } from './game-state';
import { generateCard } from './utils';

export interface Mission {
    id: string;
    title: string;
    description: string;
    type: string;
    target: any;
    completed: boolean;
}

export interface Chapter {
    id: string;
    number: number;
    title: string;
    subtitle: string;
    story: string;
    unlocked: boolean;
    unlockCondition?: {
        type: string;
        chapterId?: string;
    };
    missions: Mission[];
    rewards: {
        tokens: number;
        cards?: Array<{ rarity: string; count: number }>;
        title?: string;
        special?: string;
    };
}

/**
 * 모든 챕터 가져오기
 */
export function getAllChapters(): Chapter[] {
    return storyData.chapters as Chapter[];
}

/**
 * 특정 챕터 가져오기
 */
export function getChapter(chapterId: string): Chapter | null {
    const chapters = getAllChapters();
    return chapters.find(c => c.id === chapterId) || null;
}

/**
 * 챕터 개방 여부 확인
 */
export function isChapterUnlocked(chapterId: string): boolean {
    const chapter = getChapter(chapterId);
    if (!chapter) return false;

    // 첫 번째 챕터는 항상 해금
    if (!chapter.unlockCondition) return true;

    const state = getGameState();

    if (chapter.unlockCondition.type === 'complete_chapter') {
        const requiredChapterId = chapter.unlockCondition.chapterId;
        if (!requiredChapterId) return false;

        // 이전 챕터의 모든 미션이 완료되었는지 확인
        const requiredChapter = getChapter(requiredChapterId);
        if (!requiredChapter) return false;

        return requiredChapter.missions.every(m =>
            state.storyProgress.completedMissions.includes(m.id)
        );
    }

    return false;
}

/**
 * 챕터 완료 여부 확인
 */
export function isChapterCompleted(chapterId: string): boolean {
    const chapter = getChapter(chapterId);
    if (!chapter) return false;

    const state = getGameState();

    // 모든 미션이 완료되었는지 확인
    return chapter.missions.every(m =>
        state.storyProgress.completedMissions.includes(m.id)
    );
}

/**
 * 미션 진행도 가져오기
 */
export function getMissionProgress(missionId: string): number {
    const state = getGameState();

    // 미션별 진행도 체크
    // 여기서는 간단하게 완료 여부만 체크
    return state.storyProgress.completedMissions.includes(missionId) ? 100 : 0;
}

/**
 * 미션 완료 체크
 */
export function checkMissionCompletion(missionId: string): boolean {
    const state = getGameState();
    const chapters = getAllChapters();

    // 미션 찾기
    let mission: Mission | null = null;
    for (const chapter of chapters) {
        const found = chapter.missions.find(m => m.id === missionId);
        if (found) {
            mission = found;
            break;
        }
    }

    if (!mission) return false;

    // 미션 타입별 완료 조건 체크
    switch (mission.type) {
        case 'collect_cards':
            // 특정 군단 카드 수집
            const factionCards = state.inventory.filter(card => {
                // 카드의 군단 정보 확인 (templateId에서 추출)
                return card.templateId?.includes(mission.target.faction);
            });
            return factionCards.length >= mission.target.count;

        case 'win_battle':
            return state.stats.wins >= mission.target.count;

        case 'reach_level':
            return state.level >= mission.target.level;

        case 'unlock_factions':
            return state.unlockedFactions.length >= mission.target.count;

        case 'collect_diverse':
            // 여러 군단에서 카드 수집
            const uniqueFactions = new Set(
                state.inventory.map(card => card.templateId?.split('-')[0])
            );
            return uniqueFactions.size >= mission.target.factionCount;

        case 'win_with_synergy':
            // 이 미션은 대전 중에 체크해야 함
            return state.storyProgress.completedMissions.includes(missionId);

        case 'win_streak':
            return state.stats.winStreak >= mission.target.streak;

        case 'pvp_participate':
            return state.stats.pvpMatches >= mission.target.count;

        case 'enhance_cards':
            return state.stats.cardsEnhanced >= mission.target.count;

        case 'unlock_all_factions':
            return state.unlockedFactions.length >= mission.target.count;

        case 'ranking':
            // 랭킹 시스템과 연동 필요
            return false;

        case 'achievements':
            return state.completedAchievements.length >= mission.target.count;

        default:
            return false;
    }
}

/**
 * 챕터의 모든 미션 자동 체크
 */
export function checkChapterMissions(chapterId: string): string[] {
    const chapter = getChapter(chapterId);
    if (!chapter) return [];

    const state = getGameState();
    const newlyCompleted: string[] = [];

    for (const mission of chapter.missions) {
        // 이미 완료된 미션은 스킵
        if (state.storyProgress.completedMissions.includes(mission.id)) {
            continue;
        }

        // 미션 완료 체크
        if (checkMissionCompletion(mission.id)) {
            completeMission(mission.id);
            newlyCompleted.push(mission.id);
        }
    }

    return newlyCompleted;
}

/**
 * 챕터 보상 지급
 */
export function claimChapterRewards(chapterId: string): {
    success: boolean;
    message: string;
    rewards?: any;
} {
    const chapter = getChapter(chapterId);
    if (!chapter) {
        return { success: false, message: '챕터를 찾을 수 없습니다.' };
    }

    // 챕터 완료 확인
    if (!isChapterCompleted(chapterId)) {
        return { success: false, message: '모든 미션을 완료해야 합니다.' };
    }

    const state = getGameState();

    // 이미 보상을 받았는지 확인
    if (state.storyProgress.claimedRewards.includes(chapterId)) {
        return { success: false, message: '이미 보상을 받았습니다.' };
    }

    // 보상 지급
    addTokens(chapter.rewards.tokens);

    const rewardedCards: any[] = [];
    if (chapter.rewards.cards) {
        for (const cardReward of chapter.rewards.cards) {
            for (let i = 0; i < cardReward.count; i++) {
                const card = generateCard();
                addCard(card);
                rewardedCards.push(card);
            }
        }
    }

    // 보상 수령 기록
    state.storyProgress.claimedRewards.push(chapterId);
    saveGameState(state);

    return {
        success: true,
        message: '보상을 받았습니다!',
        rewards: {
            tokens: chapter.rewards.tokens,
            cards: rewardedCards,
            title: chapter.rewards.title,
            special: chapter.rewards.special
        }
    };
}

/**
 * 스토리 진행도 퍼센트
 */
export function getStoryProgress(): number {
    const chapters = getAllChapters();
    const state = getGameState();

    let totalMissions = 0;
    let completedMissions = 0;

    for (const chapter of chapters) {
        totalMissions += chapter.missions.length;
        for (const mission of chapter.missions) {
            if (state.storyProgress.completedMissions.includes(mission.id)) {
                completedMissions++;
            }
        }
    }

    return totalMissions > 0 ? Math.floor((completedMissions / totalMissions) * 100) : 0;
}
