// 커리어넷 원본 캐시 → 추천용 직업 데이터(src/data/jobs.json) 변환.
//
// 직업 상세의 performList(업무수행능력·업무환경, 중요도 상위 10개)와
// indicatorChart(대인관계·창의성·고용유지 등 7개 백분위 지표)를 6개 성향 지표로 바꾼다.
//
//   npm run data:build

import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const CACHE_DIR = path.join(ROOT, 'scripts/.cache/careernet')
const OUT_FILE = path.join(ROOT, 'src/data/jobs.json')

const TRAITS = ['analytic', 'creative', 'collab', 'autonomy', 'stability', 'people']

// 성향 지표별로 신호가 되는 항목과 가중치. 음수는 그 성향과 반대되는 신호.
// 항목 이름은 커리어넷(워크넷 직업정보) 원문 그대로다.
const SIGNALS = {
  analytic: {
    perform: {
      '논리적 분석': 1, 수리력: 1, 추리력: 1, '문제 해결': 0.8, '판단과 의사결정': 0.6,
      '기술 분석': 0.8, '품질관리분석': 0.5, '조직체계의 분석 및 평가': 0.8, 범주화: 0.6,
      '읽고 이해하기': 0.4, 전산: 0.5, '모니터링(Monitoring)': 0.3,
    },
    environment: {},
  },
  creative: {
    perform: { 창의력: 1, '기술 설계': 0.7, 글쓰기: 0.5 },
    environment: {},
  },
  collab: {
    perform: { 행동조정: 1, '인적자원 관리': 0.8, 협상: 0.4 },
    environment: {
      '다른 사람들을 조율하거나 이끌기': 1, '다른 사람과의 상호작용': 0.8, '연설, 발표, 회의하기': 0.6,
    },
  },
  autonomy: {
    perform: { '판단과 의사결정': 0.4 },
    environment: {
      '의사결정 권한': 1, '의사결정 가능성': 1, 재택근무: 0.6, '결과에 대한 책임': 0.4,
      '반복적인 신체행동, 정신적 활동': -0.6, '장비 속도에 보조 맞추기': -0.6, '규칙적인 근무': -0.3,
    },
  },
  stability: {
    perform: { '품질관리분석': 0.5, '작동 점검': 0.5, '모니터링(Monitoring)': 0.4 },
    environment: {
      '규칙적인 근무': 1, '정확성, 정밀성 유지': 0.8, '반복적인 신체행동, 정신적 활동': 0.6,
      '공문, 문서 주고받기': 0.5, '치열한 경쟁': -0.6, 마감시간: -0.3,
    },
  },
  people: {
    perform: {
      '서비스 지향': 1, '사람 파악': 1, 설득: 0.8, 협상: 0.6, 가르치기: 0.8, 말하기: 0.6, '듣고 이해하기': 0.5,
    },
    environment: {
      '외부 고객 대하기': 1, '사람들과 직접 접촉': 0.8, '다른 사람과의 접촉': 0.6, '전화 대화하기': 0.4,
      '불쾌하거나 무례한 사람 상대': 0.4, '다른 사람과 신체적 접촉': 0.3,
    },
  },
}

// indicatorChart 지표로 보정할 성향과 그 비율.
const INDICATOR_BLEND = {
  creative: { weight: 0.5, from: ['창의성'] },
  people: { weight: 0.5, from: ['대인관계'] },
  stability: { weight: 0.4, from: ['고용유지', '일가정균형'] },
}

// 커리어넷 직업군(aptit_name) → 관심 분야
const INTEREST_BY_APTITUDE = {
  tech: ['IT관련전문직', '공학 기술직', '공학 전문직', '이학 전문직', '환경관련 전문직'],
  business: [
    '금융 및 경영 관련직', '회계 관련직', '기획서비스직', '매니지먼트 관련직', '사무 관련직',
    '영업관련 서비스직', '법률 및 사회활동 관련직', '인문 및 사회과학 관련직',
  ],
  art: [
    '디자인 관련직', '미술 및 공예 관련직', '음악 관련직', '악기 관련직', '무용 관련직',
    '연기 관련직', '기타 특수 예술직', '의복제조 관련직',
  ],
  media: ['영상 관련직', '작가 관련직', '언어 관련 전문직', '예술기획 관련직', '웹·게임·애니메이션 관련직'],
  care: [
    '사회서비스직', '인문계 교육 관련직', '이공계 교육 관련직', '교육관련 서비스직',
    '의료관련 전문직', '보건의료 관련 서비스직',
  ],
  field: [
    '안전 관련직', '기능직', '일반운전 관련직', '고급 운전 관련직', '조리 관련직', '이미용 관련직',
    '자연친화 관련직', '농생명산업 관련직', '운동 관련직', '기타 게임·오락·스포츠 관련직', '일반 서비스직',
  ],
}
const interestOf = Object.fromEntries(
  Object.entries(INTEREST_BY_APTITUDE).flatMap(([key, names]) => names.map((n) => [n, key])),
)

const NEUTRAL = 50

function items(list, key) {
  return (list ?? []).filter(Boolean).map((it) => ({ name: it[key], importance: Number(it.importance) || 0 }))
}

function rawSignal(trait, perform, environment) {
  const { perform: pw, environment: ew } = SIGNALS[trait]
  let sum = 0
  for (const it of perform) sum += ((pw[it.name] ?? 0) * it.importance) / 100
  for (const it of environment) sum += ((ew[it.name] ?? 0) * it.importance) / 100
  return sum
}

/** 값 배열 → 0~100 백분위(동점은 평균 순위) */
function percentiles(values) {
  const sorted = [...values].sort((a, b) => a - b)
  return values.map((v) => {
    const lo = sorted.indexOf(v)
    const hi = sorted.lastIndexOf(v)
    return sorted.length > 1 ? (100 * (lo + hi)) / 2 / (sorted.length - 1) : NEUTRAL
  })
}

function firstSentence(text = '') {
  const s = text.split(/(?<=다\.)\s/)[0] ?? ''
  return s.length > 140 ? `${s.slice(0, 137)}...` : s
}

const list = JSON.parse(await fs.readFile(path.join(CACHE_DIR, 'jobs.json'), 'utf8'))

const parsed = []
let skipped = 0
for (const job of list) {
  let detail
  try {
    detail = JSON.parse(await fs.readFile(path.join(CACHE_DIR, `job-${job.job_cd}.json`), 'utf8'))
  } catch {
    skipped++
    continue
  }
  const perform = items(detail.performList?.perform, 'perform')
  const environment = items(detail.performList?.environment, 'environment')
  const chart = detail.indicatorChart?.[0]
  const indicators = chart
    ? Object.fromEntries(chart.indicator.split(',').map((n, i) => [n, Number(chart.indicator_data.split(',')[i])]))
    : null

  // 성향을 추정할 근거가 전혀 없는 직업은 추천 대상에서 뺀다.
  if (perform.length === 0 && !indicators) {
    skipped++
    continue
  }
  parsed.push({ job, detail, perform, environment, indicators })
}

// 성향별 원신호 → 전체 직업 기준 백분위. 업무수행능력 데이터가 있는 직업끼리만 비교한다.
const withPerform = parsed.filter((p) => p.perform.length > 0)
const signalPct = {}
for (const trait of TRAITS) {
  const pct = percentiles(withPerform.map((p) => rawSignal(trait, p.perform, p.environment)))
  withPerform.forEach((p, i) => {
    signalPct[p.job.job_cd] ??= {}
    signalPct[p.job.job_cd][trait] = pct[i]
  })
}

const jobs = parsed.map(({ job, detail, perform, indicators }) => {
  const traits = {}
  for (const trait of TRAITS) {
    const base = signalPct[job.job_cd]?.[trait]
    const blend = INDICATOR_BLEND[trait]
    const ind = blend && indicators ? blend.from.reduce((s, n) => s + (indicators[n] ?? NEUTRAL), 0) / blend.from.length : null
    let value
    if (base !== undefined && ind !== null) value = (1 - blend.weight) * base + blend.weight * ind
    else if (base !== undefined) value = base
    else if (ind !== null) value = ind
    else value = NEUTRAL
    traits[trait] = Math.round(value)
  }

  const info = detail.baseInfo ?? {}
  return {
    id: String(job.job_cd),
    name: job.job_nm,
    group: job.aptit_name,
    interest: interestOf[job.aptit_name] ?? null,
    summary: firstSentence(job.work),
    wage: job.wage || null,
    wlb: job.wlb || null,
    related: job.rel_job_nm || null,
    abilities: (detail.abilityList ?? []).map((a) => a.ability_name).filter(Boolean),
    skills: [...perform].sort((a, b) => b.importance - a.importance).slice(0, 5).map((p) => p.name),
    satisfaction: info.satisfication ?? null,
    /** 커리어넷 최종 수정일 (sitemap lastmod) */
    /** 커리어넷 조회수 (많이 찾는 직업 정렬용) */
    views: Number(job.views) || 0,
    updated: job.edit_dt ? new Date(job.edit_dt).toISOString().slice(0, 10) : null,
    traits,
  }
})

await fs.writeFile(OUT_FILE, JSON.stringify(jobs))

// 랜딩의 '많이 찾는 직업'용 소형 목록 (전체 데이터를 불러오지 않도록 분리)
const popular = [...jobs].sort((a, b) => b.views - a.views).slice(0, 12).map(({ id, name }) => ({ id, name }))
await fs.writeFile(path.join(ROOT, 'src/data/popular-jobs.json'), `${JSON.stringify(popular, null, 2)}\n`)
const unmapped = [...new Set(jobs.filter((j) => !j.interest).map((j) => j.group))]
console.log(`직업 ${jobs.length}개 생성 (제외 ${skipped}개) → ${path.relative(ROOT, OUT_FILE)}`)
if (unmapped.length) console.warn('관심 분야에 연결되지 않은 직업군:', unmapped)
