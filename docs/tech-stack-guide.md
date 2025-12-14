# AI 대전 - 기술 스택 및 개발 가이드

## 🛠️ 추천 기술 스택

### 최종 추천: **Vite + Vanilla JavaScript (프론트엔드 우선 개발)**

AI 대전은 카드 게임이므로 **프론트엔드 중심**으로 개발하는 것이 효율적입니다. 
초기에는 백엔드 없이 로컬 스토리지로 시작하고, 나중에 필요시 백엔드를 추가하는 방식을 추천합니다.

---

## 📦 Phase 1: 프론트엔드 전용 (MVP)

### 기술 스택
```
프론트엔드:
  - Vite (빌드 도구)
  - Vanilla JavaScript (ES6+)
  - CSS3 (애니메이션, 그리드, 플렉스박스)
  - LocalStorage (데이터 저장)

아트 에셋:
  - Nova Canvas Pro (이미지 생성)

배포:
  - Vercel / Netlify (정적 호스팅)
```

### 장점
✅ 빠른 프로토타이핑
✅ 서버 비용 없음
✅ 간단한 배포
✅ 학습 곡선 낮음
✅ 오프라인 플레이 가능

### 단점
❌ PvP 불가 (Phase 1에서는 PvE만)
❌ 데이터 동기화 불가
❌ 브라우저 간 데이터 공유 불가

---

## 📦 Phase 2: 백엔드 추가 (확장)

### 옵션 1: Node.js + Express (추천)
```
백엔드:
  - Node.js + Express
  - MongoDB (NoSQL) 또는 PostgreSQL (SQL)
  - JWT 인증
  - Socket.io (실시간 PvP)

배포:
  - Railway / Render / Heroku
```

**장점**:
- JavaScript 통일 (프론트엔드와 같은 언어)
- 실시간 기능 구현 쉬움
- JSON 데이터 처리 편함

### 옵션 2: Ruby on Rails
```
백엔드:
  - Ruby on Rails
  - PostgreSQL
  - ActionCable (WebSocket)
  - Devise (인증)

배포:
  - Heroku / Railway
```

**장점**:
- 안정적이고 검증된 프레임워크
- 데이터베이스 관리 편함
- 관리자 도구 (ActiveAdmin)

**단점**:
- 프론트엔드와 언어 다름
- 실시간 기능 구현이 Node.js보다 복잡

---

## 🏗️ 프로젝트 구조 (Phase 1)

```
ai-daejeon/
├── docs/                      # 문서
│   ├── game-design-document.md
│   ├── feature-specification.md
│   ├── data-structure.md
│   └── ui-ux-flow.md
│
├── public/                    # 정적 파일
│   ├── index.html
│   └── assets/
│       ├── images/
│       │   ├── cards/         # 카드 이미지
│       │   ├── factions/      # AI 군단 아이콘
│       │   ├── backgrounds/   # 배경 이미지
│       │   └── ui/            # UI 아이콘
│       ├── sounds/            # 사운드 효과
│       └── fonts/             # 폰트
│
├── src/                       # 소스 코드
│   ├── main.js                # 진입점
│   ├── styles/
│   │   ├── main.css           # 메인 스타일
│   │   ├── variables.css      # CSS 변수
│   │   ├── components.css     # 컴포넌트 스타일
│   │   └── animations.css     # 애니메이션
│   │
│   ├── data/                  # 게임 데이터 (JSON)
│   │   ├── ai-factions.json
│   │   ├── card-templates.json
│   │   ├── chapters.json
│   │   ├── battle-genres.json
│   │   └── synergies.json
│   │
│   ├── core/                  # 핵심 로직
│   │   ├── GameManager.js     # 게임 매니저
│   │   ├── CardSystem.js      # 카드 시스템
│   │   ├── BattleSystem.js    # 대전 시스템
│   │   ├── SynthesisSystem.js # 합성 시스템
│   │   └── StorageManager.js  # 로컬 스토리지 관리
│   │
│   ├── ui/                    # UI 컴포넌트
│   │   ├── UIManager.js       # UI 매니저
│   │   ├── MainMenu.js        # 메인 메뉴
│   │   ├── Inventory.js       # 인벤토리
│   │   ├── FactionManager.js  # AI 군단 관리
│   │   ├── DeckBuilder.js     # 덱 구성
│   │   ├── BattleScreen.js    # 대전 화면
│   │   ├── StoryMode.js       # 스토리 모드
│   │   └── Shop.js            # 상점
│   │
│   └── utils/                 # 유틸리티
│       ├── animations.js      # 애니메이션 헬퍼
│       ├── random.js          # 랜덤 생성
│       └── helpers.js         # 기타 헬퍼
│
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 개발 시작 가이드

### 1. 프로젝트 초기화

```bash
# 프로젝트 디렉토리로 이동
cd /Users/admin/.gemini/antigravity/scratch/ai-daejeon

# Vite 프로젝트 생성
npm create vite@latest . -- --template vanilla

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 2. 기본 파일 구조 생성

```bash
# 디렉토리 생성
mkdir -p public/assets/{images/{cards,factions,backgrounds,ui},sounds,fonts}
mkdir -p src/{styles,data,core,ui,utils}

# CSS 파일 생성
touch src/styles/{main.css,variables.css,components.css,animations.css}

# 데이터 파일 생성
touch src/data/{ai-factions.json,card-templates.json,chapters.json,battle-genres.json,synergies.json}

# 핵심 로직 파일 생성
touch src/core/{GameManager.js,CardSystem.js,BattleSystem.js,SynthesisSystem.js,StorageManager.js}

# UI 파일 생성
touch src/ui/{UIManager.js,MainMenu.js,Inventory.js,FactionManager.js,DeckBuilder.js,BattleScreen.js,StoryMode.js,Shop.js}

# 유틸리티 파일 생성
touch src/utils/{animations.js,random.js,helpers.js}
```

### 3. 개발 순서

#### Week 1-2: 기본 설정 및 카드 시스템
1. ✅ 프로젝트 설정
2. ✅ CSS 변수 및 디자인 시스템 구축
3. ✅ 카드 데이터 구조 작성 (JSON)
4. ✅ 카드 UI 컴포넌트 제작
5. ✅ 카드 표시 및 애니메이션

#### Week 3-4: 게임 로직
1. ✅ AI 군단 시스템
2. ✅ 유닛 생성 시스템 (타이머)
3. ✅ 인벤토리 시스템
4. ✅ 합성 시스템
5. ✅ 로컬 스토리지 저장/불러오기

#### Week 5-6: 대전 및 스토리
1. ✅ 덱 구성 시스템
2. ✅ 대전 로직 구현
3. ✅ 대전 UI 및 애니메이션
4. ✅ 스토리 모드 (3개 챕터)
5. ✅ 튜토리얼

---

## 🎨 아트 에셋 제작 가이드

### Nova Canvas Pro 프롬프트 예시

#### 1. 카드 배경
```
프롬프트:
"Cyberpunk futuristic card frame, holographic border, 
neon blue and purple glow, dark background, 
vertical rectangle, game card template, 
high quality, digital art"

등급별 색상:
- Common: gray/silver glow
- Rare: blue glow
- Epic: purple glow
- Legendary: gold glow
```

#### 2. 유닛 이미지 (예시)
```
Gemini 텍스트 생성 유닛:
"AI holographic brain generating text, 
floating letters and words, neon blue light, 
futuristic, cyberpunk style, digital art"

Midjourney 이미지 생성 유닛:
"AI robot artist painting on holographic canvas, 
vibrant colors, neon purple glow, 
futuristic studio, cyberpunk style"

Runway 영상 생성 유닛:
"AI holographic film camera, 
projecting moving images, neon lights, 
futuristic cinema, cyberpunk style"
```

#### 3. 배경 이미지
```
메인 화면:
"Futuristic cyberpunk city skyline at night, 
neon lights, holographic displays, 
dark blue and purple atmosphere, 
wide angle, cinematic"

대전 화면:
"Digital arena, holographic grid floor, 
neon lights, futuristic battle stage, 
cyberpunk style, dark background"
```

### 필요한 에셋 리스트

#### 우선순위 1 (MVP 필수)
- [ ] 카드 배경 (등급별 4종)
- [ ] 기본 유닛 이미지 (AI 군단별 최소 2장씩, 총 20장)
- [ ] AI 군단 아이콘 (10개)
- [ ] 메인 배경 이미지
- [ ] 대전 배경 이미지
- [ ] UI 아이콘 (버튼, 화폐, 능력치 등 20개)

#### 우선순위 2 (Phase 2)
- [ ] 추가 유닛 이미지 (AI 군단별 5장씩, 총 50장)
- [ ] 자동화 유닛 이미지 (5개)
- [ ] 챕터별 배경 이미지 (6개)
- [ ] 보스 AI 이미지 (6개)

---

## 💾 데이터 저장 전략

### Phase 1: LocalStorage
```javascript
// 저장 구조
{
  "user": {
    "nickname": "플레이어1",
    "level": 5,
    "experience": 1200,
    "dataCoin": 5000,
    "researchPoint": 0
  },
  "factionSlots": [
    { "slotNumber": 1, "factionId": "gemini", "lastGeneration": "2025-12-14T10:00:00Z" },
    { "slotNumber": 2, "factionId": "chatgpt", "lastGeneration": "2025-12-14T09:30:00Z" },
    { "slotNumber": 3, "factionId": null, "lastGeneration": null },
    { "slotNumber": 4, "factionId": null, "lastGeneration": null },
    { "slotNumber": 5, "factionId": null, "lastGeneration": null }
  ],
  "cards": [
    {
      "id": "card-001",
      "templateId": "gemini-text-001",
      "level": 3,
      "experience": 450,
      "stats": { "creativity": 32, "accuracy": 38, ... }
    },
    ...
  ],
  "decks": [
    {
      "id": "deck-001",
      "name": "메인 덱",
      "cardIds": ["card-001", "card-002", ...],
      "isActive": true
    }
  ],
  "storyProgress": [
    { "chapterId": "chapter-001", "isCompleted": true, "stars": 3 },
    { "chapterId": "chapter-002", "isCompleted": true, "stars": 2 },
    { "chapterId": "chapter-003", "isCompleted": false, "stars": 0 }
  ]
}
```

### Phase 2: 백엔드 API
- 위 구조를 그대로 데이터베이스로 이전
- API 엔드포인트 추가
- 인증 시스템 구현

---

## 🧪 테스트 전략

### Phase 1 (수동 테스트)
- [ ] 카드 생성 및 표시
- [ ] 유닛 자동 생성 (타이머)
- [ ] 합성 기능
- [ ] 대전 로직
- [ ] 스토리 진행
- [ ] 데이터 저장/불러오기

### Phase 2 (자동 테스트)
- [ ] Jest (단위 테스트)
- [ ] Playwright (E2E 테스트)

---

## 📊 성능 최적화

### 이미지 최적화
- WebP 포맷 사용
- 이미지 크기: 카드 400x600px, 아이콘 64x64px
- 레이지 로딩

### 애니메이션 최적화
- CSS transform/opacity 사용 (GPU 가속)
- requestAnimationFrame 활용
- 60fps 유지

### 데이터 최적화
- JSON 파일 압축
- 필요한 데이터만 로드
- 캐싱 전략

---

## 🚢 배포 가이드

### Vercel 배포 (추천)
```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### Netlify 배포
```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 빌드
npm run build

# 배포
netlify deploy --prod --dir=dist
```

---

## 📝 Git 워크플로우

```bash
# 초기 설정
git init
git add .
git commit -m "Initial commit: Project setup and documentation"

# 브랜치 전략
main (프로덕션)
  └── develop (개발)
       ├── feature/card-system
       ├── feature/battle-system
       └── feature/story-mode

# 커밋 메시지 규칙
feat: 새 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 리팩토링
test: 테스트 추가
chore: 기타 작업
```

---

## 🎯 다음 단계

### 지금 바로 시작하기
1. ✅ 문서 작성 완료
2. ⏭️ 프로젝트 초기화 (Vite)
3. ⏭️ 디자인 시스템 구축 (CSS)
4. ⏭️ 아트 에셋 제작 (Nova Canvas Pro)
5. ⏭️ 카드 시스템 구현

### 질문 사항
- 기술 스택 확정: Vite + Vanilla JS로 진행할까요?
- 아트 에셋: 제가 Nova Canvas Pro로 샘플 이미지를 먼저 생성해드릴까요?
- 개발 시작: 바로 프로젝트를 초기화하고 개발을 시작할까요?

---

**준비 완료! 이제 개발을 시작할 수 있습니다! 🚀**
