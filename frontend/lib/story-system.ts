// 인터랙티브 스토리/튜토리얼 시스템

import { gameStorage } from './game-storage';
import { Card, Rarity } from './types';
import { generateRandomStats, generateId, getRandomRarity } from './utils';

export type TaskType = 'card_count' | 'battle_win' | 'fusion' | 'level' | 'shop_purchase' | 'manual';

export interface TaskCondition {
    type: TaskType;
    target?: number;
    current?: number;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    guide: string; // 완료 방법 가이드
    condition: TaskCondition;
    completed: boolean;
    targetPath?: string; // 미완료 시 이동할 경로
    reward?: {
        coins?: number;
        experience?: number;
        cards?: number;
    };
}

export interface Chapter {
    id: string;
    number: number;
    title: string;
    description: string;
    icon: string;
    tasks: Task[];
    reward: {
        coins: number;
        experience: number;
        cards?: Card[];
        unlocks?: string[];
    };
    unlocked: boolean;
    completed: boolean;
}

/**
 * 10개 챕터 정의
 */
export function getChapters(): Chapter[] {
    return [
        {
            id: 'chapter-1',
            number: 1,
            title: 'AI 전쟁의 시작',
            description: '게임의 기본을 배우고 첫 전투를 경험하세요',
            icon: '🎯',
            tasks: [
                {
                    id: 'task-1-1',
                    title: '첫 카드 받기',
                    description: '게임을 시작하면 자동으로 카드를 받습니다',
                    guide: '이미 완료되었습니다!',
                    condition: { type: 'card_count', target: 1 },
                    completed: false,
                    reward: { coins: 100 }
                },
                {
                    id: 'task-1-2',
                    title: '카드 능력치 확인하기',
                    description: '인벤토리에서 카드를 확인하세요',
                    guide: '메뉴 → 인벤토리 → 카드 클릭',
                    targetPath: '/inventory',
                    condition: { type: 'manual' },
                    completed: false,
                    reward: { coins: 100, experience: 10 }
                },
                {
                    id: 'task-1-3',
                    title: '첫 전투 승리하기',
                    description: '전투에서 한 번 승리하세요',
                    guide: '메뉴 → 대전 시작 → 카드 선택 → 전투',
                    targetPath: '/battle',
                    condition: { type: 'battle_win', target: 1 },
                    completed: false,
                    reward: { coins: 200, experience: 20 }
                }
            ],
            reward: {
                coins: 500,
                experience: 50,
                cards: []
            },
            unlocked: true,
            completed: false
        },
        {
            id: 'chapter-2',
            number: 2,
            title: '카드 마스터',
            description: '카드를 모으고 강화하는 방법을 배우세요',
            icon: '🎴',
            tasks: [
                {
                    id: 'task-2-1',
                    title: '카드 3장 모으기',
                    description: '상점에서 카드를 구매하거나 전투 보상으로 획득하세요',
                    guide: '메뉴 → 상점 → 카드팩 구매',
                    targetPath: '/shop',
                    condition: { type: 'card_count', target: 3 },
                    completed: false,
                    reward: { coins: 200, experience: 20 }
                },
                {
                    id: 'task-2-2',
                    title: '카드 합성하기',
                    description: '카드 3장을 합성하여 더 강한 카드를 만드세요',
                    guide: '메뉴 → 카드 합성 → 카드 3장 선택 → 합성',
                    targetPath: '/fusion',
                    condition: { type: 'fusion', target: 1 },
                    completed: false,
                    reward: { coins: 300, experience: 30 }
                },
                {
                    id: 'task-2-3',
                    title: '희귀 카드 획득하기',
                    description: '희귀 등급 이상의 카드를 획득하세요',
                    guide: '카드팩 구매 또는 카드 합성',
                    condition: { type: 'manual' },
                    completed: false,
                    reward: { coins: 500, experience: 50 }
                }
            ],
            reward: {
                coins: 1000,
                experience: 100,
                cards: []
            },
            unlocked: false,
            completed: false
        },
        {
            id: 'chapter-3',
            number: 3,
            title: '전략가의 길',
            description: '전투 시스템을 마스터하세요',
            icon: '⚔️',
            tasks: [
                {
                    id: 'task-3-1',
                    title: '5장 덱 구성하기',
                    description: '카드 5장을 모아서 덱을 구성하세요',
                    guide: '카드를 5장 이상 보유하면 자동 완료',
                    targetPath: '/shop',
                    condition: { type: 'card_count', target: 5 },
                    completed: false,
                    reward: { coins: 300, experience: 30 }
                },
                {
                    id: 'task-3-2',
                    title: '3연승 달성하기',
                    description: '전투에서 3번 연속 승리하세요',
                    guide: '메뉴 → 대전 시작 → 3번 승리',
                    targetPath: '/battle',
                    condition: { type: 'battle_win', target: 3 },
                    completed: false,
                    reward: { coins: 500, experience: 50 }
                },
                {
                    id: 'task-3-3',
                    title: '히든 카드 사용하기',
                    description: '5장 모드에서 히든 카드를 사용하세요',
                    guide: '5장 모드 → 라운드 2 또는 4에서 히든 카드 선택',
                    condition: { type: 'manual' },
                    completed: false,
                    reward: { coins: 700, experience: 70 }
                }
            ],
            reward: {
                coins: 2000,
                experience: 200,
                cards: []
            },
            unlocked: false,
            completed: false
        },
        {
            id: 'chapter-4',
            number: 4,
            title: 'AI 군단 탐험',
            description: 'AI 군단 시스템을 이해하세요',
            icon: '🤖',
            tasks: [
                {
                    id: 'task-4-1',
                    title: '첫 군단 선택하기',
                    description: 'AI 군단 페이지에서 군단을 선택하세요',
                    guide: '메뉴 → AI 군단 → 군단 선택',
                    targetPath: '/factions',
                    condition: { type: 'manual' },
                    completed: false,
                    reward: { coins: 300, experience: 30 }
                },
                {
                    id: 'task-4-2',
                    title: '군단 유닛 3개 획득하기',
                    description: '슬롯에서 유닛을 획득하세요',
                    guide: '메뉴 → AI 군단 → 슬롯 클릭',
                    targetPath: '/factions',
                    condition: { type: 'manual' },
                    completed: false,
                    reward: { coins: 500, experience: 50 }
                },
                {
                    id: 'task-4-3',
                    title: '카드 10장 보유하기',
                    description: '다양한 카드를 모으세요',
                    guide: '상점 구매, 전투 보상, 군단 유닛',
                    condition: { type: 'card_count', target: 10 },
                    completed: false,
                    reward: { coins: 700, experience: 70 }
                }
            ],
            reward: {
                coins: 1500,
                experience: 150,
                cards: []
            },
            unlocked: false,
            completed: false
        },
        {
            id: 'chapter-5',
            number: 5,
            title: '레벨업의 비밀',
            description: '성장 시스템을 활용하세요',
            icon: '⭐',
            tasks: [
                {
                    id: 'task-5-1',
                    title: '레벨 5 달성하기',
                    description: '경험치를 모아 레벨 5에 도달하세요',
                    guide: '전투 승리, 퀘스트 완료로 경험치 획득',
                    condition: { type: 'level', target: 5 },
                    completed: false,
                    reward: { coins: 500, experience: 0 }
                },
                {
                    id: 'task-5-2',
                    title: '마일스톤 보상 받기',
                    description: '프로그레스 트래커에서 마일스톤을 확인하세요',
                    guide: '메인 페이지 → 프로그레스 트래커',
                    condition: { type: 'manual' },
                    completed: false,
                    reward: { coins: 1000, experience: 100 }
                },
                {
                    id: 'task-5-3',
                    title: '전투 5승 달성하기',
                    description: '총 5번의 전투에서 승리하세요',
                    guide: '메뉴 → 대전 시작',
                    condition: { type: 'battle_win', target: 5 },
                    completed: false,
                    reward: { coins: 1500, experience: 150 }
                }
            ],
            reward: {
                coins: 3000,
                experience: 250,
                cards: []
            },
            unlocked: false,
            completed: false
        },
        {
            id: 'chapter-6',
            number: 6,
            title: '경제 마스터',
            description: '자원을 효율적으로 관리하세요',
            icon: '💰',
            tasks: [
                {
                    id: 'task-6-1',
                    title: '코인 5000개 모으기',
                    description: '전투와 퀘스트로 코인을 모으세요',
                    guide: '전투 승리, 퀘스트 완료',
                    condition: { type: 'manual' },
                    completed: false,
                    reward: { coins: 1000, experience: 100 }
                },
                {
                    id: 'task-6-2',
                    title: '프리미엄 카드팩 구매하기',
                    description: '800 코인짜리 프리미엄 카드팩을 구매하세요',
                    guide: '메뉴 → 상점 → 프리미엄 카드팩',
                    targetPath: '/shop',
                    condition: { type: 'shop_purchase', target: 1 },
                    completed: false,
                    reward: { coins: 500, experience: 50 }
                },
                {
                    id: 'task-6-3',
                    title: '카드 15장 보유하기',
                    description: '다양한 방법으로 카드를 모으세요',
                    guide: '상점, 전투, 합성, 군단',
                    condition: { type: 'card_count', target: 15 },
                    completed: false,
                    reward: { coins: 2000, experience: 200 }
                }
            ],
            reward: {
                coins: 5000,
                experience: 500,
                cards: []
            },
            unlocked: false,
            completed: false
        },
        {
            id: 'chapter-7',
            number: 7,
            title: '전투의 달인',
            description: '고급 전투 기술을 익히세요',
            icon: '🏆',
            tasks: [
                {
                    id: 'task-7-1',
                    title: '전투 10승 달성하기',
                    description: '총 10번의 전투에서 승리하세요',
                    guide: '다양한 전투 모드 활용',
                    condition: { type: 'battle_win', target: 10 },
                    completed: false,
                    reward: { coins: 2000, experience: 200 }
                },
                {
                    id: 'task-7-2',
                    title: '3가지 전투 모드 모두 승리',
                    description: '5장, 3장, 1장 모드에서 각각 승리하세요',
                    guide: '메뉴 → 대전 시작 → 모드 선택',
                    condition: { type: 'manual' },
                    completed: false,
                    reward: { coins: 3000, experience: 300 }
                },
                {
                    id: 'task-7-3',
                    title: '카드 합성 5회 완료',
                    description: '카드 합성을 5번 수행하세요',
                    guide: '메뉴 → 카드 합성',
                    condition: { type: 'fusion', target: 5 },
                    completed: false,
                    reward: { coins: 5000, experience: 500 }
                }
            ],
            reward: {
                coins: 10000,
                experience: 1000,
                cards: []
            },
            unlocked: false,
            completed: false
        },
        {
            id: 'chapter-8',
            number: 8,
            title: '컬렉터의 꿈',
            description: '다양한 카드를 수집하세요',
            icon: '📦',
            tasks: [
                {
                    id: 'task-8-1',
                    title: '카드 30장 보유하기',
                    description: '카드 컬렉션을 확장하세요',
                    guide: '상점, 전투, 합성 활용',
                    condition: { type: 'card_count', target: 30 },
                    completed: false,
                    reward: { coins: 3000, experience: 300 }
                },
                {
                    id: 'task-8-2',
                    title: '모든 등급 카드 보유하기',
                    description: '일반, 희귀, 영웅, 신화 카드를 각각 보유하세요',
                    guide: '카드팩 구매, 합성',
                    condition: { type: 'manual' },
                    completed: false,
                    reward: { coins: 5000, experience: 500 }
                },
                {
                    id: 'task-8-3',
                    title: '레벨 10 달성하기',
                    description: '레벨 10에 도달하세요',
                    guide: '전투, 퀘스트로 경험치 획득',
                    condition: { type: 'level', target: 10 },
                    completed: false,
                    reward: { coins: 7000, experience: 0 }
                }
            ],
            reward: {
                coins: 15000,
                experience: 800,
                cards: []
            },
            unlocked: false,
            completed: false
        },
        {
            id: 'chapter-9',
            number: 9,
            title: '마스터의 길',
            description: '게임의 모든 시스템을 마스터하세요',
            icon: '👑',
            tasks: [
                {
                    id: 'task-9-1',
                    title: '전투 30승 달성하기',
                    description: '총 30번의 전투에서 승리하세요',
                    guide: '꾸준한 전투',
                    condition: { type: 'battle_win', target: 30 },
                    completed: false,
                    reward: { coins: 5000, experience: 500 }
                },
                {
                    id: 'task-9-2',
                    title: '카드 50장 보유하기',
                    description: '대규모 카드 컬렉션을 구축하세요',
                    guide: '모든 수단 활용',
                    condition: { type: 'card_count', target: 50 },
                    completed: false,
                    reward: { coins: 10000, experience: 1000 }
                },
                {
                    id: 'task-9-3',
                    title: '레벨 15 달성하기',
                    description: '레벨 15에 도달하세요',
                    guide: '지속적인 플레이',
                    condition: { type: 'level', target: 15 },
                    completed: false,
                    reward: { coins: 15000, experience: 0 }
                }
            ],
            reward: {
                coins: 30000,
                experience: 1500,
                cards: []
            },
            unlocked: false,
            completed: false
        },
        {
            id: 'chapter-10',
            number: 10,
            title: 'AI 전쟁의 영웅',
            description: '진정한 마스터가 되세요',
            icon: '🌟',
            tasks: [
                {
                    id: 'task-10-1',
                    title: '레벨 20 달성하기',
                    description: '최고 레벨에 도달하세요',
                    guide: '모든 활동 참여',
                    condition: { type: 'level', target: 20 },
                    completed: false,
                    reward: { coins: 10000, experience: 0 }
                },
                {
                    id: 'task-10-2',
                    title: '전투 50승 달성하기',
                    description: '총 50번의 전투에서 승리하세요',
                    guide: '전투의 달인',
                    condition: { type: 'battle_win', target: 50 },
                    completed: false,
                    reward: { coins: 20000, experience: 2000 }
                },
                {
                    id: 'task-10-3',
                    title: '모든 챕터 완료하기',
                    description: '챕터 1-9를 모두 완료하세요',
                    guide: '이전 챕터 완료',
                    condition: { type: 'manual' },
                    completed: false,
                    reward: { coins: 20000, experience: 2000 }
                }
            ],
            reward: {
                coins: 50000,
                experience: 4000,
                cards: []
            },
            unlocked: false,
            completed: false
        },
        // Phase 5: Chapter 11-20 & Event
        {
            id: 'chapter-11',
            number: 11,
            title: '고급 전략',
            description: '상성 우위를 활용하여 전투를 지배하세요',
            icon: '🧠',
            tasks: [
                {
                    id: 'task-11-1',
                    title: '상성 우위 승리 5회',
                    description: '타입 상성 우위로 5번 승리하세요',
                    guide: '속성 관계를 파악하여 덱 구성',
                    condition: { type: 'battle_win', target: 55 }, // 누적 승리 체크
                    completed: false,
                    reward: { coins: 3000, experience: 300 }
                },
                {
                    id: 'task-11-2',
                    title: '희귀 카드 5장 보유',
                    description: '희귀 등급 이상 카드 5장을 모으세요',
                    guide: '상점 또는 합성',
                    condition: { type: 'card_count', target: 5 }, // 등급 체크 로직은 별도 필요하지만 일단 수량으로 대체
                    completed: false,
                    reward: { coins: 4000, experience: 400 }
                },
                {
                    id: 'task-11-3',
                    title: '레벨 22 달성',
                    description: '더 높은 곳을 향해 나아가세요',
                    guide: '꾸준한 플레이',
                    condition: { type: 'level', target: 22 },
                    completed: false,
                    reward: { coins: 5000, experience: 500 }
                }
            ],
            reward: { coins: 10000, experience: 1000 },
            unlocked: false,
            completed: false
        },
        {
            id: 'chapter-12',
            number: 12,
            title: '신화의 힘',
            description: '모델의 힘을 경험하세요',
            icon: '⚡',
            tasks: [
                {
                    id: 'task-12-1',
                    title: '신화 등급 카드 획득',
                    description: '신화 등급 카드를 획득하세요',
                    guide: '최고급 카드팩 또는 운',
                    condition: { type: 'manual' },
                    completed: false,
                    reward: { coins: 10000, experience: 1000 }
                },
                {
                    id: 'task-12-2',
                    title: '전투 70승 달성',
                    description: '총 70번의 전투에서 승리하세요',
                    guide: '전투 마스터',
                    condition: { type: 'battle_win', target: 70 },
                    completed: false,
                    reward: { coins: 8000, experience: 800 }
                },
                {
                    id: 'task-12-3',
                    title: '카드 60장 보유',
                    description: '거대한 군단을 만드세요',
                    guide: '수집의 즐거움',
                    condition: { type: 'card_count', target: 60 },
                    completed: false,
                    reward: { coins: 6000, experience: 600 }
                }
            ],
            reward: { coins: 20000, experience: 2000 },
            unlocked: false,
            completed: false
        },
        {
            id: 'chapter-13',
            number: 13,
            title: '모델 도전',
            description: '가장 강력한 덱을 완성하세요',
            icon: '👑',
            tasks: [
                {
                    id: 'task-13-1',
                    title: '제미나이 군단 활용',
                    description: '효율성 타입 위주의 덱으로 승리하세요',
                    guide: '효율성 타입 카드 배치',
                    condition: { type: 'manual' },
                    completed: false,
                    reward: { coins: 5000, experience: 500 }
                },
                {
                    id: 'task-13-2',
                    title: '합성 20회 달성',
                    description: '총 20회의 카드 합성을 수행하세요',
                    guide: '강력한 카드를 위한 투자',
                    condition: { type: 'fusion', target: 20 },
                    completed: false,
                    reward: { coins: 7000, experience: 700 }
                },
                {
                    id: 'task-13-3',
                    title: '레벨 25 달성',
                    description: '상위 1%를 향하여',
                    guide: '레벨업',
                    condition: { type: 'level', target: 25 },
                    completed: false,
                    reward: { coins: 10000, experience: 1000 }
                }
            ],
            reward: { coins: 30000, experience: 3000 },
            unlocked: false,
            completed: false
        },
        {
            id: 'chapter-14',
            number: 14,
            title: '새로운 도전',
            description: '한계를 시험하세요',
            icon: '🌊',
            tasks: [
                {
                    id: 'task-14-1',
                    title: '전투 100승 달성',
                    description: '전설적인 기록을 세우세요',
                    guide: '백전백승',
                    condition: { type: 'battle_win', target: 100 },
                    completed: false,
                    reward: { coins: 20000, experience: 2000 }
                },
                {
                    id: 'task-14-2',
                    title: '카드 80장 보유',
                    description: '모든 카드를 수집하세요',
                    guide: '컬렉션 완성',
                    condition: { type: 'card_count', target: 80 },
                    completed: false,
                    reward: { coins: 15000, experience: 1500 }
                },
                {
                    id: 'task-14-3',
                    title: '상점 구매 20회',
                    description: '상점을 적극적으로 이용하세요',
                    guide: '카드팩, 아이템 구매',
                    condition: { type: 'shop_purchase', target: 20 },
                    completed: false,
                    reward: { coins: 10000, experience: 1000 }
                }
            ],
            reward: { coins: 50000, experience: 5000 },
            unlocked: false,
            completed: false
        },
        {
            id: 'chapter-15',
            number: 15,
            title: '경제 대국',
            description: '막대한 부를 축적하세요',
            icon: '💎',
            tasks: [
                {
                    id: 'task-15-1',
                    title: '코인 100,000 보유',
                    description: '십만장자가 되어보세요',
                    guide: '보상 저축',
                    condition: { type: 'manual' }, // 코인 보유량 체크는 manual로 유도하거나 별도 타입 필요
                    completed: false,
                    reward: { coins: 10000, experience: 1000 }
                },
                {
                    id: 'task-15-2',
                    title: '레벨 30 달성',
                    description: '마스터의 경지에 오르세요',
                    guide: '꾸준한 성장',
                    condition: { type: 'level', target: 30 },
                    completed: false,
                    reward: { coins: 20000, experience: 2000 }
                },
                {
                    id: 'task-15-3',
                    title: '모든 군단 해금',
                    description: '모든 AI 군단을 해금하세요',
                    guide: '군단 페이지',
                    condition: { type: 'manual' },
                    completed: false,
                    reward: { coins: 30000, experience: 3000 }
                }
            ],
            reward: { coins: 100000, experience: 10000 },
            unlocked: false,
            completed: false
        },
        // 이벤트 챕터
        {
            id: 'event-counterattack',
            number: 99,
            title: '🔥 이벤트: AI의 역습',
            description: '극한의 난이도에 도전하세요! (기간 한정)',
            icon: '👿',
            tasks: [
                {
                    id: 'task-evt-1',
                    title: '전투 200승 달성',
                    description: '진정한 챔피언임을 증명하세요',
                    guide: '끝없는 전투',
                    condition: { type: 'battle_win', target: 200 },
                    completed: false,
                    reward: { coins: 50000, experience: 5000 }
                },
                {
                    id: 'task-evt-2',
                    title: '합성 50회 달성',
                    description: '카드의 한계를 돌파하세요',
                    guide: '극한의 강화',
                    condition: { type: 'fusion', target: 50 },
                    completed: false,
                    reward: { coins: 50000, experience: 5000 }
                },
                {
                    id: 'task-evt-3',
                    title: '레벨 50 달성',
                    description: '정점에 도달하세요',
                    guide: '전설의 트레이너',
                    condition: { type: 'level', target: 50 },
                    completed: false,
                    reward: { coins: 100000, experience: 10000 }
                }
            ],
            reward: { coins: 500000, experience: 50000 },
            unlocked: true, // 이벤트는 항상 열려있음 (또는 조건부)
            completed: false
        }
    ];
}

/**
 * 스토리 진행도 로드
 */
export function loadStoryProgress(): Chapter[] {
    if (typeof window === 'undefined') return getChapters();

    const saved = localStorage.getItem('storyProgress');
    if (!saved) {
        const chapters = getChapters();
        saveStoryProgress(chapters);
        return chapters;
    }

    return JSON.parse(saved);
}

/**
 * 스토리 진행도 저장
 */
export function saveStoryProgress(chapters: Chapter[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('storyProgress', JSON.stringify(chapters));
}

/**
 * 태스크 검증
 */
export async function verifyTask(task: Task): Promise<boolean> {
    const { condition } = task;

    switch (condition.type) {
        case 'card_count':
            const cards = await gameStorage.getCards();
            return cards.length >= (condition.target || 0);

        case 'battle_win':
            const stats = await gameStorage.getBattleStats();
            return stats.victories >= (condition.target || 0);

        case 'fusion':
            // 합성 횟수는 localStorage에서 확인
            const fusionCount = parseInt(localStorage.getItem('fusionCount') || '0');
            return fusionCount >= (condition.target || 0);

        case 'level':
            const level = await gameStorage.getLevel();
            return level >= (condition.target || 0);

        case 'shop_purchase':
            const purchaseCount = parseInt(localStorage.getItem('shopPurchaseCount') || '0');
            return purchaseCount >= (condition.target || 0);

        case 'manual':
            // 수동 확인은 사용자가 버튼 클릭
            return true;

        default:
            return false;
    }
}

/**
 * 태스크 완료
 */
export async function completeTask(chapterId: string, taskId: string): Promise<boolean> {
    const chapters = loadStoryProgress();
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return false;

    const task = chapter.tasks.find(t => t.id === taskId);
    if (!task || task.completed) return false;

    // 검증
    const verified = await verifyTask(task);
    if (!verified) return false;

    // 완료 처리
    task.completed = true;

    // 보상 지급
    if (task.reward) {
        if (task.reward.coins) {
            await gameStorage.addCoins(task.reward.coins);
        }
        if (task.reward.experience) {
            await gameStorage.addExperience(task.reward.experience);
        }
    }

    // 챕터 완료 확인
    const allTasksCompleted = chapter.tasks.every(t => t.completed);
    if (allTasksCompleted) {
        chapter.completed = true;

        // 다음 챕터 해제
        const nextChapter = chapters.find(c => c.number === chapter.number + 1);
        if (nextChapter) {
            nextChapter.unlocked = true;
        }
    }

    saveStoryProgress(chapters);
    return true;
}

/**
 * 챕터 보상 수령
 */
export async function claimChapterReward(chapterId: string): Promise<boolean> {
    const chapters = loadStoryProgress();
    const chapter = chapters.find(c => c.id === chapterId);

    if (!chapter || !chapter.completed) return false;

    // 보상 지급
    if (chapter.reward.coins) {
        await gameStorage.addCoins(chapter.reward.coins);
    }
    if (chapter.reward.experience) {
        await gameStorage.addExperience(chapter.reward.experience);
    }

    return true;
}

/**
 * 전체 진행률 계산
 */
export function calculateProgress(): number {
    const chapters = loadStoryProgress();
    const completedChapters = chapters.filter(c => c.completed).length;
    return Math.round((completedChapters / chapters.length) * 100);
}

/**
 * 모든 챕터의 미완료 태스크를 확인하고 완료 가능한 것은 자동 완료 처리
 * (페이지 진입 시 호출용)
 */
export async function checkAllTasks(): Promise<boolean> {
    const chapters = loadStoryProgress();
    let hasUpdates = false;

    for (const chapter of chapters) {
        if (!chapter.unlocked) continue;

        // 이미 완료된 태스크는 스킵
        const tasksToCheck = chapter.tasks.filter(t => !t.completed);

        for (const task of tasksToCheck) {
            // 수동 확인(manual) 타입은 자동 완료에서 제외
            if (task.condition.type === 'manual') continue;

            const verified = await verifyTask(task);
            if (verified) {
                // 검증 성공 시 완료 처리 로직 수행 (보상 등)
                // completeTask 함수를 호출하는 것이 좋지만, 
                // 여기서는 내부 로직을 재사용하거나 completeTask를 호출해야 함.
                // completeTask는 loadStoryProgress를 다시 호출하므로 비효율적일 수 있음.
                // 따라서 직접 처리하고 마지막에 한 번 저장하는 것이 좋음.

                task.completed = true;

                // 보상 지급
                if (task.reward) {
                    if (task.reward.coins) {
                        await gameStorage.addCoins(task.reward.coins);
                    }
                    if (task.reward.experience) {
                        await gameStorage.addExperience(task.reward.experience);
                    }
                }
                hasUpdates = true;
            }
        }

        // 챕터 완료 확인
        const allTasksCompleted = chapter.tasks.every(t => t.completed);
        if (allTasksCompleted && !chapter.completed) {
            chapter.completed = true;

            // 다음 챕터 해제
            const nextChapter = chapters.find(c => c.number === chapter.number + 1);
            if (nextChapter) {
                nextChapter.unlocked = true;
            }
            hasUpdates = true;
        }
    }

    if (hasUpdates) {
        saveStoryProgress(chapters);
    }

    return hasUpdates;
}
