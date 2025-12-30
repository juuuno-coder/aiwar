// AI 군단 타입 정의
import { Specialty } from './types';

export type AICategory = 'super' | 'image' | 'video' | 'audio' | 'coding';

export interface AIFactionEffects {
    timeReduction: number; // 0-1 (0.9 = 90% 감소)
    powerBonus: number; // 0-1 (0.4 = 40% 증가, 음수 가능)
    fragmentBonus: number; // 추가 파편 개수
    specialAbility: string; // 특수 능력 설명
}

export interface AIFaction {
    id: string;
    displayName: string;
    description: string;
    category: AICategory;
    specialty: string[];
    generationInterval: number; // 분 단위
    rarityWeights: {
        common: number;
        rare: number;
        epic: number;
        legendary: number;
    };
    unlockCost: number; // 토큰
    slotCost: number; // 슬롯 배치 비용 (토큰)
    effects: AIFactionEffects;
    iconUrl: string;
}

export interface AIFactionsData {
    factions: AIFaction[];
}

/**
 * 카테고리별 색상
 */
export const CATEGORY_COLORS: Record<AICategory, string> = {
    super: '#FFD700', // 골드
    image: '#FF69B4', // 핑크
    video: '#9370DB', // 퍼플
    audio: '#00CED1', // 시안
    coding: '#32CD32' // 그린
};

/**
 * 카테고리별 아이콘
 */
export const CATEGORY_ICONS: Record<AICategory, string> = {
    super: '🚀',
    image: '🎨',
    video: '🎬',
    audio: '🎵',
    coding: '💻'
};

/**
 * 카테고리별 이름
 */
export const CATEGORY_NAMES: Record<AICategory, string> = {
    super: '슈퍼 모델',
    image: '이미지 모델',
    video: '영상 모델',
    audio: '사운드 모델',
    coding: '코딩 모델'
};
