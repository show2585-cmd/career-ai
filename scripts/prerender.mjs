// 빌드 후 정적 HTML 프리렌더 + sitemap.xml + robots.txt 생성.
//
// 네이버 검색봇과 카카오톡·페이스북 링크 미리보기는 JS를 거의 실행하지 않는다.
// 그래서 검색에 노출할 페이지마다 dist/<경로>/index.html을 만들어
// 페이지별 메타 태그, 구조화 데이터, 본문 요약을 HTML에 미리 담는다.
// 앱이 로드되면 React가 #root 안의 내용을 실제 화면으로 교체한다.
//
//   npm run build   (vite build 후 자동 실행)

import fs from 'node:fs/promises'
import path from 'node:path'
import { relatedJobs } from '../src/lib/jobs.ts'
import { INTEREST_KEYS, INTERESTS } from '../src/lib/traits.ts'
import {
  absoluteUrl,
  jobJsonLd,
  jobPath,
  jobSeo,
  OG_IMAGE_PATH,
  PRIVATE_PAGES,
  PUBLIC_PAGES,
  siteJsonLd,
} from '../src/lib/seo.ts'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIST = path.join(ROOT, 'dist')
// 배포 도메인: VITE_SITE_URL > Vercel 프로덕션 도메인 > 로컬 미리보기 (vite.config.ts와 같은 순서)
const SITE_URL = (
  process.env.VITE_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  'http://localhost:4173'
).replace(/\/+$/, '')

if (SITE_URL.startsWith('http://localhost')) {
  console.warn(`⚠ 배포 도메인이 없어 ${SITE_URL} 기준으로 생성합니다. Vercel 배포 빌드에서는 실제 도메인이 쓰입니다.`)
}

const template = await fs.readFile(path.join(DIST, 'index.html'), 'utf8')
const jobs = JSON.parse(await fs.readFile(path.join(ROOT, 'src/data/jobs.json'), 'utf8'))
const popular = JSON.parse(await fs.readFile(path.join(ROOT, 'src/data/popular-jobs.json'), 'utf8'))

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

// JSON-LD 안에서 </script>가 끊기지 않도록 '<'를 이스케이프한다.
const jsonLd = (data) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`

function setAttr(html, selector, attr, value) {
  // selector 예: 'meta[name="description"]' → 해당 태그의 attr 값을 바꾼다.
  const [, tag, key, keyValue] = selector.match(/^(\w+)\[(\w[\w:-]*)="([^"]+)"\]$/)
  const re = new RegExp(`(<${tag}\\b[^>]*\\b${key}="${keyValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*\\b${attr}=")[^"]*(")`, 's')
  if (!re.test(html)) throw new Error(`템플릿에서 ${selector}[${attr}]를 찾지 못했습니다.`)
  return html.replace(re, `$1${esc(value)}$2`)
}

function render({ title, description, path: pagePath, noindex, type = 'website' }, { head = '', body = '' } = {}) {
  const url = absoluteUrl(SITE_URL, pagePath)
  let html = template.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
  html = setAttr(html, 'meta[name="description"]', 'content', description)
  html = setAttr(html, 'meta[name="robots"]', 'content', noindex ? 'noindex, nofollow' : 'index, follow')
  html = setAttr(html, 'link[rel="canonical"]', 'href', url)
  html = setAttr(html, 'meta[property="og:type"]', 'content', type)
  html = setAttr(html, 'meta[property="og:title"]', 'content', title)
  html = setAttr(html, 'meta[property="og:description"]', 'content', description)
  html = setAttr(html, 'meta[property="og:url"]', 'content', url)
  html = setAttr(html, 'meta[property="og:image"]', 'content', absoluteUrl(SITE_URL, OG_IMAGE_PATH))
  html = setAttr(html, 'meta[name="twitter:title"]', 'content', title)
  html = setAttr(html, 'meta[name="twitter:description"]', 'content', description)
  html = setAttr(html, 'meta[name="twitter:image"]', 'content', absoluteUrl(SITE_URL, OG_IMAGE_PATH))
  if (!html.includes('<!--seo-head-->') || !html.includes('<!--seo-body-->')) {
    throw new Error('템플릿에 <!--seo-head--> / <!--seo-body--> 자리표시자가 없습니다.')
  }
  return html.replace('<!--seo-head-->', head).replace('<!--seo-body-->', body)
}

async function write(pagePath, html) {
  const file = pagePath === '/' ? path.join(DIST, 'index.html') : path.join(DIST, pagePath, 'index.html')
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, html)
}

const ATTRIBUTION = `<p>직업 정보 출처: <a href="https://www.career.go.kr">커리어넷(한국직업능력연구원)</a></p>`

const linkList = (items) =>
  `<ul>${items.map((j) => `<li><a href="${jobPath(j.id)}">${esc(j.name)}</a></li>`).join('')}</ul>`

// ── 랜딩 ──
const [landing, assessment, search] = PUBLIC_PAGES
await write(
  landing.path,
  render(landing, {
    head: jsonLd(siteJsonLd(SITE_URL)),
    body: `<main class="seo-fallback">
<h1>나는 어떤 환경에서 일할 때 가장 즐거울까?</h1>
<p>검사 결과를 알려주는 데서 끝나지 않아요. 나에게 맞는 일을 발견하고, 왜 맞는지까지 확인해 보세요.</p>
<p><a href="/assessment">나에게 맞는 진로 찾기</a></p>
<h2>이렇게 진행돼요</h2>
<ol><li>성향 진단: 일상 속 상황 25개에 답하며 나의 일하는 방식을 알아봐요.</li>
<li>직무 추천: 커리어넷 직업 데이터와 비교해 잘 맞는 직무 TOP 5를 찾아드려요.</li>
<li>직무 탐색: 추천 이유와 필요 역량을 살펴보고, 관심 직무끼리 나란히 비교해요.</li></ol>
<h2>많이 찾는 직업</h2>${linkList(popular)}
${ATTRIBUTION}</main>`,
  }),
)

// ── 진단 시작 ──
await write(
  assessment.path,
  render(assessment, {
    body: `<main class="seo-fallback"><h1>커리어 성향 진단</h1><p>${esc(assessment.description)}</p><p><a href="/assessment">진단 시작하기</a></p></main>`,
  }),
)

// ── 직업 검색: 전체 직업을 분야별 링크로 담아 검색봇이 모든 직업 페이지에 닿게 한다 ──
const byField = INTEREST_KEYS.map((key) => ({
  label: INTERESTS[key].label,
  jobs: jobs.filter((j) => j.interest === key).sort((a, b) => b.views - a.views),
}))
await write(
  search.path,
  render(search, {
    body: `<main class="seo-fallback"><h1>직업 검색</h1><p>${esc(search.description)}</p>
${byField.map((g) => `<h2>${esc(g.label)}</h2>${linkList(g.jobs)}`).join('\n')}
${ATTRIBUTION}</main>`,
  }),
)

// ── 개인화 페이지: noindex 메타만 맞춰 둔다 (새로고침 시에도 올바른 메타) ──
for (const [pagePath, meta] of Object.entries(PRIVATE_PAGES)) {
  await write(pagePath, render({ ...meta, description: landing.description, path: pagePath }))
}

// ── 직업 상세 ──
for (const job of jobs) {
  const meta = jobSeo(job)
  const competencies = [...job.abilities, ...job.skills]
  const facts = [
    job.wage && `연봉 수준: ${job.wage}`,
    job.wlb && `일·가정 균형: ${job.wlb}`,
    job.satisfaction && `직업 만족도: ${job.satisfaction}%`,
  ].filter(Boolean)
  const body = `<main class="seo-fallback">
<p>${esc(job.group)}</p>
<h1>${esc(job.name)}</h1>
<p>${esc(job.summary)}</p>
${facts.length ? `<ul>${facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
${competencies.length ? `<h2>필요한 역량</h2><ul>${competencies.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
<p><a href="/assessment">이 직업이 나와 맞는지 5분 진단으로 확인하기</a></p>
<h2>함께 보면 좋은 직업</h2>${linkList(relatedJobs(jobs, job, 6))}
${ATTRIBUTION}</main>`
  await write(meta.path, render(meta, { head: jobJsonLd(job, SITE_URL).map(jsonLd).join(''), body }))
}

// ── sitemap.xml / robots.txt ──
const today = new Date().toISOString().slice(0, 10)
const urls = [
  ...PUBLIC_PAGES.map((p) => ({ loc: p.path, lastmod: today, priority: p.path === '/' ? '1.0' : '0.8' })),
  ...jobs.map((j) => ({ loc: jobPath(j.id), lastmod: j.updated ?? today, priority: '0.6' })),
]
await fs.writeFile(
  path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${absoluteUrl(SITE_URL, u.loc)}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>
`,
)
await fs.writeFile(
  path.join(DIST, 'robots.txt'),
  `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${absoluteUrl(SITE_URL, '/sitemap.xml')}
`,
)

console.log(`프리렌더 완료: 정적 페이지 ${PUBLIC_PAGES.length + Object.keys(PRIVATE_PAGES).length}개, 직업 ${jobs.length}개, sitemap URL ${urls.length}개`)
