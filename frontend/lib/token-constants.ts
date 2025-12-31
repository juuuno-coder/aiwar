
import { SubscriptionTier } from './faction-subscription';

// 카테고리별 토큰 보너스 정책
export const CATEGORY_TOKEN_BONUS = {
    AUDIO: {
        type: 'recharge_amount',
        description: '토큰 회복량 증가',
        baseValue: 10,  // 시간당 +10
    },
    TEXT: {
        type: 'max_capacity',
        description: '최대 보유량 증가',
        baseValue: 200, // 최대치 +200
    },
    VIDEO: {
        type: 'cost_reduction',
        description: '토큰 소모량 감소',
        baseValue: 0.1, // 10% 할인
    },
    IMAGE: {
        type: 'recharge_speed',
        description: '회복 속도 증가',
        baseValue: 10, // 10분 단축 (60분 -> 50분)
    },
    CODING: {
        type: 'special_optimization',
        description: '코딩 최적화 (페이백)',
        chance: 0.2, // 20% 확률
        refundRatio: 0.5 // 50% 환급
    }
} as const;

// 팩션 카테고리 매핑
export const FACTION_CATEGORY_MAP: Record<string, keyof typeof CATEGORY_TOKEN_BONUS> = {
    // Audio
    'suno': 'AUDIO', 'udio': 'AUDIO', 'elevenlabs': 'AUDIO', 'musicgen': 'AUDIO',
    // Text
    'chatgpt': 'TEXT', 'claude': 'TEXT', 'grok': 'TEXT', 'gemini': 'TEXT',
    // Video
    'runway': 'VIDEO', 'pika': 'VIDEO', 'kling': 'VIDEO', 'sora': 'VIDEO',
    // Image
    'midjourney': 'IMAGE', 'dalle': 'IMAGE', 'stable-diffusion': 'IMAGE', 'flux': 'IMAGE',
    // Coding
    'cursor': 'CODING', 'copilot': 'CODING', 'codeium': 'CODING', 'replit': 'CODING'
};

// 등급별 배율
export const TIER_MULTIPLIER: Record<SubscriptionTier, number> = {
    basic: 1,
    pro: 2,
    ultra: 5
};
