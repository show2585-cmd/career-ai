import { QUESTIONS } from '@/data/questions'
import {
  emptyInterests,
  emptyTraits,
  INTEREST_KEYS,
  TRAIT_KEYS,
  TRAITS,
  type InterestKey,
  type InterestScores,
  type TraitKey,
  type TraitScores,
} from '@/lib/traits'

/** 질문 ID → 선택한 선택지 인덱스 */
export type Answers = Record<string, number>

// 지표별로 "모든 질문에서 그 지표에 가장 유리한 선택지를 골랐을 때"의 점수.
// 원점수를 이 값으로 나눠 0~100으로 정규화한다.
const TRAIT_MAX = (() => {
  const max = emptyTraits()
  for (const q of QUESTIONS) {
    for (const key of TRAIT_KEYS) {
      max[key] += Math.max(0, ...q.options.map((o) => o.traits?.[key] ?? 0))
    }
  }
  return max
})()

export function computeTraitScores(answers: Answers): TraitScores {
  const raw = emptyTraits()
  for (const q of QUESTIONS) {
    const option = q.options[answers[q.id]]
    if (!option?.traits) continue
    for (const [key, value] of Object.entries(option.traits) as [TraitKey, number][]) {
      raw[key] += value
    }
  }
  const scores = emptyTraits()
  for (const key of TRAIT_KEYS) {
    // 한 번도 고르지 않아도 0점이 되지 않도록 10~100 범위로 표시한다.
    scores[key] = TRAIT_MAX[key] ? Math.round(10 + (90 * raw[key]) / TRAIT_MAX[key]) : 0
  }
  return scores
}

/** 관심 분야 점수. 진단 시작 때 고른 관심 분야도 1점씩 반영한다. */
export function computeInterestScores(answers: Answers, selected: InterestKey[] = []): InterestScores {
  const scores = emptyInterests()
  for (const q of QUESTIONS) {
    const option = q.options[answers[q.id]]
    if (!option?.interests) continue
    for (const [key, value] of Object.entries(option.interests) as [InterestKey, number][]) {
      scores[key] += value
    }
  }
  for (const key of selected) scores[key] += 1
  return scores
}

export function rankTraits(scores: TraitScores): TraitKey[] {
  return [...TRAIT_KEYS].sort((a, b) => scores[b] - scores[a])
}

export function topInterests(scores: InterestScores, count = 2): InterestKey[] {
  return [...INTEREST_KEYS]
    .filter((k) => scores[k] > 0)
    .sort((a, b) => scores[b] - scores[a])
    .slice(0, count)
}

// ── 대표 커리어 성향 ──
// 1순위 지표가 "명사", 2순위 지표가 "수식어"가 된다.
// 예) 창의 1위 + 분석 2위 → "문제를 구조화하는 탐색가"

const PERSONA_NOUN: Record<TraitKey, string> = {
  analytic: '분석가',
  creative: '탐색가',
  collab: '조율자',
  autonomy: '개척자',
  stability: '설계자',
  people: '조력자',
}

const PERSONA_MODIFIER: Record<TraitKey, string> = {
  analytic: '문제를 구조화하는',
  creative: '새로운 길을 그리는',
  collab: '함께 성과를 만드는',
  autonomy: '스스로 길을 여는',
  stability: '체계를 단단히 세우는',
  people: '사람의 마음을 읽는',
}

const PERSONA_SUMMARY: Record<TraitKey, string> = {
  analytic: '복잡한 문제를 구조화하고 근거를 바탕으로 답을 찾는 업무',
  creative: '새로운 아이디어로 해결 방법을 만들어내는 업무',
  collab: '여러 사람의 의견을 모아 하나의 결과로 이끄는 업무',
  autonomy: '스스로 목표를 세우고 주도적으로 실행하는 업무',
  stability: '명확한 기준 아래 정확하고 꼼꼼하게 완성하는 업무',
  people: '사람을 이해하고 그들에게 실질적인 도움을 주는 업무',
}

export interface Persona {
  title: string
  summary: string
  primary: TraitKey
  secondary: TraitKey
}

export function getPersona(scores: TraitScores): Persona {
  const [primary, secondary] = rankTraits(scores)
  return {
    title: `${PERSONA_MODIFIER[secondary]} ${PERSONA_NOUN[primary]}`,
    summary: `${PERSONA_SUMMARY[primary]}에 높은 적합성을 보입니다. ${TRAITS[secondary].strength}`,
    primary,
    secondary,
  }
}

/** 결과 화면의 강점, 선호 환경·방식, 주의할 환경 */
export function describeProfile(scores: TraitScores) {
  const ranked = rankTraits(scores)
  const top = ranked.slice(0, 3)

  // 극단적인 지표일수록 주의할 환경으로 먼저 보여준다.
  const cautions = [...TRAIT_KEYS]
    .map((key) => {
      const s = scores[key]
      if (s >= 70) return { key, weight: s - 70, text: TRAITS[key].cautionHigh }
      if (s <= 40) return { key, weight: 40 - s, text: TRAITS[key].cautionLow }
      return null
    })
    .filter((c) => c !== null)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map((c) => c.text)

  return {
    strengths: top.map((k) => TRAITS[k].strength),
    environments: top.map((k) => TRAITS[k].environment),
    workStyles: top.slice(0, 2).map((k) => TRAITS[k].workStyle),
    cautions,
  }
}
