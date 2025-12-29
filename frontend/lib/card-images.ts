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

// CEO/Commander 전용 이미지 매핑 (현재 8종 + 추가 예정)
export const COMMANDER_IMAGES: Record<string, string> = {
    // Super AI
    'gemini': '/assets/cards/cmdr-gemini.png',       // Demis Hassabis
    'chatgpt': '/assets/cards/cmdr-chatgpt.png',     // Sam Altman
    'claude': '/assets/cards/cmdr-claude.png',       // Dario Amodei
    'grok': '/assets/cards/cmdr-grok.png',           // Elon Musk

    // Image AI
    'midjourney': '/assets/cards/cmdr-midjourney.png', // David Holz
    'dalle': '/assets/cards/cmdr-dalle.png',
    'stable-diffusion': '/assets/cards/cmdr-stable-diffusion.png',
    'flux': '/assets/cards/cmdr-flux.png',

    // Video AI
    'sora': '/assets/cards/cmdr-sora.png',           // Mira Murati
    'runway': '/assets/cards/cmdr-runway.png',
    'pika': '/assets/cards/cmdr-pika.png',
    'kling': '/assets/cards/cmdr-kling.png',

    // Audio AI
    'suno': '/assets/cards/cmdr-suno.png',           // Mikey Shulman
    'udio': '/assets/cards/cmdr-udio.png',
    'elevenlabs': '/assets/cards/cmdr-elevenlabs.png',
    'musicgen': '/assets/cards/cmdr-musicgen.png',

    // Coding AI
    'copilot': '/assets/cards/cmdr-copilot.png',     // Satya Nadella
    'cursor': '/assets/cards/cmdr-cursor.png',
    'replit': '/assets/cards/cmdr-replit.png',
    'codeium': '/assets/cards/cmdr-codeium.png',
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

// 등급별 기본 이미지 (군단 정보가 없는 카드용) - 고품질 이미지 사용
export const RARITY_FALLBACK_IMAGES: Record<Rarity, string> = {
    common: '/images/cards/real/common.png',
    rare: '/images/cards/real/rare.png',
    epic: '/images/cards/real/epic.png',
    legendary: '/images/cards/real/legendary.png',
    unique: '/images/cards/real/unique.png',
    commander: '/images/cards/real/commander.png'
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

        // Commander 등급 우선 체크 - 사용자의 요청으로 도감(Faction) 이미지를 그대로 사용
        if (rarity === 'commander') {
            if (FACTION_ICONS[factionId]) {
                return FACTION_ICONS[factionId];
            }
            // fallback if not found in FACTION_ICONS (though unlikely)
            if (COMMANDER_IMAGES[factionId]) {
                return COMMANDER_IMAGES[factionId];
            }
        }

        if (CHARACTER_IMAGES[factionId]) {
            return CHARACTER_IMAGES[factionId];
        }
    }

    // 2. 카드 이름으로 검색 (한글 이름 -> 영어 ID 역방향 검색 추가)
    if (cardName) {
        const lowerName = cardName.toLowerCase();

        // 1. 기본 영어 키워드 매칭
        for (const [key, value] of Object.entries(CHARACTER_IMAGES)) {
            if (lowerName.includes(key)) {
                return value;
            }
        }

        // 2. 한글 군단장 이름 -> Faction ID 매핑 (역방향 룩업)
        // 이 부분을 추가하여 한글 이름일 때도 올바른 이미지를 찾도록 함
        const NAME_TO_FACTION: Record<string, string> = {
            '일론 머스크': 'grok',
            '데미스 하사비스': 'gemini',
            '샘 알트먼': 'chatgpt',
            '다리오 아모데이': 'claude',
            '데이비드 홀츠': 'midjourney',
            '아디트야 라메시': 'dalle',
            '에마드 모스타크': 'stable-diffusion',
            '로빈 롬바흐': 'flux',
            '미라 무라티': 'sora',
            '크리스토발 발렌주엘라': 'runway',
            '데미 구오': 'pika',
            '청 이샤오': 'kling',
            '마이키 슐먼': 'suno',
            '데이비드 딩': 'udio',
            '마티 스타니셰프스키': 'elevenlabs',
            '제이드 코펫': 'musicgen',
            '마이클 트루엘': 'cursor',
            '사티아 나델라': 'copilot',
            '암자드 마사드': 'replit',
            '바룬 모한': 'codeium'
        };

        for (const [koreanName, factionId] of Object.entries(NAME_TO_FACTION)) {
            if (cardName.includes(koreanName)) {
                // Commander 등급 확인은 여기서 어렵지만, 이름이 매칭되면 해당 Faction의 이미지를 리턴
                if (FACTION_ICONS[factionId]) return FACTION_ICONS[factionId];
                if (CHARACTER_IMAGES[factionId]) return CHARACTER_IMAGES[factionId];
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
