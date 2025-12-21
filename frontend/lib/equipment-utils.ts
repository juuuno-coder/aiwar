import { Card, Equipment, EquipmentType, EquipmentRarity, Stats } from './types';
import { generateId } from './utils';

// 장비 등급별 능력치 범위
const STAT_Ranges: Record<EquipmentRarity, { min: number; max: number }> = {
    standard: { min: 1, max: 3 },
    advanced: { min: 4, max: 7 },
    elite: { min: 8, max: 12 },
    quantum: { min: 15, max: 25 }
};

/**
 * 랜덤 장비 생성
 */
export function generateEquipment(rarity: EquipmentRarity = 'standard'): Equipment {
    const types: EquipmentType[] = ['GPU', 'TPU', 'NPU', 'COOLING'];
    const type = types[Math.floor(Math.random() * types.length)];
    const range = STAT_Ranges[rarity];
    const statValue = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

    let stats: Partial<Stats> = {};
    let name = '';
    let description = '';

    switch (type) {
        case 'GPU':
            stats = { efficiency: statValue };
            name = `${rarity.toUpperCase()} GPU Unit`;
            description = `연산 효율을 ${statValue}만큼 증가시킵니다.`;
            break;
        case 'TPU':
            stats = { function: statValue };
            name = `${rarity.toUpperCase()} TPU Core`;
            description = `기능성을 ${statValue}만큼 증가시킵니다.`;
            break;
        case 'NPU':
            stats = { creativity: statValue };
            name = `${rarity.toUpperCase()} NPU Chip`;
            description = `창의성을 ${statValue}만큼 증가시킵니다.`;
            break;
        case 'COOLING':
            // 쿨링은 전체 스탯 소폭 증가
            const val = Math.ceil(statValue / 2);
            stats = { efficiency: val, creativity: val, function: val };
            name = `${rarity.toUpperCase()} Cooling System`;
            description = `모든 성능을 ${val}만큼 안정적으로 증가시킵니다.`;
            break;
    }

    return {
        id: `equip-${generateId()}`,
        templateId: `tpl-${type.toLowerCase()}-${rarity}`,
        type,
        rarity,
        name,
        description,
        stats,
        equippedCardId: null
    };
}

/**
 * 장비 장착
 */
export function equipItem(card: Card, equipment: Equipment): { success: boolean; message: string; updatedCard?: Card; updatedEquipment?: Equipment } {
    if (!card.equipment) card.equipment = [];

    // 슬롯 제한 (등급에 따라 다름, MVP는 3개 고정)
    if (card.equipment.length >= 3) {
        return { success: false, message: '장비 슬롯이 가득 찼습니다.' };
    }

    // 이미 장착된 장비인지 확인
    if (equipment.equippedCardId) {
        return { success: false, message: '이미 다른 카드에 장착된 장비입니다.' };
    }

    const updatedEquipment = { ...equipment, equippedCardId: card.id };
    const updatedCard = {
        ...card,
        equipment: [...card.equipment, updatedEquipment]
    };

    // 스탯 반영
    updatedCard.stats = recalculateTotalStats(updatedCard);

    return { success: true, message: '장비 장착 완료', updatedCard, updatedEquipment };
}

/**
 * 장비 해제
 */
export function unequipItem(card: Card, equipmentId: string): { success: boolean; message: string; updatedCard?: Card; updatedEquipment?: Equipment } {
    if (!card.equipment) return { success: false, message: '장착된 장비가 없습니다.' };

    const targetEq = card.equipment.find(e => e.id === equipmentId);
    if (!targetEq) return { success: false, message: '해당 장비를 찾을 수 없습니다.' };

    const updatedEquipment = { ...targetEq, equippedCardId: null };
    const updatedCard = {
        ...card,
        equipment: card.equipment.filter(e => e.id !== equipmentId)
    };

    // 스탯 재계산
    updatedCard.stats = recalculateTotalStats(updatedCard);

    return { success: true, message: '장비 해제 완료', updatedCard, updatedEquipment };
}

/**
 * 카드의 총 스탯 재계산 (기본 + 훈련 + 장비)
 */
export function recalculateTotalStats(card: Card): Stats {
    // 1. 기본 스탯 (이 값은 불변이어야 하지만, 현재 구조상 stats에 덮어쓰기 되므로 별도 baseStats 관리가 이상적임. 
    // 여기서는 역산하거나, stats가 이미 base라고 가정하고 더하는 방식은 위험함.
    // 안전한 방법: Card 생성 시 baseStats를 저장하거나, 현재 stats에서 장비/훈련 값을 빼고 다시 더해야 함.
    // MVP에서는 단순화를 위해: 현재 stats가 '기본 + 훈련' 상태라고 가정하고, 장비 스탯만 추가/제거하는 로직이 필요하지만
    // equipItem에서 호출될 때마다 더해지면 무한 증가함.

    // 해결책: Card에 'baseStats'가 없으므로, stats를 조작하기보다 display용 함수를 쓰거나,
    // card.equipmentStats 등으로 분리해서 관리하는 게 좋음.
    // 하지만 Card Interface를 크게 안 바꾸려면:
    // equipItem에서는 stats를 건드리지 않고, 전투력 계산 함수(calculateTotalPower)에서 equipment를 합산하도록 수정하는 게 best.

    // 따라서 이 함수는 equipItem에서 stats를 *직접 수정하지 않고* 리턴만 하도록 설계 변경.
    // 다만 UI 표시를 위해 stats.totalPower는 업데이트 해주는 게 좋음.

    // 임시: Equip 시에는 totalPower만 갱신 (상세 스탯은 전투 시 계산)
    let totalPlus = 0;
    if (card.equipment) {
        card.equipment.forEach(eq => {
            totalPlus += (eq.stats.efficiency || 0) + (eq.stats.creativity || 0) + (eq.stats.function || 0);
        });
    }

    // totalPower는 보여주기용 갱신
    const currentTotal = card.stats.efficiency + card.stats.creativity + card.stats.function +
        (card.plusStats ? (card.plusStats.efficiency + card.plusStats.creativity + card.plusStats.function) : 0);

    return {
        ...card.stats,
        totalPower: currentTotal + totalPlus
    };
}
