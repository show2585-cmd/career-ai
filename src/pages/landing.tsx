import { ArrowRightIcon, CompassIcon, ListChecksIcon, SparklesIcon } from 'lucide-react'
import { Link } from 'react-router'
import { LinkButton } from '@/components/link-button'
import { Seo } from '@/components/seo'
import POPULAR_JOBS from '@/data/popular-jobs.json'
import { ESTIMATED_MINUTES, QUESTIONS } from '@/data/questions'
import { jobPath, PUBLIC_PAGES } from '@/lib/seo'

const STEPS = [
  {
    icon: SparklesIcon,
    title: '성향 진단',
    body: `일상 속 상황 ${QUESTIONS.length}개에 답하며 나의 일하는 방식을 알아봐요.`,
  },
  {
    icon: CompassIcon,
    title: '직무 추천',
    body: '커리어넷 직업 데이터와 비교해 잘 맞는 직무 TOP 5를 찾아드려요.',
  },
  {
    icon: ListChecksIcon,
    title: '직무 탐색',
    body: '추천 이유와 필요 역량을 살펴보고, 관심 직무끼리 나란히 비교해요.',
  },
]

// 메인 비주얼(public/kv.png)의 왼쪽 여백 색. 이미지 가장자리가 배경과 자연스럽게 이어지도록 맞춘다.
const KV_EDGE = '#f4fafd'

export function LandingPage() {
  return (
    <div className="pb-16">
      <Seo {...PUBLIC_PAGES[0]} />
      <Hero />

      <div className="mx-auto max-w-3xl space-y-14 px-4 pt-14">
        <section className="space-y-5">
          <h2 className="text-xl font-bold">이렇게 진행돼요</h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="space-y-3 rounded-3xl bg-card p-6 ring-1 ring-border/70">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
                    <step.icon className="size-5" aria-hidden />
                  </span>
                  <span className="text-sm font-bold text-muted-foreground/60">0{i + 1}</span>
                </div>
                <p className="text-lg font-bold">{step.title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-5">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-xl font-bold">많이 찾는 직업</h2>
            <Link to="/search" className="text-sm font-medium text-primary hover:underline">
              전체 직업 검색
            </Link>
          </div>
          <ul className="flex flex-wrap gap-2">
            {POPULAR_JOBS.map((job) => (
              <li key={job.id}>
                <Link
                  to={jobPath(job.id)}
                  className="inline-flex rounded-full bg-card px-4 py-2.25 text-sm font-medium ring-1 ring-border transition-colors hover:text-primary hover:ring-primary/40"
                >
                  {job.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

/**
 * KV 히어로.
 * - PC(md 이상): 이미지를 화면 전체 폭 배경으로 깔고, 왼쪽의 밝은 여백 위에 문구를 올린다.
 * - 모바일: 문구를 먼저 보여주고, 그 아래에 인물 중심으로 자른 이미지를 이어 붙인다.
 */
function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: KV_EDGE }}>
      <div className="relative z-10 mx-auto max-w-3xl px-4 pt-10 md:flex md:min-h-[min(640px,calc(100svh-4rem))] md:items-center md:py-20">
        <div className="max-w-md space-y-6 md:max-w-[34rem]">
          <p className="inline-flex rounded-full bg-white/80 px-4 py-1.75 text-sm font-medium text-secondary-foreground ring-1 ring-primary/15 backdrop-blur">
            약 {ESTIMATED_MINUTES}분 · {QUESTIONS.length}문항 · 회원가입 없이
          </p>
          <h1 className="text-[2rem] leading-snug font-bold tracking-tight text-foreground sm:text-[2.75rem] sm:leading-[1.2]">
            나는 어떤 환경에서
            <br />
            일할 때 <span className="text-primary">가장 즐거울까?</span>
          </h1>
          <p className="leading-relaxed text-muted-foreground">
            검사 결과를 알려주는 데서 끝나지 않아요.
            <br />
            나에게 맞는 일을 발견하고, 왜 맞는지까지 확인해 보세요.
          </p>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <LinkButton
              to="/assessment"
              size="lg"
              className="h-14 rounded-full px-8 text-base font-bold shadow-lg shadow-primary/25"
            >
              나에게 맞는 진로 찾기
              <ArrowRightIcon aria-hidden />
            </LinkButton>
            {/* {completed && (
              <LinkButton to="/result" variant="ghost" className="h-11 rounded-full px-4 text-muted-foreground">
                지난 진단 결과 보기
              </LinkButton>
            )} */}
          </div>
        </div>
      </div>

      {/* PC에서는 이미지를 오른쪽 72%에만 깔아 인물이 문구 영역과 겹치지 않게 한다. */}
      <div className="relative -mt-6 aspect-[5/4] sm:aspect-[16/10] md:absolute md:inset-y-0 md:right-0 md:mt-0 md:aspect-auto md:w-[72%]">
        <picture>
          <source media="(min-width: 768px)" srcSet="/kv-1600.webp" type="image/webp" />
          <img
            src="/kv-800.webp"
            alt=""
            width={1671}
            height={941}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover object-[72%_50%] md:object-[70%_50%]"
          />
        </picture>
        {/* 모바일: 위쪽을 배경색으로 녹여 문구와 이어지게 / PC: 왼쪽을 밝게 덮어 문구 가독성 확보 */}
        <div
          aria-hidden
          className="absolute inset-0 md:hidden"
          style={{ background: `linear-gradient(to bottom, ${KV_EDGE} 0%, transparent 28%)` }}
        />
        <div
          aria-hidden
          className="absolute inset-0 hidden md:block"
          style={{ background: `linear-gradient(to right, ${KV_EDGE} 0%, ${KV_EDGE}cc 22%, transparent 45%)` }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-16"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--background))' }}
        />
      </div>
    </section>
  )
}
