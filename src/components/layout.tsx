import { CompassIcon, MenuIcon, RotateCcwIcon, SearchIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useMatch } from 'react-router'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { trackPageView } from '@/lib/analytics'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'

/** 누구나 쓰는 메뉴 */
const PUBLIC_NAV = [{ to: '/search', label: '직업 검색' }]
/** 진단을 마친 뒤에만 의미가 있는 메뉴 */
const RESULT_NAV = [
  { to: '/result', label: '내 결과' },
  { to: '/jobs', label: '추천 직무' },
  { to: '/saved', label: '관심 직무' },
  { to: '/compare', label: '비교' },
]

export function Layout() {
  const completed = useAppStore((s) => s.completedAt !== null)
  // 메인 페이지는 KV를 화면 전체 폭으로 쓰기 위해 본문 폭 제한을 풀고, 각 섹션이 직접 폭을 정한다.
  const fullBleed = useMatch('/') !== null
  const { pathname, search } = useLocation()

  // 페이지 이동마다 page_view. 자식 페이지의 <Seo>가 먼저 제목을 바꾼 뒤 실행된다(자식 effect가 먼저 돈다).
  useEffect(() => {
    trackPageView(pathname + search)
  }, [pathname, search])

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-4 px-4">
          <Link to="/" className="flex shrink-0 items-center gap-2 font-bold whitespace-nowrap">
            <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
              <CompassIcon className="size-4.5" aria-hidden />
            </span>
            <span>Career AI</span>
          </Link>
          <DesktopNav completed={completed} />
          {!completed && (
            <Link
              to="/assessment"
              className="ml-auto rounded-full bg-primary px-4 py-1.75 text-sm font-bold whitespace-nowrap text-primary-foreground hover:bg-primary/90 md:ml-0"
            >
              진단 시작
            </Link>
          )}
          <MobileNav completed={completed} />
        </div>
      </header>

      <main className={cn('w-full flex-1', !fullBleed && 'mx-auto max-w-3xl px-4 py-8 sm:py-10')}>
        <Outlet />
      </main>

      <footer className="px-4 py-8 text-center text-xs text-muted-foreground">
        직업 정보 출처:{' '}
        <a
          href="https://www.career.go.kr"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          커리어넷(한국직업능력연구원)
        </a>
      </footer>
    </div>
  )
}

function DesktopNav({ completed }: { completed: boolean }) {
  const items = completed ? [...RESULT_NAV, ...PUBLIC_NAV] : PUBLIC_NAV
  return (
    <nav className="ml-auto hidden gap-1 text-sm md:flex" aria-label="주 메뉴">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              'rounded-full px-3 py-1.75 whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground',
              isActive && 'bg-secondary font-bold text-secondary-foreground',
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

function MobileNav({ completed }: { completed: boolean }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const items = completed ? [...RESULT_NAV, ...PUBLIC_NAV] : PUBLIC_NAV

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-lg"
            className={cn('rounded-full md:hidden', completed ? 'ml-auto' : '-mr-2')}
            aria-label="메뉴 열기"
          />
        }
      >
        <MenuIcon className="size-5" aria-hidden />
      </SheetTrigger>
      <SheetContent side="right" className="w-72 gap-0">
        <SheetHeader className="border-b">
          <SheetTitle className="text-base font-bold">메뉴</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-3" aria-label="주 메뉴">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={close}
              className={({ isActive }) =>
                cn(
                  'rounded-xl px-4 py-3.25 text-base font-medium transition-colors hover:bg-muted',
                  isActive && 'bg-secondary font-bold text-secondary-foreground',
                )
              }
            >
              {item.to === '/search' && <SearchIcon className="mr-2 inline size-4 align-[-2px]" aria-hidden />}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t p-3">
          <Link
            to="/assessment"
            onClick={close}
            className="flex items-center gap-2 rounded-xl px-4 py-3.25 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <RotateCcwIcon className="size-4" aria-hidden />
            {completed ? '다시 진단하기' : '진단 시작하기'}
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}
