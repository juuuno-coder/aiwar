# AI 대전 게임 - Vercel 배포 가이드

## 🚀 배포 준비 완료!

게임이 배포 가능한 상태입니다. 아래 단계를 따라 Vercel에 배포하세요.

---

## 1단계: Vercel 계정 생성

1. https://vercel.com 접속
2. GitHub 계정으로 로그인
3. 무료 Hobby 플랜 선택

---

## 2단계: GitHub 저장소 생성

```bash
# 프로젝트 폴더에서
cd /Users/admin/Desktop/ai-daejeon/frontend

# Git 초기화
git init

# .gitignore 확인 (이미 있음)
# node_modules, .next, .env.local 등이 포함되어 있어야 함

# 파일 추가
git add .

# 커밋
git commit -m "Initial commit: AI Daejeon Game"

# GitHub에 새 저장소 생성 후
git remote add origin https://github.com/YOUR_USERNAME/ai-daejeon.git
git branch -M main
git push -u origin main
```

---

## 3단계: Vercel에 배포

### 방법 1: Vercel 웹사이트에서

1. Vercel 대시보드에서 "New Project" 클릭
2. GitHub 저장소 연결
3. `ai-daejeon` 저장소 선택
4. Framework Preset: **Next.js** 자동 감지
5. Root Directory: `frontend` (중요!)
6. Build Command: `npm run build`
7. Output Directory: `.next`
8. Install Command: `npm install`
9. "Deploy" 클릭

### 방법 2: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포
cd /Users/admin/Desktop/ai-daejeon/frontend
vercel

# 프로덕션 배포
vercel --prod
```

---

## 4단계: 환경 변수 설정 (선택사항)

Vercel 대시보드에서:
1. 프로젝트 선택
2. Settings → Environment Variables
3. 필요한 환경 변수 추가:

```
# Supabase (나중에 추가 시)
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

---

## 5단계: 커스텀 도메인 연결 (선택사항)

1. Vercel 대시보드 → Settings → Domains
2. 도메인 입력 (예: aidaejeon.com)
3. DNS 설정 안내에 따라 설정
4. 자동 HTTPS 적용

---

## 📊 배포 후 확인사항

### ✅ 체크리스트

- [ ] 메인 페이지 로드 확인
- [ ] 모든 메뉴 작동 확인
- [ ] 스토리 모드 진행 가능
- [ ] 대전 시스템 작동
- [ ] 슬롯 시스템 작동
- [ ] 유니크 유닛 타이머 작동
- [ ] 튜토리얼 팝업 표시
- [ ] 모바일 반응형 확인
- [ ] localStorage 저장 확인

---

## 🎯 배포 URL

배포 완료 후 Vercel이 제공하는 URL:
```
https://your-project-name.vercel.app
```

---

## 🔧 배포 후 업데이트

코드 수정 후:

```bash
# 변경사항 커밋
git add .
git commit -m "Update: 설명"
git push

# Vercel이 자동으로 재배포
```

---

## 📱 성능 최적화

### 이미 적용된 최적화:
- ✅ Next.js 16 (Turbopack)
- ✅ 정적 페이지 생성
- ✅ 코드 스플리팅
- ✅ 이미지 최적화
- ✅ CSS 최적화

### 추가 최적화 (선택):
- [ ] 이미지 압축
- [ ] 폰트 최적화
- [ ] 캐싱 전략
- [ ] CDN 활용

---

## 🎮 게임 완성!

**배포 가능한 상태:**
- ✅ 프로덕션 빌드 성공
- ✅ 모든 기능 구현 완료
- ✅ 튜토리얼 시스템
- ✅ 반응형 디자인
- ✅ SEO 최적화

**다음 단계:**
1. GitHub에 푸시
2. Vercel에 배포
3. 친구들과 공유
4. 피드백 수집
5. 지속적 개선

---

## 🌟 축하합니다!

AI 대전 게임이 완성되었습니다! 🎉

**완성된 기능:**
- 20개 AI 군단
- 5개 카테고리 시너지
- 5전 3선승제 전투
- 유니크 유닛 시스템
- 5개 스토리 챕터
- 튜토리얼 시스템
- 12개 게임 페이지

**게임을 즐겨주세요!** 🎮✨
