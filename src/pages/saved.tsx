import { Link } from 'react-router'
import { EmptyState, ErrorState, LoadingState } from '@/components/async-state'
import { JobActions } from '@/components/job-actions'
import { LinkButton } from '@/components/link-button'
import { PrivateSeo } from '@/components/seo'
import { useRecommendations } from '@/hooks/use-recommendations'
import { useAppStore } from '@/store/app-store'

export function SavedPage() {
  const savedJobs = useAppStore((s) => s.savedJobs)
  const compareCount = useAppStore((s) => s.compareJobs.length)
  const { state, recommendations, retry } = useRecommendations()

  if (state.status === 'error') return <ErrorState message="직업 데이터를 불러오지 못했어요." onRetry={retry} />
  if (state.status === 'loading') return <LoadingState />

  const jobs = savedJobs
    .map((id) => state.data.find((j) => j.id === id))
    .filter((j) => j !== undefined)
  const fitOf = (id: string) => recommendations?.find((r) => r.job.id === id)?.fit

  return (
    <div className="space-y-6">
      <PrivateSeo path="/saved" />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">관심 직무</h1>
          <p className="text-sm text-muted-foreground">저장한 직무는 이 기기에 보관돼요.</p>
        </div>
        {compareCount > 0 && (
          <LinkButton to="/compare" className="rounded-full">
            비교하기 ({compareCount})
          </LinkButton>
        )}
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          title="아직 저장한 직무가 없어요"
          body="추천 직무에서 마음에 드는 직무를 저장해 보세요."
          action={
            <LinkButton to="/jobs" className="mt-2 rounded-full">
              추천 직무 보기
            </LinkButton>
          }
        />
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => {
            const fit = fitOf(job.id)
            return (
              <li key={job.id} className="space-y-3 rounded-3xl bg-card p-5 ring-1 ring-border">
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/jobs/${job.id}`} className="min-w-0 hover:underline">
                    <p className="text-lg font-bold">{job.name}</p>
                    <p className="text-xs text-muted-foreground">{job.group}</p>
                  </Link>
                  {fit !== undefined && <p className="shrink-0 text-2xl font-bold text-primary tabular-nums">{fit}%</p>}
                </div>
                <JobActions jobId={job.id} jobName={job.name} />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
