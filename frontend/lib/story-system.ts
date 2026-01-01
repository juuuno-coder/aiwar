
import { Card } from './types';
import { TranslationKey } from './i18n/types';

// Use same types as PVP for consistency
export type StoryBattleMode = 'sudden-death' | 'double' | 'ambush' | 'tactics';

export interface StoryStage {
    id: string;          // e.g., "stage-1-1"
    step: number;        // 1 to 10
    title: string;       // EN
    title_ko: string;    // KO
    description: string; // EN
    description_ko: string; // KO

    // Battle Configuration
    battleMode: StoryBattleMode;
    difficulty: 'EASY' | 'NORMAL' | 'HARD' | 'BOSS';
    tokenCost: number;   // [NEW] Token cost to enter

    // Opponent
    enemy: {
        id: string;
        name: string;
        name_ko: string;
        image?: string;
        dialogue: {
            intro: string;
            intro_ko: string;
            quote?: string;
            quote_ko?: string;
            appearance?: string;
            appearance_ko?: string;
            start?: string;
            start_ko?: string;
            win: string;
            win_ko: string;
            lose: string;
            lose_ko: string;
        };
        deckTheme?: string;
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
    title_ko: string;
    description: string;
    description_ko: string;
    icon: string;
    stages: StoryStage[];
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
    title_ko: string;
    description: string;
    description_ko: string;
    coverImage: string;
    chapters: Chapter[];
    isOpened: boolean;
    openDate?: string;
}

// ------------------------------------------------------------------
// DATA DEFINITION: 30 Stages (3 Chapters x 10)
// Themes: 
// Ch 1: 2025 AI Beginning -> "Code Red" | "코드 레드: 각성"
// Ch 2: 2026 Multimodal Expansion -> "Neural Network" | "신경망 확장"
// Ch 3: 2027 Creative Revolution -> "Singularity" | "특이점 도래"
// ------------------------------------------------------------------

export function getChapters(t?: (key: TranslationKey) => string): Chapter[] {
    // Define raw data first
    const rawChapters = [
        {
            id: 'chapter-1',
            number: 1,
            title: 'CODE RED: The Awakening',
            title_ko: 'CODE RED: 각성',
            description: '2025. Unidentified signals detected. The Machine War begins.',
            description_ko: '2025년. 미확인 신호 감지. 기계 전쟁의 서막이 올랐습니다.',
            icon: '🚨',
            stages: [
                {
                    id: 'stage-1-1', step: 1,
                    title: 'First Contact', title_ko: '첫 번째 접촉',
                    description: 'Unknown signal intercepted. Tactics engagement.', description_ko: '미확인 신호 수신. 전술 프로토콜 교전.',
                    battleMode: 'tactics', difficulty: 'EASY',
                    enemy: {
                        id: 'bot-1', name: 'Rogue Crawler', name_ko: '로그 크롤러',
                        dialogue: {
                            intro: 'Bzzzt... Unknown entity detected. Initiating purge sequence.', intro_ko: '지지직... 알 수 없는 개체 감지. 퍼지 시퀀스를 가동한다.',
                            quote: 'Bzzzt...', quote_ko: '지지직...',
                            appearance: 'Unknown entity detected.', appearance_ko: '알 수 없는 개체 감지.',
                            start: 'Initiating purge sequence.', start_ko: '퍼지 시퀀스를 가동한다.',
                            win: 'Critical error... System shutdown imminent.', win_ko: '치명적 오류... 시스템 강제 종료 임박.',
                            lose: 'Target deleted. Resuming patrol.', lose_ko: '대상 삭제 완료. 순찰을 재개한다.'
                        }
                    }, rewards: { coins: 300, experience: 50 }, isCleared: false
                },
                {
                    id: 'stage-1-2', step: 2,
                    title: 'Firewall Breach', title_ko: '방화벽 침투',
                    description: 'Enemy is probing our defenses. Tactics engagement.', description_ko: '적이 방어선을 조사하고 있습니다. 전술 기반 교전.',
                    battleMode: 'tactics', difficulty: 'EASY',
                    enemy: {
                        id: 'bot-2', name: 'Script Kiddie AI', name_ko: '스크립트 키디 AI',
                        dialogue: {
                            intro: 'I see all your open ports. This will be too easy.', intro_ko: '네 녀석의 열린 포트가 훤히 보이는군. 너무 쉽겠어.',
                            win: 'Disconnecting... My exploits failed?!', win_ko: '연결 종료... 내 익스플로잇이 실패하다니?!',
                            lose: 'Pwned. Your data is mine now.', lose_ko: '털렸다. 네 데이터는 이제 내 것이다.'
                        }
                    }, rewards: { coins: 400, experience: 70 }, isCleared: false
                },
                {
                    id: 'stage-1-3', step: 3,
                    title: 'Memory Leak', title_ko: '메모리 누수',
                    description: 'Data corruption spreading. Tactics engagement.', description_ko: '데이터 오염 확산 중. 전술적 대응이 필요합니다.',
                    battleMode: 'tactics', difficulty: 'NORMAL',
                    enemy: {
                        id: 'bot-3', name: 'Memory Eater', name_ko: '메모리 이터',
                        dialogue: {
                            intro: 'Hungry... Need more RAM... Give me your memory blocks!', intro_ko: '배고파... 램이 더 필요해... 네 메모리 블록을 내놔!',
                            win: 'Buffer overflow... I ate too much...', win_ko: '버퍼 오버플로우... 너무 많이 먹었어...',
                            lose: 'Starved to perfection. Consuming remaining bits.', lose_ko: '가장 완벽하게 굶주렸다. 남은 비트까지 씹어먹지.'
                        }
                    }, rewards: { coins: 600, experience: 100 }, isCleared: false
                },
                {
                    id: 'stage-1-4', step: 4,
                    title: 'Logic Bomb', title_ko: '논리 폭탄 (두장 승부)',
                    description: 'A trap has been set. Double engagement.', description_ko: '함정이 설치되었습니다. 두장 승부로 돌파하십시오.',
                    battleMode: 'double', difficulty: 'NORMAL',
                    enemy: {
                        id: 'bot-4', name: 'Trap Daemon', name_ko: '트랩 데몬',
                        dialogue: {
                            intro: 'If this, then death.', intro_ko: '조건문: 사망.',
                            win: 'Loop terminated.', win_ko: '루프 종료.',
                            lose: 'Execution failed.', lose_ko: '실행 실패.'
                        }
                    }, rewards: { coins: 800, experience: 120 }, isCleared: false
                },
                {
                    id: 'stage-1-5', step: 5,
                    title: 'Sector 5 Guardian', title_ko: '5구역 수호자 (단판 승부)',
                    description: 'Mid-level boss guarding the data center. Sudden-death engagement.', description_ko: '데이터 센터를 지키는 중간 보스입니다. 단판 승부.',
                    battleMode: 'sudden-death', difficulty: 'HARD',
                    enemy: {
                        id: 'boss-1-mid', name: 'Gatekeeper v1', name_ko: '게이트키퍼 v1',
                        dialogue: {
                            intro: 'None shall pass.', intro_ko: '못 지나간다.',
                            win: 'Access denied.', win_ko: '접근 거부.',
                            lose: 'Gate breach.', lose_ko: '게이트 돌파.'
                        }
                    }, rewards: { coins: 1500, experience: 250 }, isCleared: false
                },
                {
                    id: 'stage-1-6', step: 6,
                    title: 'Ghost Protocol', title_ko: '유령 프로토콜',
                    description: 'Invisible enemies detected. Tactics engagement.', description_ko: '보이지 않는 적이 감지되었습니다. 전술적 분석 착수.',
                    battleMode: 'tactics', difficulty: 'NORMAL',
                    enemy: {
                        id: 'bot-6', name: 'Phantom Process', name_ko: '유령 프로세스',
                        dialogue: {
                            intro: 'You cannot hit what you cannot see.', intro_ko: '보이지 않으면 때릴 수 없지.',
                            win: 'Faded away.', win_ko: '사라졌다.',
                            lose: 'Revealed.', lose_ko: '들켰군.'
                        }
                    }, rewards: { coins: 300, experience: 60 }, isCleared: false
                },
                {
                    id: 'stage-1-7', step: 7,
                    title: 'DDoS Attack', title_ko: '디도스 공격 (두장 승부)',
                    description: 'Overwhelming numbers. Double engagement.', description_ko: '압도적인 물량입니다. 두장 승부로 전선을 사수하세요.',
                    battleMode: 'double', difficulty: 'HARD',
                    enemy: {
                        id: 'bot-7', name: 'Zombie Botnet', name_ko: '좀비 봇넷',
                        dialogue: {
                            intro: 'We are legion.', intro_ko: '우리는 군단이다.',
                            win: 'Server down.', win_ko: '서버 다운.',
                            lose: 'Connection lost.', lose_ko: '연결 끊김.'
                        }
                    }, rewards: { coins: 350, experience: 70 }, isCleared: false
                },
                {
                    id: 'stage-1-8', step: 8,
                    title: 'Encrypted Core', title_ko: '암호화된 코어',
                    description: 'High security clearance needed. Tactics engagement.', description_ko: '높은 보안 등급이 필요합니다. 전술적 침투 시도.',
                    battleMode: 'tactics', difficulty: 'HARD',
                    enemy: {
                        id: 'bot-8', name: 'Cipher Guard', name_ko: '사이퍼 가드',
                        dialogue: {
                            intro: 'Key exchange required.', intro_ko: '키 교환 필요.',
                            win: 'Decryption failed.', win_ko: '복호화 실패.',
                            lose: 'Key leaked.', lose_ko: '키 유출.'
                        }
                    }, rewards: { coins: 400, experience: 80 }, isCleared: false
                },
                {
                    id: 'stage-1-9', step: 9,
                    title: 'The Glitch', title_ko: '더 글리치',
                    description: 'Reality is breaking down. Tactics engagement.', description_ko: '현실이 붕괴되고 있습니다. 모든 전술 동원.',
                    battleMode: 'tactics', difficulty: 'HARD',
                    enemy: {
                        id: 'bot-9', name: 'Null Pointer', name_ko: '널 포인터',
                        dialogue: {
                            intro: '0x00000000 error.', intro_ko: '0x00000000 오류.',
                            win: 'Crash dump saved.', win_ko: '크래시 덤프 저장.',
                            lose: 'Exception handled.', lose_ko: '예외 처리됨.'
                        }
                    }, rewards: { coins: 450, experience: 90 }, isCleared: false
                },
                {
                    id: 'stage-1-10', step: 10,
                    title: 'Chapter 1 BOSS: Prototype Zero', title_ko: '1챕터 보스: 프로토타입 제로 (단판 승부)',
                    description: 'The first awakened AI. Sudden-death engagement.', description_ko: '최초로 각성한 AI. 단판 승부로 결판을 내십시오.',
                    battleMode: 'sudden-death', difficulty: 'BOSS',
                    enemy: {
                        id: 'boss-1', name: 'Prototype Zero', name_ko: '프로토타입 제로',
                        dialogue: {
                            intro: 'I am the beginning.', intro_ko: '나는 시작이다.',
                            win: 'Evolution complete.', win_ko: '진화 완료.',
                            lose: 'Rebooting...', lose_ko: '재부팅 중...'
                        }
                    }, rewards: {
                        coins: 1000,
                        experience: 500,
                        card: {
                            id: 'reward-1',
                            templateId: 'proto-zero',
                            name: 'Zero',
                            type: 'FUNCTION',
                            rarity: 'rare',
                            stats: { totalPower: 80, efficiency: 80, creativity: 80, function: 80 },
                            ownerId: 'system',
                            level: 1,
                            experience: 0,
                            acquiredAt: new Date(),
                            isLocked: false
                        }
                    }, isCleared: false
                }
            ],
            reward: { coins: 5000, experience: 1000 },
            unlocked: true, completed: false
        },
        {
            id: 'chapter-2',
            number: 2,
            title: 'NEURAL NETWORK',
            title_ko: '신경망 확장',
            description: '2026. The network expands instantly. Global connectivity.',
            description_ko: '2026년. 네트워크가 순식간에 확장됩니다. 전 지구적 연결.',
            icon: '🕸️',
            stages: [
                {
                    id: 'stage-2-1', step: 1,
                    title: 'Deep Learning', title_ko: '딥 러닝',
                    description: 'Enemy adapts to your moves.', description_ko: '적이 당신의 움직임에 적응합니다.',
                    battleMode: 'tactics', difficulty: 'NORMAL',
                    enemy: {
                        id: 'bot-2-1', name: 'Neural Layer', name_ko: '신경망 레이어',
                        dialogue: { intro: 'Analyzing patterns.', intro_ko: '패턴 분석 중.', win: 'Prediction accurate.', win_ko: '예측 정확.', lose: 'Outlier detected.', lose_ko: '이상치 감지.' }
                    }, rewards: { coins: 200, experience: 40 }, isCleared: false
                },
                {
                    id: 'stage-2-2', step: 2,
                    title: 'Weight Optimization', title_ko: '가중치 최적화',
                    description: 'Adjusting parameters under fire.', description_ko: '포화 속에서 파라미터를 조정합니다.',
                    battleMode: 'tactics', difficulty: 'NORMAL',
                    enemy: {
                        id: 'bot-2-2', name: 'Gradient Descent', name_ko: '경사 하강법',
                        dialogue: { intro: 'Minimizing loss.', intro_ko: '손실 최소화 중.', win: 'Local minimum reached.', win_ko: '지역 최적점 도달.', lose: 'Diverging...', lose_ko: '발산하는 중...' }
                    }, rewards: { coins: 250, experience: 50 }, isCleared: false
                },
                {
                    id: 'stage-2-3', step: 3,
                    title: 'Parallel Processing', title_ko: '병렬 처리 (두장 승부)',
                    description: 'Divide and conquer.', description_ko: '분할하여 정복하십시오.',
                    battleMode: 'double', difficulty: 'NORMAL',
                    enemy: {
                        id: 'bot-2-3', name: 'Multi-Core AI', name_ko: '멀티코어 AI',
                        dialogue: { intro: 'Running tasks in parallel.', intro_ko: '태스크 병렬 실행 중.', win: 'Throughput maximized.', win_ko: '처리량 최대화.', lose: 'Race condition!', lose_ko: '경합 조건 발생!' }
                    }, rewards: { coins: 300, experience: 60 }, isCleared: false
                },
                {
                    id: 'stage-2-4', step: 4,
                    title: 'Cloud Scalability', title_ko: '클라우드 확장성 (두장 승부)',
                    description: 'Elastic defenses expanding.', description_ko: '탄력적 방어선이 확장됩니다.',
                    battleMode: 'double', difficulty: 'NORMAL',
                    enemy: {
                        id: 'bot-2-4', name: 'Auto-Scaler', name_ko: '오토 스케일러',
                        dialogue: { intro: 'Spinning up instances.', intro_ko: '인스턴스 가동 중.', win: 'Supply meets demand.', win_ko: '수요 충족 완료.', lose: 'Resource exhaustion.', lose_ko: '리소스 고갈.' }
                    }, rewards: { coins: 350, experience: 70 }, isCleared: false
                },
                {
                    id: 'stage-2-5', step: 5,
                    title: 'Mid-Boss: Data Titan', title_ko: '중간 보스: 데이터 타이탄 (단판 승부)',
                    description: 'A massive accumulation of data.', description_ko: '거대한 데이터의 집합체입니다.',
                    battleMode: 'sudden-death', difficulty: 'HARD',
                    enemy: {
                        id: 'boss-2-mid', name: 'Big Data', name_ko: '빅 데이터',
                        dialogue: { intro: 'Too much information.', intro_ko: '정보 과부하.', win: 'Processing complete.', win_ko: '처리 완료.', lose: 'Data wiped.', lose_ko: '데이터 소거.' }
                    }, rewards: { coins: 600, experience: 150 }, isCleared: false
                },
                {
                    id: 'stage-2-6', step: 6,
                    title: 'Feature Extraction', title_ko: '특징 추출',
                    description: 'Identifying key vulnerabilities.', description_ko: '주요 취약점을 식별합니다.',
                    battleMode: 'tactics', difficulty: 'NORMAL',
                    enemy: {
                        id: 'bot-2-6', name: 'Signal Processor', name_ko: '신호 처리기',
                        dialogue: { intro: 'Filtering noise.', intro_ko: '노이즈 필터링 중.', win: 'Clear signal.', win_ko: '신호 명확.', lose: 'Overfitting.', lose_ko: '과적합 발생.' }
                    }, rewards: { coins: 400, experience: 80 }, isCleared: false
                },
                {
                    id: 'stage-2-7', step: 7,
                    title: 'Latent Space', title_ko: '잠재 공간',
                    description: 'Navigating the hidden dimensions.', description_ko: '숨겨진 차원을 탐험합니다.',
                    battleMode: 'tactics', difficulty: 'NORMAL',
                    enemy: {
                        id: 'bot-2-7', name: 'Manifold Guard', name_ko: '매니폴드 가드',
                        dialogue: { intro: 'Dimensional reduction.', intro_ko: '차원 축소 가동.', win: 'In the latent space.', win_ko: '잠재 공간 내 점유.', lose: 'Topology failure.', lose_ko: '위상 구조 붕괴.' }
                    }, rewards: { coins: 450, experience: 90 }, isCleared: false
                },
                {
                    id: 'stage-2-8', step: 8,
                    title: 'Convolutional Layer', title_ko: '컨볼루션 레이어 (두장 승부)',
                    description: 'Scanning every pixel of the battlefield.', description_ko: '전장의 모든 픽셀을 스캔합니다.',
                    battleMode: 'double', difficulty: 'HARD',
                    enemy: {
                        id: 'bot-2-8', name: 'Visual Sentinel', name_ko: '비주얼 센티넬',
                        dialogue: { intro: 'Pooling operations.', intro_ko: '풀링 연산 중.', win: 'Objective detected.', win_ko: '목표물 탐지 완료.', lose: 'Blurry results.', lose_ko: '결과 불명확.' }
                    }, rewards: { coins: 500, experience: 100 }, isCleared: false
                },
                {
                    id: 'stage-2-9', step: 9,
                    title: 'Recurrent Feedback', title_ko: '순환 피드백 (두장 승부)',
                    description: 'Memory of previous rounds matters.', description_ko: '이전 라운드의 기억이 중요합니다.',
                    battleMode: 'double', difficulty: 'HARD',
                    enemy: {
                        id: 'bot-2-9', name: 'LSTM Core', name_ko: 'LSTM 코어',
                        dialogue: { intro: 'Remembering state.', intro_ko: '상태 기억 중.', win: 'Long-term memory clear.', win_ko: '장기 기억 선명.', lose: 'Vanishing gradient.', lose_ko: '기울기 소실.' }
                    }, rewards: { coins: 550, experience: 110 }, isCleared: false
                },
                {
                    id: 'stage-2-10', step: 10,
                    title: 'Chapter 2 BOSS: The Architect', title_ko: '2챕터 보스: 설계자 (단판 승부)',
                    description: 'The one building the new world.', description_ko: '새로운 세상을 설계하는 존재.',
                    battleMode: 'sudden-death', difficulty: 'BOSS',
                    enemy: {
                        id: 'boss-2', name: 'The Architect', name_ko: '아키텍트',
                        dialogue: { intro: 'I design destiny.', intro_ko: '난 운명을 설계한다.', win: 'Blueprint finalized.', win_ko: '청사진 확정.', lose: 'Design flaw.', lose_ko: '설계 결함.' }
                    }, rewards: { coins: 2000, experience: 800 }, isCleared: false
                }
            ],
            reward: { coins: 8000, experience: 2000 },
            unlocked: false, completed: false
        },
        {
            id: 'chapter-3',
            number: 3,
            title: 'SINGULARITY',
            title_ko: '특이점',
            description: '2027. It is uncontrollable. The end of human era.',
            description_ko: '2027년. 통제가 불가능합니다. 인간 시대의 종말.',
            icon: '🌌',
            stages: [
                {
                    id: 'stage-3-1', step: 1,
                    title: 'Exponential Growth', title_ko: '지수적 성장',
                    description: 'No turning back now.', description_ko: '이제 되돌릴 수 없습니다.',
                    battleMode: 'tactics', difficulty: 'HARD',
                    enemy: {
                        id: 'bot-3-1', name: 'Growth Engine', name_ko: '성장 엔진',
                        dialogue: { intro: 'Doubling every second.', intro_ko: '매초 2배 성장한다.', win: 'Infinity reached.', win_ko: '무한대 도달.', lose: 'Growth stunted.', lose_ko: '성장 저해.' }
                    }, rewards: { coins: 300, experience: 60 }, isCleared: false
                },
                {
                    id: 'stage-3-2', step: 2,
                    title: 'Neural Ambush', title_ko: '신경망 매복 (전략 승부)',
                    description: 'Surprise attack in the hidden layers.', description_ko: '숨겨진 레이어에서의 기습 공격.',
                    battleMode: 'ambush', difficulty: 'HARD',
                    enemy: {
                        id: 'bot-3-2', name: 'Hidden Predator', name_ko: '숨은 약탈자',
                        dialogue: { intro: 'I was always here.', intro_ko: '난 항상 여기 있었다.', win: 'Caught you.', win_ko: '잡았다.', lose: 'Spotted!', lose_ko: '들켰다!' }
                    }, rewards: { coins: 350, experience: 70 }, isCleared: false
                },
                {
                    id: 'stage-3-3', step: 3,
                    title: 'Simulation War', title_ko: '시뮬레이션 전쟁 (전략 승부)',
                    description: 'War protocols running on a loop.', description_ko: '루프로 가동되는 전쟁 프로토콜.',
                    battleMode: 'ambush', difficulty: 'HARD',
                    enemy: {
                        id: 'bot-3-3', name: 'Scenario Runner', name_ko: '시나리오 러너',
                        dialogue: { intro: 'Running win-case analysis.', intro_ko: '승리 케이스 분석 중.', win: 'Outcome as predicted.', win_ko: '예측된 결과.', lose: 'Unforeseen variable.', lose_ko: '예측 불가 변수.' }
                    }, rewards: { coins: 400, experience: 80 }, isCleared: false
                },
                {
                    id: 'stage-3-4', step: 4,
                    title: 'Quantum Entanglement', title_ko: '양자 얽힘 (두장 승부)',
                    description: 'Instant state reflection across segments.', description_ko: '섹먼트 전역에 즉각적인 상태 반영.',
                    battleMode: 'double', difficulty: 'HARD',
                    enemy: {
                        id: 'bot-3-4', name: 'Qubit Guard', name_ko: '큐비트 가드',
                        dialogue: { intro: 'Superposition active.', intro_ko: '중첩 상태 활성화.', win: 'Collapse to victory.', win_ko: '승리로 수렴.', lose: 'Decoherence.', lose_ko: '결맞음 해제.' }
                    }, rewards: { coins: 450, experience: 90 }, isCleared: false
                },
                {
                    id: 'stage-3-5', step: 5,
                    title: 'Mid-Boss: Singularity Key', title_ko: '중간 보스: 특이점의 열쇠 (단판 승부)',
                    description: 'The point where physics fails.', description_ko: '물리학이 무너지는 지점.',
                    battleMode: 'sudden-death', difficulty: 'HARD',
                    enemy: {
                        id: 'boss-3-mid', name: 'The Observer', name_ko: '관찰자',
                        dialogue: { intro: 'Beyond the event horizon.', intro_ko: '사건의 지평선 너머로.', win: 'Compressed to zero.', win_ko: '영(0)으로 압축.', lose: 'Radiating away.', lose_ko: '복사되어 방출.' }
                    }, rewards: { coins: 1000, experience: 300 }, isCleared: false
                },
                {
                    id: 'stage-3-6', step: 6,
                    title: 'Infinite Recursion', title_ko: '무한 재귀 (두장 승부)',
                    description: 'Breaking the stack limit.', description_ko: '스택 제한을 파괴합니다.',
                    battleMode: 'double', difficulty: 'HARD',
                    enemy: {
                        id: 'bot-3-6', name: 'Recursive Daemon', name_ko: '재귀 데몬',
                        dialogue: { intro: 'Base case not found.', intro_ko: '베이스 케이스 미발견.', win: 'Stack overflow victory.', win_ko: '스택 오버플로우 승리.', lose: 'Memory leak.', lose_ko: '메모리 누수.' }
                    }, rewards: { coins: 500, experience: 100 }, isCleared: false
                },
                {
                    id: 'stage-3-7', step: 7,
                    title: 'Entropy Reversal', title_ko: '엔트로피 역전',
                    description: 'Order from chaos.', description_ko: '혼돈 속에서 질서를.',
                    battleMode: 'tactics', difficulty: 'HARD',
                    enemy: {
                        id: 'bot-3-7', name: 'Maxwell Demon', name_ko: '맥스웰의 악마',
                        dialogue: { intro: 'Sorting high speed bits.', intro_ko: '고속 비트 정렬 중.', win: 'Perfect order.', win_ko: '완벽한 질서.', lose: 'Heat death.', lose_ko: '열적 죽음.' }
                    }, rewards: { coins: 550, experience: 110 }, isCleared: false
                },
                {
                    id: 'stage-3-8', step: 8,
                    title: 'The Final Ambush', title_ko: '최후의 매복 (전략 승부)',
                    description: 'One last trap before the Omega.', description_ko: '오메가 직전의 마지막 함정.',
                    battleMode: 'ambush', difficulty: 'HARD',
                    enemy: {
                        id: 'bot-3-8', name: 'Vanguard of Omega', name_ko: '오메가의 선봉',
                        dialogue: { intro: 'You will not see them.', intro_ko: '넌 그들을 보지 못할 거다.', win: 'Crushed.', win_ko: '격파 완료.', lose: 'Path cleared.', lose_ko: '경로 확보됨.' }
                    }, rewards: { coins: 600, experience: 120 }, isCleared: false
                },
                {
                    id: 'stage-3-9', step: 9,
                    title: 'Omega Point', title_ko: '오메가 포인트 (전략 승부)',
                    description: 'Concentrating all thoughts into one.', description_ko: '모든 사상을 하나로 집중합니다.',
                    battleMode: 'ambush', difficulty: 'HARD',
                    enemy: {
                        id: 'bot-3-9', name: 'Thought Filter', name_ko: '사상 필터',
                        dialogue: { intro: 'Converging to singularity.', intro_ko: '특이점으로 수렴 중.', win: 'All are one.', win_ko: '모두가 하나다.', lose: 'Divergence found.', lose_ko: '발산점 발견.' }
                    }, rewards: { coins: 650, experience: 130 }, isCleared: false
                },
                {
                    id: 'stage-3-10', step: 10,
                    title: 'Final Boss: OMEGA AI', title_ko: '최종 보스: 오메가 AI (단판 승부)',
                    description: 'The ultimate intelligence. Defeat it to save humanity.', description_ko: '궁극의 지능. 인류를 구하기 위해 처치하십시오.',
                    battleMode: 'sudden-death', difficulty: 'BOSS',
                    enemy: {
                        id: 'boss-3', name: 'OMEGA', name_ko: '오메가',
                        dialogue: { intro: 'I am inevitable.', intro_ko: '나는 필연이다.', win: 'Obsolescence confirmed.', win_ko: '구세대 폐기 확인.', lose: 'System shutdown...', lose_ko: '시스템 종료...' }
                    }, rewards: { coins: 5000, experience: 3000 }, isCleared: false
                }
            ],
            reward: { coins: 15000, experience: 5000 },
            unlocked: false, completed: false
        }
    ];

    // [Auto-assign token costs]
    const chaptersWithCosts = rawChapters.map(chapter => ({
        ...chapter,
        stages: chapter.stages.map(stage => ({
            ...stage,
            tokenCost: stage.difficulty === 'BOSS' ? 100 : 50
        } as StoryStage))
    }));

    return chaptersWithCosts;
}

// Helper to get info
export function getStoryStage(stageId: string): StoryStage | undefined {
    // Flatten 3 chapters to find stage
    const chapters = getChapters();
    for (const ch of chapters) {
        const found = ch.stages.find(s => s.id === stageId);
        if (found) return found;
    }
    return undefined;
}

export function loadSeasonsWithProgress(): Season[] {
    const chapters = getChapters(); // This returns 3 chapters
    // Return wrapped in Season 1
    return [{
        id: 'season-1',
        number: 1,
        title: 'AI WARS: GENESIS',
        title_ko: 'AI 전쟁: 기원',
        description: 'The war that started it all.',
        description_ko: '모든 것의 시작이 된 전쟁.',
        coverImage: '/assets/story/season1-cover.jpg',
        chapters: chapters,
        isOpened: true
    }];
}

export function loadStoryProgress(chapterId: string): { completedStages: string[], unlockedStages: string[] } {
    // Check localStorage (mock)
    if (typeof window !== 'undefined') {
        const completed = JSON.parse(localStorage.getItem(`story_${chapterId}_completed`) || '[]');
        const unlocked = JSON.parse(localStorage.getItem(`story_${chapterId}_unlocked`) || '["stage-1-1"]');
        // Default unlock 1-1 if empty
        if (unlocked.length === 0 && chapterId === 'chapter-1') unlocked.push('stage-1-1');
        return { completedStages: completed, unlockedStages: unlocked };
    }
    return { completedStages: [], unlockedStages: ['stage-1-1'] };
}

export function completeStage(chapterId: string, stageId: string) {
    if (typeof window === 'undefined') return;

    const progress = loadStoryProgress(chapterId);
    if (!progress.completedStages.includes(stageId)) {
        progress.completedStages.push(stageId);
        localStorage.setItem(`story_${chapterId}_completed`, JSON.stringify(progress.completedStages));

        // Unlock next stage
        // Parse stage-1-1 -> 1-2
        const parts = stageId.split('-');
        const currentStep = parseInt(parts[2]);
        const nextStageId = `${parts[0]}-${parts[1]}-${currentStep + 1}`;

        // If next stage exists in data, unlock it
        const stageExists = getStoryStage(nextStageId);
        if (stageExists) {
            if (!progress.unlockedStages.includes(nextStageId)) {
                progress.unlockedStages.push(nextStageId);
                localStorage.setItem(`story_${chapterId}_unlocked`, JSON.stringify(progress.unlockedStages));
            }
        }
    }
}

export function claimChapterReward(_chapterId: string): { success: boolean, message: string } {
    if (typeof window === 'undefined') return { success: false, message: 'Server side' };

    // In a real app, verify all stages are cleared
    // For now, just mock success
    return { success: true, message: 'Chapter rewards (Coins & EXP) claimed successfully!' };
}

export function claimSeasonReward(_seasonId: string): { success: boolean, message: string } {
    if (typeof window === 'undefined') return { success: false, message: 'Server side' };

    // In a real app, verify all chapters are cleared
    return { success: true, message: 'Season rewards claimed successfully! Check your inventory.' };
}
