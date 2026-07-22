# GraceBridge — 목회 지원 플랫폼

목회자의 설교 준비를 돕고, 일반 성도의 성경 이해를 넓히는 **다국어(5개 언어) 목회 지원 플랫폼**입니다.

- **AI 설교 작성기** — 본문·절기·대상·분량을 선택해 설교 초안을 생성 (Phase 2)
- **성경 이해 라이브러리** — 66권 구조의 슬라이드·영상·PDF (Phase 3)
- **관리자 도구** — 회원 승인, 콘텐츠 관리, AI 슬라이드 생성기, 통계 (Phase 4)
- **성도 기능** — 오늘의 묵상, 성경 Q&A (Phase 5)

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js 14 (App Router, TypeScript) |
| 스타일 | Tailwind CSS, mobile-first |
| 다국어 | next-intl (`/ko`, `/en`, `/fr`, `/es`, `/de`) |
| DB·인증·스토리지 | Supabase (Postgres + Auth + Storage) |
| AI | Anthropic API (claude-sonnet-4-6) — 서버 사이드 전용 |
| 배포 | Vercel |

## 진행 단계 (Phase)

- ✅ **Phase 1 — 기반 구축**: 프로젝트 스캐폴딩, i18n, Supabase 연동, 인증(가입/로그인/역할), 반응형 레이아웃(모바일 탭바), 랜딩 페이지
- ✅ **Phase 2 — 설교 작성기** (핵심): 단계별 입력 마법사, AI 스트리밍 생성(SSE), 결과 뷰어/편집기, 다시 생성, 보관함(저장/조회/편집/삭제), DOCX·PDF·텍스트 내보내기, 역할별 사용량 제한
- ⬜ **Phase 3 — 콘텐츠 라이브러리**
- ⬜ **Phase 4 — 관리자 도구**
- ⬜ **Phase 5 — 성도 기능 + 마감**

## 로컬 개발 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example`를 복사해 `.env.local`을 만들고 값을 채웁니다.

```bash
cp .env.example .env.local
```

| 변수 | 설명 |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API 키 (서버 전용, 절대 클라이언트 노출 금지) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon 공개 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role 키 (서버 전용) |
| `NEXT_PUBLIC_SITE_URL` | 사이트 URL (로컬: `http://localhost:3000`) |

### 3. Supabase 초기 설정

1. [supabase.com](https://supabase.com)에서 프로젝트 생성
2. **SQL Editor**에서 [`supabase/schema.sql`](supabase/schema.sql) 전체를 붙여넣고 실행
   - 모든 테이블 + RLS 정책 + 신규 가입 트리거가 생성됩니다
3. **Authentication > Providers**에서 Email, Google OAuth 활성화
   - Google OAuth: 리디렉션 URL에 `https://<도메인>/auth/callback` 추가
4. 첫 관리자 지정: SQL Editor에서 아래 실행
   ```sql
   update public.profiles set role = 'admin', approved = true
   where email = '관리자이메일@example.com';
   ```

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 → 자동으로 `/ko`로 리디렉션됩니다.

## Vercel 배포

1. GitHub 저장소에 푸시
2. [Vercel](https://vercel.com)에서 저장소 임포트
3. **Environment Variables**에 위 5개 변수 모두 등록
4. `NEXT_PUBLIC_SITE_URL`을 배포 도메인으로 설정
5. Deploy — 이후 `main` 브랜치 푸시마다 자동 배포

## 사용자 역할

| 역할 | 권한 |
|---|---|
| `admin` | 전체 관리 |
| `pastor` | 설교 작성기, 전체 콘텐츠, 보관함 (관리자 승인 필요) |
| `member` | 콘텐츠 열람, 묵상, 설교 작성기 요약 모드 |
| `guest` | 랜딩·미리보기 |

> 목회자로 가입 시 관리자 승인 전까지는 `member` 권한으로 이용됩니다.

## 프로젝트 구조

```
src/
  app/
    [locale]/          # 언어별 라우트 (레이아웃, 랜딩, 인증, 각 페이지)
    auth/callback/     # OAuth·이메일 인증 콜백
  components/          # Header, MobileTabBar, LanguageSwitcher 등
  i18n/                # next-intl 설정 (routing, request, navigation)
  lib/
    supabase/          # 브라우저·서버·미들웨어·admin 클라이언트
    auth.ts            # 현재 사용자/역할 헬퍼
  types/database.ts    # DB 타입
messages/              # ko·en·fr·es·de 번역 파일
supabase/schema.sql    # DB 스키마 + RLS
```

---

*관리자: 이성균 목사 / 기획: 문형철*
