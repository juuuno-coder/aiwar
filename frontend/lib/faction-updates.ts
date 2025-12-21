// 각 AI 군단의 최신 업데이트 정보
// 실제 AI 서비스 뉴스를 게임 세계관에 맞게 반영

export interface FactionUpdate {
    date: string;
    headline: string;
    details: string;
    impact: 'buff' | 'nerf' | 'neutral';
    version?: string;
}

export const FACTION_UPDATES: Record<string, FactionUpdate> = {
    gemini: {
        date: '2024.12',
        headline: 'Gemini 2.0 Flash 출시로 압도적 성능 강화!',
        details: '안티그래비티, 나노바나나Pro 등 최신 에이전트 도구와 완벽 연동. 실시간 스트리밍과 네이티브 이미지 생성 지원으로 멀티모달 능력 대폭 상승.',
        impact: 'buff',
        version: '2.0'
    },
    chatgpt: {
        date: '2024.12',
        headline: 'o1 모델로 추론 능력 비약적 향상',
        details: 'Chain-of-Thought 추론으로 복잡한 문제 해결 능력이 크게 강화. Sora와의 통합으로 영상 생성까지 지원.',
        impact: 'buff',
        version: 'o1'
    },
    claude: {
        date: '2024.11',
        headline: 'Claude 3.5 Sonnet 컴퓨터 제어 능력 추가',
        details: '화면을 직접 보고 마우스와 키보드를 조작하는 "컴퓨터 사용" 기능 도입. 코딩 영역에서 강세 유지.',
        impact: 'buff',
        version: '3.5'
    },
    grok: {
        date: '2024.12',
        headline: 'Grok-2 이미지 생성 기능 탑재',
        details: 'X 플랫폼 실시간 데이터와 연동되며, 이제 이미지 생성까지 지원. 검열 없는 솔직한 답변으로 인기.',
        impact: 'buff',
        version: '2.0'
    },
    midjourney: {
        date: '2024.12',
        headline: 'V7 베타 출시, 더욱 정교한 디테일',
        details: '인물 묘사와 손 표현이 크게 개선. 웹 에디터 기능 확장으로 접근성 향상.',
        impact: 'buff',
        version: 'V7'
    },
    dalle: {
        date: '2024.10',
        headline: 'DALL-E 3 글씨 렌더링 완벽 지원',
        details: '이미지 내 텍스트 렌더링 정확도 대폭 향상. ChatGPT 통합으로 편의성 증가.',
        impact: 'neutral',
        version: '3.0'
    },
    'stable-diffusion': {
        date: '2024.10',
        headline: 'Stable Diffusion 3.5 오픈소스 공개',
        details: '8B 파라미터 모델 완전 오픈소스화. 커뮤니티 기반 발전 가속.',
        impact: 'buff',
        version: '3.5'
    },
    flux: {
        date: '2024.11',
        headline: 'Flux Pro 1.1 속도 3배 향상',
        details: '생성 속도가 3배 빨라지면서도 품질 유지. 실시간 이미지 생성에 최적화.',
        impact: 'buff',
        version: '1.1'
    },
    kling: {
        date: '2024.11',
        headline: 'Kling 1.6 고품질 동영상 생성',
        details: '중국발 영상 AI의 반격. 1080p 고화질 영상과 자연스러운 모션 지원.',
        impact: 'buff',
        version: '1.6'
    },
    runway: {
        date: '2024.10',
        headline: 'Gen-3 Alpha Turbo 속도 개선',
        details: '할리우드급 품질을 유지하면서 생성 속도 50% 향상. 프로 크리에이터 필수 도구.',
        impact: 'buff',
        version: 'Gen-3'
    },
    pika: {
        date: '2024.11',
        headline: 'Pika 2.0 전면 리뉴얼',
        details: '새로운 모델 아키텍처로 품질 대폭 향상. 무료 크레딧 정책 유지로 접근성 최고.',
        impact: 'buff',
        version: '2.0'
    },
    sora: {
        date: '2024.12',
        headline: 'Sora 드디어 정식 출시!',
        details: 'OpenAI의 텍스트-투-비디오 모델 공개. 1분 길이 고품질 영상 생성 가능.',
        impact: 'buff',
        version: '1.0'
    },
    suno: {
        date: '2024.12',
        headline: 'Suno v4 음질 혁명',
        details: '스튜디오급 음질과 10분 길이 곡 생성 지원. 커버 기능 추가.',
        impact: 'buff',
        version: 'v4'
    },
    udio: {
        date: '2024.11',
        headline: 'Udio 1.5 장르 확장',
        details: '클래식부터 일렉트로닉까지 장르 범위 대폭 확대. 프로급 마스터링 품질.',
        impact: 'buff',
        version: '1.5'
    },
    elevenlabs: {
        date: '2024.12',
        headline: '다국어 음성 복제 정확도 99%',
        details: '한국어 포함 32개 언어 음성 복제 지원. 감정 표현력 대폭 향상.',
        impact: 'buff',
        version: '2.5'
    },
    musicgen: {
        date: '2024.09',
        headline: 'MusicGen Stereo 스테레오 출력',
        details: 'Meta의 오픈소스 음악 모델 업데이트. 스테레오 출력과 멜로디 컨디셔닝 지원.',
        impact: 'neutral',
        version: '1.1'
    },
    cursor: {
        date: '2024.12',
        headline: 'Cursor Agent 자율 코딩 시대',
        details: 'AI가 직접 터미널을 조작하고 코드를 수정하는 에이전트 모드 도입.',
        impact: 'buff',
        version: '0.44'
    },
    copilot: {
        date: '2024.11',
        headline: 'GitHub Copilot 멀티파일 에디팅',
        details: '여러 파일을 동시에 수정하는 Sparks 기능 추가. 코드 리뷰 자동화.',
        impact: 'buff',
        version: 'X'
    },
    replit: {
        date: '2024.10',
        headline: 'Replit Agent 앱 자동 생성',
        details: '자연어로 앱을 설명하면 자동으로 전체 코드베이스 생성.',
        impact: 'buff',
        version: 'Agent'
    },
    codeium: {
        date: '2024.11',
        headline: 'Windsurf IDE 출시',
        details: 'Codeium의 독자 IDE 출시. 무료 AI 코딩 보조의 새 기준.',
        impact: 'buff',
        version: 'Windsurf'
    }
};

/**
 * 군단 ID로 최신 업데이트 정보 가져오기
 */
export function getFactionUpdate(factionId: string): FactionUpdate | null {
    return FACTION_UPDATES[factionId] || null;
}

/**
 * 모든 업데이트를 날짜순으로 정렬하여 반환
 */
export function getRecentUpdates(limit: number = 5): Array<{ factionId: string; update: FactionUpdate }> {
    return Object.entries(FACTION_UPDATES)
        .map(([factionId, update]) => ({ factionId, update }))
        .sort((a, b) => b.update.date.localeCompare(a.update.date))
        .slice(0, limit);
}
