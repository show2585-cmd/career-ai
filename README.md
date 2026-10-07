# Career AI

성향 기반 맞춤형 진로 추천 서비스. 5분 상황형 진단으로 일하는 방식을 분석하고, 커리어넷 직업 데이터와 비교해 잘 맞는 직무를 추천합니다.

## 기술 스택

React 19 · Vite · TypeScript · Tailwind CSS v4 · shadcn/ui (Base UI) · Zustand · Recharts · Vercel

## 시작하기

```bash
npm install
cp .env.example .env.local   # CAREERNET_API_KEY에 커리어넷 Open API 인증키 입력
npm run dev
```

사내망 등 TLS를 가로채는 환경에서는 `NODE_USE_SYSTEM_CA=1`을 설정해야 `npx shadcn`, 데이터 수집이 동작합니다.

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 (커리어넷 API는 Vite 프록시로 중계) |
| `npm run build` | 타입 체크 → 빌드 → 정적 프리렌더(직업 상세·sitemap·robots) |
| `npm run data:fetch` | 커리어넷 직업 목록·상세 원본 수집 (`scripts/.cache`) |
| `npm run data:build` | 원본 → 추천용 `src/data/jobs.json` 변환 |
| `npm run icons` | 파비콘·OG 이미지·KV WebP 생성 |

## 구조

- `src/lib/scoring.ts` 진단 응답 → 6개 성향 점수
- `scripts/build-jobs.mjs` 커리어넷 업무수행능력·업무환경 → 직업 성향 벡터
- `src/lib/recommend.ts` 성향 프로필 유사도(75%) + 관심 분야(25%) 추천
- `api/careernet.ts` 배포 환경의 API 중계 함수 (인증키는 서버에만 보관)

## 배포 (Vercel)

환경 변수 `CAREERNET_API_KEY`를 설정합니다. 커스텀 도메인을 쓰면 `VITE_SITE_URL`도 설정합니다(미설정 시 Vercel 프로덕션 도메인 사용).

## 데이터 출처

직업 정보: [커리어넷(한국직업능력연구원)](https://www.career.go.kr) Open API (CC-BY)
