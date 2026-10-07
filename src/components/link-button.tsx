import type { VariantProps } from 'class-variance-authority'
import { Link, type LinkProps } from 'react-router'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** 버튼처럼 보이는 라우터 링크 */
export function LinkButton({
  className,
  variant,
  size,
  ...props
}: LinkProps & VariantProps<typeof buttonVariants>) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
