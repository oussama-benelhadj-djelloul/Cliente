import { MessageSquareReply } from 'lucide-react'

import { ImportanceBadge, PrivateBadge, StatusBadge } from '@/components/feedback-badges'
import { VoteButton } from '@/components/vote-button'
import { Card } from '@/components/ui/card'
import { timeAgo } from '@/lib/utils'
import type { Feedback } from '@/lib/types'

type Props = { feedback: Feedback; companyName: string; onVotesChange: (votes: Feedback['votes']) => void }

export function FeedbackCard({ feedback, companyName, onVotesChange }: Props) {
  return (
    <Card className="flex-row gap-4 px-5 py-5">
      <VoteButton feedback={feedback} onChange={onVotesChange} />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">{feedback.title}</h3>
          {feedback.is_private && <PrivateBadge />}
        </div>
        <p className="text-muted-foreground text-sm whitespace-pre-line">{feedback.description}</p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <StatusBadge status={feedback.status} />
          <ImportanceBadge importance={feedback.importance} />
          <span className="text-muted-foreground text-xs">{timeAgo(feedback.created_at)}</span>
        </div>
        {feedback.response && (
          <div className="bg-muted/60 mt-3 rounded-md border p-3 text-sm">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium">
              <MessageSquareReply className="size-3.5" /> {companyName} replied
            </div>
            <p className="whitespace-pre-line">{feedback.response}</p>
          </div>
        )}
      </div>
    </Card>
  )
}
