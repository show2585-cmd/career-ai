import { CheckIcon } from 'lucide-react'
import { useEffect } from 'react'
import { Link, Navigate } from 'react-router'
import { ErrorState, LoadingState } from '@/components/async-state'
import { JobActions } from '@/components/job-actions'
import { LinkButton } from '@/components/link-button'
import { PrivateSeo } from '@/components/seo'
import { Badge } from '@/components/ui/badge'
import { useRecommendations } from '@/hooks/use-recommendations'
import { track } from '@/lib/analytics'
import { diversify, type Recommendation } from '@/lib/recommend'
import { INTERESTS } from '@/lib/traits'

const TOP_COUNT = 5
const MORE_COUNT = 5

export function JobsPage() {
  const { result, state, recommendations, retry } = useRecommendations()
  const topJob = recommendations ? diversify(recommendations, 1)[0] : undefined

  useEffect(() => {
    if (topJob) track('view_recommendations', { top_job: topJob.job.name, top_fit: topJob.fit })
  }, [topJob?.job.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!result) return <Navigate to="/assessment" replace />

  if (state.status === 'error') {
    return <ErrorState message="직업 데이터를 불러오지 못했어요. 네트워크 상태를 확인해 주세요." onRetry={retry} />
  }
  if (!recommendations) return <LoadingState label="잘 맞는 직무를 찾고 있어요" />

  const top = diversify(recommendations, TOP_COUNT)
  // TOP 5 다음으로 잘 맞는 직무 (FR 예외: 추천 직무 부족 시 유사 직무 추가 추천)
  const more = diversify(
    recommendations.filter((r) => !top.includes(r)),
    MORE_COUNT,
  )

  return (
    <div className="space-y-10">
      <PrivateSeo path="/jobs" />
      <section className="space-y-2">
        <p className="text-sm font-bold text-primary">{result.persona.title}에게</p>
        <h1 className="text-2xl font-bold sm:text-3xl">잘 맞는 직무 TOP {TOP_COUNT}</h1>
        <p className="text-sm text-muted-foreground">
          커리어넷 직업 {recommendations.length}개의 업무수행능력·업무환경 데이터와 내 성향을 비교했어요.
        </p>
      </section>

      <ol className="space-y-4">
        {top.map((rec, i) => (
          <li key={rec.job.id}>
            <JobCard rec={rec} rank={i + 1} />
          </li>
        ))}
      </ol>

      {more.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold">이런 직무도 잘 맞아요</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {more.map((rec) => (
              <li key={rec.job.id}>
                <Link
                  to={`/jobs/${rec.job.id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-card p-4 ring-1 ring-border transition-shadow hover:ring-primary/40"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-bold">{rec.job.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{rec.job.group}</span>
                  </span>
                  <span className="shrink-0 font-bold text-primary tabular-nums">{rec.fit}%</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function JobCard({ rec, rank }: { rec: Recommendation; rank: number }) {
  const { job, fit, highlights, reasons } = rec
  const checks = highlights.length ? highlights : reasons.slice(0, 1)

  return (
    <article className="space-y-4 rounded-3xl bg-card p-5 ring-1 ring-border sm:p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1.5">
          <p className="text-sm font-bold text-primary">{rank}위</p>
          <h2 className="text-xl font-bold">{job.name}</h2>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="rounded-full">
              {job.group}
            </Badge>
            {job.interest && (
              <Badge variant="outline" className="rounded-full">
                {INTERESTS[job.interest].label}
              </Badge>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-muted-foreground">적합도</p>
          <p className="text-3xl font-bold text-primary tabular-nums">{fit}%</p>
        </div>
      </header>

      {job.summary && <p className="text-sm leading-relaxed text-muted-foreground">{job.summary}</p>}

      <ul className="space-y-1.5 text-sm">
        {checks.map((text) => (
          <li key={text} className="flex items-center gap-2">
            <CheckIcon className="size-4 shrink-0 text-primary" aria-hidden />
            {text}
          </li>
        ))}
      </ul>

      <footer className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <JobActions jobId={job.id} jobName={job.name} />
        <LinkButton to={`/jobs/${job.id}`} className="rounded-full px-5">
          자세히 보기
        </LinkButton>
      </footer>
    </article>
  )
}
