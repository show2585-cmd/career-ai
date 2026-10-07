import type { InterestKey, TraitScores } from '@/lib/traits'

/** scripts/build-jobs.mjs가 커리어넷 데이터로 생성하는 추천용 직업 요약 */
export interface JobSummary {
  id: string
  name: string
  /** 커리어넷 직업군 (aptit_name) */
  group: string
  interest: InterestKey | null
  summary: string
  wage: string | null
  wlb: string | null
  related: string | null
  abilities: string[]
  skills: string[]
  satisfaction: number | null
  /** 커리어넷 조회수 */
  views: number
  /** 커리어넷 최종 수정일 (YYYY-MM-DD) */
  updated: string | null
  traits: TraitScores
}

let jobsPromise: Promise<JobSummary[]> | null = null

/** 직업 데이터(약 340KB)는 추천 화면에 들어갈 때 처음 한 번만 불러온다. */
export function loadJobs(): Promise<JobSummary[]> {
  jobsPromise ??= import('@/data/jobs.json')
    .then((m) => m.default as JobSummary[])
    .catch((err) => {
      jobsPromise = null
      throw err
    })
  return jobsPromise
}


/** 관련 직업명 중 우리 데이터에 있는 직업 + 같은 직업군 직업 (내부 링크용) */
export function relatedJobs(jobs: JobSummary[], job: JobSummary, count: number) {
  const names = new Set((job.related ?? '').split(',').map((s) => s.trim()))
  const byName = jobs.filter((j) => j.id !== job.id && names.has(j.name))
  const sameGroup = jobs
    .filter((j) => j.id !== job.id && j.group === job.group && !byName.includes(j))
    .sort((a, b) => b.views - a.views)
  return [...byName, ...sameGroup].slice(0, count)
}
