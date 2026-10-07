import type { JobSummary } from '@/lib/jobs'
import { INTERESTS, TRAIT_KEYS, TRAITS, type InterestScores, type TraitScores } from '@/lib/traits'

// 추천 점수 = 성향 프로필 유사도 75% + 관심 분야 일치 25%.
// 진단은 문항마다 하나만 고르는 방식이라 점수가 사람 안에서 상대적이다.
// 그래서 절대값 차이 대신 "어떤 성향이 상대적으로 높고 낮은가"의 모양(피어슨 상관)을 비교한다.
const TRAIT_WEIGHT = 0.75
const INTEREST_WEIGHT = 0.25

export interface Recommendation {
  job: JobSummary
  /** 화면에 보여주는 적합도 (%) */
  fit: number
  reasons: string[]
  /** 카드용 짧은 강점 문구 */
  highlights: string[]
  difficulties: string[]
}

function mean(v: number[]) {
  return v.reduce((a, b) => a + b, 0) / v.length
}

function pearson(a: number[], b: number[]) {
  const ma = mean(a)
  const mb = mean(b)
  let num = 0
  let da = 0
  let db = 0
  for (let i = 0; i < a.length; i++) {
    num += (a[i] - ma) * (b[i] - mb)
    da += (a[i] - ma) ** 2
    db += (b[i] - mb) ** 2
  }
  return da && db ? num / Math.sqrt(da * db) : 0
}

function toVector(scores: TraitScores) {
  return TRAIT_KEYS.map((k) => scores[k])
}

/** 0~1 원점수를 사용자에게 보여줄 40~98%로 변환 */
function toPercent(raw: number) {
  return Math.round(Math.min(98, Math.max(40, 40 + 58 * raw)))
}

export function recommend(
  jobs: JobSummary[],
  traits: TraitScores,
  interests: InterestScores,
): Recommendation[] {
  const user = toVector(traits)
  const userMean = mean(user)
  const maxInterest = Math.max(...Object.values(interests))

  return jobs
    .map((job) => {
      const traitFit = (pearson(user, toVector(job.traits)) + 1) / 2
      const interestFit =
        maxInterest === 0 ? 0.5 : job.interest ? interests[job.interest] / maxInterest : 0
      const fit = toPercent(TRAIT_WEIGHT * traitFit + INTEREST_WEIGHT * interestFit)
      return { job, fit, ...explain(job, traits, userMean, interestFit) }
    })
    .sort((a, b) => b.fit - a.fit || (b.job.satisfaction ?? 0) - (a.job.satisfaction ?? 0))
}

/**
 * 상위 추천이 한 직업군에 몰리지 않도록 직업군당 최대 perGroup개까지만 고른다.
 * 남는 자리는 다음 순위로 채운다.
 */
export function diversify(recs: Recommendation[], count: number, perGroup = 2): Recommendation[] {
  const picked: Recommendation[] = []
  const groupCount = new Map<string, number>()
  for (const rec of recs) {
    const n = groupCount.get(rec.job.group) ?? 0
    if (n >= perGroup) continue
    picked.push(rec)
    groupCount.set(rec.job.group, n + 1)
    if (picked.length === count) break
  }
  return picked
}

function explain(job: JobSummary, traits: TraitScores, userMean: number, interestFit: number) {
  // 사용자도 평균보다 높고 직업도 많이 요구하는 성향 = 추천 근거
  const matches = TRAIT_KEYS.filter((k) => traits[k] > userMean && job.traits[k] >= 60).sort(
    (a, b) => Math.min(traits[b], job.traits[b]) - Math.min(traits[a], job.traits[a]),
  )
  const reasons = matches.slice(0, 3).map((k) => TRAITS[k].matchReason)
  if (job.interest && interestFit >= 0.75) {
    reasons.push(`관심 분야인 '${INTERESTS[job.interest].label}' 분야의 직업이에요.`)
  }
  if (reasons.length === 0) reasons.push('전반적인 성향의 균형이 이 직업과 비슷해요.')

  const highlights = matches.slice(0, 3).map((k) => `${TRAITS[k].label} 활용`)

  // 직업은 많이 요구하는데 사용자는 상대적으로 낮은 성향 = 예상되는 어려움
  const difficulties = TRAIT_KEYS.filter((k) => job.traits[k] >= 70 && traits[k] < userMean - 5)
    .sort((a, b) => job.traits[b] - traits[b] - (job.traits[a] - traits[a]))
    .slice(0, 2)
    .map((k) => TRAITS[k].gap)

  return { reasons, highlights, difficulties }
}
