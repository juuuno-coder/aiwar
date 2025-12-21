# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. https://supabase.com 접속
2. "Start your project" 클릭
3. 새 프로젝트 생성
   - Name: `ai-daejeon`
   - Database Password: 안전한 비밀번호 설정
   - Region: `Northeast Asia (Seoul)` 선택

## 2. 데이터베이스 스키마 실행

1. Supabase 대시보드에서 `SQL Editor` 클릭
2. `New query` 클릭
3. `supabase/schema.sql` 파일 내용 복사
4. 붙여넣기 후 `Run` 클릭

## 3. API 키 복사

1. Supabase 대시보드에서 `Settings` → `API` 클릭
2. 다음 값들을 복사:
   - `Project URL`
   - `anon public` key

## 4. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 5. 개발 서버 재시작

```bash
npm run dev
```

## 완료!

이제 Supabase 백엔드가 연결되었습니다.

---

## 다음 단계

- [ ] 인증 시스템 구현
- [ ] 실시간 랭킹 구현
- [ ] 데이터 동기화
- [ ] Vercel 배포
