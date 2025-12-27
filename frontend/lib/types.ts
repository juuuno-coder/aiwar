// 게임 타입 정의

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'unique' | 'commander';
export type Specialty = 'text' | 'image' | 'video' | 'music' | 'voice' | 'code';
export type CardType = 'normal' | 'automated';
export type AIType = 'EFFICIENCY' | 'CREATIVITY' | 'FUNCTION' | 'COST';
export type BattleMode = '1-card' | '3-card' | '5-card';

export interface Stats {
    creativity?: number;
    accuracy?: number;
    speed?: number;
    stability?: number;
    ethics?: number;
    totalPower: number;
    // Extended stats for rock-paper-scissors mechanic
    efficiency?: number;
    function?: number;
    cost?: number;
}

export interface AIFaction {
    id: string;
    displayName: string;
    description: string;
    specialty: Specialty[];
    generationInterval: number; // minutes
    rarityWeights: {
        common: number;
        rare: number;
        epic: number;
        legendary: number;
    };
    unlockCost: number;
    iconUrl: string;
}

export interface CardTemplate {
    id: string;
    name: string;
    aiFactionId: string;
    specialty: Specialty;
    rarity: Rarity;
    cardType: CardType;
    imageUrl: string;
    videoUrl?: string;
    description: string;
    baseStats: {
        creativity: { min: number; max: number };
        accuracy: { min: number; max: number };
        speed: { min: number; max: number };
        stability: { min: number; max: number };
        ethics: { min: number; max: number };
    };
    specialAbility?: {
        name: string;
        description: string;
        type: 'passive' | 'active';
    };
}

export interface Card {
    id: string;
    templateId: string;
    name?: string; // Derived from template or unique name
    ownerId: string;
    level: number;
    experience: number;
    stats: Stats; // Assuming CardStats is a typo and should be Stats
    rarity?: Rarity;
    acquiredAt: Date;
    isLocked: boolean;
    isUnique?: boolean; // 유니크 유닛 여부
    type?: AIType; // Rock-Paper-Scissors type
    specialSkill?: {
        name: string;
        description: string;
        effect: string;
    };
    equipment?: Equipment[];
    plusStats?: Stats;
}

export type EquipmentRarity = 'standard' | 'advanced' | 'elite' | 'quantum';
export type EquipmentType = 'GPU' | 'TPU' | 'NPU' | 'COOLING';

export interface Equipment {
    id: string;
    templateId: string;
    type: EquipmentType;
    rarity: EquipmentRarity;
    name: string;
    description: string;
    stats: Partial<Stats>;
    equippedCardId: string | null;
}

export interface FactionSlot {
    id: string;
    userId: string;
    slotNumber: number; // 1-5
    aiFactionId: string | null;
    lastGeneration: Date | null;
    nextGeneration: Date | null;
}

export interface Deck {
    id: string;
    userId: string;
    name: string;
    cardIds: string[]; // max 5
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Chapter {
    id: string;
    year: number; // 2025-2030
    title: string;
    description: string;
    difficulty: 'easy' | 'normal' | 'hard' | 'expert';
    unlockCondition?: string;
    bossDeck: {
        name: string;
        cards: string[]; // card template IDs
    };
    rewards: {
        dataCoin?: number;
        experience?: number;
        aiFactionUnlock?: string;
        cardPack?: number;
    };
    order: number;
}

export interface BattleGenre {
    id: string;
    name: string;
    description: string;
    statWeights: {
        creativity: number;
        accuracy: number;
        speed: number;
        stability: number;
        ethics: number;
    };
}

export interface UserProfile {
    id: string;
    username: string;
    level: number;
    exp: number;
    coins: number;
    tokens: number;
    createdAt: Date;
    lastLogin: Date;
}

export interface DailyMission {
    id: string;
    missionType: 'win_battles' | 'generate_units' | 'synthesize_units' | 'use_faction';
    title: string;
    description: string;
    targetCount: number;
    rewards: {
        dataCoin?: number;
        experience?: number;
        cardPack?: number;
    };
    isActive: boolean;
}

export interface UserMissionProgress {
    id: string;
    userId: string;
    missionId: string;
    currentCount: number;
    isCompleted: boolean;
    isClaimed: boolean;
    date: string; // YYYY-MM-DD
}
