import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { InventoryCard } from './inventory-system';
import { Stats } from './types';

interface UniqueApplication {
    id: string;
    userId: string;
    name: string;
    description: string;
    imageUrl?: string;
    materialCards: InventoryCard[];
}

/**
 * 승인된 신청서를 바탕으로 유니크 카드 생성 및 지급
 */
export async function createUniqueCardFromApplication(applicationId: string): Promise<boolean> {
    if (!db) return false;

    try {
        // 1. 신청서 데이터 조회
        const appRef = doc(db, 'unique_requests', applicationId);
        const appSnap = await getDoc(appRef);

        if (!appSnap.exists()) {
            console.error('Application not found');
            return false;
        }

        const appData = appSnap.data() as UniqueApplication;
        const materials = appData.materialCards || [];

        // 2. 능력치 계산: 5대 스탯 평균 + 유니크 보너스
        let avgCreativity = 0, avgAccuracy = 0, avgSpeed = 0, avgStability = 0, avgEthics = 0;

        if (materials.length > 0) {
            materials.forEach(card => {
                avgCreativity += card.stats.creativity || 0;
                avgAccuracy += card.stats.accuracy || 0;
                avgSpeed += card.stats.speed || 0;
                avgStability += card.stats.stability || 0;
                avgEthics += card.stats.ethics || 0;
            });
            avgCreativity /= materials.length;
            avgAccuracy /= materials.length;
            avgSpeed /= materials.length;
            avgStability /= materials.length;
            avgEthics /= materials.length;
        } else {
            // 기본값 (Fallback)
            avgCreativity = 70; avgAccuracy = 70; avgSpeed = 70; avgStability = 70; avgEthics = 70;
        }

        // 유니크 보너스 (1.5 ~ 2.0배)
        const bonusMultiplier = 1.5 + (Math.random() * 0.5);

        const finalStats: Stats = {
            creativity: Math.floor(avgCreativity * bonusMultiplier),
            accuracy: Math.floor(avgAccuracy * bonusMultiplier),
            speed: Math.floor(avgSpeed * bonusMultiplier),
            stability: Math.floor(avgStability * bonusMultiplier),
            ethics: Math.floor(avgEthics * bonusMultiplier),
            totalPower: 0 // 계산 후 할당
        };

        finalStats.totalPower = (finalStats.creativity || 0) + (finalStats.accuracy || 0) +
            (finalStats.speed || 0) + (finalStats.stability || 0) +
            (finalStats.ethics || 0);

        // 3. 새 유니크 카드 객체 생성
        const uniqueCardId = `unique-${Date.now()}`;
        const uniqueInstanceId = `${uniqueCardId}-${Math.random().toString(36).substr(2, 9)}`;

        const newCard: InventoryCard = {
            id: uniqueCardId,
            instanceId: uniqueInstanceId,
            templateId: 'unique-custom', // 템플릿 ID 임의 지정
            name: appData.name,
            ownerId: appData.userId,
            description: appData.description,
            imageUrl: appData.imageUrl || '/card_placeholder.png',
            rarity: 'unique',
            // cardType property removed as it might not be in InventoryCard type
            isLocked: true, // 유니크는 기본 잠금
            stats: finalStats,
            level: 1,
            experience: 0,
            acquiredAt: serverTimestamp() as Timestamp
        };

        // 4. 유저 인벤토리에 지급
        // users/{userId}/inventory/{uniqueInstanceId}
        const userInventoryRef = doc(db, 'users', appData.userId, 'inventory', uniqueInstanceId);
        await setDoc(userInventoryRef, newCard);

        console.log(`✅ 유니크 카드 지급 완료: ${newCard.name} -> ${appData.userId}`);
        return true;

    } catch (error) {
        console.error('❌ 유니크 카드 생성 실패:', error);
        return false;
    }
}
