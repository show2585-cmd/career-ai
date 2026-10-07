import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Seo } from '@/components/seo'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ESTIMATED_MINUTES, QUESTIONS } from '@/data/questions'
import { PUBLIC_PAGES } from '@/lib/seo'
import { cn } from '@/lib/utils'
import { INTEREST_KEYS, INTERESTS, type InterestKey } from '@/lib/traits'
import { useAppStore } from '@/store/app-store'

const AGE_GROUPS = ['10대', '20대 초반', '20대 후반', '30대', '40대 이상']
const STATUSES = ['대학생', '취업 준비 중', '직장인', '기타']

export function AssessmentStartPage() {
  const navigate = useNavigate()
  const { profile, setProfile, answers, completedAt, resetAssessment } = useAppStore()
  const [ageGroup, setAgeGroup] = useState(profile.ageGroup)
  const [status, setStatus] = useState(profile.status)
  const [interests, setInterests] = useState<InterestKey[]>(profile.interests)

  const answeredCount = Object.keys(answers).length
  const inProgress = completedAt === null && answeredCount > 0

  function start(fresh: boolean) {
    setProfile({ ageGroup, status, interests })
    if (fresh) resetAssessment()
    navigate('/assessment/questions')
  }

  function toggleInterest(key: InterestKey, checked: boolean) {
    setInterests((prev) => (checked ? [...prev, key] : prev.filter((k) => k !== key)))
  }

  return (
    <div className="space-y-8">
      <Seo {...PUBLIC_PAGES[1]} />
      <section className="space-y-3">
        <p className="text-sm font-bold text-primary">STEP 1</p>
        <h1 className="text-2xl font-bold sm:text-3xl">커리어 성향 진단</h1>
        <p className="text-muted-foreground">
          정답은 없어요. 일상과 업무 속 상황에서 <strong className="text-foreground">평소의 나라면</strong>{' '}
          어떻게 행동할지 골라주세요. 내가 어떤 방식과 환경에서 일할 때 만족도가 높은지 분석해 맞는 직무를
          찾아드려요.
        </p>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-secondary/60 p-4">
            <dt className="text-muted-foreground">문항 수</dt>
            <dd className="mt-1 text-xl font-bold text-secondary-foreground">{QUESTIONS.length}문항</dd>
          </div>
          <div className="rounded-2xl bg-secondary/60 p-4">
            <dt className="text-muted-foreground">예상 소요 시간</dt>
            <dd className="mt-1 text-xl font-bold text-secondary-foreground">약 {ESTIMATED_MINUTES}분</dd>
          </div>
        </dl>
      </section>

      <Card>
        <CardContent className="space-y-6">
          <div>
            <p className="text-lg font-bold">기본 정보 <span className="text-sm font-medium text-muted-foreground">(선택)</span></p>
            <p className="text-sm text-muted-foreground">입력하면 추천에 참고해요. 건너뛰어도 괜찮아요.</p>
          </div>

          <ChipGroup label="연령대" options={AGE_GROUPS} value={ageGroup} onChange={setAgeGroup} />
          <ChipGroup label="현재 상태" options={STATUSES} value={status} onChange={setStatus} />

          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium">관심 있는 분야 (복수 선택)</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {INTEREST_KEYS.map((key) => (
                <Label
                  key={key}
                  className="flex cursor-pointer items-center gap-2.5 rounded-2xl border p-3.5 font-medium transition-colors has-data-checked:border-primary has-data-checked:bg-secondary/50"
                >
                  <Checkbox
                    checked={interests.includes(key)}
                    onCheckedChange={(checked) => toggleInterest(key, checked)}
                  />
                  {INTERESTS[key].label}
                </Label>
              ))}
            </div>
          </fieldset>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row">
        {inProgress ? (
          <>
            <Button size="lg" className="h-14 rounded-full sm:flex-1 text-base font-bold" onClick={() => start(false)}>
              이어서 하기 ({answeredCount}/{QUESTIONS.length})
            </Button>
            <Button size="lg" variant="outline" className="h-14 rounded-full sm:flex-1 text-base font-bold" onClick={() => start(true)}>
              처음부터 다시
            </Button>
          </>
        ) : (
          <Button size="lg" className="h-14 rounded-full sm:flex-1 text-base font-bold" onClick={() => start(true)}>
            진단 시작하기
          </Button>
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        응답과 결과는 이 기기의 브라우저에만 저장되며 서버로 전송되지 않아요.
      </p>
    </div>
  )
}

function ChipGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value?: string
  onChange: (value?: string) => void
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected ? undefined : option)}
              className={cn(
                'rounded-full border px-4 py-1.75 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                selected ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted',
              )}
            >
              {option}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
