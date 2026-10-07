import { ArrowRightIcon, BriefcaseIcon, LightbulbIcon, StarIcon, TriangleAlertIcon } from 'lucide-react'
import { Navigate } from 'react-router'
import { FitBars, TraitRadar } from '@/components/charts'
import { LinkButton } from '@/components/link-button'
import { PrivateSeo } from '@/components/seo'
import { useAssessmentResult } from '@/hooks/use-assessment-result'
import { useRecommendations } from '@/hooks/use-recommendations'
import { diversify } from '@/lib/recommend'
import { rankTraits, topInterests } from '@/lib/scoring'
import { INTERESTS, TRAITS, type TraitScores } from '@/lib/traits'
import { cn, josa } from '@/lib/utils'

// 결과 화면은 카드 상자를 쓰지 않고, 번호가 붙은 섹션이 위에서 아래로 읽히는 흐름으로 구성한다.

export function ResultPage() {
  const result = useAssessmentResult()
  if (!result) return <Navigate to="/assessment" replace />

  const { persona, traits, profile, interests } = result
  const [first, second] = rankTraits(traits)

  return (
    <div>
      <PrivateSeo path="/result" />

      <header className="space-y-4 rounded-[2rem] bg-gradient-to-br from-primary to-[oklch(0.5_0.2_285)] px-6 py-10 text-center text-primary-foreground">
        <p className="text-sm text-primary-foreground/80">나의 대표 커리어 성향</p>
        <h1 className="text-2xl leading-snug font-bold sm:text-3xl">{persona.title}</h1>
        <p className="mx-auto max-w-lg leading-relaxed font-light text-primary-foreground/90">{persona.summary}</p>
        <p className="text-sm text-primary-foreground/80">
          관심 분야 · {topInterests(interests).map((k) => INTERESTS[k].label).join(', ') || '고르게 관심 있음'}
        </p>
      </header>

      <Section
        index="01"
        title="성향 프로필"
        lead={
          <>
            <strong className="text-foreground">{josa(TRAITS[first].label, '과', '와')}</strong>{' '}
            <strong className="text-foreground">{TRAITS[second].label}</strong> 쪽으로 가장 크게 뻗어 있어요.
          </>
        }
      >
        <div className="grid items-center gap-8 md:grid-cols-[1.1fr_1fr] [&>*]:min-w-0">
          <TraitRadar series={[{ key: 'me', label: '나', color: 'var(--chart-1)', values: traits }]} />
          <TraitRanking scores={traits} />
        </div>
      </Section>

      <Section index="02" title="나와 잘 맞는 직무 TOP 5" lead="직무를 누르면 추천 이유와 자세한 정보를 볼 수 있어요.">
        <TopJobs />
      </Section>

      <Section index="03" title="한눈에 보는 나">
        <dl className="divide-y">
          <Row icon={StarIcon} label="강점" items={profile.strengths} />
          <Row icon={BriefcaseIcon} label="잘 맞는 환경" items={profile.environments} />
          <Row icon={LightbulbIcon} label="일하는 방식" items={profile.workStyles} />
          <Row
            icon={TriangleAlertIcon}
            label="피하면 좋은 환경"
            items={profile.cautions.length ? profile.cautions : ['특별히 피해야 할 환경은 없어요. 다양한 환경에 잘 적응하는 편이에요.']}
          />
        </dl>
      </Section>

      <div className="flex flex-col gap-2 border-t pt-8 sm:flex-row">
        <LinkButton to="/jobs" size="lg" className="h-14 rounded-full text-base font-bold sm:flex-1">
          나에게 맞는 직무 보기
        </LinkButton>
        <LinkButton to="/assessment" size="lg" variant="outline" className="h-14 rounded-full text-base sm:w-40">
          다시 진단하기
        </LinkButton>
      </div>
    </div>
  )
}

function Section({
  index,
  title,
  lead,
  children,
}: {
  index: string
  title: string
  lead?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="space-y-6 py-10 sm:py-12 [&+&]:border-t">
      <div className="space-y-2">
        <p className="text-sm font-bold text-primary tabular-nums">{index}</p>
        <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
        {lead && <p className="text-muted-foreground">{lead}</p>}
      </div>
      {children}
    </section>
  )
}

/** 성향 순위: 레이더의 숫자를 높은 순으로 다시 읽어준다. 상위 2개를 강조한다. */
function TraitRanking({ scores }: { scores: TraitScores }) {
  return (
    <ol className="space-y-3">
      {rankTraits(scores).map((key, i) => {
        const top = i < 2
        return (
          <li key={key} className="grid grid-cols-[1.5rem_1fr_2.5rem] items-center gap-3">
            <span className={cn('text-sm font-bold tabular-nums', top ? 'text-primary' : 'text-muted-foreground/60')}>
              {i + 1}
            </span>
            <span className="space-y-1.5">
              <span className={cn('block text-sm', top ? 'font-bold' : 'text-muted-foreground')}>{TRAITS[key].label}</span>
              <span className="block h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                <span
                  className="block h-full rounded-r-[4px] rounded-l-full"
                  style={{
                    width: `${scores[key]}%`,
                    background: top ? 'var(--primary)' : 'color-mix(in oklch, var(--chart-me) 40%, transparent)',
                  }}
                />
              </span>
            </span>
            <span className={cn('text-right font-bold tabular-nums', !top && 'text-muted-foreground')}>{scores[key]}</span>
          </li>
        )
      })}
    </ol>
  )
}

function TopJobs() {
  const { recommendations } = useRecommendations()

  if (!recommendations) {
    return (
      <div className="space-y-4" aria-busy>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-3 animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <FitBars
        items={diversify(recommendations, 5).map((rec) => ({
          key: rec.job.id,
          label: rec.job.name,
          sublabel: rec.job.group,
          value: rec.fit,
          href: `/jobs/${rec.job.id}`,
        }))}
      />
      <div className="flex justify-end">
        <LinkButton to="/jobs" variant="ghost" className="h-9 rounded-full text-primary">
          추천 이유 자세히 보기
          <ArrowRightIcon aria-hidden />
        </LinkButton>
      </div>
    </div>
  )
}

function Row({ icon: Icon, label, items }: { icon: React.ComponentType<{ className?: string }>; label: string; items: string[] }) {
  return (
    <div className="grid gap-3 py-5 first:pt-0 last:pb-0 sm:grid-cols-[10rem_1fr] sm:gap-6">
      <dt className="flex items-center gap-2.5 self-start font-bold">
        <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
          <Icon className="size-4" aria-hidden />
        </span>
        <span>{label}</span>
      </dt>
      <dd>
        <ul className="space-y-1.5 leading-relaxed">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </dd>
    </div>
  )
}
