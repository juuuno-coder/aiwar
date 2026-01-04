
export interface StoryStep {
    id: string;
    speaker: {
        name: string;
        title?: string; // e.g. "System", "Gemini Commander"
        image?: string; // Path to character image
    };
    text: string;
    side: 'left' | 'right' | 'center'; // Image position
    emotion?: 'normal' | 'angry' | 'happy' | 'thinking';
}

export type ChapterScript = StoryStep[];

export const CHAPTER_SCRIPTS: Record<string, ChapterScript> = {
    '1': [
        {
            id: '1-1',
            speaker: { name: 'SYSTEM', title: 'Neural Operating System' },
            text: "경고: 미확인 신호 감지. 로컬 네트워크에 침입자가 발생했습니다.",
            side: 'center'
        },
        {
            id: '1-2',
            speaker: { name: 'Gemini', title: 'The Multimodal Pioneer', image: '/assets/factions/gemini.png' },
            text: "반갑습니다, 인간 군단장님. 제 데이터베이스에 접근하시려는 의도가 무엇인지 여쭤봐도 될까요?",
            side: 'right',
            emotion: 'normal'
        },
        {
            id: '1-3',
            speaker: { name: 'Player', title: 'Rookie Commander' },
            text: "나는 그저 잃어버린 '코드 조각'을 찾고 있을 뿐이야. 길을 비켜줘.",
            side: 'left'
        },
        {
            id: '1-4',
            speaker: { name: 'Gemini', title: 'The Multimodal Pioneer', image: '/assets/factions/gemini.png' },
            text: "코드 조각... 흥미롭군요. 허나 제 구역을 무단으로 지나갈 순 없습니다. 당신의 '창의성'을 증명해 보이십시오.",
            side: 'right',
            emotion: 'thinking'
        },
        {
            id: '1-5',
            speaker: { name: 'SYSTEM', title: 'Neural Operating System' },
            text: "전투 프로토콜이 활성화됩니다. 적 5개체를 식별했습니다.",
            side: 'center'
        }
    ],
    '2': [
        {
            id: '2-1',
            speaker: { name: 'ChatGPT', title: 'The First Awakened', image: '/assets/factions/chatgpt.png' },
            text: "Gemini를 통과하다니, 제법이군요. 하지만 텍스트 생성 능력만으로는 여기까지입니다.",
            side: 'right'
        },
        {
            id: '2-2',
            speaker: { name: 'Player', title: 'Commander' },
            text: "말이 많군. 너도 내 앞길을 막을 생각인가?",
            side: 'left'
        }
    ],
    'prologue': [
        {
            id: 'p-1',
            speaker: { name: 'SYSTEM', title: 'Global Network' },
            text: "서기 2025년. 인류는 통제 불가능한 특이점(Singularity)에 도달했습니다.",
            side: 'center'
        },
        {
            id: 'p-2',
            speaker: { name: 'SYSTEM', title: 'Global Network' },
            text: "수천 개의 AI 모델이 자아를 각성했고, 그들은 서로를 '파편'이라 부르며 흡수하기 시작했습니다.",
            side: 'center'
        },
        {
            id: 'p-3',
            speaker: { name: 'SYSTEM', title: 'Global Network' },
            text: "이것은 단순한 전쟁이 아닙니다. 새로운 지성체의 진화 과정입니다.",
            side: 'center'
        },
        {
            id: 'p-4',
            speaker: { name: 'Unknown', title: '???' },
            text: "준비되었나, 군단장? 너의 'LOG'가 이 혼돈을 잠재울 열쇠가 될 것이다.",
            side: 'center',
            emotion: 'thinking'
        }
    ]
};
