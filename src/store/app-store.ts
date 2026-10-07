import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Answers } from '@/lib/scoring'
import type { InterestKey } from '@/lib/traits'

// 비회원 전용: 모든 상태를 이 기기의 localStorage에 저장한다.
// 진단 중 새로고침·이탈해도 진행 상태가 복구된다 (FR-001, NFR-004).

export interface UserProfile {
  ageGroup?: string
  status?: string
  interests: InterestKey[]
}

export const MAX_COMPARE = 3

interface AppState {
  profile: UserProfile
  answers: Answers
  currentIndex: number
  completedAt: string | null
  savedJobs: string[]
  compareJobs: string[]
  /** 비교 차트 색 슬롯(0~2). 하나를 빼도 남은 직무의 색이 바뀌지 않도록 직무별로 고정한다. */
  compareSlots: Record<string, number>

  setProfile: (profile: UserProfile) => void
  answer: (questionId: string, optionIndex: number) => void
  setCurrentIndex: (index: number) => void
  complete: () => void
  resetAssessment: () => void
  toggleSaved: (jobId: string) => void
  toggleCompare: (jobId: string) => boolean
  clearCompare: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: { interests: [] },
      answers: {},
      currentIndex: 0,
      completedAt: null,
      savedJobs: [],
      compareJobs: [],
      compareSlots: {},

      setProfile: (profile) => set({ profile }),
      answer: (questionId, optionIndex) =>
        set((s) => ({ answers: { ...s.answers, [questionId]: optionIndex } })),
      setCurrentIndex: (currentIndex) => set({ currentIndex }),
      complete: () => set({ completedAt: new Date().toISOString() }),
      resetAssessment: () => set({ answers: {}, currentIndex: 0, completedAt: null }),

      toggleSaved: (jobId) =>
        set((s) => ({
          savedJobs: s.savedJobs.includes(jobId)
            ? s.savedJobs.filter((id) => id !== jobId)
            : [...s.savedJobs, jobId],
        })),
      /** 비교 목록이 가득 차서 추가하지 못하면 false */
      toggleCompare: (jobId) => {
        const { compareJobs, compareSlots } = get()
        if (compareJobs.includes(jobId)) {
          const { [jobId]: _removed, ...rest } = compareSlots
          set({ compareJobs: compareJobs.filter((id) => id !== jobId), compareSlots: rest })
          return true
        }
        if (compareJobs.length >= MAX_COMPARE) return false
        const used = new Set(compareJobs.map((id) => compareSlots[id]))
        const slot = Array.from({ length: MAX_COMPARE }, (_, i) => i).find((i) => !used.has(i)) ?? 0
        set({ compareJobs: [...compareJobs, jobId], compareSlots: { ...compareSlots, [jobId]: slot } })
        return true
      },
      clearCompare: () => set({ compareJobs: [], compareSlots: {} }),
    }),
    {
      name: 'career-ai',
      version: 2,
      // v2: 커리어 미션 기능 삭제 → 저장된 미션 기록을 정리한다.
      migrate: (persisted) => {
        const { missions: _missions, ...rest } = (persisted ?? {}) as Record<string, unknown>
        return rest as unknown as AppState
      },
      // 시크릿 모드 등에서 localStorage 접근이 막혀도 앱은 동작하도록 한다.
      storage: createJSONStorage(() => {
        try {
          localStorage.setItem('__probe__', '1')
          localStorage.removeItem('__probe__')
          return localStorage
        } catch {
          return sessionStorage
        }
      }),
    },
  ),
)
