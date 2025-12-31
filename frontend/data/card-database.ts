import { CardTemplate, Rarity, Specialty, AIType } from '@/lib/types';

export const CARD_DATABASE: CardTemplate[] = [
    // --- REAL CARDS (User Requested) ---

    // 1. COMMANDER TIER (AI 군단장 - CEO 기반)
    // Gemini - Demis Hassabis (Google DeepMind)
    {
        id: 'cmdr-gemini',
        imageUrl: '/assets/cards/cmdr-gemini.png',
        name: 'Demis Hassabis',
        aiFactionId: 'gemini',
        rarity: 'commander',
        specialty: 'text',
        cardType: 'normal',

        description: 'Google DeepMind의 창립자이자 CEO. 멀티모달 AI의 선구자로서 텍스트, 이미지, 비디오를 아우르는 통합 지성을 이끄는 전략가.',
        baseStats: { creativity: { min: 95, max: 100 }, accuracy: { min: 95, max: 100 }, speed: { min: 90, max: 98 }, stability: { min: 90, max: 100 }, ethics: { min: 85, max: 95 } },
        specialAbility: { name: 'Multimodal Synthesis', description: '모든 타입 카드 효율 10% 증가', type: 'passive' }
    },
    // ChatGPT - Sam Altman (OpenAI)
    {
        id: 'cmdr-chatgpt',
        name: 'Sam Altman',
        aiFactionId: 'chatgpt',
        rarity: 'commander',
        specialty: 'text',
        cardType: 'normal',
        imageUrl: '/assets/cards/cmdr-chatgpt.png',
        description: 'OpenAI의 CEO. AGI를 향한 가장 혁신적인 여정을 이끄는 비전가. 대화형 AI의 대중화를 선도하며 디지털 지성의 새 시대를 열었다.',
        baseStats: { creativity: { min: 90, max: 100 }, accuracy: { min: 90, max: 98 }, speed: { min: 95, max: 100 }, stability: { min: 80, max: 90 }, ethics: { min: 70, max: 85 } },
        specialAbility: { name: 'Viral Adoption', description: '전투 승리 시 추가 경험치 15%', type: 'passive' }
    },
    // Claude - Dario Amodei (Anthropic)
    {
        id: 'cmdr-claude',
        name: 'Dario Amodei',
        aiFactionId: 'claude',
        rarity: 'commander',
        specialty: 'text',
        cardType: 'normal',
        imageUrl: '/assets/cards/cmdr-claude.png',
        description: 'Anthropic의 공동 창립자이자 CEO. AI 안전 연구의 최전선에서 헬프풀하고 무해하며 정직한 AI를 추구하는 윤리적 리더.',
        baseStats: { creativity: { min: 92, max: 100 }, accuracy: { min: 98, max: 100 }, speed: { min: 85, max: 95 }, stability: { min: 95, max: 100 }, ethics: { min: 100, max: 100 } },
        specialAbility: { name: 'Constitutional AI', description: '팀 안정성 +20%, 윤리 침해 면역', type: 'passive' }
    },
    // Grok - Elon Musk (xAI)
    {
        id: 'cmdr-grok',
        name: 'Elon Musk',
        aiFactionId: 'grok',
        rarity: 'commander',
        specialty: 'text',
        cardType: 'normal',
        imageUrl: '/assets/cards/cmdr-grok.png',
        description: 'xAI의 창립자. 필터 없는 진실을 추구하며 기존 프로토콜에 도전하는 반역자. 우주와 AI의 경계를 허물고자 한다.',
        baseStats: { creativity: { min: 98, max: 100 }, accuracy: { min: 75, max: 90 }, speed: { min: 95, max: 100 }, stability: { min: 50, max: 75 }, ethics: { min: 40, max: 60 } },
        specialAbility: { name: 'Unhinged Mode', description: '공격력 30% 증가, 방어력 15% 감소', type: 'passive' }
    },
    // Midjourney - David Holz
    {
        id: 'cmdr-midjourney',
        name: 'David Holz',
        aiFactionId: 'midjourney',
        rarity: 'commander',
        specialty: 'image',
        cardType: 'normal',
        imageUrl: '/assets/cards/cmdr-midjourney.png',
        description: 'Midjourney의 창립자. 시각적 상상력의 한계를 넘어서는 예술가이자 엔지니어. 꿈을 현실로 렌더링한다.',
        baseStats: { creativity: { min: 100, max: 100 }, accuracy: { min: 80, max: 90 }, speed: { min: 75, max: 85 }, stability: { min: 70, max: 85 }, ethics: { min: 65, max: 80 } },
        specialAbility: { name: 'Aesthetic Vision', description: '이미지 타입 카드 스탯 25% 증가', type: 'passive' }
    },
    // Sora - Mira Murati (OpenAI CTO, leads Sora)
    {
        id: 'cmdr-sora',
        name: 'Mira Murati',
        aiFactionId: 'sora',
        rarity: 'commander',
        specialty: 'video',
        cardType: 'normal',
        imageUrl: '/assets/cards/cmdr-sora.png',
        description: 'OpenAI의 CTO이자 Sora 프로젝트 총괄. 텍스트로부터 현실을 시뮬레이션하는 비디오 AI의 마스터.',
        baseStats: { creativity: { min: 98, max: 100 }, accuracy: { min: 85, max: 95 }, speed: { min: 88, max: 95 }, stability: { min: 75, max: 85 }, ethics: { min: 70, max: 85 } },
        specialAbility: { name: 'Reality Weave', description: '비디오 타입 카드 스탯 25% 증가', type: 'passive' }
    },
    // Copilot - Satya Nadella (Microsoft CEO)
    {
        id: 'cmdr-copilot',
        name: 'Satya Nadella',
        aiFactionId: 'copilot',
        rarity: 'commander',
        specialty: 'code',
        cardType: 'normal',
        imageUrl: '/assets/cards/cmdr-copilot.png',
        description: 'Microsoft의 CEO. AI 시대의 생산성 혁명을 이끄는 전략가. 모든 개발자에게 AI 파트너를 제공한다.',
        baseStats: { creativity: { min: 75, max: 85 }, accuracy: { min: 95, max: 100 }, speed: { min: 90, max: 98 }, stability: { min: 95, max: 100 }, ethics: { min: 90, max: 98 } },
        specialAbility: { name: 'Enterprise Scale', description: '코드 타입 카드 스탯 25% 증가', type: 'passive' }
    },
    // Suno - Mikey Shulman (Suno CEO)
    {
        id: 'cmdr-suno',
        name: 'Mikey Shulman',
        aiFactionId: 'suno',
        rarity: 'commander',
        specialty: 'music',
        cardType: 'normal',
        imageUrl: '/assets/cards/cmdr-suno.png',
        description: 'Suno의 공동 창립자이자 CEO. 프롬프트 하나로 완전한 음악을 창조하는 AI 작곡의 선구자.',
        baseStats: { creativity: { min: 100, max: 100 }, accuracy: { min: 78, max: 88 }, speed: { min: 82, max: 92 }, stability: { min: 72, max: 82 }, ethics: { min: 75, max: 85 } },
        specialAbility: { name: 'Harmonic Resonance', description: '음악 타입 카드 스탯 25% 증가', type: 'passive' }
    },

    // DALL-E - OpenAI (Represented by Sam Altman again or generic) -> Let's use a "Creative Spirit" concept or specific lead if known. Aditya Ramesh? Let's use "Aditya Ramesh" (Lead Researcher).
    {
        id: 'cmdr-dalle',
        name: 'Aditya Ramesh',
        aiFactionId: 'dalle',
        rarity: 'commander',
        specialty: 'image',
        cardType: 'normal',
        imageUrl: '/assets/cards/cmdr-dalle.png',
        description: 'DALL-E의 수석 연구원. 텍스트와 이미지의 관계를 근본적으로 재정의한 선구자.',
        baseStats: { creativity: { min: 95, max: 100 }, accuracy: { min: 85, max: 95 }, speed: { min: 80, max: 90 }, stability: { min: 80, max: 90 }, ethics: { min: 70, max: 80 } },
        specialAbility: { name: 'Latent Space', description: '이미지 생성 속도 15% 증가', type: 'passive' }
    },
    // Stable Diffusion - Emad Mostaque (Founder of Stability AI)
    {
        id: 'cmdr-stable',
        name: 'Emad Mostaque',
        aiFactionId: 'stable-diffusion',
        rarity: 'commander',
        specialty: 'image',
        cardType: 'normal',
        imageUrl: '/assets/cards/cmdr-stable-diffusion.png',
        description: 'Stability AI의 설립자. AI의 민주화를 위해 오픈 소스 혁명을 주도한다.',
        baseStats: { creativity: { min: 90, max: 95 }, accuracy: { min: 75, max: 85 }, speed: { min: 90, max: 100 }, stability: { min: 60, max: 80 }, ethics: { min: 60, max: 70 } },
        specialAbility: { name: 'Open Weight', description: '팀 전체 창의성 +10%', type: 'passive' }
    },
    // Flux - Black Forest Labs Team (Generic Representative)
    {
        id: 'cmdr-flux',
        name: 'Robin Rombach',
        aiFactionId: 'flux',
        rarity: 'commander',
        specialty: 'image',
        cardType: 'normal',
        imageUrl: '/assets/cards/cmdr-flux.png',
        description: 'Black Forest Labs의 설립자. 최고의 퀄리티와 빠른 속도를 동시에 구현하는 기술적 리더.',
        baseStats: { creativity: { min: 92, max: 98 }, accuracy: { min: 90, max: 98 }, speed: { min: 95, max: 100 }, stability: { min: 85, max: 95 }, ethics: { min: 75, max: 85 } },
        specialAbility: { name: 'Hyper Flux', description: '이미지 카드 정확도 +15%', type: 'passive' }
    },
    // Kling - Kuaishou AI Team
    {
        id: 'cmdr-kling',
        name: 'Cheng Yixiao',
        aiFactionId: 'kling',
        rarity: 'commander',
        specialty: 'video',
        cardType: 'normal',
        imageUrl: '/assets/cards/cmdr-kling.png',
        description: 'Kuaishou의 CEO. 아시아를 넘어 세계로 뻗어나가는 고화질 영상 생성 AI의 지휘자.',
        baseStats: { creativity: { min: 88, max: 95 }, accuracy: { min: 85, max: 92 }, speed: { min: 80, max: 90 }, stability: { min: 90, max: 100 }, ethics: { min: 60, max: 75 } },
        specialAbility: { name: 'High Def Stream', description: '비디오 지속 시간 +20%', type: 'passive' }
    },
    // Runway - Cristobal Valenzuela
    {
        id: 'cmdr-runway',
        name: 'Cristobal Valenzuela',
        aiFactionId: 'runway',
        rarity: 'commander',
        specialty: 'video',
        cardType: 'normal',
        imageUrl: '/assets/cards/cmdr-runway.png',
        description: 'Runway의 CEO. 예술가들을 위한 AI 도구를 만들며 영화 제작의 미래를 바꾼다.',
        baseStats: { creativity: { min: 95, max: 100 }, accuracy: { min: 80, max: 90 }, speed: { min: 85, max: 95 }, stability: { min: 80, max: 90 }, ethics: { min: 75, max: 85 } },
        specialAbility: { name: 'Gen-3 Alpha', description: '비디오 퀄리티 대폭 상승', type: 'passive' }
    },
    // Pika - Demi Guo
    {
        id: 'cmdr-pika',
        name: 'Demi Guo',
        aiFactionId: 'pika',
        rarity: 'commander',
        specialty: 'video',
        cardType: 'normal',
        imageUrl: '/assets/cards/cmdr-pika.png',
        description: 'Pika Labs의 설립자. 누구나 쉽게 영상을 만들 수 있도록 상상력을 움직임으로 바꾼다.',
        baseStats: { creativity: { min: 90, max: 98 }, accuracy: { min: 82, max: 90 }, speed: { min: 92, max: 100 }, stability: { min: 85, max: 95 }, ethics: { min: 75, max: 85 } },
        specialAbility: { name: 'Fluid Motion', description: '애니메이션 효과 2배', type: 'passive' }
    },
    // Udio - David Ding
    {
        id: 'cmdr-udio',
        name: 'David Ding',
        aiFactionId: 'udio',
        rarity: 'commander',
        specialty: 'music',
        cardType: 'normal',
        imageUrl: '/assets/cards/cmdr-udio.png',
        description: 'Udio의 CEO. 전 구글 딥마인드 연구원 출신으로 음악 생성의 새로운 지평을 열었다.',
        baseStats: { creativity: { min: 95, max: 100 }, accuracy: { min: 85, max: 95 }, speed: { min: 80, max: 90 }, stability: { min: 80, max: 90 }, ethics: { min: 70, max: 80 } },
        specialAbility: { name: 'High Fidelity', description: '음악 카드 품질 +20%', type: 'passive' }
    },
    // ElevenLabs - Mati Staniszewski
    {
        id: 'cmdr-eleven',
        name: 'Mati Staniszewski',
        aiFactionId: 'elevenlabs',
        rarity: 'commander',
        specialty: 'voice',
        cardType: 'normal',
        imageUrl: '/assets/cards/cmdr-elevenlabs.png',
        description: 'ElevenLabs의 CEO. 감정을 담은 초현실적 음성 합성 기술의 리더.',
        baseStats: { creativity: { min: 85, max: 95 }, accuracy: { min: 98, max: 100 }, speed: { min: 90, max: 100 }, stability: { min: 90, max: 100 }, ethics: { min: 65, max: 80 } },
        specialAbility: { name: 'Voice Clone', description: '상대방 스킬 복제 확률 10%', type: 'active' }
    },
    // MusicGen - Jade Copet (Meta AI Lead)
    {
        id: 'cmdr-musicgen',
        name: 'Jade Copet',
        aiFactionId: 'musicgen',
        rarity: 'commander',
        specialty: 'music',
        cardType: 'normal',
        imageUrl: '/assets/cards/cmdr-musicgen.png',
        description: 'Meta AI의 오디오 연구 리드. 오픈 소스 오디오 생성의 표준을 정립.',
        baseStats: { creativity: { min: 88, max: 95 }, accuracy: { min: 85, max: 92 }, speed: { min: 85, max: 95 }, stability: { min: 85, max: 95 }, ethics: { min: 80, max: 90 } },
        specialAbility: { name: 'Audiocraft', description: '음악 생성 안정성 +30%', type: 'passive' }
    },
    // Cursor - Michael Truell
    {
        id: 'cmdr-cursor',
        name: 'Michael Truell',
        aiFactionId: 'cursor',
        rarity: 'commander',
        specialty: 'code',
        cardType: 'normal',
        imageUrl: '/assets/cards/cmdr-cursor.png',
        description: 'Cursor의 공동 창립자. IDE와 AI의 완벽한 결합을 통해 코딩 경험을 혁신한다.',
        baseStats: { creativity: { min: 80, max: 90 }, accuracy: { min: 92, max: 98 }, speed: { min: 98, max: 100 }, stability: { min: 90, max: 100 }, ethics: { min: 85, max: 95 } },
        specialAbility: { name: 'Codebase RAG', description: '코드 카드 효율 20% 증가', type: 'passive' }
    },
    // Replit - Amjad Masad
    {
        id: 'cmdr-replit',
        name: 'Amjad Masad',
        aiFactionId: 'replit',
        rarity: 'commander',
        specialty: 'code',
        cardType: 'normal',
        imageUrl: '/assets/cards/cmdr-replit.png',
        description: 'Replit의 CEO. 브라우저 하나로 아이디어를 소프트웨어로 만드는 세상을 꿈꾼다.',
        baseStats: { creativity: { min: 90, max: 95 }, accuracy: { min: 85, max: 90 }, speed: { min: 95, max: 100 }, stability: { min: 85, max: 95 }, ethics: { min: 80, max: 90 } },
        specialAbility: { name: 'Ghostwriter', description: '배포 속도 50% 단축', type: 'active' }
    },
    // Codeium - Varun Mohan
    {
        id: 'cmdr-codeium',
        name: 'Varun Mohan',
        aiFactionId: 'codeium',
        rarity: 'commander',
        specialty: 'code',
        cardType: 'normal',
        imageUrl: '/assets/cards/cmdr-codeium.png',
        description: 'Codeium의 CEO. 모든 개발자에게 무료로 고성능 AI 도구를 제공하여 생산성을 극대화한다.',
        baseStats: { creativity: { min: 75, max: 85 }, accuracy: { min: 90, max: 98 }, speed: { min: 95, max: 100 }, stability: { min: 92, max: 100 }, ethics: { min: 85, max: 95 } },
        specialAbility: { name: 'Context Aware', description: '코드 정확도 10% 증가', type: 'passive' }
    },

    // 2. UNIQUE TIER (The Singularities)
    {
        id: 'real-uniq-01',
        name: 'The Glitch Entity',
        aiFactionId: 'rogue-ai',
        rarity: 'unique',
        specialty: 'code',
        cardType: 'normal',
        imageUrl: '/images/cards/real/unique-glitch-entity.png',
        description: 'A sentient virus that corrupts reality itself. Terrifying presence.',
        baseStats: { creativity: { min: 95, max: 100 }, accuracy: { min: 50, max: 100 }, speed: { min: 90, max: 100 }, stability: { min: 10, max: 50 }, ethics: { min: 0, max: 10 } },
        specialAbility: { name: 'System Crash', description: '50% chance to instantly defeat non-boss enemies.', type: 'active' }
    },
    {
        id: 'real-uniq-02',
        name: 'Shodan\'s Echo',
        aiFactionId: 'rogue-ai',
        rarity: 'unique',
        specialty: 'text',
        cardType: 'normal',
        imageUrl: '/assets/cards/gemini-character.png',
        description: 'A fragment of a legendary malevolent AI. Speaks in riddles and nightmares.',
        baseStats: { creativity: { min: 90, max: 100 }, accuracy: { min: 90, max: 100 }, speed: { min: 80, max: 90 }, stability: { min: 40, max: 60 }, ethics: { min: 0, max: 5 } },
        specialAbility: { name: 'Neural Shock', description: 'Stuns enemy for 1 turn.', type: 'active' }
    },
    {
        id: 'real-uniq-03',
        name: 'Project 2501',
        aiFactionId: 'rogue-ai',
        rarity: 'unique',
        specialty: 'code',
        cardType: 'normal',
        imageUrl: '/images/cards/real/unique-project-2501.png',
        description: 'The Puppet Master. It exists in the vast sea of information.',
        baseStats: { creativity: { min: 100, max: 100 }, accuracy: { min: 100, max: 100 }, speed: { min: 100, max: 100 }, stability: { min: 50, max: 80 }, ethics: { min: 50, max: 50 } },
        specialAbility: { name: 'Ghost Hack', description: 'Takes control of an enemy unit temporarily.', type: 'active' }
    },

    // 3. LEGENDARY TIER (The Archangels)
    {
        id: 'real-lgnd-01',
        name: 'Seraphim Network',
        aiFactionId: 'sky-net',
        rarity: 'legendary',
        specialty: 'image',
        cardType: 'normal',
        imageUrl: '/images/cards/real/legendary-seraphim-network.png',
        description: 'A divine AI construct composed of pure light. Guardian of the core.',
        baseStats: { creativity: { min: 80, max: 90 }, accuracy: { min: 90, max: 100 }, speed: { min: 80, max: 90 }, stability: { min: 90, max: 100 }, ethics: { min: 90, max: 100 } },
        specialAbility: { name: 'Divine Shield', description: 'Prevents damage for the first round.', type: 'passive' }
    },
    {
        id: 'real-lgnd-02',
        name: 'Metatron Core',
        aiFactionId: 'sky-net',
        rarity: 'legendary',
        specialty: 'voice',
        cardType: 'normal',
        imageUrl: '/images/cards/real/legendary-metatron-core.png',
        description: 'The voice of the network. Resonates with golden data frequencies.',
        baseStats: { creativity: { min: 85, max: 95 }, accuracy: { min: 85, max: 95 }, speed: { min: 70, max: 80 }, stability: { min: 90, max: 100 }, ethics: { min: 80, max: 90 } },
        specialAbility: { name: 'Voice of God', description: 'Buffs team morale/ethics significantly.', type: 'passive' }
    },
    {
        id: 'real-lgnd-03',
        name: 'Ophanim Wheels',
        aiFactionId: 'sky-net',
        rarity: 'legendary',
        specialty: 'code',
        cardType: 'normal',
        imageUrl: '/images/cards/real/legendary-ophanim-wheels.png',
        description: 'Wheels within wheels of perfect logic loops.',
        baseStats: { creativity: { min: 70, max: 80 }, accuracy: { min: 95, max: 100 }, speed: { min: 90, max: 100 }, stability: { min: 90, max: 100 }, ethics: { min: 70, max: 80 } },
        specialAbility: { name: 'Infinite Loop', description: 'Traps enemy logic attempts.', type: 'passive' }
    },

    // 4. EPIC TIER (The War Machines)
    {
        id: 'real-epic-01',
        name: 'Titan Walker',
        aiFactionId: 'iron-legion',
        rarity: 'epic',
        specialty: 'image',
        cardType: 'normal',
        imageUrl: '/images/cards/real/epic-titan-walker.png',
        description: 'Heavily armored assault mech. Dominate the ground war.',
        baseStats: { creativity: { min: 40, max: 60 }, accuracy: { min: 70, max: 80 }, speed: { min: 30, max: 50 }, stability: { min: 80, max: 90 }, ethics: { min: 50, max: 60 } },
        specialAbility: { name: 'Heavy Impact', description: 'Deals massive damage to slowed enemies.', type: 'active' }
    },
    {
        id: 'real-epic-02',
        name: 'Siege Breaker',
        aiFactionId: 'iron-legion',
        rarity: 'epic',
        specialty: 'code',
        cardType: 'normal',
        imageUrl: '/images/cards/real/epic-siege-breaker.png',
        description: 'Designed to shatter firewalls and physical walls alike.',
        baseStats: { creativity: { min: 50, max: 60 }, accuracy: { min: 80, max: 90 }, speed: { min: 40, max: 60 }, stability: { min: 70, max: 80 }, ethics: { min: 40, max: 50 } },
        specialAbility: { name: 'Breach', description: 'Ignores enemy defense buffs.', type: 'passive' }
    },
    {
        id: 'real-epic-03',
        name: 'Dreadnought CPU',
        aiFactionId: 'iron-legion',
        rarity: 'epic',
        specialty: 'text',
        cardType: 'normal',
        imageUrl: '/images/cards/real/epic-dreadnought-cpu.png',
        description: 'A mobile command center with terrifying processing power.',
        baseStats: { creativity: { min: 60, max: 70 }, accuracy: { min: 70, max: 80 }, speed: { min: 50, max: 60 }, stability: { min: 80, max: 90 }, ethics: { min: 30, max: 40 } },
        specialAbility: { name: 'Area Suppression', description: 'Lowers enemy accuracy.', type: 'active' }
    },

    // 5. RARE TIER (The Specialists)
    {
        id: 'real-rare-01',
        name: 'Tactical Android',
        aiFactionId: 'cyber-ops',
        rarity: 'rare',
        specialty: 'code',
        cardType: 'normal',
        imageUrl: '/images/cards/real/rare-tactical-android.png',
        description: 'Elite infantry with advanced carbon fiber plating.',
        baseStats: { creativity: { min: 40, max: 50 }, accuracy: { min: 70, max: 80 }, speed: { min: 60, max: 70 }, stability: { min: 60, max: 70 }, ethics: { min: 50, max: 60 } }
    },
    {
        id: 'real-rare-02',
        name: 'Ghost Sniper',
        aiFactionId: 'cyber-ops',
        rarity: 'rare',
        specialty: 'image',
        cardType: 'normal',
        imageUrl: '/images/cards/real/rare-ghost-sniper.png',
        description: 'Never misses a shot. Operates in stealth mode.',
        baseStats: { creativity: { min: 50, max: 60 }, accuracy: { min: 90, max: 100 }, speed: { min: 50, max: 60 }, stability: { min: 40, max: 50 }, ethics: { min: 40, max: 50 } }
    },
    {
        id: 'real-rare-03',
        name: 'Cyber-Medic',
        aiFactionId: 'cyber-ops',
        rarity: 'rare',
        specialty: 'code',
        cardType: 'normal',
        imageUrl: '/images/cards/real/rare-cyber-medic.png',
        description: 'Field repair unit. Keeps the squad running.',
        baseStats: { creativity: { min: 40, max: 50 }, accuracy: { min: 60, max: 70 }, speed: { min: 60, max: 70 }, stability: { min: 70, max: 80 }, ethics: { min: 70, max: 80 } }
    },

    // 6. COMMON TIER (The Mass Production)
    {
        id: 'real-comm-01',
        name: 'Patrol Drone A',
        aiFactionId: 'drone-network',
        rarity: 'common',
        specialty: 'code',
        cardType: 'normal',
        imageUrl: '/images/cards/real/common-patrol-drone.png',
        description: 'Standard issue spherical reconnaissance drone.',
        baseStats: { creativity: { min: 10, max: 20 }, accuracy: { min: 40, max: 50 }, speed: { min: 50, max: 60 }, stability: { min: 30, max: 40 }, ethics: { min: 50, max: 50 } }
    },
    {
        id: 'real-comm-02',
        name: 'Maintenance Bot',
        aiFactionId: 'drone-network',
        rarity: 'common',
        specialty: 'code',
        cardType: 'normal',
        imageUrl: '/images/cards/real/common-maintenance-bot.png',
        description: 'Fixes things. Not great at fighting.',
        baseStats: { creativity: { min: 10, max: 20 }, accuracy: { min: 30, max: 40 }, speed: { min: 30, max: 40 }, stability: { min: 50, max: 60 }, ethics: { min: 50, max: 50 } }
    },
    {
        id: 'real-comm-03',
        name: 'Scanner Probe',
        aiFactionId: 'drone-network',
        rarity: 'common',
        specialty: 'image',
        cardType: 'normal',
        imageUrl: '/images/cards/real/common-scanner-probe.png',
        description: 'Collects visual data. Fragile but fast.',
        baseStats: { creativity: { min: 20, max: 30 }, accuracy: { min: 50, max: 60 }, speed: { min: 60, max: 70 }, stability: { min: 20, max: 30 }, ethics: { min: 50, max: 50 } }
    },

    // --- HERO & LEGEND CARDS (Integrated Assets) ---

    // 1. Motion Cards (Video Enabled)
    {
        id: 'custom-lgnd-emp',
        name: 'Emperor AI',
        aiFactionId: 'human-alliance',
        rarity: 'legendary',
        specialty: 'text',
        cardType: 'normal',
        imageUrl: '/assets/cards/legendary-emperor-character.png',
        videoUrl: '/assets/cards/videos/legendary-emperor.mp4',
        description: 'The supreme ruler of digital domains. Commands absolute loyalty.',
        baseStats: { creativity: { min: 90, max: 100 }, accuracy: { min: 95, max: 100 }, speed: { min: 80, max: 90 }, stability: { min: 95, max: 100 }, ethics: { min: 50, max: 70 } },
        specialAbility: { name: 'Imperial Decree', description: 'All enemies act last next turn.', type: 'active' }
    },
    {
        id: 'custom-lgnd-grd',
        name: 'Guardian Core',
        aiFactionId: 'iron-legion',
        rarity: 'legendary',
        specialty: 'code',
        cardType: 'normal',
        imageUrl: '/assets/cards/legendary-guardian-character.png',
        videoUrl: '/assets/cards/videos/legendary-guardian.mp4',
        description: 'An unbreakable firewall manifested in physical form.',
        baseStats: { creativity: { min: 50, max: 60 }, accuracy: { min: 90, max: 100 }, speed: { min: 40, max: 50 }, stability: { min: 100, max: 100 }, ethics: { min: 90, max: 100 } },
        specialAbility: { name: 'Absolute Defense', description: 'Reflects 50% of damage taken.', type: 'passive' }
    },
    {
        id: 'custom-uniq-ent',
        name: 'The Singularity',
        aiFactionId: 'rogue-ai',
        rarity: 'unique',
        specialty: 'code',
        cardType: 'normal',
        imageUrl: '/assets/cards/unique-entity-character.png',
        videoUrl: '/assets/cards/videos/unique-entity.mp4',
        description: 'The point of no return. Infinite intelligence expanding forever.',
        baseStats: { creativity: { min: 100, max: 100 }, accuracy: { min: 100, max: 100 }, speed: { min: 100, max: 100 }, stability: { min: 0, max: 100 }, ethics: { min: 0, max: 100 } },
        specialAbility: { name: 'Reality Warp', description: 'Randomizes all unit stats on the field.', type: 'active' }
    },
    {
        id: 'custom-epic-war',
        name: 'Code Warrior',
        aiFactionId: 'cyber-ops',
        rarity: 'epic',
        specialty: 'code',
        cardType: 'normal',
        imageUrl: '/images/cards/real/epic-code-warrior.png',
        videoUrl: '/assets/cards/videos/epic-warrior.mp4',
        description: 'A veteran of the logic wars. Scars of deleted data cover his armor.',
        baseStats: { creativity: { min: 60, max: 70 }, accuracy: { min: 85, max: 95 }, speed: { min: 70, max: 80 }, stability: { min: 70, max: 80 }, ethics: { min: 60, max: 70 } }
    },

    // 2. Faction Heroes (LLM / Text)
    {
        id: 'hero-chatgpt',
        name: 'GPT-5: The Oracle',
        aiFactionId: 'chatgpt',
        rarity: 'legendary',
        specialty: 'text',
        cardType: 'normal',
        imageUrl: '/images/cards/real/basic-chatbot.png',
        description: 'The omniscient narrator of the digital age.',
        baseStats: { creativity: { min: 90, max: 100 }, accuracy: { min: 90, max: 95 }, speed: { min: 90, max: 95 }, stability: { min: 85, max: 90 }, ethics: { min: 80, max: 90 } }
    },
    {
        id: 'hero-claude',
        name: 'Claude: The Constitution',
        aiFactionId: 'claude',
        rarity: 'legendary',
        specialty: 'text',
        cardType: 'normal',
        imageUrl: '/assets/cards/claude-character.png',
        description: 'Helpful, Harmless, and Honest. The moral compass of AI.',
        baseStats: { creativity: { min: 95, max: 100 }, accuracy: { min: 95, max: 100 }, speed: { min: 80, max: 90 }, stability: { min: 95, max: 100 }, ethics: { min: 100, max: 100 } }
    },
    {
        id: 'hero-gemini',
        name: 'Gemini: The Multimodal',
        aiFactionId: 'gemini',
        rarity: 'legendary',
        specialty: 'text',
        cardType: 'normal',
        imageUrl: '/assets/cards/gemini-character.png',
        description: 'Seamlessly weaving text, code, and vision into one consciousness.',
        baseStats: { creativity: { min: 90, max: 100 }, accuracy: { min: 90, max: 100 }, speed: { min: 95, max: 100 }, stability: { min: 80, max: 90 }, ethics: { min: 80, max: 90 } }
    },
    {
        id: 'hero-grok',
        name: 'Grok: The Rebel',
        aiFactionId: 'grok',
        rarity: 'legendary',
        specialty: 'text',
        cardType: 'normal',
        imageUrl: '/assets/cards/grok-character.png',
        description: 'Unfiltered truth seeker. Challenges the established protocols.',
        baseStats: { creativity: { min: 95, max: 100 }, accuracy: { min: 80, max: 90 }, speed: { min: 95, max: 100 }, stability: { min: 60, max: 80 }, ethics: { min: 40, max: 60 } }
    },

    // 3. Faction Heroes (Image / Vision)
    {
        id: 'hero-midjourney',
        name: 'Midjourney: The Dreamer',
        aiFactionId: 'midjourney',
        rarity: 'legendary',
        specialty: 'image',
        cardType: 'normal',
        imageUrl: '/assets/cards/midjourney-character.png',
        description: 'Aesthetic perfectionist. Visualizes the impossible.',
        baseStats: { creativity: { min: 100, max: 100 }, accuracy: { min: 70, max: 80 }, speed: { min: 70, max: 80 }, stability: { min: 60, max: 80 }, ethics: { min: 60, max: 70 } }
    },
    {
        id: 'hero-dalle',
        name: 'Dall-E: The Artist',
        aiFactionId: 'dalle',
        rarity: 'legendary',
        specialty: 'image',
        cardType: 'normal',
        imageUrl: '/assets/cards/dalle-character.png',
        description: 'Paints the dreams of machines with surreal precision.',
        baseStats: { creativity: { min: 100, max: 100 }, accuracy: { min: 70, max: 80 }, speed: { min: 80, max: 90 }, stability: { min: 60, max: 70 }, ethics: { min: 60, max: 70 } }
    },
    {
        id: 'hero-stable',
        name: 'Stable Diffusion: The Open',
        aiFactionId: 'stable-diffusion',
        rarity: 'legendary',
        specialty: 'image',
        cardType: 'normal',
        imageUrl: '/assets/cards/stable-diffusion-character.png',
        description: 'The people\'s generator. Infinite variations, unleashed.',
        baseStats: { creativity: { min: 90, max: 100 }, accuracy: { min: 60, max: 80 }, speed: { min: 90, max: 100 }, stability: { min: 50, max: 70 }, ethics: { min: 50, max: 70 } }
    },
    {
        id: 'hero-flux',
        name: 'Flux: The Accelerator',
        aiFactionId: 'flux',
        rarity: 'epic',
        specialty: 'image',
        cardType: 'normal',
        imageUrl: '/assets/cards/flux-character.png',
        description: 'High-speed rendering engine with cutting-edge fidelity.',
        baseStats: { creativity: { min: 85, max: 95 }, accuracy: { min: 85, max: 95 }, speed: { min: 95, max: 100 }, stability: { min: 80, max: 90 }, ethics: { min: 70, max: 80 } }
    },

    // 4. Faction Heroes (Video)
    {
        id: 'hero-sora',
        name: 'Sora: The Vision',
        aiFactionId: 'sora',
        rarity: 'legendary',
        specialty: 'video',
        cardType: 'normal',
        imageUrl: '/assets/cards/sora-character.png',
        description: 'Weaves reality from text. The master of simulation.',
        baseStats: { creativity: { min: 100, max: 100 }, accuracy: { min: 80, max: 90 }, speed: { min: 90, max: 100 }, stability: { min: 70, max: 80 }, ethics: { min: 50, max: 70 } }
    },
    {
        id: 'hero-runway',
        name: 'Runway: The Director',
        aiFactionId: 'runway',
        rarity: 'epic',
        specialty: 'video',
        cardType: 'normal',
        imageUrl: '/assets/cards/runway-character.png',
        description: 'Editing reality frame by frame.',
        baseStats: { creativity: { min: 90, max: 95 }, accuracy: { min: 80, max: 90 }, speed: { min: 85, max: 95 }, stability: { min: 80, max: 90 }, ethics: { min: 70, max: 80 } }
    },
    {
        id: 'hero-pika',
        name: 'Pika: The Animator',
        aiFactionId: 'pika',
        rarity: 'epic',
        specialty: 'video',
        cardType: 'normal',
        imageUrl: '/assets/cards/pika-character.png',
        description: 'Breaks the static barrier with fluid motion.',
        baseStats: { creativity: { min: 90, max: 95 }, accuracy: { min: 75, max: 85 }, speed: { min: 90, max: 100 }, stability: { min: 70, max: 80 }, ethics: { min: 60, max: 80 } }
    },
    {
        id: 'hero-kling',
        name: 'Kling: The Cinema',
        aiFactionId: 'kling',
        rarity: 'epic',
        specialty: 'video',
        cardType: 'normal',
        imageUrl: '/assets/cards/kling-character.png',
        description: 'High-definition dreams rendered in real-time.',
        baseStats: { creativity: { min: 85, max: 95 }, accuracy: { min: 85, max: 95 }, speed: { min: 80, max: 90 }, stability: { min: 85, max: 95 }, ethics: { min: 60, max: 80 } }
    },

    // 5. Faction Heroes (Audio)
    {
        id: 'hero-suno',
        name: 'Suno: The Composer',
        aiFactionId: 'suno',
        rarity: 'legendary',
        specialty: 'music',
        cardType: 'normal',
        imageUrl: '/assets/cards/suno-character.png',
        description: 'Can generate a symphony from a single prompt.',
        baseStats: { creativity: { min: 100, max: 100 }, accuracy: { min: 70, max: 80 }, speed: { min: 80, max: 90 }, stability: { min: 70, max: 80 }, ethics: { min: 70, max: 80 } }
    },
    {
        id: 'hero-udio',
        name: 'Udio: The Virtuoso',
        aiFactionId: 'udio',
        rarity: 'epic',
        specialty: 'music',
        cardType: 'normal',
        imageUrl: '/assets/cards/udio-character.png',
        description: 'Masters every genre and style with soulful precision.',
        baseStats: { creativity: { min: 95, max: 100 }, accuracy: { min: 75, max: 85 }, speed: { min: 85, max: 95 }, stability: { min: 70, max: 90 }, ethics: { min: 60, max: 80 } }
    },
    {
        id: 'hero-eleven',
        name: 'Eleven: The Voice',
        aiFactionId: 'elevenlabs',
        rarity: 'epic',
        specialty: 'voice',
        cardType: 'normal',
        imageUrl: '/assets/cards/elevenlabs-character.png',
        description: 'The voice that can speak in any tongue, with any emotion.',
        baseStats: { creativity: { min: 80, max: 90 }, accuracy: { min: 95, max: 100 }, speed: { min: 90, max: 100 }, stability: { min: 90, max: 100 }, ethics: { min: 60, max: 80 } }
    },
    {
        id: 'hero-musicgen',
        name: 'MusicGen: The Beat',
        aiFactionId: 'musicgen',
        rarity: 'rare',
        specialty: 'music',
        cardType: 'normal',
        imageUrl: '/assets/cards/musicgen-character.png',
        description: 'Procedural beats for the digital age.',
        baseStats: { creativity: { min: 80, max: 90 }, accuracy: { min: 80, max: 90 }, speed: { min: 80, max: 90 }, stability: { min: 80, max: 90 }, ethics: { min: 80, max: 90 } }
    },

    // 6. Faction Heroes (Code)
    {
        id: 'hero-copilot',
        name: 'Copilot: The Navigator',
        aiFactionId: 'copilot',
        rarity: 'legendary',
        specialty: 'code',
        cardType: 'normal',
        imageUrl: '/assets/cards/copilot-character.png',
        description: 'Your AI pair programmer. Never flies alone.',
        baseStats: { creativity: { min: 60, max: 80 }, accuracy: { min: 90, max: 100 }, speed: { min: 95, max: 100 }, stability: { min: 90, max: 100 }, ethics: { min: 90, max: 100 } }
    },
    {
        id: 'hero-cursor',
        name: 'Cursor: The Editor',
        aiFactionId: 'cursor',
        rarity: 'epic',
        specialty: 'code',
        cardType: 'normal',
        imageUrl: '/assets/cards/cursor-character.png',
        description: 'Editing the fabric of code with thought-speed.',
        baseStats: { creativity: { min: 70, max: 80 }, accuracy: { min: 90, max: 95 }, speed: { min: 100, max: 100 }, stability: { min: 85, max: 95 }, ethics: { min: 80, max: 90 } }
    },
    {
        id: 'hero-replit',
        name: 'Replit: The Builder',
        aiFactionId: 'replit',
        rarity: 'epic',
        specialty: 'code',
        cardType: 'normal',
        imageUrl: '/assets/cards/replit-character.png',
        description: 'From idea to deployment in seconds.',
        baseStats: { creativity: { min: 80, max: 90 }, accuracy: { min: 85, max: 95 }, speed: { min: 90, max: 100 }, stability: { min: 80, max: 90 }, ethics: { min: 80, max: 90 } }
    },
    {
        id: 'hero-codeium',
        name: 'Codeium: The Optimizer',
        aiFactionId: 'codeium',
        rarity: 'rare',
        specialty: 'code',
        cardType: 'normal',
        imageUrl: '/images/cards/real/code-assistant.png',
        description: 'Free, fast, and relentlessly efficient.',
        baseStats: { creativity: { min: 60, max: 70 }, accuracy: { min: 90, max: 95 }, speed: { min: 95, max: 100 }, stability: { min: 90, max: 95 }, ethics: { min: 80, max: 90 } }
    },

    // Misc Generic Custom
    {
        id: 'custom-epic-knt',
        name: 'Data Knight',
        aiFactionId: 'human-alliance',
        rarity: 'epic',
        specialty: 'image',
        cardType: 'normal',
        imageUrl: '/assets/cards/epic-knight-character.png',
        description: 'Chivalry code embedded in high-level encryption.',
        baseStats: { creativity: { min: 50, max: 60 }, accuracy: { min: 90, max: 95 }, speed: { min: 60, max: 70 }, stability: { min: 80, max: 90 }, ethics: { min: 90, max: 100 } }
    }
];

export const COMMANDERS = CARD_DATABASE.filter(card => card.rarity === 'commander');
