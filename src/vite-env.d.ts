/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 배포 도메인 (canonical, OG, sitemap 절대 URL에 사용). 예: https://career-ai.kr */
  readonly VITE_SITE_URL?: string
}
