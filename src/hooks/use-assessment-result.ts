import { useMemo } from 'react'
import { computeInterestScores, computeTraitScores, describeProfile, getPersona } from '@/lib/scoring'
import { useAppStore } from '@/store/app-store'

/** 저장된 응답으로 진단 결과를 계산한다. 진단을 끝내지 않았으면 null. */
export function useAssessmentResult() {
  const answers = useAppStore((s) => s.answers)
  const interests = useAppStore((s) => s.profile.interests)
  const completedAt = useAppStore((s) => s.completedAt)

  return useMemo(() => {
    if (!completedAt) return null
    const traits = computeTraitScores(answers)
    return {
      completedAt,
      traits,
      interests: computeInterestScores(answers, interests),
      persona: getPersona(traits),
      profile: describeProfile(traits),
    }
  }, [answers, interests, completedAt])
}

export type AssessmentResult = NonNullable<ReturnType<typeof useAssessmentResult>>
