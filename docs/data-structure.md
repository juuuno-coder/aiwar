# AI 대전 - 데이터 구조 설계

## 📊 개요
이 문서는 AI 대전 게임의 모든 데이터 구조를 정의합니다.

---

## 🗄️ 데이터베이스 스키마

### 1. Users (유저)

```json
{
  "id": "string (UUID)",
  "email": "string (unique)",
  "password_hash": "string",
  "nickname": "string (unique)",
  "avatar_url": "string (optional)",
  "level": "number (default: 1)",
  "experience": "number (default: 0)",
  "data_coin": "number (default: 1000)",
  "research_point": "number (default: 0)",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "last_login": "timestamp"
}
```

**인덱스**:
- `email` (unique)
- `nickname` (unique)

---

### 2. AI_Factions (AI 군단)

```json
{
  "id": "string (UUID)",
  "name": "string (unique)",
  "display_name": "string",
  "description": "string",
  "specialty": "array<string>",
  "generation_interval": "number (minutes)",
  "rarity_weights": {
    "common": "number (0-100)",
    "rare": "number (0-100)",
    "epic": "number (0-100)",
    "legendary": "number (0-100)"
  },
  "unlock_cost": "number (data_coin)",
  "unlock_condition": "string (optional)",
  "icon_url": "string",
  "created_at": "timestamp"
}
```

**예시 데이터**:
```json
{
  "id": "ai-001",
  "name": "gemini",
  "display_name": "Gemini",
  "description": "Google의 멀티모달 AI",
  "specialty": ["text", "image", "code"],
  "generation_interval": 30,
  "rarity_weights": {
    "common": 60,
    "rare": 30,
    "epic": 8,
    "legendary": 2
  },
  "unlock_cost": 0,
  "unlock_condition": "default",
  "icon_url": "/assets/factions/gemini.png"
}
```

---

### 3. Cards (카드)

```json
{
  "id": "string (UUID)",
  "card_template_id": "string (references CardTemplates.id)",
  "owner_id": "string (references Users.id)",
  "level": "number (1-10, default: 1)",
  "experience": "number (default: 0)",
  "stats": {
    "creativity": "number",
    "accuracy": "number",
    "speed": "number",
    "stability": "number",
    "ethics": "number",
    "total_power": "number (calculated)"
  },
  "acquired_at": "timestamp",
  "is_locked": "boolean (default: false)"
}
```

**인덱스**:
- `owner_id`
- `card_template_id`

---

### 4. Card_Templates (카드 템플릿)

```json
{
  "id": "string (UUID)",
  "name": "string",
  "ai_faction_id": "string (references AI_Factions.id)",
  "specialty": "string (text|image|video|music|code)",
  "rarity": "string (common|rare|epic|legendary)",
  "card_type": "string (normal|automated)",
  "image_url": "string",
  "description": "string",
  "base_stats": {
    "creativity": "object { min: number, max: number }",
    "accuracy": "object { min: number, max: number }",
    "speed": "object { min: number, max: number }",
    "stability": "object { min: number, max: number }",
    "ethics": "object { min: number, max: number }"
  },
  "special_ability": "object (optional)",
  "created_at": "timestamp"
}
```

**예시 데이터**:
```json
{
  "id": "card-template-001",
  "name": "Gemini 텍스트 생성기",
  "ai_faction_id": "ai-001",
  "specialty": "text",
  "rarity": "rare",
  "card_type": "normal",
  "image_url": "/assets/cards/gemini-text-001.png",
  "description": "Gemini의 강력한 텍스트 생성 능력",
  "base_stats": {
    "creativity": { "min": 20, "max": 35 },
    "accuracy": { "min": 25, "max": 35 },
    "speed": { "min": 20, "max": 30 },
    "stability": { "min": 20, "max": 35 },
    "ethics": { "min": 25, "max": 35 }
  }
}
```

---

### 5. User_Faction_Slots (유저 AI 군단 슬롯)

```json
{
  "id": "string (UUID)",
  "user_id": "string (references Users.id)",
  "slot_number": "number (1-5)",
  "ai_faction_id": "string (references AI_Factions.id, nullable)",
  "last_generation": "timestamp (nullable)",
  "next_generation": "timestamp (nullable)"
}
```

**인덱스**:
- `user_id, slot_number` (unique composite)

---

### 6. Decks (덱)

```json
{
  "id": "string (UUID)",
  "user_id": "string (references Users.id)",
  "name": "string",
  "card_ids": "array<string> (max 5)",
  "is_active": "boolean (default: false)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**인덱스**:
- `user_id`

---

### 7. Battles (대전 기록)

```json
{
  "id": "string (UUID)",
  "battle_type": "string (pve|pvp)",
  "player_id": "string (references Users.id)",
  "opponent_id": "string (references Users.id or AI)",
  "player_deck_id": "string (references Decks.id)",
  "opponent_deck_id": "string (references Decks.id)",
  "genre": "string (creativity|accuracy|speed|ethics|total)",
  "rounds": "array<object>",
  "winner_id": "string",
  "rewards": "object",
  "created_at": "timestamp"
}
```

**Rounds 구조**:
```json
{
  "round_number": "number (1-5)",
  "player_card_id": "string",
  "opponent_card_id": "string",
  "player_power": "number",
  "opponent_power": "number",
  "winner": "string (player|opponent)"
}
```

---

### 8. Story_Progress (스토리 진행도)

```json
{
  "id": "string (UUID)",
  "user_id": "string (references Users.id)",
  "chapter_id": "string (references Chapters.id)",
  "is_completed": "boolean (default: false)",
  "stars": "number (0-3)",
  "completed_at": "timestamp (nullable)"
}
```

**인덱스**:
- `user_id, chapter_id` (unique composite)

---

### 9. Chapters (챕터)

```json
{
  "id": "string (UUID)",
  "year": "number (2025-2030)",
  "title": "string",
  "description": "string",
  "difficulty": "string (easy|normal|hard|expert)",
  "unlock_condition": "string (optional)",
  "boss_deck": "object",
  "rewards": "object",
  "order": "number"
}
```

**예시 데이터**:
```json
{
  "id": "chapter-001",
  "year": 2025,
  "title": "AI의 시작",
  "description": "2025년, AI 기술이 막 발전하기 시작했다...",
  "difficulty": "easy",
  "unlock_condition": null,
  "boss_deck": {
    "name": "초기 AI",
    "cards": ["card-template-001", "card-template-002", ...]
  },
  "rewards": {
    "data_coin": 500,
    "ai_faction_unlock": "ai-002"
  },
  "order": 1
}
```

---

### 10. Daily_Missions (일일 미션)

```json
{
  "id": "string (UUID)",
  "mission_type": "string (win_battles|generate_units|synthesize_units|use_faction)",
  "title": "string",
  "description": "string",
  "target_count": "number",
  "rewards": "object",
  "is_active": "boolean (default: true)"
}
```

**예시 데이터**:
```json
{
  "id": "mission-001",
  "mission_type": "win_battles",
  "title": "대전 3회 승리",
  "description": "어떤 모드든 대전에서 3회 승리하세요",
  "target_count": 3,
  "rewards": {
    "data_coin": 200,
    "experience": 50
  }
}
```

---

### 11. User_Mission_Progress (유저 미션 진행도)

```json
{
  "id": "string (UUID)",
  "user_id": "string (references Users.id)",
  "mission_id": "string (references Daily_Missions.id)",
  "current_count": "number (default: 0)",
  "is_completed": "boolean (default: false)",
  "is_claimed": "boolean (default: false)",
  "date": "date (YYYY-MM-DD)"
}
```

**인덱스**:
- `user_id, mission_id, date` (unique composite)

---

### 12. Achievements (업적)

```json
{
  "id": "string (UUID)",
  "title": "string",
  "description": "string",
  "condition": "object",
  "rewards": "object",
  "icon_url": "string"
}
```

---

### 13. User_Achievements (유저 업적)

```json
{
  "id": "string (UUID)",
  "user_id": "string (references Users.id)",
  "achievement_id": "string (references Achievements.id)",
  "unlocked_at": "timestamp"
}
```

---

### 14. Transactions (거래 내역)

```json
{
  "id": "string (UUID)",
  "user_id": "string (references Users.id)",
  "transaction_type": "string (purchase|reward|synthesis|upgrade)",
  "currency_type": "string (data_coin|research_point)",
  "amount": "number",
  "description": "string",
  "created_at": "timestamp"
}
```

---

## 🎴 게임 데이터 (JSON)

### AI 군단 목록 (ai_factions.json)

```json
[
  {
    "id": "gemini",
    "display_name": "Gemini",
    "description": "Google의 멀티모달 AI",
    "specialty": ["text", "image", "code"],
    "generation_interval": 30,
    "rarity_weights": {
      "common": 60,
      "rare": 30,
      "epic": 8,
      "legendary": 2
    },
    "unlock_cost": 0,
    "icon_url": "/assets/factions/gemini.png"
  },
  {
    "id": "chatgpt",
    "display_name": "ChatGPT",
    "description": "OpenAI의 대화형 AI",
    "specialty": ["text", "code"],
    "generation_interval": 30,
    "rarity_weights": {
      "common": 60,
      "rare": 30,
      "epic": 8,
      "legendary": 2
    },
    "unlock_cost": 1000,
    "icon_url": "/assets/factions/chatgpt.png"
  },
  {
    "id": "claude",
    "display_name": "Claude",
    "description": "Anthropic의 안전한 AI",
    "specialty": ["text", "code"],
    "generation_interval": 30,
    "rarity_weights": {
      "common": 55,
      "rare": 32,
      "epic": 10,
      "legendary": 3
    },
    "unlock_cost": 1500,
    "icon_url": "/assets/factions/claude.png"
  },
  {
    "id": "midjourney",
    "display_name": "Midjourney",
    "description": "최고의 이미지 생성 AI",
    "specialty": ["image"],
    "generation_interval": 45,
    "rarity_weights": {
      "common": 50,
      "rare": 35,
      "epic": 12,
      "legendary": 3
    },
    "unlock_cost": 2000,
    "icon_url": "/assets/factions/midjourney.png"
  },
  {
    "id": "dalle",
    "display_name": "DALL-E",
    "description": "OpenAI의 이미지 생성 AI",
    "specialty": ["image"],
    "generation_interval": 40,
    "rarity_weights": {
      "common": 58,
      "rare": 30,
      "epic": 10,
      "legendary": 2
    },
    "unlock_cost": 1800,
    "icon_url": "/assets/factions/dalle.png"
  },
  {
    "id": "stable-diffusion",
    "display_name": "Stable Diffusion",
    "description": "오픈소스 이미지 생성 AI",
    "specialty": ["image"],
    "generation_interval": 35,
    "rarity_weights": {
      "common": 65,
      "rare": 28,
      "epic": 6,
      "legendary": 1
    },
    "unlock_cost": 1200,
    "icon_url": "/assets/factions/stable-diffusion.png"
  },
  {
    "id": "runway",
    "display_name": "Runway",
    "description": "영상 생성 및 편집 AI",
    "specialty": ["video"],
    "generation_interval": 60,
    "rarity_weights": {
      "common": 50,
      "rare": 35,
      "epic": 12,
      "legendary": 3
    },
    "unlock_cost": 3000,
    "icon_url": "/assets/factions/runway.png"
  },
  {
    "id": "kling",
    "display_name": "Kling",
    "description": "고품질 영상 생성 AI",
    "specialty": ["video"],
    "generation_interval": 60,
    "rarity_weights": {
      "common": 52,
      "rare": 33,
      "epic": 12,
      "legendary": 3
    },
    "unlock_cost": 2800,
    "icon_url": "/assets/factions/kling.png"
  },
  {
    "id": "suno",
    "display_name": "Suno",
    "description": "음악 생성 AI",
    "specialty": ["music"],
    "generation_interval": 50,
    "rarity_weights": {
      "common": 55,
      "rare": 32,
      "epic": 10,
      "legendary": 3
    },
    "unlock_cost": 2500,
    "icon_url": "/assets/factions/suno.png"
  },
  {
    "id": "elevenlabs",
    "display_name": "ElevenLabs",
    "description": "음성 합성 AI",
    "specialty": ["voice"],
    "generation_interval": 40,
    "rarity_weights": {
      "common": 60,
      "rare": 30,
      "epic": 8,
      "legendary": 2
    },
    "unlock_cost": 2000,
    "icon_url": "/assets/factions/elevenlabs.png"
  }
]
```

---

### 능력치 범위 (stat_ranges.json)

```json
{
  "common": {
    "creativity": { "min": 10, "max": 20 },
    "accuracy": { "min": 10, "max": 20 },
    "speed": { "min": 10, "max": 20 },
    "stability": { "min": 10, "max": 20 },
    "ethics": { "min": 10, "max": 20 }
  },
  "rare": {
    "creativity": { "min": 20, "max": 35 },
    "accuracy": { "min": 20, "max": 35 },
    "speed": { "min": 20, "max": 35 },
    "stability": { "min": 20, "max": 35 },
    "ethics": { "min": 20, "max": 35 }
  },
  "epic": {
    "creativity": { "min": 35, "max": 50 },
    "accuracy": { "min": 35, "max": 50 },
    "speed": { "min": 35, "max": 50 },
    "stability": { "min": 35, "max": 50 },
    "ethics": { "min": 35, "max": 50 }
  },
  "legendary": {
    "creativity": { "min": 50, "max": 70 },
    "accuracy": { "min": 50, "max": 70 },
    "speed": { "min": 50, "max": 70 },
    "stability": { "min": 50, "max": 70 },
    "ethics": { "min": 50, "max": 70 }
  }
}
```

---

### 대전 장르 (battle_genres.json)

```json
[
  {
    "id": "creativity",
    "name": "창작 대결",
    "description": "창의성이 2배로 적용됩니다",
    "stat_weights": {
      "creativity": 2.0,
      "accuracy": 1.0,
      "speed": 1.0,
      "stability": 1.0,
      "ethics": 1.0
    }
  },
  {
    "id": "accuracy",
    "name": "정확도 대결",
    "description": "정확성이 2배로 적용됩니다",
    "stat_weights": {
      "creativity": 1.0,
      "accuracy": 2.0,
      "speed": 1.0,
      "stability": 1.0,
      "ethics": 1.0
    }
  },
  {
    "id": "speed",
    "name": "속도 대결",
    "description": "속도가 2배로 적용됩니다",
    "stat_weights": {
      "creativity": 1.0,
      "accuracy": 1.0,
      "speed": 2.0,
      "stability": 1.0,
      "ethics": 1.0
    }
  },
  {
    "id": "ethics",
    "name": "윤리 대결",
    "description": "윤리성이 2배로 적용됩니다",
    "stat_weights": {
      "creativity": 1.0,
      "accuracy": 1.0,
      "speed": 1.0,
      "stability": 1.0,
      "ethics": 2.0
    }
  },
  {
    "id": "total",
    "name": "종합 대결",
    "description": "모든 능력치가 균등하게 적용됩니다",
    "stat_weights": {
      "creativity": 1.0,
      "accuracy": 1.0,
      "speed": 1.0,
      "stability": 1.0,
      "ethics": 1.0
    }
  }
]
```

---

### 시너지 (synergies.json)

```json
{
  "faction_bonus": {
    "2_cards": 1.10,
    "3_cards": 1.20,
    "4_cards": 1.30,
    "5_cards": 1.50
  },
  "combos": [
    {
      "id": "multimedia",
      "name": "멀티미디어 콤보",
      "required_specialties": ["image", "video", "music"],
      "bonus": {
        "creativity": 1.15
      }
    },
    {
      "id": "developer",
      "name": "개발자 콤보",
      "required_specialties": ["code", "text"],
      "bonus": {
        "accuracy": 1.15
      }
    },
    {
      "id": "creator",
      "name": "크리에이터 콤보",
      "required_specialties": ["image", "text", "music"],
      "bonus": {
        "creativity": 1.15
      }
    }
  ],
  "type_advantage": {
    "video": "image",
    "image": "text",
    "text": "code",
    "code": "video",
    "music": "voice",
    "voice": "music"
  },
  "advantage_bonus": 1.20
}
```

---

## 🔧 API 엔드포인트 (참고)

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/reset-password` - 비밀번호 재설정

### 유저
- `GET /api/users/me` - 내 정보 조회
- `PUT /api/users/me` - 내 정보 수정
- `GET /api/users/:id` - 특정 유저 정보 조회

### AI 군단
- `GET /api/factions` - 모든 AI 군단 목록
- `GET /api/factions/:id` - 특정 AI 군단 정보
- `POST /api/factions/:id/unlock` - AI 군단 영입

### 슬롯
- `GET /api/slots` - 내 슬롯 목록
- `PUT /api/slots/:slotNumber` - 슬롯에 AI 군단 배치
- `POST /api/slots/:slotNumber/generate` - 유닛 생성

### 카드
- `GET /api/cards` - 내 카드 목록
- `GET /api/cards/:id` - 특정 카드 정보
- `POST /api/cards/synthesize` - 카드 합성
- `POST /api/cards/:id/upgrade` - 카드 강화

### 덱
- `GET /api/decks` - 내 덱 목록
- `POST /api/decks` - 덱 생성
- `PUT /api/decks/:id` - 덱 수정
- `DELETE /api/decks/:id` - 덱 삭제

### 대전
- `POST /api/battles/pve` - PvE 대전 시작
- `GET /api/battles/:id` - 대전 정보 조회
- `GET /api/battles/history` - 대전 기록

### 스토리
- `GET /api/story/chapters` - 챕터 목록
- `GET /api/story/progress` - 내 진행도
- `POST /api/story/chapters/:id/start` - 챕터 시작

### 미션
- `GET /api/missions/daily` - 오늘의 미션
- `GET /api/missions/progress` - 내 미션 진행도
- `POST /api/missions/:id/claim` - 미션 보상 수령

### 상점
- `GET /api/shop/items` - 상점 아이템 목록
- `POST /api/shop/purchase` - 아이템 구매

---

## 📝 참고 사항

### 데이터 검증
- 모든 능력치는 양수
- 카드 레벨은 1~10
- 덱은 정확히 5장
- 화폐는 음수 불가

### 보안
- 비밀번호는 bcrypt로 해싱
- JWT 토큰 유효기간: 7일
- API 요청은 인증 필요

### 성능 최적화
- 카드 목록은 페이지네이션 (20장씩)
- 대전 기록은 최근 50개만 조회
- 인덱스 활용

---

이 데이터 구조를 기반으로 백엔드 API와 프론트엔드를 개발할 수 있습니다!
