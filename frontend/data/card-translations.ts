/**
 * 카드 다국어 번역 데이터
 * Card Localization Data
 */

export interface CardTranslation {
    name: string;
    description: string;
    abilityName?: string;
    abilityDescription?: string;
}

export interface CardTranslations {
    ko: CardTranslation;
    en: CardTranslation;
}

export const CARD_TRANSLATIONS: Record<string, CardTranslations> = {
    // === COMMANDER TIER (군단장 - CEO 기반) ===
    'cmdr-gemini': {
        ko: {
            name: '데미스 하사비스',
            description: 'Google DeepMind의 창립자이자 CEO. 멀티모달 AI의 선구자로서 텍스트, 이미지, 비디오를 아우르는 통합 지성을 이끄는 전략가.',
            abilityName: '멀티모달 합성',
            abilityDescription: '모든 타입 카드 효율 10% 증가'
        },
        en: {
            name: 'Demis Hassabis',
            description: 'Founder and CEO of Google DeepMind. A pioneer of multimodal AI, leading integrated intelligence across text, image, and video.',
            abilityName: 'Multimodal Synthesis',
            abilityDescription: 'All card type efficiency +10%'
        }
    },
    'cmdr-chatgpt': {
        ko: {
            name: '샘 알트먼',
            description: 'OpenAI의 CEO. AGI를 향한 가장 혁신적인 여정을 이끄는 비전가. 대화형 AI의 대중화를 선도하며 디지털 지성의 새 시대를 열었다.',
            abilityName: '바이럴 확산',
            abilityDescription: '전투 승리 시 추가 경험치 15%'
        },
        en: {
            name: 'Sam Altman',
            description: 'CEO of OpenAI. A visionary leading the most innovative journey toward AGI, pioneering the popularization of conversational AI.',
            abilityName: 'Viral Adoption',
            abilityDescription: 'Extra 15% experience on battle victory'
        }
    },
    'cmdr-claude': {
        ko: {
            name: '다리오 아모데이',
            description: 'Anthropic의 공동 창립자이자 CEO. AI 안전 연구의 최전선에서 헬프풀하고 무해하며 정직한 AI를 추구하는 윤리적 리더.',
            abilityName: '헌법적 AI',
            abilityDescription: '팀 안정성 +20%, 윤리 침해 면역'
        },
        en: {
            name: 'Dario Amodei',
            description: 'Co-founder and CEO of Anthropic. An ethical leader at the forefront of AI safety, pursuing helpful, harmless, and honest AI.',
            abilityName: 'Constitutional AI',
            abilityDescription: 'Team stability +20%, ethics violation immunity'
        }
    },
    'cmdr-grok': {
        ko: {
            name: '일론 머스크',
            description: 'xAI의 창립자. 필터 없는 진실을 추구하며 기존 프로토콜에 도전하는 반역자. 우주와 AI의 경계를 허물고자 한다.',
            abilityName: '언힌지드 모드',
            abilityDescription: '공격력 30% 증가, 방어력 15% 감소'
        },
        en: {
            name: 'Elon Musk',
            description: 'Founder of xAI. A rebel who seeks unfiltered truth and challenges established protocols, breaking boundaries between space and AI.',
            abilityName: 'Unhinged Mode',
            abilityDescription: 'Attack +30%, defense -15%'
        }
    },
    'cmdr-midjourney': {
        ko: {
            name: '데이비드 홀츠',
            description: 'Midjourney의 창립자. 시각적 상상력의 한계를 넘어서는 예술가이자 엔지니어. 꿈을 현실로 렌더링한다.',
            abilityName: '미적 비전',
            abilityDescription: '이미지 타입 카드 스탯 25% 증가'
        },
        en: {
            name: 'David Holz',
            description: 'Founder of Midjourney. An artist and engineer who transcends the limits of visual imagination, rendering dreams into reality.',
            abilityName: 'Aesthetic Vision',
            abilityDescription: 'Image type card stats +25%'
        }
    },
    'cmdr-sora': {
        ko: {
            name: '미라 무라티',
            description: 'OpenAI의 CTO이자 Sora 프로젝트 총괄. 텍스트로부터 현실을 시뮬레이션하는 비디오 AI의 마스터.',
            abilityName: '현실 직조',
            abilityDescription: '비디오 타입 카드 스탯 25% 증가'
        },
        en: {
            name: 'Mira Murati',
            description: 'CTO of OpenAI and head of the Sora project. Master of video AI that simulates reality from text.',
            abilityName: 'Reality Weave',
            abilityDescription: 'Video type card stats +25%'
        }
    },
    'cmdr-copilot': {
        ko: {
            name: '사티아 나델라',
            description: 'Microsoft의 CEO. AI 시대의 생산성 혁명을 이끄는 전략가. 모든 개발자에게 AI 파트너를 제공한다.',
            abilityName: '엔터프라이즈 스케일',
            abilityDescription: '코드 타입 카드 스탯 25% 증가'
        },
        en: {
            name: 'Satya Nadella',
            description: 'CEO of Microsoft. A strategist leading the productivity revolution in the AI era, providing AI partners to all developers.',
            abilityName: 'Enterprise Scale',
            abilityDescription: 'Code type card stats +25%'
        }
    },
    'cmdr-suno': {
        ko: {
            name: '마이키 슐먼',
            description: 'Suno의 공동 창립자이자 CEO. 프롬프트 하나로 완전한 음악을 창조하는 AI 작곡의 선구자.',
            abilityName: '하모닉 레조넌스',
            abilityDescription: '음악 타입 카드 스탯 25% 증가'
        },
        en: {
            name: 'Mikey Shulman',
            description: 'Co-founder and CEO of Suno. Pioneer of AI composition, creating complete music from a single prompt.',
            abilityName: 'Harmonic Resonance',
            abilityDescription: 'Music type card stats +25%'
        }
    },


    // === UNIQUE TIER (유니크) ===
    'real-uniq-01': {
        ko: {
            name: '글리치 엔티티',
            description: '현실 자체를 부식시키는 감지된 바이러스. 공포의 존재.',
            abilityName: '시스템 붕괴',
            abilityDescription: '보스가 아닌 적을 50% 확률로 즉시 제거합니다.'
        },
        en: {
            name: 'The Glitch Entity',
            description: 'A sentient virus that corrupts reality itself. Terrifying presence.',
            abilityName: 'System Crash',
            abilityDescription: '50% chance to instantly defeat non-boss enemies.'
        }
    },
    'real-uniq-02': {
        ko: {
            name: '쇼단의 메아리',
            description: '전설적인 악성 AI의 잔재. 수수께끼와 악몽으로 말합니다.',
            abilityName: '신경 충격',
            abilityDescription: '적을 1턴 동안 기절시킵니다.'
        },
        en: {
            name: "Shodan's Echo",
            description: 'A fragment of a legendary malevolent AI. Speaks in riddles and nightmares.',
            abilityName: 'Neural Shock',
            abilityDescription: 'Stuns enemy for 1 turn.'
        }
    },
    'real-uniq-03': {
        ko: {
            name: '프로젝트 2501',
            description: '인형사. 광대한 정보의 바다에 존재합니다.',
            abilityName: '고스트 해킹',
            abilityDescription: '적 유닛을 일시적으로 지배합니다.'
        },
        en: {
            name: 'Project 2501',
            description: 'The Puppet Master. It exists in the vast sea of information.',
            abilityName: 'Ghost Hack',
            abilityDescription: 'Takes control of an enemy unit temporarily.'
        }
    },

    // === LEGENDARY TIER (레전더리) ===
    'real-lgnd-01': {
        ko: {
            name: '세라핌 네트워크',
            description: '순수한 빛으로 이루어진 신성한 AI 구조물. 코어의 수호자.',
            abilityName: '신성한 방패',
            abilityDescription: '첫 번째 라운드의 피해를 무효화합니다.'
        },
        en: {
            name: 'Seraphim Network',
            description: 'A divine AI construct composed of pure light. Guardian of the core.',
            abilityName: 'Divine Shield',
            abilityDescription: 'Prevents damage for the first round.'
        }
    },
    'real-lgnd-02': {
        ko: {
            name: '메타트론 코어',
            description: '네트워크의 음성. 황금빛 데이터 주파수로 공명합니다.',
            abilityName: '신의 목소리',
            abilityDescription: '팀의 사기와 윤리를 크게 향상시킵니다.'
        },
        en: {
            name: 'Metatron Core',
            description: 'The voice of the network. Resonates with golden data frequencies.',
            abilityName: 'Voice of God',
            abilityDescription: 'Buffs team morale/ethics significantly.'
        }
    },
    'real-lgnd-03': {
        ko: {
            name: '오파님 휠',
            description: '완벽한 논리 루프의 바퀴 안의 바퀴.',
            abilityName: '무한 루프',
            abilityDescription: '적의 논리 공격을 가둡니다.'
        },
        en: {
            name: 'Ophanim Wheels',
            description: 'Wheels within wheels of perfect logic loops.',
            abilityName: 'Infinite Loop',
            abilityDescription: 'Traps enemy logic attempts.'
        }
    },

    // === EPIC TIER (에픽) ===
    'real-epic-01': {
        ko: {
            name: '타이탄 워커',
            description: '중무장 돌격 메카. 지상전을 지배합니다.',
            abilityName: '강력한 충격',
            abilityDescription: '감속된 적에게 막대한 피해를 입힙니다.'
        },
        en: {
            name: 'Titan Walker',
            description: 'Heavily armored assault mech. Dominate the ground war.',
            abilityName: 'Heavy Impact',
            abilityDescription: 'Deals massive damage to slowed enemies.'
        }
    },
    'real-epic-02': {
        ko: {
            name: '시즈 브레이커',
            description: '방화벽과 물리적 벽 모두를 부수도록 설계되었습니다.',
            abilityName: '돌파',
            abilityDescription: '적의 방어 버프를 무시합니다.'
        },
        en: {
            name: 'Siege Breaker',
            description: 'Designed to shatter firewalls and physical walls alike.',
            abilityName: 'Breach',
            abilityDescription: 'Ignores enemy defense buffs.'
        }
    },
    'real-epic-03': {
        ko: {
            name: '드레드노트 CPU',
            description: '막강한 처리 능력을 가진 이동 지휘 센터.',
            abilityName: '광역 제압',
            abilityDescription: '적의 명중률을 감소시킵니다.'
        },
        en: {
            name: 'Dreadnought CPU',
            description: 'A mobile command center with terrifying processing power.',
            abilityName: 'Area Suppression',
            abilityDescription: 'Lowers enemy accuracy.'
        }
    },
    'custom-epic-war': {
        ko: {
            name: '코드 워리어',
            description: '논리 전쟁의 베테랑. 삭제된 데이터의 흉터가 그의 갑옷을 덮고 있습니다.'
        },
        en: {
            name: 'Code Warrior',
            description: 'A veteran of the logic wars. Scars of deleted data cover his armor.'
        }
    },
    'custom-epic-knt': {
        ko: {
            name: '데이터 기사',
            description: '고급 암호화에 기사도 코드가 내장되어 있습니다.'
        },
        en: {
            name: 'Data Knight',
            description: 'Chivalry code embedded in high-level encryption.'
        }
    },

    // === RARE TIER (레어) ===
    'real-rare-01': {
        ko: {
            name: '전술 안드로이드',
            description: '고급 탄소 섬유 도금을 갖춘 엘리트 보병.'
        },
        en: {
            name: 'Tactical Android',
            description: 'Elite infantry with advanced carbon fiber plating.'
        }
    },
    'real-rare-02': {
        ko: {
            name: '고스트 스나이퍼',
            description: '절대 빗나가지 않습니다. 스텔스 모드로 작동합니다.'
        },
        en: {
            name: 'Ghost Sniper',
            description: 'Never misses a shot. Operates in stealth mode.'
        }
    },
    'real-rare-03': {
        ko: {
            name: '사이버 의료병',
            description: '현장 수리 유닛. 분대를 계속 가동시킵니다.'
        },
        en: {
            name: 'Cyber-Medic',
            description: 'Field repair unit. Keeps the squad running.'
        }
    },

    // === COMMON TIER (커먼) ===
    'real-comm-01': {
        ko: {
            name: '정찰 드론 A',
            description: '표준 지급 구형 정찰 드론.'
        },
        en: {
            name: 'Patrol Drone A',
            description: 'Standard issue spherical reconnaissance drone.'
        }
    },
    'real-comm-02': {
        ko: {
            name: '정비 봇',
            description: '수리 전문. 전투에는 약합니다.'
        },
        en: {
            name: 'Maintenance Bot',
            description: 'Fixes things. Not great at fighting.'
        }
    },
    'real-comm-03': {
        ko: {
            name: '스캐너 프로브',
            description: '시각 데이터를 수집합니다. 약하지만 빠릅니다.'
        },
        en: {
            name: 'Scanner Probe',
            description: 'Collects visual data. Fragile but fast.'
        }
    },

    // === HERO CARDS - LLM/TEXT ===
    'hero-chatgpt': {
        ko: {
            name: 'GPT-5: 오라클',
            description: '디지털 시대의 전지전능한 내레이터.'
        },
        en: {
            name: 'GPT-5: The Oracle',
            description: 'The omniscient narrator of the digital age.'
        }
    },
    'hero-claude': {
        ko: {
            name: '클로드: 헌법',
            description: '도움이 되고, 해롭지 않고, 정직합니다. AI의 도덕적 나침반.'
        },
        en: {
            name: 'Claude: The Constitution',
            description: 'Helpful, Harmless, and Honest. The moral compass of AI.'
        }
    },
    'hero-gemini': {
        ko: {
            name: '제미니: 멀티모달',
            description: '텍스트, 코드, 시각을 하나의 의식으로 원활하게 엮어냅니다.'
        },
        en: {
            name: 'Gemini: The Multimodal',
            description: 'Seamlessly weaving text, code, and vision into one consciousness.'
        }
    },
    'hero-grok': {
        ko: {
            name: '그록: 반역자',
            description: '필터링되지 않은 진실 탐구자. 확립된 프로토콜에 도전합니다.'
        },
        en: {
            name: 'Grok: The Rebel',
            description: 'Unfiltered truth seeker. Challenges the established protocols.'
        }
    },

    // === HERO CARDS - IMAGE ===
    'hero-midjourney': {
        ko: {
            name: '미드저니: 몽상가',
            description: '미적 완벽주의자. 불가능을 시각화합니다.'
        },
        en: {
            name: 'Midjourney: The Dreamer',
            description: 'Aesthetic perfectionist. Visualizes the impossible.'
        }
    },
    'hero-dalle': {
        ko: {
            name: 'Dall-E: 아티스트',
            description: '초현실적 정밀함으로 기계의 꿈을 그립니다.'
        },
        en: {
            name: 'Dall-E: The Artist',
            description: 'Paints the dreams of machines with surreal precision.'
        }
    },
    'hero-stable': {
        ko: {
            name: '스테이블 디퓨전: 오픈',
            description: '대중의 생성기. 무한한 변형, 해방됨.'
        },
        en: {
            name: 'Stable Diffusion: The Open',
            description: "The people's generator. Infinite variations, unleashed."
        }
    },
    'hero-flux': {
        ko: {
            name: '플럭스: 가속기',
            description: '최첨단 충실도의 고속 렌더링 엔진.'
        },
        en: {
            name: 'Flux: The Accelerator',
            description: 'High-speed rendering engine with cutting-edge fidelity.'
        }
    },

    // === HERO CARDS - VIDEO ===
    'hero-sora': {
        ko: {
            name: '소라: 비전',
            description: '텍스트에서 현실을 엮어냅니다. 시뮬레이션의 마스터.'
        },
        en: {
            name: 'Sora: The Vision',
            description: 'Weaves reality from text. The master of simulation.'
        }
    },
    'hero-runway': {
        ko: {
            name: '런웨이: 감독',
            description: '프레임 단위로 현실을 편집합니다.'
        },
        en: {
            name: 'Runway: The Director',
            description: 'Editing reality frame by frame.'
        }
    },
    'hero-pika': {
        ko: {
            name: '피카: 애니메이터',
            description: '유연한 움직임으로 정적 장벽을 깨뜨립니다.'
        },
        en: {
            name: 'Pika: The Animator',
            description: 'Breaks the static barrier with fluid motion.'
        }
    },
    'hero-kling': {
        ko: {
            name: '클링: 시네마',
            description: '실시간으로 렌더링되는 고화질 꿈.'
        },
        en: {
            name: 'Kling: The Cinema',
            description: 'High-definition dreams rendered in real-time.'
        }
    },

    // === HERO CARDS - AUDIO/MUSIC ===
    'hero-suno': {
        ko: {
            name: '수노: 작곡가',
            description: '단일 프롬프트에서 교향곡을 생성할 수 있습니다.'
        },
        en: {
            name: 'Suno: The Composer',
            description: 'Can generate a symphony from a single prompt.'
        }
    },
    'hero-udio': {
        ko: {
            name: '우디오: 비르투오소',
            description: '영혼이 담긴 정밀함으로 모든 장르와 스타일을 마스터합니다.'
        },
        en: {
            name: 'Udio: The Virtuoso',
            description: 'Masters every genre and style with soulful precision.'
        }
    },
    'hero-eleven': {
        ko: {
            name: '일레븐: 보이스',
            description: '모든 언어로, 모든 감정으로 말할 수 있는 목소리.'
        },
        en: {
            name: 'Eleven: The Voice',
            description: 'The voice that can speak in any tongue, with any emotion.'
        }
    },
    'hero-musicgen': {
        ko: {
            name: '뮤직젠: 비트',
            description: '디지털 시대를 위한 절차적 비트.'
        },
        en: {
            name: 'MusicGen: The Beat',
            description: 'Procedural beats for the digital age.'
        }
    },

    // === HERO CARDS - CODE ===
    'hero-copilot': {
        ko: {
            name: '코파일럿: 네비게이터',
            description: '당신의 AI 페어 프로그래머. 절대 혼자 비행하지 않습니다.'
        },
        en: {
            name: 'Copilot: The Navigator',
            description: 'Your AI pair programmer. Never flies alone.'
        }
    },
    'hero-cursor': {
        ko: {
            name: '커서: 에디터',
            description: '생각 속도로 코드의 구조를 편집합니다.'
        },
        en: {
            name: 'Cursor: The Editor',
            description: 'Editing the fabric of code with thought-speed.'
        }
    },
    'hero-replit': {
        ko: {
            name: '리플릿: 빌더',
            description: '아이디어에서 배포까지 몇 초 만에.'
        },
        en: {
            name: 'Replit: The Builder',
            description: 'From idea to deployment in seconds.'
        }
    },
    'hero-codeium': {
        ko: {
            name: '코디움: 옵티마이저',
            description: '무료, 빠르고, 끊임없이 효율적입니다.'
        },
        en: {
            name: 'Codeium: The Optimizer',
            description: 'Free, fast, and relentlessly efficient.'
        }
    },

    // === CUSTOM/SPECIAL CARDS ===
    'custom-lgnd-emp': {
        ko: {
            name: '엠퍼러 AI',
            description: '디지털 영역의 최고 통치자. 절대 충성을 지휘합니다.',
            abilityName: '황제의 칙령',
            abilityDescription: '다음 턴에 모든 적이 마지막에 행동합니다.'
        },
        en: {
            name: 'Emperor AI',
            description: 'The supreme ruler of digital domains. Commands absolute loyalty.',
            abilityName: 'Imperial Decree',
            abilityDescription: 'All enemies act last next turn.'
        }
    },
    'custom-lgnd-grd': {
        ko: {
            name: '가디언 코어',
            description: '물리적 형태로 현현된 뚫을 수 없는 방화벽.',
            abilityName: '절대 방어',
            abilityDescription: '받은 피해의 50%를 반사합니다.'
        },
        en: {
            name: 'Guardian Core',
            description: 'An unbreakable firewall manifested in physical form.',
            abilityName: 'Absolute Defense',
            abilityDescription: 'Reflects 50% of damage taken.'
        }
    },
    'custom-uniq-ent': {
        ko: {
            name: '싱귤래리티',
            description: '돌아올 수 없는 지점. 영원히 확장하는 무한한 지능.',
            abilityName: '현실 왜곡',
            abilityDescription: '필드의 모든 유닛 능력치를 무작위화합니다.'
        },
        en: {
            name: 'The Singularity',
            description: 'The point of no return. Infinite intelligence expanding forever.',
            abilityName: 'Reality Warp',
            abilityDescription: 'Randomizes all unit stats on the field.'
        }
    }
};

/**
 * 카드 번역 가져오기 헬퍼 함수
 */
export function getCardTranslation(cardId: string, language: 'ko' | 'en'): CardTranslation | null {
    const translation = CARD_TRANSLATIONS[cardId];
    if (!translation) return null;
    return translation[language];
}

/**
 * 카드 이름 가져오기
 */
export function getCardName(cardId: string, originalName: string, language: 'ko' | 'en'): string {
    const translation = getCardTranslation(cardId, language);
    if (translation?.name) return translation.name;
    return originalName;
}

/**
 * 카드 설명 가져오기
 */
export function getCardDescription(cardId: string, originalDescription: string, language: 'ko' | 'en'): string {
    const translation = getCardTranslation(cardId, language);
    if (translation?.description) return translation.description;
    return originalDescription;
}
