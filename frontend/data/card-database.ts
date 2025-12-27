import { CardTemplate, Rarity, Specialty, AIType } from '@/lib/types';

export const CARD_DATABASE: CardTemplate[] = [
    // --- REAL CARDS (User Requested) ---

    // 1. COMMANDER TIER (The Leaders)
    {
        id: 'real-cmdr-01',
        name: 'Grand Tactician High command',
        aiFactionId: 'human-alliance',
        rarity: 'commander',
        specialty: 'text',
        cardType: 'normal',
        imageUrl: '/images/cards/real/commander.png',
        description: 'Features a charismatic leader overseeing the digital battlefield. Master of strategy.',
        baseStats: { creativity: { min: 90, max: 100 }, accuracy: { min: 90, max: 100 }, speed: { min: 80, max: 95 }, stability: { min: 95, max: 100 }, ethics: { min: 90, max: 100 } },
        specialAbility: { name: 'Unified Command', description: 'Boosts all allies stats by 15%.', type: 'passive' }
    },
    {
        id: 'real-cmdr-02',
        name: 'Cyber-Warlord Zero',
        aiFactionId: 'machine-empire',
        rarity: 'commander',
        specialty: 'code',
        cardType: 'normal',
        imageUrl: '/assets/cards/cyber-warlord.png',
        description: 'A ruthless commander who calculates victory with zero emotion.',
        baseStats: { creativity: { min: 80, max: 90 }, accuracy: { min: 95, max: 100 }, speed: { min: 90, max: 100 }, stability: { min: 90, max: 100 }, ethics: { min: 10, max: 30 } },
        specialAbility: { name: 'Ruthless Efficiency', description: 'Sacrifices weak units to boost power.', type: 'active' }
    },
    {
        id: 'real-cmdr-03',
        name: 'Fleet Admiral Nova',
        aiFactionId: 'star-fleet',
        rarity: 'commander',
        specialty: 'video',
        cardType: 'normal',
        imageUrl: '/assets/cards/fleet-admiral.png',
        description: 'Commands the aerial drone fleets. Expert in rapid deployment.',
        baseStats: { creativity: { min: 85, max: 95 }, accuracy: { min: 85, max: 95 }, speed: { min: 95, max: 100 }, stability: { min: 80, max: 90 }, ethics: { min: 70, max: 90 } },
        specialAbility: { name: 'Air Superiority', description: 'First strike guaranteed in battle.', type: 'passive' }
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
        imageUrl: '/assets/cards/shodan-echo.png',
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
