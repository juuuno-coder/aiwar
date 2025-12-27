Log: Narrative_and_Visual_Polish (스토리_및_비주얼_폴리싱)
Original Date: 2025-12-20 13:21:00
Key Goal: 스토리 모드 몰입감 강화(Visual Novel Style) 및 카드 비주얼 통합(Faction Branding)

📝 상세 작업 일지 (Chronological)

Story Cutscene System (스토리 컷신 시스템)
상황: 텍스트 기반의 단순한 스토리 전달 방식을 Visual Novel 스타일로 개선 필요.
해결:
components/DialogueOverlay.tsx: 컷신 UI 컴포넌트 구현 (캐릭터 스탠딩, 대사창, 타이핑 효과, 스킵 기능).
lib/story-data.ts: 스토리 스크립트 데이터 구조(StoryStep) 정의 및 챕터 1 데이터 추가.
app/story/[chapterId]/page.tsx: 기존 텍스트 컷신 로직을 DialogueOverlay로 교체하여 몰입감 증대.

Worldview & Prologue (세계관 및 프롤로그)
상황: 게임의 배경(2025년 AI 전쟁)을 설명하는 인트로 시퀀스 부재.
해결:
lib/story-data.ts: 프롤로그용 시네마틱 텍스트 스크립트('prologue') 추가.
app/story/page.tsx: 스토리 허브 상단에 'PROLOGUE' 배너 추가. 클릭 시 DialogueOverlay를 통해 세계관 설명 재생.
수정: 페이지 내 중복 import로 인한 구문 오류(Syntax Error) 수정.

Visual Integration (비주얼 통합)
상황: 유닛 카드의 이미지가 누락된 경우(일러스트 미구현) 기본 이미지가 출력되어 몰입감 저하. 또한 유닛의 소속(Faction)을 직관적으로 알기 어려움.
해결:
components/GameCard.tsx: 카드 우측 하단에 소속 군단의 로고(Faction Icon)를 표시하는 뱃지 오버레이 추가.
lib/card-images.ts: 캐릭터 이미지 로딩 실패 시, 단순히 등급별 기본 이미지를 보여주는 대신 해당 유닛의 '군단 로고'를 메인 이미지로 사용하는 폴백 로직(Step 2.5) 추가. 이를 통해 "Gemini 유닛"임이 시각적으로 유지되도록 개선.
