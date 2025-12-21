import { Card, Stats } from './types';
import { generateRandomStats } from './utils';

// 레벨업에 필요한 경험치 (임시: 레벨 * 100)
export const getRequiredExp = (level: number) => level * 100;

// 재료 카드 등급별 경험치 획득량
const MATERIAL_EXP: Record<string, number> = {
    common: 50,
    rare: 150,
    epic: 500,
    legendary: 2000
};

/**
 * 훈련 결과 미리보기 계산
 */
export function calculateTrainingPreview(target: Card, materials: Card[]) {
    if (materials.length === 0) return null;

    let totalExpGain = 0;
    let tokenCost = 0;

    materials.forEach(mat => {
        const rarity = mat.rarity || 'common';
        totalExpGain += MATERIAL_EXP[rarity];
        tokenCost += MATERIAL_EXP[rarity] / 2; // 비용은 경험치의 절반
    });

    let newLevel = target.level;
    let newExp = target.experience + totalExpGain;
    let levelUpCount = 0;

    // 레벨업 계산
    while (true) {
        const required = getRequiredExp(newLevel);
        if (newExp >= required) {
            newExp -= required;
            newLevel++;
            levelUpCount++;
        } else {
            break;
        }
    }

    return {
        totalExpGain,
        tokenCost,
        currentLevel: target.level,
        nextLevel: newLevel,
        currentExp: target.experience,
        nextExp: newExp,
        levelUpCount
    };
}

/**
 * 실제 훈련 실행 (스탯 상승 포함)
 */
export function executeTraining(target: Card, materials: Card[]) {
    const preview = calculateTrainingPreview(target, materials);
    if (!preview) return target;

    const updatedCard = { ...target };
    updatedCard.level = preview.nextLevel;
    updatedCard.experience = preview.nextExp;

    // plusStats 초기화
    if (!updatedCard.plusStats) {
        updatedCard.plusStats = {
            efficiency: 0,
            creativity: 0,
            function: 0,
            totalPower: 0
        };
    }

    // 레벨업당 스탯 상승 (랜덤 1~3 + 메인 타입 보너스)
    if (preview.levelUpCount > 0) {
        for (let i = 0; i < preview.levelUpCount; i++) {
            const gainEfficiency = Math.floor(Math.random() * 3) + 1;
            const gainCreativity = Math.floor(Math.random() * 3) + 1;
            const gainFunction = Math.floor(Math.random() * 3) + 1;

            updatedCard.plusStats.efficiency += gainEfficiency;
            updatedCard.plusStats.creativity += gainCreativity;
            updatedCard.plusStats.function += gainFunction;

            // 메인 타입 추가 보너스
            if (target.type === 'EFFICIENCY') updatedCard.plusStats.efficiency += 2;
            if (target.type === 'CREATIVITY') updatedCard.plusStats.creativity += 2;
            if (target.type === 'COST') updatedCard.plusStats.function += 2;
        }

        // 총 전투력 재계산
        updatedCard.plusStats.totalPower =
            updatedCard.plusStats.efficiency +
            updatedCard.plusStats.creativity +
            updatedCard.plusStats.function;

        // 기본 스탯에도 반영 (totalPower 업데이트를 위해)
        updatedCard.stats.totalPower = updatedCard.stats.efficiency + updatedCard.stats.creativity + updatedCard.stats.function + updatedCard.plusStats.totalPower;
    }

    return updatedCard;
}
