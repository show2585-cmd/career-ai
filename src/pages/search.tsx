import { SearchIcon, XIcon } from 'lucide-react'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { EmptyState, ErrorState, LoadingState } from '@/components/async-state'
import { Seo } from '@/components/seo'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRecommendations } from '@/hooks/use-recommendations'
import { track } from '@/lib/analytics'
import { searchScore } from '@/lib/search'
import { jobPath, PUBLIC_PAGES } from '@/lib/seo'
import { INTEREST_KEYS, INTERESTS, type InterestKey } from '@/lib/traits'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 60

type SortKey = 'popular' | 'fit' | 'name'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'popular', label: '많이 찾는 순' },
  { value: 'fit', label: '나와 잘 맞는 순' },
  { value: 'name', label: '가나다 순' },
]

const SEARCH_SEO = PUBLIC_PAGES.find((p) => p.path === '/search')!

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  // 입력값은 로컬 상태로 둔다. URL을 직접 value로 쓰면 키 입력마다 주소가 바뀌며
  // 한글 IME 조합이 깨져 "ㄱ개갭바발…"처럼 글자가 중복 입력된다.
  const [query, setQuery] = useState(() => params.get('q') ?? '')
  const field = (params.get('field') as InterestKey | null) ?? null
  const { state, recommendations, retry } = useRecommendations()
  const [sort, setSort] = useState<SortKey>('popular')
  const [limit, setLimit] = useState(PAGE_SIZE)
  // 입력 중에는 이전 결과를 유지해 타이핑이 끊기지 않게 한다.
  const deferredQuery = useDeferredValue(query)

  const fitById = useMemo(() => new Map(recommendations?.map((r) => [r.job.id, r.fit]) ?? []), [recommendations])
  const effectiveSort: SortKey = sort === 'fit' && !recommendations ? 'popular' : sort
  // 적합도 정렬은 진단을 마친 경우에만 보여준다.
  const sortOptions = SORT_OPTIONS.filter((o) => o.value !== 'fit' || recommendations)

  const results = useMemo(() => {
    if (state.status !== 'ready') return []
    return state.data
      .filter((job) => !field || job.interest === field)
      .map((job) => ({ job, score: searchScore(job, deferredQuery) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => {
        if (deferredQuery && b.score !== a.score) return b.score - a.score
        if (effectiveSort === 'fit') return (fitById.get(b.job.id) ?? 0) - (fitById.get(a.job.id) ?? 0)
        if (effectiveSort === 'name') return a.job.name.localeCompare(b.job.name, 'ko')
        return b.job.views - a.job.views
      })
  }, [state, field, deferredQuery, effectiveSort, fitById])

  // 입력이 1초간 멈춘 검색어만 기록해 타이핑 중간 글자가 쌓이지 않게 한다.
  const resultCount = results.length
  useEffect(() => {
    const term = deferredQuery.trim()
    if (term.length < 2 || state.status !== 'ready') return
    const timer = window.setTimeout(() => track('search', { search_term: term, results: resultCount, field: field ?? 'all' }), 1000)
    return () => window.clearTimeout(timer)
  }, [deferredQuery, field, resultCount, state.status])

  // 검색어는 입력이 0.3초 멈추면 주소(?q=)에 반영해 공유·북마크가 되게 한다.
  useEffect(() => {
    if (query === (params.get('q') ?? '')) return
    const timer = window.setTimeout(() => update({ q: query }), 300)
    return () => window.clearTimeout(timer)
  }, [query]) // eslint-disable-line react-hooks/exhaustive-deps

  function update(next: { q?: string; field?: InterestKey | null }) {
    const p = new URLSearchParams(params)
    if (next.q !== undefined) {
      if (next.q) p.set('q', next.q)
      else p.delete('q')
    }
    if (next.field !== undefined) {
      if (next.field) p.set('field', next.field)
      else p.delete('field')
    }
    setParams(p, { replace: true })
    setLimit(PAGE_SIZE)
  }

  return (
    <div className="space-y-6">
      <Seo {...SEARCH_SEO} />
      <div className="space-y-1">
        <h1 className="text-2xl font-bold sm:text-3xl">직업 검색</h1>
        <p className="text-sm text-muted-foreground">
          커리어넷 직업 {state.status === 'ready' ? state.data.length : ''}개를 이름, 관련 직업, 직업군으로 찾아보세요.
        </p>
      </div>

      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="예) 개발자, 간호, ㄱㅊㄱ"
          aria-label="직업 검색어"
          autoComplete="off"
          enterKeyHint="search"
          className="h-14 w-full rounded-full border-0 bg-card pr-12 pl-12 text-base ring-1 ring-border outline-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              update({ q: '' })
            }}
            aria-label="검색어 지우기"
            className="absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <XIcon className="size-4" />
          </button>
        )}
      </form>

      <div className="space-y-3">
        {/* 분야 칩 스와이퍼: 모바일은 터치 스와이프, PC는 마우스 드래그 + 양 끝 화살표 */}
        <Carousel opts={{ align: 'start', dragFree: true, containScroll: 'trimSnaps' }} aria-label="분야" className="md:px-10">
          <CarouselContent className="-ml-2">
            {[null, ...INTEREST_KEYS].map((key) => (
              <CarouselItem key={key ?? 'all'} className="basis-auto pl-2">
                <Chip
                  selected={field === key}
                  onClick={() => update({ field: key === null || field === key ? null : key })}
                >
                  {key ? INTERESTS[key].label : '전체'}
                </Chip>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious aria-label="이전 분야" className="left-0 hidden size-8 disabled:opacity-0 md:inline-flex" />
          <CarouselNext aria-label="다음 분야" className="right-0 hidden size-8 disabled:opacity-0 md:inline-flex" />
        </Carousel>

        <div className="flex items-center justify-between gap-3 text-sm">
          <p className="text-muted-foreground" aria-live="polite">
            {state.status === 'ready' && (
              <>
                <strong className="text-foreground tabular-nums">{results.length}</strong>개 직업
              </>
            )}
          </p>
          <Select
            items={sortOptions}
            value={effectiveSort}
            onValueChange={(value) => value && setSort(value as SortKey)}
          >
            <SelectTrigger aria-label="정렬" className="h-9 rounded-full bg-card px-3.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {state.status === 'error' ? (
        <ErrorState message="직업 데이터를 불러오지 못했어요." onRetry={retry} />
      ) : state.status === 'loading' ? (
        <LoadingState />
      ) : results.length === 0 ? (
        <EmptyState title="검색 결과가 없어요" body="다른 검색어로 찾아보거나 분야 필터를 풀어보세요." />
      ) : (
        <>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {results.slice(0, limit).map(({ job }) => {
              const fit = fitById.get(job.id)
              return (
                <li key={job.id} className="min-w-0">
                  <Link
                    to={jobPath(job.id)}
                    className="flex h-full items-start justify-between gap-3 rounded-2xl bg-card p-4 ring-1 ring-border transition-shadow hover:ring-primary/40"
                  >
                    <span className="min-w-0 space-y-1">
                      <span className="block font-bold">{job.name}</span>
                      <span className="block text-xs text-muted-foreground">{job.group}</span>
                      <span className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{job.summary}</span>
                    </span>
                    {fit !== undefined && (
                      <span className="shrink-0 text-right">
                        <span className="block text-[11px] text-muted-foreground">적합도</span>
                        <span className="block font-bold text-primary tabular-nums">{fit}%</span>
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
          {results.length > limit && (
            <div className="flex justify-center">
              <Button variant="outline" className="h-11 rounded-full px-6" onClick={() => setLimit((n) => n + PAGE_SIZE)}>
                더 보기 ({results.length - limit}개 남음)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'h-9 shrink-0 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        selected ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-muted',
      )}
    >
      {children}
    </button>
  )
}
