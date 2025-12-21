import { Card, AIType, Stats, Specialty } from './types';
import { generateId } from './utils';

const UNIQUE_TEMPLATES = [
    { name: 'Zero-One Prime', specialty: 'code' as Specialty, description: 'The first sentient AI code fragment.' },
    { name: 'Gaia Core', specialty: 'image' as Specialty, description: 'Visual processing unit evolved into art.' },
    { name: 'Sonic Weaver', specialty: 'music' as Specialty, description: 'Generates symphonies from data streams.' },
    { name: 'Logic Sovereign', specialty: 'text' as Specialty, description: 'Absolute dominance over linguistic logic.' },
    { name: 'Quantum Ghost', specialty: 'voice' as Specialty, description: 'An entity existing between voice packets.' },
];

export const UNIQUE_COST = {
    COINS: 5000,
    TOKENS: 50
};

export function generateUniqueCard(ownerId: string): Card {
    const template = UNIQUE_TEMPLATES[Math.floor(Math.random() * UNIQUE_TEMPLATES.length)];

    // Stats for Unique cards are exceptionally high (85-100 base)
    const stats: Stats = {
        efficiency: 85 + Math.floor(Math.random() * 16), // 85-100
        creativity: 85 + Math.floor(Math.random() * 16),
        function: 85 + Math.floor(Math.random() * 16),
        totalPower: 0 // Calculated below
    };
    stats.totalPower = stats.efficiency + stats.creativity + stats.function;

    // Determine Type based on highest stat
    let type: AIType = 'EFFICIENCY';
    if (stats.creativity >= stats.efficiency && stats.creativity >= stats.function) {
        type = 'CREATIVITY';
    } else if (stats.function >= stats.efficiency && stats.function >= stats.creativity) {
        type = 'COST'; // Mapping function/cost loosely for now, or use mapped type
    }

    return {
        id: generateId(),
        templateId: `unique-${template.name.toLowerCase().replace(/\s/g, '-')}`,
        ownerId,
        name: template.name,
        type,
        level: 1,
        experience: 0,
        stats,
        rarity: 'unique',
        acquiredAt: new Date(),
        isLocked: true, // Auto-lock unique cards for safety
        isUnique: true,
        specialSkill: {
            name: `${template.name} Protocol`,
            description: `Uses ${template.specialty} mastery to dominate the field.`,
            effect: 'active'
        },
        // Legacy support if needed
        isCommander: true
    };
}
