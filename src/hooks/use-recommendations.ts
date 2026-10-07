import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAssessmentResult } from '@/hooks/use-assessment-result'
import { fetchJobDetail, type CareerNetJobDetail } from '@/lib/careernet'
import { loadJobs, type JobSummary } from '@/lib/jobs'
import { recommend } from '@/lib/recommend'

type AsyncState<T> = { status: 'loading' } | { status: 'error'; error: Error } | { status: 'ready'; data: T }

const LOADING = { status: 'loading' } as const

/** key가 바뀌거나 retry하면 loader(key)를 다시 호출한다. loader는 모듈 수준의 고정 함수여야 한다. */
function useAsync<T>(key: string, loader: (key: string) => Promise<T>) {
  const [attempt, setAttempt] = useState(0)
  const requestKey = `${key}:${attempt}`
  const [settled, setSettled] = useState<{ requestKey: string; state: AsyncState<T> } | null>(null)

  useEffect(() => {
    let cancelled = false
    loader(key).then(
      (data) => !cancelled && setSettled({ requestKey, state: { status: 'ready', data } }),
      (error: Error) => !cancelled && setSettled({ requestKey, state: { status: 'error', error } }),
    )
    return () => {
      cancelled = true
    }
  }, [key, loader, requestKey])

  const retry = useCallback(() => setAttempt((a) => a + 1), [])
  const state: AsyncState<T> = settled?.requestKey === requestKey ? settled.state : LOADING
  return { state, retry }
}

export function useJobs() {
  return useAsync<JobSummary[]>('jobs', loadJobs)
}

/** 진단 결과 기준으로 전체 직업을 적합도 순으로 정렬한 목록 */
export function useRecommendations() {
  const result = useAssessmentResult()
  const { state, retry } = useJobs()

  const recommendations = useMemo(() => {
    if (!result || state.status !== 'ready') return null
    return recommend(state.data, result.traits, result.interests)
  }, [result, state])

  return { result, state, recommendations, retry }
}

export function useJobDetail(id: string) {
  return useAsync<CareerNetJobDetail>(id, fetchJobDetail)
}
