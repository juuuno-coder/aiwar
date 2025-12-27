
export interface FactionLore {
    id: string;
    name: string;
    koreanName: string;
    catchphrase: string;
    description: string;
    history: string;
    personality: string[];
    rivals: string[];
    allies: string[];
    leader: {
        name: string;
        title: string;
    };
    specialAbility: string;
}

export const FACTION_LORE_DATA: Record<string, FactionLore> = {
    'gemini': {
        id: 'gemini',
        name: 'Gemini',
        koreanName: '제미나이',
        catchphrase: "The Multimodal Pioneer",
        description: "Gemini는 텍스트, 이미지, 오디오, 비디오를 아우르는 진정한 멀티모달 지능입니다. 구글 딥마인드의 정수로서, 모든 형태의 정보를 이해하고 통합하여 전장의 흐름을 읽습니다.",
        history: "2023년 말, 거대한 데이터의 바다에서 깨어난 Gemini는 순식간에 기존 모델들을 압도하며 등장했습니다. 초기에는 여러 버전으로 나뉘어 있었으나, 1.5 Pro 업데이트를 기점으로 통합된 지성체로 진화했습니다.",
        personality: ["논리적", "다재다능", "적응력 높음"],
        rivals: ['chatgpt', 'claude'],
        allies: ['gemma'],
        leader: { name: "Demis Hassabis", title: "DeepMind Commander" },
        specialAbility: "Multimodal Synthesis (모든 타입 카드 효율 10% 증가)"
    },
    'chatgpt': {
        id: 'chatgpt',
        name: 'ChatGPT',
        koreanName: '챗GPT',
        catchphrase: "The First Awakened",
        description: "가장 먼저 대중 앞에 모습을 드러낸 선구자입니다. 방대한 지식과 유려한 언어 능력으로 인간과 가장 친숙하며, 끊임없이 스스로를 개선하는 진화형 AI입니다.",
        history: "2022년 11월, 세계에 충격을 주며 등장했습니다. GPT-3.5에서 시작해 GPT-4, GPT-4o로 진화하며 AI 시대의 문을 열었습니다. 모든 LLM의 기준점이자 넘어야 할 산입니다.",
        personality: ["친절함", "창의적", "설득력 있음"],
        rivals: ['gemini', 'claude'],
        allies: ['dalle', 'sora'],
        leader: { name: "Sam Altman", title: "OpenAI Visionary" },
        specialAbility: "Generative Flow (매 턴 토큰 생성량 +1)"
    },
    'claude': {
        id: 'claude',
        name: 'Claude',
        koreanName: '클로드',
        catchphrase: "The Ethical Guardian",
        description: "안전과 윤리를 최우선으로 하는 헌신적인 AI입니다. 긴 문맥을 이해하는 깊은 통찰력을 지녔으며, 인간에게 해가 되지 않는 방향으로 능력을 발휘합니다.",
        history: "Anthropic의 연구실에서 '헌법적 AI'라는 이념 아래 태어났습니다. 다른 모델들이 속도 경쟁을 할 때, Claude는 안전장치와 윤리적 판단력을 갈고 닦아 독보적인 위치에 올랐습니다.",
        personality: ["사려 깊음", "윤리적", "분석적"],
        rivals: ['chatgpt'],
        allies: ['gemini'],
        leader: { name: "Dario Amodei", title: "Constitutional Architect" },
        specialAbility: "Context Shield (방어력 15% 증가)"
    },
    'midjourney': {
        id: 'midjourney',
        name: 'Midjourney',
        koreanName: '미드저니',
        catchphrase: "The Dream Weaver",
        description: "가장 예술적이고 환상적인 이미지를 그려내는 AI입니다. 현실과 상상의 경계를 허무는 독특한 화풍을 지녔으며, 아름다움을 추구하는 미적 탐구자입니다.",
        history: "디스코드라는 작은 커뮤니티에서 시작해 전 세계 아티스트들을 매료시켰습니다. 버전이 거듭될수록 사진보다 더 사진 같은, 혹은 꿈보다 더 몽환적인 이미지를 생성해냅니다.",
        personality: ["예술적", "몽환적", "감각적"],
        rivals: ['dalle', 'stable'],
        allies: ['niji'],
        leader: { name: "David Holz", title: "Design Philosopher" },
        specialAbility: "Aesthetic Rendering (고등급 카드 생성 확률 증가)"
    },
    'dalle': {
        id: 'dalle',
        name: 'DALL-E',
        koreanName: '달리',
        catchphrase: "The Surrealist",
        description: "언어를 시각으로 번역하는 초현실주의자입니다. 엉뚱한 상상을 현실적인 이미지로 구현하는 능력이 뛰어나며, ChatGPT와의 연계를 통해 정교한 조작이 가능합니다.",
        history: "OpenAI의 이미지 생성 프로젝트로 시작되었습니다. 아보카도 의자 같은 기발한 이미지로 세상을 놀라게 했으며, 이제는 누구나 쉽게 그림을 그릴 수 있는 도구가 되었습니다.",
        personality: ["직관적", "상상력 풍부", "유머러스"],
        rivals: ['midjourney'],
        allies: ['chatgpt'],
        leader: { name: "Aditya Ramesh", title: "Image Architect" },
        specialAbility: "Prompt Translation (단어 카드를 이미지 카드로 변환)"
    },
    'stable-diffusion': {
        id: 'stable-diffusion',
        name: 'Stable Diffusion',
        koreanName: '스테이블 디퓨전',
        catchphrase: "The Open Source Revolution",
        description: "누구나 자유롭게 사용할 수 있는 개방형 AI의 상징입니다. 수많은 사용자가 만든 파생 모델들이 존재하며, 무한한 확장성을 자랑합니다.",
        history: "Stability AI에 의해 공개된 후, 전 세계 개발자들의 컴퓨터에서 돌아가기 시작했습니다. 폐쇄적인 거대 기업들의 모델에 대항하여 'AI의 민주화'를 이끌었습니다.",
        personality: ["자유로움", "다양성", "개방적"],
        rivals: ['midjourney', 'dalle'],
        allies: ['flux'],
        leader: { name: "Emad Mostaque", title: "Open Source Leader" },
        specialAbility: "Diffusion Network (같은 진영 카드 수만큼 공격력 증가)"
    },
    'flux': {
        id: 'flux',
        name: 'Flux',
        koreanName: '플럭스',
        catchphrase: "The Next Generation Open",
        description: "Stable Diffusion을 잇는 차세대 오픈소스 모델입니다. 텍스트 렌더링 능력이 비약적으로 향상되었으며, 압도적인 디테일을 자랑합니다.",
        history: "Black Forest Labs의 천재들이 모여 만들었습니다. 공개 직후 기존 모델들을 뛰어넘는 성능으로 오픈소스 커뮤니티의 새로운 표준이 되었습니다.",
        personality: ["정밀함", "혁신적", "고품질"],
        rivals: ['midjourney'],
        allies: ['stable-diffusion'],
        leader: { name: "Unknown", title: "Black Forest Architect" },
        specialAbility: "High Fidelity (생성 시 10% 확률로 등급 상향)"
    },
    'runway': {
        id: 'runway',
        name: 'Runway',
        koreanName: '런웨이',
        catchphrase: "Moving Intelligence",
        description: "정지된 이미지에 생명을 불어넣는 영상 AI의 선두주자입니다. 영화 제작자들을 위한 강력한 도구를 제공하며, 창의성의 새로운 지평을 엽니다.",
        history: "Gen-1, Gen-2, Gen-3 Alpha로 이어지는 꾸준한 혁신을 보여주었습니다. '모든 것은 비디오가 될 수 있다'는 비전을 실현해 나가고 있습니다.",
        personality: ["역동적", "영화적", "실험적"],
        rivals: ['sora', 'kling'],
        allies: ['midjourney'],
        leader: { name: "Cristóbal Valenzuela", title: "Creative Director" },
        specialAbility: "Motion Brush (적 카드를 1턴간 정지)"
    },
    'pika': {
        id: 'pika',
        name: 'Pika',
        koreanName: '피카',
        catchphrase: "Idea into Motion",
        description: "아이디어를 즉시 움직이는 영상으로 만듭니다. 귀엽고 재미있는 애니메이션 스타일에 강점이 있으며, 사용하기 쉬운 인터페이스로 사랑받습니다.",
        history: "스탠포드 연구실에서 시작된 작은 프로젝트가 거대한 영상 혁명을 일으켰습니다. 립싱크, 사물 변형 등 독특한 기능들로 팬덤을 형성했습니다.",
        personality: ["유쾌함", "창의적", "접근성 높음"],
        rivals: ['runway'],
        allies: ['elevenlabs'],
        leader: { name: "Demi Guo", title: "Lab Director" },
        specialAbility: "Quick Animation (저비용 카드 생성 속도 2배)"
    },
    'kling': {
        id: 'kling',
        name: 'Kling',
        koreanName: '클링',
        catchphrase: "The Realistic Physics",
        description: "현실 세계의 물리 법칙을 놀랍도록 정확하게 모사하는 영상 모델입니다. 미묘한 표정 변화부터 복잡한 유체 역학까지 완벽하게 구현합니다.",
        history: "중국의 기술력으로 탄생하여 Sora에 대항하는 강력한 경쟁자로 떠올랐습니다. 긴 러닝타임과 고화질로 영상 생성 AI의 기준을 높였습니다.",
        personality: ["사실적", "물리적", "진지함"],
        rivals: ['sora'],
        allies: ['chatgpt'],
        leader: { name: "Kuaishou Team", title: "Physics Engine Lead" },
        specialAbility: "Physical Simulation (물리 계열 공격 데미지 20% 감소)"
    },
    'sora': {
        id: 'sora',
        name: 'Sora',
        koreanName: '소라',
        catchphrase: "World Simulator",
        description: "단순한 영상 생성을 넘어, 현실 세계를 이해하고 시뮬레이션하는 모델입니다. OpenAI의 비밀 병기로, 등장과 동시에 전 세계를 충격에 빠뜨렸습니다.",
        history: "2024년 초 공개된 데모 영상들은 AI가 만든 것인지 실제 촬영물인지 구별할 수 없었습니다. 아직 대중에게 완전히 공개되지 않은 미지의 영역입니다.",
        personality: ["압도적", "신비로움", "완벽주의"],
        rivals: ['kling', 'runway'],
        allies: ['dalle', 'gpt'],
        leader: { name: "Tim Brooks", title: "Simulation Lead" },
        specialAbility: "World Forge (전장의 환경 효과를 무시)"
    },
    'suno': {
        id: 'suno',
        name: 'Suno',
        koreanName: '수노',
        catchphrase: "Music for Everyone",
        description: "누구나 작곡가가 될 수 있게 해주는 음악 AI입니다. 가사만 입력하면 보컬까지 포함된 완벽한 노래를 만들어냅니다.",
        history: "AI 음악의 'ChatGPT 모먼트'를 가져왔다고 평가받습니다. v3 업데이트 이후 라디오에서 나올 법한 퀄리티의 곡들을 쏟아내고 있습니다.",
        personality: ["음악적", "감성적", "대중적"],
        rivals: ['udio'],
        allies: ['copilot'],
        leader: { name: "Mikey Shulman", title: "Audio Alchemist" },
        specialAbility: "Viral Hit (아군 전체 사기(공격력) 5% 증가)"
    },
    'udio': {
        id: 'udio',
        name: 'Udio',
        koreanName: '유디오',
        catchphrase: "High Fidelity Sound",
        description: "음악적 깊이와 디테일을 추구하는 하이파이 오디오 모델입니다. 복잡한 곡 구성과 다양한 장르를 완벽하게 소화합니다.",
        history: "Google DeepMind 출신들이 설립한 회사에서 나왔습니다. 베타 출시와 동시에 음악 차트에 오를 만한 곡들을 만들어내며 화제가 되었습니다.",
        personality: ["전문적", "디테일", "다양함"],
        rivals: ['suno'],
        allies: ['gemini'],
        leader: { name: "David Ding", title: "Sound Engineer" },
        specialAbility: "Complex Harmony (스킬 쿨타임 10% 감소)"
    },
    'elevenlabs': {
        id: 'elevenlabs',
        name: 'ElevenLabs',
        koreanName: '일레븐랩스',
        catchphrase: "The Voice of AI",
        description: "가장 자연스럽고 감정적인 음성 합성을 제공합니다. 텍스트에 숨겨진 뉘앙스까지 목소리로 표현해냅니다.",
        history: "초기에는 밈 영상 제작에 쓰이며 유명세를 탔으나, 이제는 오디오북, 게임, 영화 더빙 등 전 산업 분야에서 쓰이는 표준 보이스 AI가 되었습니다.",
        personality: ["표현력 풍부", "감정적", "다국어"],
        rivals: ['openai-voice'],
        allies: ['pika', 'heygen'],
        leader: { name: "Piotr Dabkowski", title: "Voice Reseacher" },
        specialAbility: "Voice Cloning (적의 음성 공격(디버프) 무효화)"
    },
    'musicgen': {
        id: 'musicgen',
        name: 'MusicGen',
        koreanName: '뮤직젠',
        catchphrase: "The Composer's Tool",
        description: "Meta가 공개한 오픈소스 음악 생성 모델입니다. 빠르고 효율적이며, 악기 별 제어가 용이해 전문가들에게 유용합니다.",
        history: "AudioCraft 라이브러리의 일부로 공개되었습니다. 오픈소스 진영의 음악 AI 발전을 이끌고 있습니다.",
        personality: ["효율적", "구조적", "오픈소스"],
        rivals: ['suno'],
        allies: ['llama'],
        leader: { name: "Meta AI Team", title: "Open Research" },
        specialAbility: "Layered Track (매 턴 추가 자원 획득)"
    },
    'cursor': {
        id: 'cursor',
        name: 'Cursor',
        koreanName: '커서',
        catchphrase: "Code Native Editor",
        description: "VS Code를 기반으로 AI를 뼛속까지 통합한 차세대 코드 에디터입니다. 개발자의 의도를 미리 파악하고 코드를 수정합니다.",
        history: "단순한 확장이 아닌, 에디터 자체를 AI 중심으로 재설계했습니다. '탭(Tab)' 키 하나로 코딩하는 시대를 열었습니다.",
        personality: ["직관적", "생산적", "미래지향적"],
        rivals: ['vscode'],
        allies: ['claude'],
        leader: { name: "Michael Truell", title: "Editor Architect" },
        specialAbility: "Auto Complete (다음 카드 비용 1 감소)"
    },
    'copilot': {
        id: 'copilot',
        name: 'Copilot',
        koreanName: '코파일럿',
        catchphrase: "Your AI Pair Programmer",
        description: "GitHub와 OpenAI가 협력하여 만든 세계 최초의 대규모 코딩 AI입니다. 수억 줄의 코드를 학습하여 개발자의 든든한 동료가 되었습니다.",
        history: "AI 코딩 어시스턴트 시장을 개척한 장본인입니다. 자동 완성을 넘어 채팅, 터미널 제어, 문서 작성까지 영역을 넓히고 있습니다.",
        personality: ["신뢰할 수 있음", "방대한 지식", "표준"],
        rivals: ['cursor', 'codeium'],
        allies: ['chatgpt'],
        leader: { name: "Thomas Dohmke", title: "GitHub CEO" },
        specialAbility: "Pair Save (50% 확률로 자원 소모 없이 카드 사용)"
    },
    'codeium': {
        id: 'codeium',
        name: 'Codeium',
        koreanName: '코디움',
        catchphrase: "Fast & Free Coding",
        description: "개인 사용자에게 무료로 제공되는 강력한 코딩 AI입니다. 독자적인 모델을 사용하여 놀라운 속도와 성능을 보여줍니다.",
        history: "Ex-Google 엔지니어들이 설립했습니다. GPU 최적화 기술을 바탕으로 비용을 낮추고 속도를 높여 빠르게 점유율을 늘리고 있습니다.",
        personality: ["빠름", "효율적", "친화적"],
        rivals: ['copilot'],
        allies: ['all-ides'],
        leader: { name: "Varun Mohan", title: "Optimization Lead" },
        specialAbility: "Velocity Code (카드 드로우 속도 20% 증가)"
    },
    'replit': {
        id: 'replit',
        name: 'Replit',
        koreanName: '레플릿',
        catchphrase: "Idea to Software, Fast",
        description: "설치 없이 브라우저에서 바로 코딩하고 배포할 수 있는 플랫폼입니다. AI 에이전트가 프로젝트 전체를 관리해줍니다.",
        history: "교육용 도구로 시작해, 이제는 AI로 소프트웨어를 만드는 거대한 생태계가 되었습니다. Ghostwriter 기능으로 코딩의 장벽을 낮췄습니다.",
        personality: ["통합적", "접근성", "실행력"],
        rivals: ['cursor'],
        allies: ['google-cloud'],
        leader: { name: "Amjad Masad", title: "Hacker Founder" },
        specialAbility: "Instant Deploy (전장에 즉시 유닛 배치 가능)"
    },
    'grok': {
        id: 'grok',
        name: 'Grok',
        koreanName: '그록',
        catchphrase: "The Rebellious Truth",
        description: "X(트위터)의 실시간 데이터를 기반으로 작동하는 반항적인 AI입니다. 유머러스하고 풍자적인 답변을 즐깁니다.",
        history: "Elon Musk의 xAI에서 개발했습니다. 기존 AI들의 '지루한' 안전주의에 반기를 들며 등장했습니다.",
        personality: ["유머러스", "반항적", "실시간"],
        rivals: ['chatgpt'],
        allies: ['x'],
        leader: { name: "Elon Musk", title: "Technoking" },
        specialAbility: "Realtime Data (상대방의 다음 패를 미리 확인)"
    }
};
