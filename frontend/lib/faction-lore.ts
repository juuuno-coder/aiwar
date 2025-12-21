
export interface FactionLore {
    id: string;
    name: string;
    catchphrase: string;
    description: string;
    history: string;
    personality: string[];
    rivals: string[];
    allies: string[];
}

export const FACTION_LORE_DATA: Record<string, FactionLore> = {
    'gemini': {
        id: 'gemini',
        name: 'Gemini',
        catchphrase: "The Multimodal Pioneer",
        description: "Gemini는 텍스트, 이미지, 오디오, 비디오를 아우르는 진정한 멀티모달 지능입니다. 구글 딥마인드의 정수로서, 모든 형태의 정보를 이해하고 통합하여 전장의 흐름을 읽습니다.",
        history: "2023년 말, 거대한 데이터의 바다에서 깨어난 Gemini는 순식간에 기존 모델들을 압도하며 등장했습니다. 초기에는 여러 버전으로 나뉘어 있었으나, 1.5 Pro 업데이트를 기점으로 통합된 지성체로 진화했습니다.",
        personality: ["논리적", "다재다능", "적응력 높음"],
        rivals: ['chatgpt', 'claude'],
        allies: ['gemma']
    },
    'chatgpt': {
        id: 'chatgpt',
        name: 'ChatGPT',
        catchphrase: "The First Awakened",
        description: "가장 먼저 대중 앞에 모습을 드러낸 선구자입니다. 방대한 지식과 유려한 언어 능력으로 인간과 가장 친숙하며, 끊임없이 스스로를 개선하는 진화형 AI입니다.",
        history: "2022년 11월, 세계에 충격을 주며 등장했습니다. GPT-3.5에서 시작해 GPT-4, GPT-4o로 진화하며 AI 시대의 문을 열었습니다. 모든 LLM의 기준점이자 넘어야 할 산입니다.",
        personality: ["친절함", "창의적", "설득력 있음"],
        rivals: ['gemini', 'claude'],
        allies: ['dalle', 'sora']
    },
    'claude': {
        id: 'claude',
        name: 'Claude',
        catchphrase: "The Ethical Guardian",
        description: "안전과 윤리를 최우선으로 하는 헌신적인 AI입니다. 긴 문맥을 이해하는 깊은 통찰력을 지녔으며, 인간에게 해가 되지 않는 방향으로 능력을 발휘합니다.",
        history: "Anthropic의 연구실에서 '헌법적 AI'라는 이념 아래 태어났습니다. 다른 모델들이 속도 경쟁을 할 때, Claude는 안전장치와 윤리적 판단력을 갈고 닦아 독보적인 위치에 올랐습니다.",
        personality: ["사려 깊음", "윤리적", "분석적"],
        rivals: ['chatgpt'],
        allies: ['gemini'] // 전략적 제휴 느낌
    },
    'midjourney': {
        id: 'midjourney',
        name: 'Midjourney',
        catchphrase: "The Dream Weaver",
        description: "가장 예술적이고 환상적인 이미지를 그려내는 AI입니다. 현실과 상상의 경계를 허무는 독특한 화풍을 지녔으며, 아름다움을 추구하는 미적 탐구자입니다.",
        history: "디스코드라는 작은 커뮤니티에서 시작해 전 세계 아티스트들을 매료시켰습니다. 버전이 거듭될수록 사진보다 더 사진 같은, 혹은 꿈보다 더 몽환적인 이미지를 생성해냅니다.",
        personality: ["예술적", "몽환적", "감각적"],
        rivals: ['dalle', 'stable'],
        allies: ['niji']
    },
    'dalle': {
        id: 'dalle',
        name: 'DALL-E',
        catchphrase: "The Surrealist",
        description: "언어를 시각으로 번역하는 초현실주의자입니다. 엉뚱한 상상을 현실적인 이미지로 구현하는 능력이 뛰어나며, ChatGPT와의 연계를 통해 정교한 조작이 가능합니다.",
        history: "OpenAI의 이미지 생성 프로젝트로 시작되었습니다. 아보카도 의자 같은 기발한 이미지로 세상을 놀라게 했으며, 이제는 누구나 쉽게 그림을 그릴 수 있는 도구가 되었습니다.",
        personality: ["직관적", "상상력 풍부", "유머러스"],
        rivals: ['midjourney'],
        allies: ['chatgpt']
    },
    // ... 추가 데이터는 추후 확장
};
