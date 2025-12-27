Log: Core_Game_Logic_And_UI_Fixes (핵심_게임_로직_구현_및_UI_수정)
Original Date: 2025-12-17 14:00:00
Key Goal: AI War 게임의 핵심 로직(GameContext) 구현 및 Next.js App Router 환경에서의 클라이언트 컴포넌트 오류(use client, Context API) 해결.

📝 상세 작업 일지 (Chronological)

1. 핵심 게임 로직 및 UI 컴포넌트 기초 구현
   상황: 턴제 카드 게임의 기본 동작을 위한 상태 관리와 UI가 필요함.
   해결:
   - types/card.ts: CardData 인터페이스 정의 (id, name, attack, defense, imageUrl).
   - components/GameContext.tsx: 게임 상태(덱, 손패, 자원, 턴) 및 액션(draw, play, attack, equip) 관리 로직 구현. 간단한 AI 상대(랜덤 카드 내기) 포함.
   - components/Card.tsx & GameBoard.tsx: 카드 렌더링 및 플레이어/상대 영역 구분 표시 구현.
   - components/FooterControls.tsx: 턴 종료, 공격, 장비 버튼 UI 및 기능 연결.

2. Next.js Server/Client Component 호환성 문제 해결
   상황: "createContext only works in Client Components" 빌드 에러 발생. Next.js App Router에서는 Hook을 사용하는 컴포넌트에 "use client"가 필요함.
   해결:
   - components/GameContext.tsx: 최상단에 "use client" 지시어 추가.
   - components/GameBoard.tsx: "use client" 추가 (useGame 훅 사용).
   - components/FooterControls.tsx: "use client" 추가 (useGame 훅 사용).
   - components/LayoutWrapper.tsx: "use client" 추가.

3. Context Provider 래핑 및 타입 오류 수정
   상황: CardData 타입 참조 오류 및 "useGame must be used within GameProvider" 런타임 에러 발생. GameProvider가 UI 트리 상위에서 올바르게 감싸지 않음.
   해결:
   - components/GameContext.tsx: 누락된 CardData import 추가.
   - components/LayoutWrapper.tsx: GameProvider로 내부 JSX 전체(Header, Sidebar, Main, Footer)를 감싸도록 구조 변경.

4. 이미지 및 스타일 Import 누락 수정
   상황: Sidebar 컴포넌트에서 "Failed to construct 'Image'", "avatarPlaceholder is not defined", "styles is not defined" 에러 연달아 발생.
   해결:
   - components/Sidebar.tsx:
     - next/image에서 Image 컴포넌트 import.
     - 로컬 이미지 파일(avatar_placeholder_...) import.
     - CSS Module(styles) import 구문 복구.

5. 포트 충돌 및 잠금 파일 문제 트러블슈팅 (가이드)
   상황: npm run dev 실행 시 "Unable to acquire lock" 에러 발생.
   해결: 기존 Next.js 프로세스 종료(kill) 및 .next/dev/lock 파일 삭제 가이드 제공.
