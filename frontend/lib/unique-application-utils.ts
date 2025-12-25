
import { Card as CardType } from './types';
import { GameState } from './game-storage';
import { getGameState, saveGameState, spendTokens } from './game-state';

export interface UniqueApplication {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    materialCardIds: string[];
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    createdAt: number;
    completedAt?: number;
}

export function canApplyForUnique(materials: CardType[]): boolean {
    if (materials.length !== 3) return false;
    // 전설 등급, 레벨 10 이상 (임시로 레벨 제한 해제하거나 낮출 수 있음. 요구사항은 10)
    return materials.every(c => c.rarity === 'legendary' && c.level >= 10);
}

export function getApplicationCost(): { coins: number; tokens: number } {
    return { coins: 10000, tokens: 2000 };
}

export async function submitUniqueApplication(
    name: string,
    description: string,
    imageUrl: string, // Base64 or URL
    materialCards: CardType[]
): Promise<{ success: boolean; message: string; applicationId?: string }> {

    if (!canApplyForUnique(materialCards)) {
        return { success: false, message: '자격 요건 불충분: 10레벨 전설 카드 3장이 필요합니다.' };
    }

    const { coins: costCoins, tokens: costTokens } = getApplicationCost();
    const state = getGameState();

    if (state.coins < costCoins || state.tokens < costTokens) {
        return { success: false, message: `재화 부족 (필요: ${costCoins} 코인, ${costTokens} 토큰)` };
    }

    // 재화 소모
    const { gameStorage } = await import('@/lib/game-storage');
    await gameStorage.addCoins(-costCoins);
    await gameStorage.addTokens(-costTokens);

    // 재료 카드 제거
    for (const card of materialCards) {
        await gameStorage.deleteCard(card.id);
    }

    const newApp: UniqueApplication = {
        id: `uniq-app-${Date.now()}`,
        name,
        description,
        imageUrl,
        materialCardIds: materialCards.map(c => c.id),
        status: 'pending',
        createdAt: Date.now()
    };

    // 저장
    const newState = await gameStorage.loadGameState();
    const apps = newState.uniqueApplications || [];
    await gameStorage.saveGameState({
        uniqueApplications: [...apps, newApp]
    });

    return {
        success: true,
        message: '신청서가 제출되었습니다! 관리자 승인까지 약 36시간 소요됩니다.',
        applicationId: newApp.id
    };
}

export async function getMyApplications(): Promise<UniqueApplication[]> {
    const { gameStorage } = await import('@/lib/game-storage');
    const state = await gameStorage.loadGameState();
    return state.uniqueApplications || [];
}
