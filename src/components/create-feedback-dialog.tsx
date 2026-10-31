import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { FEEDBACK_SELECT, IMPORTANCE, type Company, type Feedback, type Importance } from '@/lib/types'

type Props = { company: Company; onCreated: (feedback: Feedback) => void }

export function CreateFeedbackDialog({ company, onCreated }: Props) {
  const { user } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [importance, setImportance] = useState<Importance>('important')
  const [isPrivate, setIsPrivate] = useState(false)
  const [saving, setSaving] = useState(false)

  if (!user) {
    return (
      <Button asChild className="w-full sm:w-auto">
        <Link to={`/login?next=${encodeURIComponent(location.pathname)}`}>
          <Plus /> Share feedback
        </Link>
      </Button>
    )
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSaving(true)
    const { data, error } = await supabase
      .from('feedbacks')
      .insert({
        company_id: company.id,
        author_id: user!.id,
        title: String(form.get('title')).trim(),
        description: String(form.get('description')).trim(),
        importance,
        is_private: isPrivate,
      })
      .select(FEEDBACK_SELECT)
      .single()
    setSaving(false)
    if (error) {
      toast.error('Could not send your feedback', {
        description: error.code === '23505' ? 'A feedback with this title already exists — upvote it instead!' : error.message,
      })
      return
    }
    onCreated(data as Feedback)
    toast.success(`Thanks! ${company.name} received your feedback.`)
    setOpen(false)
    setIsPrivate(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus /> Share feedback
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={submit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>Share feedback with {company.name}</DialogTitle>
            <DialogDescription>An idea, a problem, a complaint — they are listening.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Short summary" required maxLength={120} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Details</Label>
            <Textarea id="description" name="description" placeholder="What happened, or what would help you?" required rows={4} />
          </div>
          <div className="grid gap-2">
            <Label>How important is it to you?</Label>
            <Select value={importance} onValueChange={(v) => setImportance(v as Importance)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IMPORTANCE.map((i) => (
                  <SelectItem key={i.value} value={i.value}>
                    {i.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-start gap-3 rounded-md border p-3">
            <Checkbox id="private" checked={isPrivate} onCheckedChange={(v) => setIsPrivate(v === true)} />
            <div className="grid gap-1">
              <Label htmlFor="private">Send privately</Label>
              <p className="text-muted-foreground text-xs">Only {company.name} will see it. Others can't read or vote on it.</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Sending…' : 'Send feedback'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
