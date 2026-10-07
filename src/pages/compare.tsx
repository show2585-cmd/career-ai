import { XIcon } from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState, ErrorState, LoadingState } from '@/components/async-state'
import { FitBars, ME_COLOR, SERIES_COLORS, TraitRadar } from '@/components/charts'
import { LinkButton } from '@/components/link-button'
import { PrivateSeo } from '@/components/seo'
import { Button } from '@/components/ui/button'
import { useRecommendations } from '@/hooks/use-recommendations'
import { INTERESTS, TRAIT_KEYS, TRAITS } from '@/lib/traits'
import { MAX_COMPARE, useAppStore } from '@/store/app-store'

/** 0~100 → 별 1~5개 */
function Stars({ value }: { value: number }) {
  const count = Math.max(1, Math.round(value / 20))
  return (
    <span aria-label={`5점 중 ${count}점 (${value}점)`} className="tracking-tight whitespace-nowrap">
      <span className="text-primary">{'★'.repeat(count)}</span>
      <span className="text-muted-foreground/30">{'★'.repeat(5 - count)}</span>
      <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">{value}</span>
    </span>
  )
}

export function ComparePage() {
  const compareJobs = useAppStore((s) => s.compareJobs)
  const compareSlots = useAppStore((s) => s.compareSlots)
  const toggleCompare = useAppStore((s) => s.toggleCompare)
  const clearCompare = useAppStore((s) => s.clearCompare)
  const { state, recommendations, result, retry } = useRecommendations()

  if (state.status === 'error') return <ErrorState message="직업 데이터를 불러오지 못했어요." onRetry={retry} />
  if (state.status === 'loading') return <LoadingState />

  const jobs = compareJobs.map((id) => state.data.find((j) => j.id === id)).filter((j) => j !== undefined)
  const fitOf = (id: string) => recommendations?.find((r) => r.job.id === id)?.fit

  // 직무별 고정 색. 슬롯이 없는 예전 데이터는 남는 슬롯을 순서대로 채운다.
  const usedSlots = new Set(jobs.map((j) => compareSlots[j.id]).filter((n) => n !== undefined))
  const freeSlots = SERIES_COLORS.map((_, i) => i).filter((i) => !usedSlots.has(i))
  const colorOf = Object.fromEntries(
    jobs.map((j) => [j.id, SERIES_COLORS[compareSlots[j.id] ?? freeSlots.shift() ?? 0]]),
  ) as Record<string, string>

  if (jobs.length === 0) {
    return (
      <EmptyState
        title="비교할 직무를 담아주세요"
        body={`추천 직무나 관심 직무에서 '비교'를 눌러 최대 ${MAX_COMPARE}개까지 담을 수 있어요.`}
        action={
          <LinkButton to="/jobs" className="mt-2 rounded-full">
            추천 직무 보기
          </LinkButton>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <PrivateSeo path="/compare" />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">직무 비교</h1>
          <p className="text-sm text-muted-foreground">
            {jobs.length < 2 ? '직무를 하나 이상 더 담으면 나란히 비교할 수 있어요.' : '직무마다 요구하는 성향을 내 성향과 겹쳐 봤어요.'}
          </p>
        </div>
        <Button variant="ghost" className="h-9 rounded-full text-muted-foreground" onClick={clearCompare}>
          모두 비우기
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="min-w-0 space-y-4 rounded-3xl bg-card p-5 ring-1 ring-border sm:p-6">
          <h2 className="text-lg font-bold">성향 비교</h2>
          <TraitRadar
            series={[
              ...jobs.map((job) => ({ key: `job${job.id}`, label: job.name, color: colorOf[job.id], values: job.traits })),
              ...(result ? [{ key: 'me', label: '나', color: ME_COLOR, values: result.traits, dashed: true }] : []),
            ]}
          />
        </section>
        {result && (
          <section className="min-w-0 space-y-5 rounded-3xl bg-card p-5 ring-1 ring-border sm:p-6">
            <h2 className="text-lg font-bold">나와의 적합도</h2>
            <FitBars
              items={[...jobs]
                .sort((a, b) => (fitOf(b.id) ?? 0) - (fitOf(a.id) ?? 0))
                .map((job) => ({
                  key: job.id,
                  label: job.name,
                  sublabel: job.group,
                  value: fitOf(job.id) ?? 0,
                  href: `/jobs/${job.id}`,
                  color: colorOf[job.id],
                }))}
            />
          </section>
        )}
      </div>

      <h2 className="pt-2 text-lg font-bold">자세히 비교하기</h2>
      <div className="overflow-x-auto rounded-3xl bg-card ring-1 ring-border">
        <table className="w-full min-w-[32rem] text-sm">
          <thead>
            <tr className="border-b">
              <th scope="col" className="w-28 p-4 text-left font-medium text-muted-foreground">
                비교 항목
              </th>
              {jobs.map((job) => (
                <th key={job.id} scope="col" className="p-4 text-left align-top">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/jobs/${job.id}`} className="flex items-center gap-2 font-bold hover:underline">
                      <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: colorOf[job.id] }} />
                      {job.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleCompare(job.id)}
                      className="-m-1 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label={`${job.name} 비교에서 빼기`}
                    >
                      <XIcon className="size-4" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_tr]:border-b [&_tr:last-child]:border-0">
            {result && (
              <Row label="나와의 적합도">
                {jobs.map((job) => (
                  <td key={job.id} className="p-4 text-lg font-bold text-primary tabular-nums">
                    {fitOf(job.id) ?? '-'}%
                  </td>
                ))}
              </Row>
            )}
            {TRAIT_KEYS.map((key) => (
              <Row key={key} label={TRAITS[key].label}>
                {jobs.map((job) => (
                  <td key={job.id} className="p-4">
                    <Stars value={job.traits[key]} />
                  </td>
                ))}
              </Row>
            ))}
            <Row label="분야">
              {jobs.map((job) => (
                <td key={job.id} className="p-4">
                  {job.interest ? INTERESTS[job.interest].label : job.group}
                </td>
              ))}
            </Row>
            <Row label="연봉 수준">
              {jobs.map((job) => (
                <td key={job.id} className="p-4">
                  {job.wage ?? '-'}
                </td>
              ))}
            </Row>
            <Row label="일·가정 균형">
              {jobs.map((job) => (
                <td key={job.id} className="p-4">
                  {job.wlb ?? '-'}
                </td>
              ))}
            </Row>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <th scope="row" className="p-4 text-left font-medium text-muted-foreground">
        {label}
      </th>
      {children}
    </tr>
  )
}
