import { Button } from '@/components/ui/button'

export function LoadingState({ label = '불러오는 중이에요' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-muted-foreground" role="status">
      <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary" aria-hidden />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-card px-6 py-12 text-center ring-1 ring-border" role="alert">
      <p className="font-bold">문제가 생겼어요</p>
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" className="rounded-full" onClick={onRetry}>
        다시 시도
      </Button>
    </div>
  )
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-card px-6 py-14 text-center ring-1 ring-border">
      <p className="text-lg font-bold">{title}</p>
      <p className="text-sm text-muted-foreground">{body}</p>
      {action}
    </div>
  )
}
