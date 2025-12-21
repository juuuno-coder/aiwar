// 카드 이미지 매핑 유틸리티
// templateId 또는 카드 이름을 기반으로 적절한 캐릭터 이미지 반환

import { Rarity } from './types';

export const CHARACTER_IMAGES: Record<string, string> = {
    // Super 카테고리
    'gemini': '/assets/cards/gemini-character.png',
    'chatgpt': '/assets/cards/chatgpt-character.png',
    'claude': '/assets/cards/claude-character.png',
    'grok': '/assets/cards/grok-character.png',
    // Image 카테고리
    'midjourney': '/assets/cards/midjourney-character.png',
    'dalle': '/assets/cards/dalle-character.png',
    'stable-diffusion': '/assets/cards/stable-diffusion-character.png',
    'flux': '/assets/cards/flux-character.png',
    // Video 카테고리
    'kling': '/assets/cards/kling-character.png',
    'runway': '/assets/cards/runway-character.png',
    'pika': '/assets/cards/pika-character.png',
    'sora': '/assets/cards/sora-character.png',
    // Audio 카테고리
    'suno': '/assets/cards/suno-character.png',
    'udio': '/assets/cards/udio-character.png',
    'elevenlabs': '/assets/cards/elevenlabs-character.png',
    'musicgen': '/assets/cards/musicgen-character.png',
    // Coding 카테고리
    'cursor': '/assets/cards/cursor-character.png',
    'copilot': '/assets/cards/copilot-character.png',
    'replit': '/assets/cards/replit-character.png',
    'codeium': '/assets/cards/codeium-character.png',

    // 유니크 특수 카드
    'unique-entity': '/assets/cards/unique-entity-character.png',
    'unique-emperor': '/assets/cards/unique-emperor-character.png',
    'unique-guardian': '/assets/cards/unique-guardian-character.png',

    // 전설 특수 카드
    'legendary-emperor': '/assets/cards/legendary-emperor-character.png',
    'legendary-guardian': '/assets/cards/legendary-guardian-character.png',
};

export const FACTION_ICONS: Record<string, string> = {
    // Super 카테고리
    'gemini': '/assets/factions/gemini.png',
    'chatgpt': '/assets/factions/chatgpt.png',
    'claude': '/assets/factions/claude.png',
    'grok': '/assets/factions/grok.png',
    // Image 카테고리
    'midjourney': '/assets/factions/midjourney.png',
    'dalle': '/assets/factions/dalle.png',
    'stable-diffusion': '/assets/factions/stable-diffusion.png',
    'flux': '/assets/factions/flux.png',
    // Video 카테고리
    'kling': '/assets/factions/kling.png',
    'runway': '/assets/factions/runway.png',
    'pika': '/assets/factions/pika.png',
    'sora': '/assets/factions/sora.png',
    // Audio 카테고리
    'suno': '/assets/factions/suno.png',
    'udio': '/assets/factions/udio.png',
    'elevenlabs': '/assets/factions/elevenlabs.png',
    'musicgen': '/assets/factions/musicgen.png',
    // Coding 카테고리
    'cursor': '/assets/factions/cursor.png',
    'copilot': '/assets/factions/copilot.png',
    'replit': '/assets/factions/replit.png',
    'codeium': '/assets/factions/codeium.png',
};

// 등급별 기본 이미지 (군단 정보가 없는 카드용)
export const RARITY_FALLBACK_IMAGES: Record<Rarity, string> = {
    common: '/cards/card_design_common_1765812994475.png',
    rare: '/cards/card_design_rare_1765813078584.png',
    epic: '/cards/card_design_hero_1765813158240.png',
    legendary: '/cards/card_design_mythic_1765813331925.png'
};

/**
 * 카드의 templateId 또는 이름을 기반으로 캐릭터 이미지 경로를 반환
 * @param templateId 카드의 템플릿 ID (예: 'gemini-001', 'chatgpt-rare-002')
 * @param cardName 카드 이름 (폴백용)
 * @param rarity 카드 등급 (최종 폴백용)
 * @returns 캐릭터 이미지 경로
 */
export function getCardCharacterImage(templateId?: string, cardName?: string, rarity?: Rarity): string | null {
    // 1. templateId에서 군단 ID 추출 (예: 'gemini-001' -> 'gemini')
    if (templateId) {
        const factionId = templateId.split('-')[0]?.toLowerCase() || '';
        if (CHARACTER_IMAGES[factionId]) {
            return CHARACTER_IMAGES[factionId];
        }
    }

    // 2. 카드 이름으로 검색
    if (cardName) {
        const lowerName = cardName.toLowerCase();
        for (const [key, value] of Object.entries(CHARACTER_IMAGES)) {
            if (lowerName.includes(key)) {
                return value;
            }
        }
    }

    // 2.5. Faction Icon fallback (군단 아이콘을 캐릭터 이미지처럼 사용)
    if (templateId) {
        const factionId = templateId.split('-')[0]?.toLowerCase() || '';
        if (FACTION_ICONS[factionId]) {
            return FACTION_ICONS[factionId];
        }
    }

    // 3. 등급별 기본 이미지 반환
    if (rarity && RARITY_FALLBACK_IMAGES[rarity]) {
        return RARITY_FALLBACK_IMAGES[rarity];
    }

    return null;
}

/**
 * 군단 ID를 기반으로 아이콘 경로를 반환
 * @param factionId 군단 ID
 * @returns 아이콘 경로 또는 null
 */
export function getFactionIcon(factionId: string): string | null {
    return FACTION_ICONS[factionId?.toLowerCase()] || null;
}

/**
 * 이미지가 실제로 존재하는지 비동기 확인 (클라이언트 사이드)
 */
export async function checkImageExists(src: string): Promise<boolean> {
    return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = src;
    });
}

// ============================================
// 카드 영상 매핑 (전설/유니크용 WebM)
// ============================================

// 영상 파일 매핑 (호버/상세보기 시 재생)
export const CHARACTER_VIDEOS: Record<string, string> = {
    // 전설 등급
    'legendary-emperor': '/assets/cards/videos/legendary-emperor.mp4',
    'legendary-guardian': '/assets/cards/videos/legendary-guardian.mp4',
    'legendary-default': '/assets/cards/videos/legendary-emperor.mp4',

    // 유니크 등급
    'unique-entity': '/assets/cards/videos/unique-entity.mp4',
    'unique-default': '/assets/cards/videos/unique-entity.mp4',

    // 영웅 등급
    'epic-warrior': '/assets/cards/videos/epic-warrior.mp4',
    'epic-default': '/assets/cards/videos/epic-warrior.mp4',
};

/**
 * 카드의 영상 경로를 반환 (전설/유니크 카드용)
 * @param templateId 카드의 템플릿 ID
 * @param rarity 카드 등급
 * @returns 영상 경로 또는 null
 */
export function getCardCharacterVideo(templateId?: string, rarity?: Rarity): string | null {
    // 영웅/전설/유니크만 영상 지원
    if (rarity !== 'epic' && rarity !== 'legendary') {
        return null;
    }

    // 1. templateId로 직접 매칭 (예: 'legendary-emperor')
    if (templateId && CHARACTER_VIDEOS[templateId]) {
        return CHARACTER_VIDEOS[templateId];
    }

    // 2. 등급별 기본 영상
    const fallbackKey = `${rarity}-default`;
    return CHARACTER_VIDEOS[fallbackKey] || null;
}

/**
 * 영상이 실제로 존재하는지 비동기 확인
 */
export async function checkVideoExists(src: string): Promise<boolean> {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.onloadedmetadata = () => resolve(true);
        video.onerror = () => resolve(false);
        video.src = src;
    });
}
