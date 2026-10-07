// SEO 메타 정보의 단일 출처.
// 앱(런타임 <Seo>)과 빌드 시 프리렌더(scripts/prerender.mjs)가 함께 쓰므로
// '@/' alias나 브라우저 API 없이 순수 함수로만 작성한다.

export const SITE_NAME = 'Career AI'

export const DEFAULT_TITLE = 'Career AI - 나에게 맞는 직업 찾기 | 성향 기반 진로 추천 테스트'

export const DEFAULT_DESCRIPTION =
  '5분 성향 진단으로 나의 일하는 방식을 분석하고, 커리어넷 직업 데이터에서 잘 맞는 직무 TOP 5를 추천해 드려요. 추천 이유와 필요 역량, 직무 비교까지 회원가입 없이 무료로 확인하세요.'

export const OG_IMAGE_PATH = '/og.jpg'

export interface SeoMeta {
  title: string
  description: string
  /** 사이트 루트 기준 경로. 예: /jobs/209 */
  path: string
  /** 개인화 페이지 등 검색 결과에 노출하지 않을 페이지 */
  noindex?: boolean
  type?: 'website' | 'article'
}

export function pageTitle(title?: string) {
  return title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE
}

/** 검색에 노출하는 정적 페이지 */
export const PUBLIC_PAGES: SeoMeta[] = [
  { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, path: '/' },
  {
    title: pageTitle('무료 커리어 성향 진단 테스트'),
    description:
      '25개의 상황형 질문으로 분석적 사고, 창의성, 협업, 자율성, 안정성, 사람 중심 성향을 진단해요. 약 5분, 회원가입 없이 바로 시작할 수 있어요.',
    path: '/assessment',
  },
  {
    title: pageTitle('직업 검색 - 직업별 하는 일, 연봉, 필요 역량'),
    description:
      '커리어넷 직업 정보를 이름, 관련 직업, 분야로 검색해 보세요. 직업별 하는 일, 연봉, 필요 역량, 전망을 확인하고 나와의 적합도까지 비교할 수 있어요.',
    path: '/search',
  },
]

/** 진단 결과를 바탕으로 한 개인화 페이지: 검색 노출 제외 */
export const PRIVATE_PAGES: Record<string, Omit<SeoMeta, 'path' | 'description'>> = {
  '/assessment/questions': { title: pageTitle('성향 진단'), noindex: true },
  '/assessment/analyzing': { title: pageTitle('결과 분석 중'), noindex: true },
  '/result': { title: pageTitle('나의 커리어 성향 결과'), noindex: true },
  '/jobs': { title: pageTitle('나에게 맞는 직무 TOP 5'), noindex: true },
  '/saved': { title: pageTitle('관심 직무'), noindex: true },
  '/compare': { title: pageTitle('직무 비교'), noindex: true },
}

export interface JobSeoInput {
  id: string
  name: string
  group: string
  summary: string
  abilities: string[]
  skills: string[]
}

export function jobPath(id: string) {
  return `/jobs/${id}`
}

export function jobSeo(job: JobSeoInput): SeoMeta {
  const competencies = [...job.abilities, ...job.skills].slice(0, 3).join(', ')
  // 검색 결과 스니펫(약 155자)에 역량과 안내 문구까지 보이도록 직무 요약을 먼저 줄인다.
  const lead = truncate(job.summary || `${job.name}은(는) ${job.group}에 속하는 직업이에요.`, 80)
  const description = truncate(
    `${lead} ${competencies ? `필요 역량: ${competencies}. ` : ''}연봉·전망·준비 방법과 나와의 적합도를 확인하세요.`,
    155,
  )
  return {
    title: pageTitle(`${job.name} 하는 일, 연봉, 필요 역량`),
    description,
    path: jobPath(job.id),
    type: 'article',
  }
}

/** 직업 상세의 구조화 데이터 (schema.org Occupation + BreadcrumbList) */
export function jobJsonLd(job: JobSeoInput, siteUrl: string) {
  const url = absoluteUrl(siteUrl, jobPath(job.id))
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Occupation',
      name: job.name,
      description: job.summary,
      occupationalCategory: job.group,
      skills: [...job.abilities, ...job.skills].join(', ') || undefined,
      url,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: absoluteUrl(siteUrl, '/') },
        { '@type': 'ListItem', position: 2, name: job.name, item: url },
      ],
    },
  ]
}

export function siteJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: '성향 기반 맞춤형 진로 추천',
    url: absoluteUrl(siteUrl, '/'),
    description: DEFAULT_DESCRIPTION,
    inLanguage: 'ko-KR',
  }
}

export function absoluteUrl(siteUrl: string, path: string) {
  return siteUrl.replace(/\/+$/, '') + path
}

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}
