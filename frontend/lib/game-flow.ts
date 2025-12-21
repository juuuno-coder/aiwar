// 게임 플로우 매니저 - 상황별 다음 액션 제안

export type GameContext =
    | 'home'
    | 'battle'
    | 'story'
    | 'result'
    | 'inventory'
    | 'shop'
    | 'training'
    | 'battle-victory'
    | 'battle-defeat'
    | 'card-acquired'
    | 'level-up'
    | 'fusion-complete'
    | 'unit-claimed'
    | 'shop-purchase'
    | 'main-menu';

export interface GameAction {
    id: string;
    label: string;
    icon: string;
    route: string;
    description?: string;
    priority?: number; // 높을수록 추천 (1: 추천)
}

/**
 * 현재 게임 상황에 맞는 다음 액션 제안
 */
export function getNextActions(context: GameContext, data?: any): GameAction[] {
    const actions: GameAction[] = [];

    switch (context) {
        case 'home':
            return [
                { id: 'battle', label: '대전하기', icon: '⚔️', route: '/battle', priority: 1, description: '다른 AI와 실력을 겨뤄보세요' },
                { id: 'story', label: '스토리', icon: '📖', route: '/story', description: 'AI 전쟁의 이야기를 따라가세요' },
                { id: 'training', label: 'AI 훈련', icon: '⚡', route: '/training', description: '카드를 강화하여 더 강력하게 만드세요' },
            ];
        case 'training':
            return [
                { id: 'battle', label: '실전 테스트', icon: '⚔️', route: '/battle', priority: 1, description: '강화된 카드로 전투해보세요' },
                { id: 'inventory', label: '인벤토리', icon: '🎒', route: '/inventory', description: '전체 카드 목록 확인' },
                { id: 'home', label: '홈으로', icon: '🏠', route: '/', description: '메인 화면으로 이동' },
            ];
        case 'battle-victory':
            actions.push(
                {
                    id: 'next-battle',
                    label: '다음 전투',
                    description: '연승 보너스 +10%',
                    icon: '⚔️',
                    route: '/battle',
                    priority: 1
                },
                {
                    id: 'open-shop',
                    label: '카드 뽑기',
                    description: '획득한 코인으로 카드팩 구매',
                    icon: '🎴',
                    route: '/shop',
                    priority: 2
                },
                {
                    id: 'enhance-deck',
                    label: '덱 강화',
                    description: '카드 합성 및 강화',
                    icon: '⚡',
                    route: '/fusion',
                    priority: 3
                }
            );
            break;

        case 'battle-defeat':
            actions.push(
                {
                    id: 'retry-battle',
                    label: '재도전',
                    description: '같은 전투 다시 시작',
                    icon: '🔄',
                    route: '/battle',
                    priority: 1
                },
                {
                    id: 'improve-deck',
                    label: '덱 개선',
                    description: '카드 교체 및 강화',
                    icon: '🔧',
                    route: '/inventory',
                    priority: 2
                },
                {
                    id: 'get-cards',
                    label: '카드 획득',
                    description: '새로운 카드 뽑기',
                    icon: '🎴',
                    route: '/shop',
                    priority: 3
                }
            );
            break;

        case 'card-acquired':
            const cardCount = data?.cardCount || 1;
            actions.push(
                {
                    id: 'view-inventory',
                    label: '인벤토리',
                    description: `새 카드 ${cardCount}장 확인`,
                    icon: '📦',
                    route: '/inventory',
                    priority: 1
                },
                {
                    id: 'build-deck',
                    label: '덱 구성',
                    description: '전투용 덱 만들기',
                    icon: '🎯',
                    route: '/battle',
                    priority: 2
                },
                {
                    id: 'continue-shop',
                    label: '계속 뽑기',
                    description: '더 많은 카드 획득',
                    icon: '🎴',
                    route: '/shop',
                    priority: 3
                }
            );
            break;

        case 'level-up':
            actions.push(
                {
                    id: 'claim-reward',
                    label: '보상 받기',
                    description: '레벨업 보상 확인',
                    icon: '🎁',
                    route: '/achievements',
                    priority: 1
                },
                {
                    id: 'unlock-features',
                    label: '새 기능',
                    description: '잠금 해제된 기능 확인',
                    icon: '🔓',
                    route: '/factions',
                    priority: 2
                },
                {
                    id: 'continue-game',
                    label: '게임 계속',
                    description: '전투로 돌아가기',
                    icon: '⚔️',
                    route: '/battle',
                    priority: 3
                }
            );
            break;

        case 'fusion-complete':
            actions.push(
                {
                    id: 'view-result',
                    label: '결과 확인',
                    description: '합성된 카드 보기',
                    icon: '✨',
                    route: '/inventory',
                    priority: 1
                },
                {
                    id: 'continue-fusion',
                    label: '계속 합성',
                    description: '더 강한 카드 만들기',
                    icon: '🔮',
                    route: '/fusion',
                    priority: 2
                },
                {
                    id: 'test-battle',
                    label: '전투 테스트',
                    description: '새 카드로 전투하기',
                    icon: '⚔️',
                    route: '/battle',
                    priority: 3
                }
            );
            break;

        case 'unit-claimed':
            actions.push(
                {
                    id: 'view-unit',
                    label: '유닛 확인',
                    description: '획득한 유닛 보기',
                    icon: '🤖',
                    route: '/inventory',
                    priority: 1
                },
                {
                    id: 'claim-more',
                    label: '더 획득',
                    description: '다른 슬롯 확인',
                    icon: '🎰',
                    route: '/factions',
                    priority: 2
                },
                {
                    id: 'start-battle',
                    label: '전투 시작',
                    description: '새 유닛으로 전투',
                    icon: '⚔️',
                    route: '/battle',
                    priority: 3
                }
            );
            break;

        case 'shop-purchase':
            actions.push(
                {
                    id: 'view-cards',
                    label: '카드 확인',
                    description: '구매한 카드 보기',
                    icon: '📦',
                    route: '/inventory',
                    priority: 1
                },
                {
                    id: 'more-shop',
                    label: '더 구매',
                    description: '추가 카드팩 구매',
                    icon: '🛒',
                    route: '/shop',
                    priority: 2
                },
                {
                    id: 'use-cards',
                    label: '카드 사용',
                    description: '전투에 투입',
                    icon: '⚔️',
                    route: '/battle',
                    priority: 3
                }
            );
            break;

        case 'main-menu':
        default:
            actions.push(
                {
                    id: 'start-battle',
                    label: '전투 시작',
                    description: '5전 3선승제',
                    icon: '⚔️',
                    route: '/battle',
                    priority: 1
                },
                {
                    id: 'manage-cards',
                    label: '카드 관리',
                    description: '인벤토리 확인',
                    icon: '📦',
                    route: '/inventory',
                    priority: 2
                },
                {
                    id: 'visit-shop',
                    label: '상점',
                    description: '카드팩 구매',
                    icon: '🛒',
                    route: '/shop',
                    priority: 3
                }
            );
            break;
    }

    return actions.sort((a, b) => (a.priority || 99) - (b.priority || 99));
}

/**
 * 특정 조건 확인
 */
export function checkConditions(): {
    hasEnoughCoins: boolean;
    hasCards: boolean;
    canFuse: boolean;
    canClaim: boolean;
} {
    // localStorage에서 간단히 확인 (나중에 game-storage로 통합)
    const coins = parseInt(localStorage.getItem('coins') || '0');
    const cards = JSON.parse(localStorage.getItem('userCards') || '[]');

    return {
        hasEnoughCoins: coins >= 300,
        hasCards: cards.length > 0,
        canFuse: cards.length >= 2,
        canClaim: true // 슬롯 타이머 확인 필요
    };
}
