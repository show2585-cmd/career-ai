// Google Analytics 4 연동.
// - 배포 사이트에서만 수집한다(개발 서버·localhost 미리보기 제외).
// - SPA라 페이지 이동마다 page_view를 직접 보낸다. (GA4 향상된 측정의
//   "브라우저 기록 이벤트 기반 페이지 변경"은 꺼야 중복 집계되지 않는다.)
// - 개인을 식별할 수 있는 정보는 보내지 않는다.

type GtagParams = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const GA_ID = import.meta.env.VITE_GA_ID

const enabled =
  Boolean(GA_ID) &&
  import.meta.env.PROD &&
  typeof window !== 'undefined' &&
  !['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)

export function initAnalytics() {
  if (!enabled || window.gtag) return
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // gtag.js는 arguments 객체 그대로를 dataLayer에 넣어야 인식한다.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { send_page_view: false })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)
}

export function trackPageView(path: string) {
  if (!enabled) return
  window.gtag?.('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  })
}

/**
 * 퍼널 이벤트. GA4 관리 → 이벤트에서 assessment_complete, save_job을 "주요 이벤트"로 표시하면 전환으로 집계된다.
 *
 * assessment_start → assessment_complete → view_recommendations → view_job → save_job / compare_add
 * search: 직업 검색어
 */
export function track(event: AnalyticsEvent, params?: GtagParams) {
  if (!enabled) return
  window.gtag?.('event', event, params)
}

export type AnalyticsEvent =
  | 'assessment_start'
  | 'assessment_complete'
  | 'view_recommendations'
  | 'view_job'
  | 'save_job'
  | 'compare_add'
  | 'search'
