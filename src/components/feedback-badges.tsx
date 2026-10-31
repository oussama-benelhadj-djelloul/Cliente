import { CircleCheck, CircleDashed, Clock, Lock, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { IMPORTANCE, STATUSES, type FeedbackStatus, type Importance } from '@/lib/types'

const statusStyle: Record<FeedbackStatus, { className: string; icon: typeof Clock }> = {
  new: { className: 'border-border text-muted-foreground', icon: Sparkles },
  planned: { className: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300', icon: CircleDashed },
  in_progress: { className: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300', icon: Clock },
  done: { className: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300', icon: CircleCheck },
}

export function StatusBadge({ status }: { status: FeedbackStatus }) {
  const { className, icon: Icon } = statusStyle[status]
  return (
    <Badge variant="outline" className={className}>
      <Icon />
      {STATUSES.find((s) => s.value === status)?.label}
    </Badge>
  )
}

export function ImportanceBadge({ importance }: { importance: Importance }) {
  return (
    <Badge
      variant="outline"
      className={cn(importance === 'critical' && 'border-red-200 text-red-700 dark:border-red-900 dark:text-red-300')}
    >
      {IMPORTANCE.find((i) => i.value === importance)?.label}
    </Badge>
  )
}

export function PrivateBadge() {
  return (
    <Badge variant="secondary">
      <Lock /> Private
    </Badge>
  )
}
