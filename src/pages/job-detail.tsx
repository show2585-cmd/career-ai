import { ArrowLeftIcon, SparklesIcon } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { ErrorState, LoadingState } from '@/components/async-state'
import { ME_COLOR, SERIES_COLORS, TraitRadar } from '@/components/charts'
import { JobActions } from '@/components/job-actions'
import { LinkButton } from '@/components/link-button'
import { Seo } from '@/components/seo'
import { Badge } from '@/components/ui/badge'
import { useJobDetail, useRecommendations } from '@/hooks/use-recommendations'
import { track } from '@/lib/analytics'
import { cleanText, type CareerNetJobDetail } from '@/lib/careernet'
import { relatedJobs, type JobSummary } from '@/lib/jobs'
import { jobPath, jobSeo, type JobSeoInput } from '@/lib/seo'

export function JobDetailPage() {
  const { id = '' } = useParams()
  const { state: detailState, retry } = useJobDetail(id)
  const { state: jobsState, recommendations, result } = useRecommendations()

  const summary = jobsState.status === 'ready' ? jobsState.data.find((j) => j.id === id) : undefined
  const rec = recommendations?.find((r) => r.job.id === id)
  const rank = rec && recommendations ? recommendations.indexOf(rec) + 1 : null
  const loadedName = detailState.status === 'ready' ? detailState.data.baseInfo.job_nm : null

  useEffect(() => {
    if (loadedName) track('view_job', { job_id: id, job_name: loadedName, fit: rec?.fit, rank: rank ?? undefined })
  }, [id, loadedName]) // eslint-disable-line react-hooks/exhaustive-deps

  if (detailState.status === 'error') return <ErrorState message={detailState.error.message} onRetry={retry} />
  if (detailState.status === 'loading') return <LoadingState label="커리어넷에서 직업 정보를 가져오고 있어요" />

  const detail = detailState.data
  const info = detail.baseInfo
  const allJobs = jobsState.status === 'ready' ? jobsState.data : []

  return (
    <div className="space-y-6">
      <Seo {...jobSeo(summary ?? seoInputFromDetail(id, detail))} />
      {recommendations ? (
        <LinkButton to="/jobs" variant="ghost" className="-ml-2 h-9 rounded-full text-muted-foreground">
          <ArrowLeftIcon aria-hidden />
          추천 직무
        </LinkButton>
      ) : (
        <LinkButton to="/" variant="ghost" className="-ml-2 h-9 rounded-full text-muted-foreground">
          <ArrowLeftIcon aria-hidden />
          홈
        </LinkButton>
      )}

      <header className="space-y-4 rounded-[2rem] bg-card p-6 ring-1 ring-border sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <Badge variant="secondary" className="rounded-full">
              {info.aptit_name}
            </Badge>
            <h1 className="text-2xl font-bold sm:text-3xl">{info.job_nm}</h1>
          </div>
          {rec && (
            <div className="shrink-0 text-right">
              <p className="text-xs text-muted-foreground">나와의 적합도{rank ? ` · ${rank}위` : ''}</p>
              <p className="text-4xl font-bold text-primary tabular-nums">{rec.fit}%</p>
            </div>
          )}
        </div>
        <dl className="grid grid-cols-3 gap-2 text-center text-sm">
          <Stat label="평균 연봉" value={formatWage(info.wage)} />
          <Stat label="직업 만족도" value={info.satisfication ? `${info.satisfication}%` : '-'} />
          <Stat label="일·가정 균형" value={info.wlb || '-'} />
        </dl>
        <JobActions jobId={id} jobName={info.job_nm} />
      </header>

      {!recommendations && <AssessmentCta jobName={info.job_nm} />}

      {rec && (
        <Section title="추천 이유" description="내 성향과 이 직업이 요구하는 성향을 겹쳐 봤어요.">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_1.1fr] [&>*]:min-w-0">
            {result && (
              <TraitRadar
                series={[
                  { key: 'job', label: info.job_nm, color: SERIES_COLORS[0], values: rec.job.traits },
                  { key: 'me', label: '나', color: ME_COLOR, values: result.traits, dashed: true },
                ]}
              />
            )}
            <div>
              <Bullets items={rec.reasons} />
              {rec.difficulties.length > 0 && (
                <div className="mt-4 rounded-2xl bg-muted/60 p-4">
                  <p className="mb-2 text-sm font-bold">예상되는 어려움</p>
                  <Bullets items={rec.difficulties} muted />
                </div>
              )}
            </div>
          </div>
        </Section>
      )}

      <Section title="주요 업무">
        <Bullets items={(detail.workList ?? []).map((w) => cleanText(w.work))} />
      </Section>

      <Competencies detail={detail} />

      <EnvironmentSection detail={detail} />

      {(detail.aptitudeList?.length || detail.interestList?.length) && (
        <Section title="이런 사람에게 잘 맞아요">
          <Bullets
            items={[
              ...(detail.aptitudeList ?? []).map((a) => cleanText(a.aptitude)),
              ...(detail.interestList ?? []).map((i) => cleanText(i.interest)),
            ]}
          />
        </Section>
      )}

      {detail.forecastList?.[0] && (
        <Section title="커리어 전망">
          <p className="text-sm leading-relaxed">{cleanText(detail.forecastList[0].forecast)}</p>
        </Section>
      )}

      <Roadmap detail={detail} />

      <RelatedSection detail={detail} />

      {summary && <MoreJobs jobs={relatedJobs(allJobs, summary, 6)} />}
    </div>
  )
}

/** 검색 등으로 진단 없이 들어온 방문자에게 진단을 권한다. */
function AssessmentCta({ jobName }: { jobName: string }) {
  return (
    <section className="flex flex-col items-start gap-4 rounded-3xl bg-secondary/60 p-6 sm:flex-row sm:items-center">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
        <SparklesIcon className="size-5" aria-hidden />
      </span>
      <div className="space-y-1 sm:flex-1">
        <p className="font-bold">{jobName}, 나와 잘 맞을까?</p>
        <p className="text-sm text-muted-foreground">5분 성향 진단으로 이 직업과의 적합도와 추천 이유를 확인해 보세요.</p>
      </div>
      <LinkButton to="/assessment" className="rounded-full px-5">
        무료 진단하기
      </LinkButton>
    </section>
  )
}

function MoreJobs({ jobs }: { jobs: JobSummary[] }) {
  if (!jobs.length) return null
  return (
    <Section title="함께 보면 좋은 직업">
      <ul className="grid gap-2 sm:grid-cols-2">
        {jobs.map((job) => (
          <li key={job.id} className="min-w-0">
            <Link
              to={jobPath(job.id)}
              className="block rounded-2xl p-3.5 ring-1 ring-border transition-colors hover:ring-primary/40"
            >
              <span className="block font-bold">{job.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{job.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}

/** 직업 데이터(jobs.json)를 아직 못 불러왔을 때 API 응답으로 SEO 메타를 만든다. */
function seoInputFromDetail(id: string, detail: CareerNetJobDetail): JobSeoInput {
  return {
    id,
    name: detail.baseInfo.job_nm,
    group: detail.baseInfo.aptit_name,
    summary: detail.workList?.[0] ? cleanText(detail.workList[0].work) : '',
    abilities: (detail.abilityList ?? []).map((a) => a.ability_name),
    skills: (detail.performList?.perform ?? []).filter((p) => p !== null).slice(0, 3).map((p) => p.perform),
  }
}

function Competencies({ detail }: { detail: CareerNetJobDetail }) {
  const abilities = (detail.abilityList ?? []).map((a) => a.ability_name).filter(Boolean)
  const performs = (detail.performList?.perform ?? []).filter((p) => p !== null).slice(0, 5)
  if (!abilities.length && !performs.length) return null

  return (
    <Section title="필요한 역량">
      {abilities.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {abilities.map((a) => (
            <Badge key={a} className="h-7 rounded-full px-3">
              {a}
            </Badge>
          ))}
        </div>
      )}
      {performs.length > 0 && <ImportanceList items={performs.map((p) => ({ name: p.perform, inform: p.inform, importance: p.importance }))} />}
    </Section>
  )
}

function EnvironmentSection({ detail }: { detail: CareerNetJobDetail }) {
  const envs = (detail.performList?.environment ?? []).filter((e) => e !== null).slice(0, 5)
  if (!envs.length) return null
  return (
    <Section title="업무 환경" description="이 직업에서 자주 겪는 환경이에요.">
      <ImportanceList items={envs.map((e) => ({ name: e.environment, inform: e.inform, importance: e.importance }))} />
    </Section>
  )
}

function ImportanceList({ items }: { items: { name: string; inform: string; importance: number }[] }) {
  return (
    <ul className="space-y-3" aria-label="중요도 (100점 만점)">
      {items.map((item) => (
        <li key={item.name} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-bold">{item.name}</span>
            <span className="font-medium tabular-nums text-muted-foreground">{item.importance}</span>
          </div>
          <span className="block h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
            <span className="block h-full rounded-full bg-primary" style={{ width: `${item.importance}%` }} />
          </span>
          <p className="text-xs text-muted-foreground">{item.inform}</p>
        </li>
      ))}
    </ul>
  )
}

/** 성장 로드맵: 커리어넷 "준비 방법"을 기초 → 중급 → 실전 단계로 보여준다. */
function Roadmap({ detail }: { detail: CareerNetJobDetail }) {
  const ready = detail.jobReadyList ?? {}
  const steps = [
    { label: '기초', title: '정규 교육과정', items: (ready.curriculum ?? []).map((c) => c.curriculum) },
    {
      label: '중급',
      title: '자격증 · 직업훈련',
      items: [...(ready.certificate ?? []).map((c) => c.certificate), ...(ready.training ?? []).map((t) => t.training)],
    },
    { label: '실전', title: '입직 및 취업', items: (ready.recruit ?? []).map((r) => r.recruit) },
  ].filter((s) => s.items.length > 0)
  if (!steps.length) return null

  return (
    <Section title="성장 로드맵">
      <ol className="relative space-y-6 border-l-2 border-secondary pl-6">
        {steps.map((step) => (
          <li key={step.label} className="relative space-y-1.5">
            <span
              aria-hidden
              className="absolute top-0.5 -left-[2.0625rem] grid size-4 place-items-center rounded-full bg-primary ring-4 ring-card"
            />
            <p className="text-sm font-bold">
              <span className="text-primary">{step.label}</span> · {step.title}
            </p>
            <Bullets items={step.items.map(cleanText)} muted />
          </li>
        ))}
      </ol>
    </Section>
  )
}

function RelatedSection({ detail }: { detail: CareerNetJobDetail }) {
  const related = detail.baseInfo.rel_job_nm?.split(',').map((s) => s.trim()).filter(Boolean) ?? []
  const departs = (detail.departList ?? []).map((d) => d.depart_name)
  if (!related.length && !departs.length) return null
  return (
    <Section title="관련 정보">
      <div className="space-y-4">
        {related.length > 0 && <ChipRow label="관련 직업" items={related} />}
        {departs.length > 0 && <ChipRow label="관련 학과" items={departs} />}
      </div>
    </Section>
  )
}

function ChipRow({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge key={item} variant="outline" className="h-7 rounded-full px-3 font-medium">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  )
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-3xl bg-card p-6 ring-1 ring-border">
      <div className="space-y-1">
        <h2 className="text-lg font-bold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function Bullets({ items, muted }: { items: string[]; muted?: boolean }) {
  return (
    <ul className={`space-y-2 text-sm leading-relaxed ${muted ? 'text-muted-foreground' : ''}`}>
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
          {item}
        </li>
      ))}
    </ul>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary/60 px-2 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-bold text-secondary-foreground">{value}</dd>
    </div>
  )
}

function formatWage(wage: number | string | undefined) {
  if (wage === undefined || wage === '' || wage === null) return '-'
  return `${wage}만원`
}
