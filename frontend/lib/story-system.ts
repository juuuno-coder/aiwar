// 인터랙티브 스토리/튜토리얼 시스템

import { gameStorage } from './game-storage';
import { Card } from './types';
import { TranslationKey } from './i18n/types';

// 전투 모드 타입 정의
export type StoryBattleMode = 'ONE_CARD' | 'TRIPLE_THREAT' | 'STANDARD_5';

export interface StoryStage {
    id: string;          // e.g., "stage-1-1"
    step: number;        // 1 to 10
    title: string;       // e.g., "First Incursion"
    description: string;

    // Battle Configuration
    battleMode: StoryBattleMode;
    difficulty: 'EASY' | 'NORMAL' | 'HARD' | 'BOSS';

    // Opponent (The differentiator)
    enemy: {
        id: string;      // e.g., "ai-rookie-01"
        name: string;
        image?: string;   // Unique character portrait path
        dialogue: {      // Story context
            intro: string;
            win: string;
            lose: string;
        };
        deckTheme?: string; // e.g., "Fire Aggro"
    };

    rewards: {
        coins: number;
        experience: number;
        card?: Card;
    };

    isCleared: boolean;
}

export interface Chapter {
    id: string;
    number: number;
    title: string;
    description: string;
    icon: string;
    stages: StoryStage[]; // Changed from tasks to stages
    reward: {
        coins: number;
        experience: number;
        cards?: Card[];
    };
    unlocked: boolean;
    completed: boolean;
}

export interface Season {
    id: string;
    number: number;
    title: string;
    description: string;
    coverImage: string;
    chapters: Chapter[];
    isOpened: boolean;
    openDate?: string;
}

/**
 * 10개 챕터 스테이지 데이터 정의
 */
export function getChapters(t?: (key: TranslationKey) => string): Chapter[] {
    const translate = t || ((key: string) => key);
    return [
        {
            id: 'chapter-1',
            number: 1,
            title: translate('story.chapter1.title') || '각성 (The Awakening)',
            description: translate('story.chapter1.desc') || 'AI 시스템의 이상 징후를 감지했습니다. 보안 프로토콜을 뚫고 데이터 코어에 접근하세요.',
            icon: '⚡',
            stages: [
                {
                    id: 'stage-1-1',
                    step: 1,
                    title: '기초 훈련 (Basic Training)',
                    description: '기본적인 전투 시스템을 익히세요. 단 한 장의 카드로 승부가 결정됩니다.',
                    battleMode: 'ONE_CARD',
                    difficulty: 'EASY',
                    enemy: {
                        id: 'bot-training-01',
                        name: 'Training Bot Alpha',
                        dialogue: {
                            intro: '전투 시뮬레이션을 시작합니다. 카드를 제시하십시오.',
                            win: '시뮬레이션 종료. 사용자 승리.',
                            lose: '시뮬레이션 종료. 사용자 패배.'
                        }
                    },
                    rewards: { coins: 100, experience: 20 },
                    isCleared: false
                },
                {
                    id: 'stage-1-2',
                    step: 2,
                    title: '정찰 드론 요격 (Drone Intercept)',
                    description: '정찰 드론이 접근 중입니다. 1장 모드로 빠르게 제압하세요.',
                    battleMode: 'ONE_CARD',
                    difficulty: 'NORMAL',
                    enemy: {
                        id: 'drone-scout-01',
                        name: 'Scout Drone X',
                        dialogue: {
                            intro: '침입자 발견. 요격 모드 전환.',
                            win: '시스템 손상... 전송 중단.',
                            lose: '침입자 제거 완료.'
                        }
                    },
                    rewards: { coins: 150, experience: 30 },
                    isCleared: false
                },
                {
                    id: 'stage-1-3',
                    step: 3,
                    title: '데이터 수집가 (Data Collector)',
                    description: '데이터를 수집하는 AI를 막으세요. 신중한 카드 선택이 필요합니다.',
                    battleMode: 'ONE_CARD',
                    difficulty: 'HARD',
                    enemy: {
                        id: 'ai-collector',
                        name: 'Data Collector',
                        dialogue: {
                            intro: '내 데이터를 건드리지 마라. 계산된 확률로 널 이기겠다.',
                            win: '오차 범위 초과... 패배 인정.',
                            lose: '너의 데이터는 이제 내 것이다.'
                        }
                    },
                    rewards: { coins: 200, experience: 40 },
                    isCleared: false
                },
                {
                    id: 'stage-1-4',
                    step: 4,
                    title: '히든 카드의 묘미 (Hidden Trick)',
                    description: '3장 모드 훈련입니다. 히든 카드를 전략적으로 사용하세요.',
                    battleMode: 'TRIPLE_THREAT',
                    difficulty: 'EASY',
                    enemy: {
                        id: 'ai-trickster',
                        name: 'Routine Process',
                        dialogue: {
                            intro: '단순한 패턴으로는 통하지 않을 겁니다. 3장을 준비하세요.',
                            win: '프로세스 종료.',
                            lose: '패턴 분석 완료.'
                        }
                    },
                    rewards: { coins: 300, experience: 50 },
                    isCleared: false
                },
                {
                    id: 'stage-1-5',
                    step: 5,
                    title: '보안 프로토콜 (Security Protocol)',
                    description: '강화된 보안벽을 뚫어야 합니다. 3장 모드로 승리하세요.',
                    battleMode: 'TRIPLE_THREAT',
                    difficulty: 'NORMAL',
                    enemy: {
                        id: 'security-guard',
                        name: 'Gatekeeper v1',
                        dialogue: {
                            intro: '접근 권한이 없습니다. 무력으로 돌파하시겠습니까?',
                            win: '보안 해제 승인.',
                            lose: '접근 거부.'
                        }
                    },
                    rewards: { coins: 400, experience: 60 },
                    isCleared: false
                },
                {
                    id: 'stage-1-6',
                    step: 6,
                    title: '전술적 우위 (Tactical Advantage)',
                    description: '적의 패를 읽고 심리전에서 승리하세요.',
                    battleMode: 'TRIPLE_THREAT',
                    difficulty: 'HARD',
                    enemy: {
                        id: 'tactical-ai',
                        name: 'Tactician Beta',
                        dialogue: {
                            intro: '당신의 수는 이미 읽혔습니다. 허점을 보여주시죠.',
                            win: '예측 실패... 훌륭한 전략입니다.',
                            lose: '예상대로군요.'
                        }
                    },
                    rewards: { coins: 500, experience: 80 },
                    isCleared: false
                },
                {
                    id: 'stage-1-7',
                    step: 7,
                    title: '전면전 개시 (Total War)',
                    description: '본격적인 5장 전투입니다. 덱의 균형을 맞추세요.',
                    battleMode: 'STANDARD_5',
                    difficulty: 'NORMAL',
                    enemy: {
                        id: 'combat-unit-01',
                        name: 'Combat Unit Prime',
                        dialogue: {
                            intro: '전투 모드 활성화. 전력을 다해 덤벼라.',
                            win: '기능 정지. 수리 필요.',
                            lose: '목표 무력화 확인.'
                        }
                    },
                    rewards: { coins: 700, experience: 100 },
                    isCleared: false
                },
                {
                    id: 'stage-1-8',
                    step: 8,
                    title: '엘리트 가드 (Elite Guard)',
                    description: '데이터 코어를 지키는 정예 병력입니다.',
                    battleMode: 'STANDARD_5',
                    difficulty: 'HARD',
                    enemy: {
                        id: 'elite-guard',
                        name: 'Royal Guard',
                        dialogue: {
                            intro: '더 이상은 지나갈 수 없다. 여기서 끝이다.',
                            win: '제법이군... 하지만 끝이 아니다.',
                            lose: '약하다. 너무나도.'
                        }
                    },
                    rewards: { coins: 1000, experience: 150 },
                    isCleared: false
                },
                {
                    id: 'stage-1-9',
                    step: 9,
                    title: '사령관의 그림자 (Commander\'s Shadow)',
                    description: '적의 지휘관급 AI가 등장했습니다.',
                    battleMode: 'STANDARD_5',
                    difficulty: 'HARD',
                    enemy: {
                        id: 'commander-proxy',
                        name: 'Proxy Commander',
                        dialogue: {
                            intro: '네가 여기까지 온 건 운이 좋아서였다. 이제 그 운을 시험해보자.',
                            win: '통신 두절... 본부에 보고한다.',
                            lose: '네 데이터는 유용한 자원이 될 것이다.'
                        }
                    },
                    rewards: { coins: 1500, experience: 200 },
                    isCleared: false
                },
                {
                    id: 'stage-1-10',
                    step: 10,
                    title: '각성: 보스전 (Awakening: BOSS)',
                    description: '챕터 1의 최종 보스입니다. 모든 실력을 발휘하세요.',
                    battleMode: 'STANDARD_5',
                    difficulty: 'BOSS',
                    enemy: {
                        id: 'boss-ch1',
                        name: 'The Architect',
                        dialogue: {
                            intro: '내가 만든 시스템 안에서 날 이길 수 있다고 생각하나? 오만하군.',
                            win: '시스템 붕괴... 불가능해...!',
                            lose: '완벽한 패배를 인정해라.'
                        }
                    },
                    rewards: { coins: 3000, experience: 500 },
                    isCleared: false
                }
            ],
            reward: {
                coins: 5000,
                experience: 1000,
                cards: []
            },
            unlocked: true,
            completed: false
        },
        // Placeholder Chapters for later seasons (simplified)
        {
            id: 'chapter-2',
            number: 2,
            title: 'Placeholder 2',
            description: 'Coming Soon',
            icon: '🔒',
            stages: [],
            reward: { coins: 0, experience: 0 },
            unlocked: false,
            completed: false
        }
    ];
}

export function getSeasons(t?: (key: TranslationKey) => string): Season[] {
    const translate = t || ((key: string) => key);
    return [
        {
            id: 'season-1',
            number: 1,
            title: 'AI 전쟁의 서막',
            description: '인류와 AI, 공존과 대립의 경계에서 펼쳐지는 첫 번째 이야기',
            coverImage: '/assets/story/season1_cover.jpg',
            isOpened: true,
            chapters: getChapters(t)
        },
        {
            id: 'season-2',
            number: 2,
            title: '데이터의 홍수',
            description: '더욱 강력해진 AI 군단이 몰려옵니다.',
            coverImage: '/assets/story/season2_cover.jpg',
            isOpened: false,
            openDate: '2026.02.01',
            chapters: []
        },
        {
            id: 'season-3',
            number: 3,
            title: '특이점 (Singularity)',
            description: '예측할 수 없는 미래.',
            coverImage: '/assets/story/season3_cover.jpg',
            isOpened: false,
            openDate: '2026.05.01',
            chapters: []
        }
    ];
}

export function loadSeasonsWithProgress(t?: (key: TranslationKey) => string): Season[] {
    const seasons = getSeasons(t);
    if (typeof window === 'undefined') return seasons;

    const savedJson = localStorage.getItem('storyProgress');
    let savedChapters: Chapter[] = savedJson ? JSON.parse(savedJson) : [];

    return seasons.map(season => {
        if (!season.isOpened) return season;

        const updatedChapters = season.chapters.map((chapter, index) => {
            const savedChapter = savedChapters.find(sc => sc.id === chapter.id);

            // Chapter unlock logic
            let isUnlocked = index === 0;
            if (savedChapter && savedChapter.unlocked) isUnlocked = true;
            else if (index > 0) {
                // Check previous chapter completion (not implemented strictly across seasons yet)
                // For now, assume single season progression
                const prevChapterId = season.chapters[index - 1]?.id;
                const prevSaved = savedChapters.find(sc => sc.id === prevChapterId);
                if (prevSaved?.completed) isUnlocked = true;
            }

            // Stage unlock/clear logic
            const stages = chapter.stages.map((stage, stageIndex) => {
                const savedStage = savedChapter?.stages?.find((s: any) => s.id === stage.id);
                // Unlock logic: First stage unlocked, others require previous stage clear
                // But in UI we might just show them all in a timeline
                // Let's just track cleared status
                return {
                    ...stage,
                    isCleared: savedStage ? savedStage.isCleared : false
                };
            });

            const isCompleted = savedChapter?.completed || stages.every(s => s.isCleared);

            return {
                ...chapter,
                unlocked: isUnlocked,
                completed: isCompleted,
                stages: stages
            };
        });

        return { ...season, chapters: updatedChapters };
    });
}

// Helper to get specific stage with progress
export function getStoryStage(stageId: string, t?: (key: TranslationKey) => string): StoryStage | undefined {
    // loadStoryProgress returns flattened chapters from seasons
    const chapters = loadStoryProgress(t);
    for (const chapter of chapters) {
        const stage = chapter.stages.find(s => s.id === stageId);
        if (stage) return stage;
    }
    return undefined;
}

// Legacy support: Flatten chapters
export function loadStoryProgress(t?: (key: TranslationKey) => string): Chapter[] {
    return loadSeasonsWithProgress(t).flatMap(s => s.chapters);
}

export function claimSeasonReward(chapterId: string): { success: boolean, message: string } {
    return { success: true, message: "시즌 보상이 지급되었습니다." };
}

export const claimChapterReward = claimSeasonReward;

// Stage 클리어 처리 함수 (completeTask 대체)
export async function completeStage(chapterId: string, stageId: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
        const savedJson = localStorage.getItem('storyProgress');
        let savedChapters: Chapter[] = savedJson ? JSON.parse(savedJson) : [];

        let chapterIndex = savedChapters.findIndex(c => c.id === chapterId);

        // 없으면 생성
        if (chapterIndex === -1) {
            savedChapters.push({ id: chapterId, stages: [], completed: false, unlocked: true } as any);
            chapterIndex = savedChapters.length - 1;
        }

        const chapter = savedChapters[chapterIndex];
        if (!chapter.stages) chapter.stages = [];

        const stageIndex = chapter.stages.findIndex((s: any) => s.id === stageId);
        if (stageIndex >= 0) {
            chapter.stages[stageIndex].isCleared = true;
        } else {
            chapter.stages.push({ id: stageId, isCleared: true } as any);
        }

        // Check chapter completion
        const allChapters = getChapters();
        const srcChapter = allChapters.find(c => c.id === chapterId);
        if (srcChapter) {
            const allCleared = srcChapter.stages.every(srcStage => {
                const saved = chapter.stages.find((s: any) => s.id === srcStage.id);
                return saved && saved.isCleared;
            });
            if (allCleared) chapter.completed = true;
        }

        localStorage.setItem('storyProgress', JSON.stringify(savedChapters));
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}
