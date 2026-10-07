import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { PrivateSeo } from '@/components/seo'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { QUESTIONS } from '@/data/questions'
import { track } from '@/lib/analytics'
import { computeTraitScores, getPersona } from '@/lib/scoring'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'

const AUTO_ADVANCE_MS = 250

export function AssessmentQuestionsPage() {
  const navigate = useNavigate()
  const { answers, answer, currentIndex, setCurrentIndex, complete } = useAppStore()
  const advanceTimer = useRef<number>(undefined)

  const index = Math.min(currentIndex, QUESTIONS.length - 1)
  const question = QUESTIONS[index]
  const selected = answers[question.id]
  const isLast = index === QUESTIONS.length - 1
  const answeredCount = QUESTIONS.filter((q) => answers[q.id] !== undefined).length
  const percent = Math.round((answeredCount / QUESTIONS.length) * 100)

  useEffect(() => () => window.clearTimeout(advanceTimer.current), [])

  function select(optionIndex: number) {
    answer(question.id, optionIndex)
    window.clearTimeout(advanceTimer.current)
    if (!isLast) {
      advanceTimer.current = window.setTimeout(() => setCurrentIndex(index + 1), AUTO_ADVANCE_MS)
    }
  }

  function next() {
    if (selected === undefined) return
    if (!isLast) {
      setCurrentIndex(index + 1)
      return
    }
    // 앞 문항을 건너뛴 채 마지막까지 온 경우, 첫 미응답 문항으로 보낸다.
    const firstUnanswered = QUESTIONS.findIndex((q) => answers[q.id] === undefined)
    if (firstUnanswered !== -1) {
      setCurrentIndex(firstUnanswered)
      return
    }
    complete()
    const persona = getPersona(computeTraitScores(answers))
    track('assessment_complete', { persona: persona.title, primary_trait: persona.primary })
    navigate('/assessment/analyzing')
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <PrivateSeo path="/assessment/questions" />
      <Progress value={percent} aria-label="진단 진행률" className="[&_[data-slot=progress-track]]:h-2">
        <span className="text-sm font-bold text-primary">
          Q{index + 1}
          <span className="font-medium text-muted-foreground"> / {QUESTIONS.length}</span>
        </span>
        <span className="ml-auto text-sm text-muted-foreground tabular-nums">{percent}%</span>
      </Progress>

      <h1 id={`${question.id}-title`} className="text-[1.375rem] leading-normal font-bold">
        {question.text}
      </h1>

      <RadioGroup
        key={question.id}
        aria-labelledby={`${question.id}-title`}
        value={selected === undefined ? null : String(selected)}
        onValueChange={(value) => select(Number(value))}
        className="gap-3"
      >
        {question.options.map((option, i) => {
          const checked = selected === i
          return (
            <Label
              key={option.text}
              className={cn(
                'flex min-h-16 cursor-pointer items-center gap-4 rounded-2xl border-2 border-transparent bg-card p-4 text-base leading-snug font-medium ring-1 ring-border transition-all hover:ring-primary/40 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50',
                checked && 'border-primary bg-secondary/50 ring-0',
              )}
            >
              {/* 실제 라디오는 시각적으로 숨기고, 키보드·스크린리더 접근만 담당한다. */}
              <RadioGroupItem value={String(i)} className="sr-only" />
              <span
                aria-hidden
                className={cn(
                  'grid size-8 shrink-0 place-items-center rounded-full bg-muted text-sm font-bold text-muted-foreground transition-colors',
                  checked && 'bg-primary text-primary-foreground',
                )}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span>{option.text}</span>
            </Label>
          )
        })}
      </RadioGroup>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="lg"
          className="h-13 flex-1 rounded-full text-base"
          disabled={index === 0}
          onClick={() => setCurrentIndex(index - 1)}
        >
          이전
        </Button>
        <Button size="lg" className="h-13 flex-1 rounded-full text-base" disabled={selected === undefined} onClick={next}>
          {isLast ? '결과 보기' : '다음'}
        </Button>
      </div>
    </div>
  )
}
