import { BookmarkIcon, ColumnsIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MAX_COMPARE, useAppStore } from '@/store/app-store'

/** 관심 직무 저장 / 비교 담기 토글 버튼 */
export function JobActions({ jobId, jobName, className }: { jobId: string; jobName: string; className?: string }) {
  const saved = useAppStore((s) => s.savedJobs.includes(jobId))
  const comparing = useAppStore((s) => s.compareJobs.includes(jobId))
  const toggleSaved = useAppStore((s) => s.toggleSaved)
  const toggleCompare = useAppStore((s) => s.toggleCompare)

  return (
    <div className={cn('flex gap-2', className)}>
      <Button
        variant="outline"
        size="sm"
        aria-pressed={saved}
        className={cn('h-9 rounded-full px-3.5', saved && 'border-primary bg-secondary text-secondary-foreground')}
        onClick={() => {
          toggleSaved(jobId)
          toast(saved ? `'${jobName}'을(를) 관심 직무에서 뺐어요.` : `'${jobName}'을(를) 관심 직무에 저장했어요.`)
        }}
      >
        <BookmarkIcon className={cn(saved && 'fill-current')} aria-hidden />
        {saved ? '저장됨' : '저장'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        aria-pressed={comparing}
        className={cn('h-9 rounded-full px-3.5', comparing && 'border-primary bg-secondary text-secondary-foreground')}
        onClick={() => {
          if (!toggleCompare(jobId)) toast(`비교는 최대 ${MAX_COMPARE}개까지 담을 수 있어요.`)
        }}
      >
        <ColumnsIcon aria-hidden />
        {comparing ? '비교 중' : '비교'}
      </Button>
    </div>
  )
}
