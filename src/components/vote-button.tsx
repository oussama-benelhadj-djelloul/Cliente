import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { ChevronUp } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { Feedback } from '@/lib/types'

type Props = { feedback: Feedback; onChange: (votes: Feedback['votes']) => void }

export function VoteButton({ feedback, onChange }: Props) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [busy, setBusy] = useState(false)
  const voted = !!user && feedback.votes.some((v) => v.user_id === user.id)

  async function toggle() {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`)
      return
    }
    setBusy(true)
    const previous = feedback.votes
    onChange(voted ? previous.filter((v) => v.user_id !== user.id) : [...previous, { user_id: user.id }])
    const { error } = voted
      ? await supabase.from('votes').delete().match({ feedback_id: feedback.id, user_id: user.id })
      : await supabase.from('votes').insert({ feedback_id: feedback.id, user_id: user.id })
    if (error) {
      onChange(previous)
      toast.error('Could not save your vote', { description: error.message })
    }
    setBusy(false)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={voted}
      aria-label={voted ? 'Remove vote' : 'Upvote'}
      className={cn(
        'flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-md border text-sm font-semibold transition-colors',
        voted ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent',
      )}
    >
      <ChevronUp className="size-4" />
      {feedback.votes.length}
    </button>
  )
}
