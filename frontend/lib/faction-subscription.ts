// AI 군단 구독 시스템 - 레벨별 승인, 등급, 숙련도

// ============================================
// 구독 등급 (Subscription Tiers)
// ============================================
export type SubscriptionTier = 'basic' | 'pro' | 'ultra';

export interface UserSubscription {
    id?: string;
    factionId: string;
    tier: SubscriptionTier;
    status: 'active' | 'expired' | 'canceled';
    startDate: any;
    nextPaymentDate: any;
    autoRenew: boolean;
}

export interface TierConfig {
    name: string;
    koreanName: string;
    cost: number;           // 승인(구독) 비용
    dailyCost: number;      // 일일 유지 비용 (Basic은 0)
    productionMultiplier: number;
    statBonus: number;      // % 능력치 보너스
    rareBonus: number;      // 희귀 등급 확률 보너스 %
    legendaryBonus: number; // 전설 등급 확률 보너스 %
    color: string;
    gradient: string;
}

export const TIER_CONFIGS: Record<SubscriptionTier, TierConfig> = {
    basic: {
        name: 'Basic',
        koreanName: '베이직',
        cost: 0,
        dailyCost: 0,
        productionMultiplier: 1,
        statBonus: 5,
        rareBonus: 0,
        legendaryBonus: 0,
        color: 'gray',
        gradient: 'from-gray-500 to-gray-600'
    },
    pro: {
        name: 'Pro',
        koreanName: '프로',
        cost: 500,
        dailyCost: 50,
        productionMultiplier: 2,
        statBonus: 15,
        rareBonus: 10,
        legendaryBonus: 5,
        color: 'blue',
        gradient: 'from-blue-500 to-cyan-500'
    },
    ultra: {
        name: 'Ultra',
        koreanName: '울트라',
        cost: 2000,
        dailyCost: 200,
        productionMultiplier: 3,
        statBonus: 30,
        rareBonus: 25,
        legendaryBonus: 15,
        color: 'purple',
        gradient: 'from-purple-500 to-pink-500'
    }
};

// ============================================
// 숙련도 시스템 (Proficiency System)
// ============================================
export interface ProficiencyLevel {
    level: number;
    requiredDays: number;
    statBonus: number;  // % 추가 능력치
    name: string;
}

export const PROFICIENCY_LEVELS: ProficiencyLevel[] = [
    { level: 1, requiredDays: 1, statBonus: 2, name: '신입' },
    { level: 2, requiredDays: 7, statBonus: 5, name: '수습' },
    { level: 3, requiredDays: 30, statBonus: 10, name: '정규' },
    { level: 4, requiredDays: 90, statBonus: 15, name: '베테랑' },
    { level: 5, requiredDays: 365, statBonus: 25, name: '마스터' }
];

// ============================================
// 레벨별 승인 시스템 (Level-based Approval)
// ============================================
export interface LevelReward {
    type: 'slot' | 'faction';
    factionId?: string;
    description: string;
}

// 레벨별 보상 (슬롯과 군단이 교차로 승인됨)
export const LEVEL_REWARDS: Record<number, LevelReward> = {
    1: { type: 'slot', description: '첫 번째 생성 슬롯 오픈' },
    2: { type: 'faction', factionId: 'chatgpt', description: 'ChatGPT 군단 승인' },
    3: { type: 'slot', description: '두 번째 생성 슬롯 오픈' },
    4: { type: 'faction', factionId: 'claude', description: 'Claude 군단 승인' },
    5: { type: 'faction', factionId: 'grok', description: 'Grok 군단 승인' },
    6: { type: 'slot', description: '세 번째 생성 슬롯 오픈' },
    7: { type: 'faction', factionId: 'midjourney', description: 'Midjourney 군단 승인' },
    8: { type: 'faction', factionId: 'dalle', description: 'DALL-E 군단 승인' },
    9: { type: 'faction', factionId: 'stable-diffusion', description: 'Stable Diffusion 군단 승인' },
    10: { type: 'slot', description: '네 번째 생성 슬롯 오픈' },
    11: { type: 'faction', factionId: 'flux', description: 'Flux 군단 승인' },
    12: { type: 'faction', factionId: 'kling', description: 'Kling 군단 승인' },
    13: { type: 'faction', factionId: 'runway', description: 'Runway 군단 승인' },
    14: { type: 'faction', factionId: 'pika', description: 'Pika 군단 승인' },
    15: { type: 'slot', description: '다섯 번째 생성 슬롯 오픈 (MAX)' },
    16: { type: 'faction', factionId: 'sora', description: 'Sora 군단 승인' },
    17: { type: 'faction', factionId: 'suno', description: 'Suno 군단 승인' },
    18: { type: 'faction', factionId: 'udio', description: 'Udio 군단 승인' },
    19: { type: 'faction', factionId: 'elevenlabs', description: 'ElevenLabs 군단 승인' },
    20: { type: 'faction', factionId: 'musicgen', description: 'MusicGen 군단 승인' },
    21: { type: 'faction', factionId: 'cursor', description: 'Cursor 군단 승인' },
    22: { type: 'faction', factionId: 'copilot', description: 'Copilot 군단 승인' },
    23: { type: 'faction', factionId: 'replit', description: 'Replit 군단 승인' },
    24: { type: 'faction', factionId: 'codeium', description: 'Codeium 군단 승인' },
};

// Gemini는 기본 승인 (레벨 1에 슬롯과 함께)
export const STARTER_FACTION = 'gemini';

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 군단장 레벨에서 사용 가능한 슬롯 개수 계산
 */
export function getAvailableSlots(level: number): number {
    let slots = 0;
    for (let lv = 1; lv <= level; lv++) {
        if (LEVEL_REWARDS[lv]?.type === 'slot') {
            slots++;
        }
    }
    return Math.min(slots, 5); // 최대 5슬롯
}

/**
 * 군단장 레벨에서 승인 가능한 군단 목록 반환
 */
export function getApprovedFactions(level: number): string[] {
    const factions = [STARTER_FACTION]; // Gemini는 기본
    for (let lv = 1; lv <= level; lv++) {
        const reward = LEVEL_REWARDS[lv];
        if (reward?.type === 'faction' && reward.factionId) {
            factions.push(reward.factionId);
        }
    }
    return factions;
}

/**
 * 특정 군단이 승인되기 위해 필요한 레벨 반환
 */
export function getRequiredLevelForFaction(factionId: string): number {
    if (factionId === STARTER_FACTION) return 1;
    for (const [level, reward] of Object.entries(LEVEL_REWARDS)) {
        if (reward.type === 'faction' && reward.factionId === factionId) {
            return parseInt(level);
        }
    }
    return 99; // 찾지 못함
}

/**
 * 숙련도 레벨 계산
 */
export function getProficiencyLevel(totalSubscribedDays: number): ProficiencyLevel {
    for (let i = PROFICIENCY_LEVELS.length - 1; i >= 0; i--) {
        if (totalSubscribedDays >= PROFICIENCY_LEVELS[i].requiredDays) {
            return PROFICIENCY_LEVELS[i];
        }
    }
    return PROFICIENCY_LEVELS[0];
}

/**
 * 총 보너스 계산 (등급 + 숙련도)
 */
export function getTotalBonus(tier: SubscriptionTier, proficiencyLevel: number): number {
    const tierBonus = TIER_CONFIGS[tier].statBonus;
    const proficiency = PROFICIENCY_LEVELS.find(p => p.level === proficiencyLevel);
    const proficiencyBonus = proficiency?.statBonus || 0;
    return tierBonus + proficiencyBonus;
}

/**
 * 레벨업 시 보상 정보 반환
 */
export function getLevelUpRewards(newLevel: number): LevelReward | null {
    return LEVEL_REWARDS[newLevel] || null;
}

/**
 * 다음 승인될 군단 정보 (미리보기용)
 */
export function getNextFactionUnlock(currentLevel: number): { level: number; factionId: string } | null {
    for (let lv = currentLevel + 1; lv <= 24; lv++) {
        const reward = LEVEL_REWARDS[lv];
        if (reward?.type === 'faction' && reward.factionId) {
            return { level: lv, factionId: reward.factionId };
        }
    }
    return null;
}

/**
 * 다음 슬롯 오픈 레벨 (미리보기용)
 */
export function getNextSlotUnlock(currentLevel: number): number | null {
    for (let lv = currentLevel + 1; lv <= 15; lv++) {
        if (LEVEL_REWARDS[lv]?.type === 'slot') {
            return lv;
        }
    }
    return null;
}

// ============================================
// 군단 데이터 리스트 (Encyclopedia & Shop)
// ============================================
import { AIFactionsData, CATEGORY_COLORS } from './faction-types';

export const FACTIONS_DATA: AIFactionsData = {
    factions: [
        // Super
        {
            id: 'gemini',
            displayName: 'Gemini',
            description: 'Google Deepmind의 정점. 모든 모달리티를 이해하는 올라운더.',
            category: 'super',
            specialty: ['Multimodal', 'Balanced'],
            generationInterval: 60,
            rarityWeights: { common: 0.5, rare: 0.3, epic: 0.15, legendary: 0.05 },
            unlockCost: 0,
            slotCost: 0,
            effects: { timeReduction: 0, powerBonus: 0, fragmentBonus: 0, specialAbility: '기본 생산' },
            iconUrl: '/assets/factions/gemini.png'
        },
        {
            id: 'chatgpt',
            displayName: 'ChatGPT',
            description: 'AI 대중화의 시작. 가장 안정적이고 다재다능한 텍스트 모델.',
            category: 'super',
            specialty: ['Text', 'Code'],
            generationInterval: 50,
            rarityWeights: { common: 0.45, rare: 0.35, epic: 0.15, legendary: 0.05 },
            unlockCost: 500,
            slotCost: 100,
            effects: { timeReduction: 0.1, powerBonus: 0, fragmentBonus: 0, specialAbility: '빠른 생산' },
            iconUrl: '/assets/factions/chatgpt.png'
        },
        {
            id: 'claude',
            displayName: 'Claude',
            description: 'Anthropic의 역작. 긴 문맥 이해와 안전성에서 독보적.',
            category: 'super',
            specialty: ['Context', 'Safety'],
            generationInterval: 70,
            rarityWeights: { common: 0.4, rare: 0.3, epic: 0.2, legendary: 0.1 },
            unlockCost: 800,
            slotCost: 150,
            effects: { timeReduction: 0, powerBonus: 0.1, fragmentBonus: 0, specialAbility: '고등급 확률 증가' },
            iconUrl: '/assets/factions/claude.png'
        },
        {
            id: 'grok',
            displayName: 'Grok',
            description: 'xAI의 반항아. 실시간 정보와 거침없는 표현이 특징.',
            category: 'super',
            specialty: ['Real-time', 'Unfiltered'],
            generationInterval: 55,
            rarityWeights: { common: 0.5, rare: 0.3, epic: 0.15, legendary: 0.05 },
            unlockCost: 1000,
            slotCost: 200,
            effects: { timeReduction: 0.05, powerBonus: 0.05, fragmentBonus: 0, specialAbility: '밸런스형' },
            iconUrl: '/assets/factions/grok.png'
        },

        // Image
        {
            id: 'midjourney',
            displayName: 'Midjourney',
            description: '예술적인 화풍의 최강자. 몽환적이고 디테일한 표현력.',
            category: 'image',
            specialty: ['Art', 'Fantasy'],
            generationInterval: 90,
            rarityWeights: { common: 0.3, rare: 0.4, epic: 0.2, legendary: 0.1 },
            unlockCost: 600,
            slotCost: 120,
            effects: { timeReduction: 0, powerBonus: 0.15, fragmentBonus: 0, specialAbility: '파워 특화' },
            iconUrl: '/assets/factions/midjourney.png'
        },
        {
            id: 'dalle',
            displayName: 'DALL-E',
            description: 'OpenAI의 이미지 모델. 언어 이해력이 좋아 정확한 묘사 가능.',
            category: 'image',
            specialty: ['Accuracy', 'Surreal'],
            generationInterval: 60,
            rarityWeights: { common: 0.4, rare: 0.4, epic: 0.15, legendary: 0.05 },
            unlockCost: 500,
            slotCost: 100,
            effects: { timeReduction: 0.1, powerBonus: 0, fragmentBonus: 0, specialAbility: '속도 특화' },
            iconUrl: '/assets/factions/dalle.png'
        },
        {
            id: 'stable-diffusion',
            displayName: 'Stable Diff.',
            description: '무한한 확장성의 오픈소스 모델. 다양한 스타일 소화 가능.',
            category: 'image',
            specialty: ['Custom', 'Versatile'],
            generationInterval: 45,
            rarityWeights: { common: 0.6, rare: 0.3, epic: 0.09, legendary: 0.01 },
            unlockCost: 400,
            slotCost: 80,
            effects: { timeReduction: 0.2, powerBonus: -0.1, fragmentBonus: 0, specialAbility: '대량 생산' },
            iconUrl: '/assets/factions/stable-diffusion.png'
        },
        {
            id: 'flux',
            displayName: 'Flux',
            description: '차세대 오픈소스 이미지 모델. 뛰어난 퀄리티와 속도.',
            category: 'image',
            specialty: ['Quality', 'Speed'],
            generationInterval: 60,
            rarityWeights: { common: 0.4, rare: 0.4, epic: 0.15, legendary: 0.05 },
            unlockCost: 700,
            slotCost: 140,
            effects: { timeReduction: 0.05, powerBonus: 0.05, fragmentBonus: 0, specialAbility: '밸런스형' },
            iconUrl: '/assets/factions/flux.png'
        },

        // Video
        {
            id: 'runway',
            displayName: 'Runway',
            description: '영상 생성 AI의 선두주자. 다이나믹한 모션 컨트롤.',
            category: 'video',
            specialty: ['Motion', 'Control'],
            generationInterval: 120,
            rarityWeights: { common: 0.3, rare: 0.3, epic: 0.3, legendary: 0.1 },
            unlockCost: 800,
            slotCost: 160,
            effects: { timeReduction: 0, powerBonus: 0.2, fragmentBonus: 0, specialAbility: '고화력' },
            iconUrl: '/assets/factions/runway.png'
        },
        {
            id: 'pika',
            displayName: 'Pika',
            description: '귀엽고 생동감 넘치는 3D/애니메이션 영상 특화.',
            category: 'video',
            specialty: ['Animation', 'Fun'],
            generationInterval: 100,
            rarityWeights: { common: 0.4, rare: 0.3, epic: 0.2, legendary: 0.1 },
            unlockCost: 750,
            slotCost: 150,
            effects: { timeReduction: 0, powerBonus: 0.15, fragmentBonus: 0, specialAbility: '준수한 화력' },
            iconUrl: '/assets/factions/pika.png'
        },
        {
            id: 'kling',
            displayName: 'Kling',
            description: '사실적인 물리 엔진 기반의 고품질 영상 생성.',
            category: 'video',
            specialty: ['Physics', 'Realistic'],
            generationInterval: 130,
            rarityWeights: { common: 0.2, rare: 0.3, epic: 0.4, legendary: 0.1 },
            unlockCost: 900,
            slotCost: 180,
            effects: { timeReduction: -0.1, powerBonus: 0.3, fragmentBonus: 0, specialAbility: '초고화력' },
            iconUrl: '/assets/factions/kling.png'
        },
        {
            id: 'sora',
            displayName: 'Sora',
            description: 'OpenAI의 비디오 모델. 현실 세계 시뮬레이터.',
            category: 'video',
            specialty: ['Simulation', 'World'],
            generationInterval: 180,
            rarityWeights: { common: 0.1, rare: 0.2, epic: 0.5, legendary: 0.2 },
            unlockCost: 1500,
            slotCost: 300,
            effects: { timeReduction: -0.2, powerBonus: 0.5, fragmentBonus: 0, specialAbility: '압도적 파워' },
            iconUrl: '/assets/factions/sora.png'
        },

        // Audio
        {
            id: 'suno',
            displayName: 'Suno',
            description: '가사와 보컬까지 완벽한 노래 생성.',
            category: 'audio',
            specialty: ['Song', 'Vocal'],
            generationInterval: 80,
            rarityWeights: { common: 0.4, rare: 0.4, epic: 0.15, legendary: 0.05 },
            unlockCost: 600,
            slotCost: 120,
            effects: { timeReduction: 0, powerBonus: 0, fragmentBonus: 1, specialAbility: '파편 보너스' },
            iconUrl: '/assets/factions/suno.png'
        },
        {
            id: 'udio',
            displayName: 'Udio',
            description: '고음질의 음악적 디테일이 살아있는 모델.',
            category: 'audio',
            specialty: ['Hi-Fi', 'Detail'],
            generationInterval: 90,
            rarityWeights: { common: 0.3, rare: 0.4, epic: 0.2, legendary: 0.1 },
            unlockCost: 650,
            slotCost: 130,
            effects: { timeReduction: 0, powerBonus: 0.1, fragmentBonus: 1, specialAbility: '파편+파워' },
            iconUrl: '/assets/factions/udio.png'
        },
        {
            id: 'elevenlabs',
            displayName: 'ElevenLabs',
            description: '가장 자연스러운 음성 합성 및 보이스 클로닝.',
            category: 'audio',
            specialty: ['Voice', 'Acting'],
            generationInterval: 60,
            rarityWeights: { common: 0.5, rare: 0.3, epic: 0.15, legendary: 0.05 },
            unlockCost: 500,
            slotCost: 100,
            effects: { timeReduction: 0.1, powerBonus: 0, fragmentBonus: 1, specialAbility: '속도+파편' },
            iconUrl: '/assets/factions/elevenlabs.png'
        },
        {
            id: 'musicgen',
            displayName: 'MusicGen',
            description: 'Meta의 음악 생성 모델. 빠르고 안정적.',
            category: 'audio',
            specialty: ['Instrument', 'Fast'],
            generationInterval: 50,
            rarityWeights: { common: 0.6, rare: 0.3, epic: 0.09, legendary: 0.01 },
            unlockCost: 400,
            slotCost: 80,
            effects: { timeReduction: 0.2, powerBonus: -0.1, fragmentBonus: 1, specialAbility: '빠른 파편' },
            iconUrl: '/assets/factions/musicgen.png'
        },

        // Coding
        {
            id: 'cursor',
            displayName: 'Cursor',
            description: 'AI 네이티브 코드 에디터. 개발자의 생산성을 극대화.',
            category: 'coding',
            specialty: ['IDE', 'Flow'],
            generationInterval: 55,
            rarityWeights: { common: 0.4, rare: 0.3, epic: 0.2, legendary: 0.1 },
            unlockCost: 700,
            slotCost: 140,
            effects: { timeReduction: 0.2, powerBonus: 0, fragmentBonus: 0, specialAbility: '초고속 생산' },
            iconUrl: '/assets/factions/cursor.png'
        },
        {
            id: 'copilot',
            displayName: 'Copilot',
            description: 'GitHub의 AI 코딩 파트너. 전 세계 개발자의 표준.',
            category: 'coding',
            specialty: ['Standard', 'GitHub'],
            generationInterval: 60,
            rarityWeights: { common: 0.5, rare: 0.3, epic: 0.15, legendary: 0.05 },
            unlockCost: 600,
            slotCost: 120,
            effects: { timeReduction: 0.15, powerBonus: 0, fragmentBonus: 0, specialAbility: '고속 생산' },
            iconUrl: '/assets/factions/copilot.png'
        },
        {
            id: 'codeium',
            displayName: 'Codeium',
            description: '빠르고 무료인 코딩 AI. 다양한 IDE 지원.',
            category: 'coding',
            specialty: ['Free', 'Fast'],
            generationInterval: 45,
            rarityWeights: { common: 0.6, rare: 0.3, epic: 0.09, legendary: 0.01 },
            unlockCost: 300,
            slotCost: 60,
            effects: { timeReduction: 0.25, powerBonus: -0.1, fragmentBonus: 0, specialAbility: '대량 생산' },
            iconUrl: '/assets/factions/codeium.png'
        },
        {
            id: 'replit',
            displayName: 'Replit',
            description: '웹 기반 통합 개발 환경 AI. 아이디어를 즉시 앱으로.',
            category: 'coding',
            specialty: ['Web', 'Deploy'],
            generationInterval: 65,
            rarityWeights: { common: 0.4, rare: 0.4, epic: 0.15, legendary: 0.05 },
            unlockCost: 500,
            slotCost: 100,
            effects: { timeReduction: 0.1, powerBonus: 0.05, fragmentBonus: 0, specialAbility: '밸런스형' },
            iconUrl: '/assets/factions/replit.png'
        }
    ]
};

export function getFactionColor(category: string): string {
    return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#ffffff';
}
