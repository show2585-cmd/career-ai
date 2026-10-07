import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { PrivateSeo } from '@/components/seo'
import { useAppStore } from '@/store/app-store'

const STEPS = ['응답을 정리하고 있어요', '업무 성향을 분석하고 있어요', '잘 맞는 직무를 찾고 있어요']
const STEP_MS = 700

export function AssessmentAnalyzingPage() {
  const navigate = useNavigate()
  const completed = useAppStore((s) => s.completedAt !== null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setStep((s) => s + 1), STEP_MS)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (step >= STEPS.length) navigate('/result', { replace: true })
  }, [step, navigate])

  if (!completed) return <Navigate to="/assessment" replace />

  return (
    <div className="flex min-h-[50svh] flex-col items-center justify-center gap-6 text-center">
      <PrivateSeo path="/assessment/analyzing" />
      <div className="size-12 animate-spin rounded-full border-4 border-muted border-t-primary" aria-hidden />
      <p className="text-lg font-medium" role="status" aria-live="polite">
        {STEPS[Math.min(step, STEPS.length - 1)]}
      </p>
    </div>
  )
}
