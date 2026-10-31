import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router'
import { ChevronUp, Copy, ExternalLink, Inbox, MessageSquareReply, Pencil, ThumbsUp, Users } from 'lucide-react'
import { toast } from 'sonner'

import { CompanyForm } from '@/components/company-form'
import { ImportanceBadge, PrivateBadge } from '@/components/feedback-badges'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { timeAgo } from '@/lib/utils'
import { FEEDBACK_SELECT, STATUSES, type Company, type Feedback, type FeedbackStatus } from '@/lib/types'

type Filter = 'all' | 'unanswered' | 'private'

export function DashboardPage() {
  const { user, loading } = useAuth()
  const [company, setCompany] = useState<Company | null | undefined>(undefined)
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data: c } = await supabase.from('companies').select('*').eq('owner_id', user!.id).order('created_at').limit(1).maybeSingle()
      setCompany((c as Company) ?? null)
      if (!c) return
      const { data: f } = await supabase.from('feedbacks').select(FEEDBACK_SELECT).eq('company_id', c.id).order('created_at', { ascending: false })
      setFeedbacks((f as Feedback[]) ?? [])
    }
    load()
  }, [user])

  const stats = useMemo(
    () => [
      { label: 'Feedbacks', value: feedbacks.length, icon: Inbox },
      { label: 'Votes', value: feedbacks.reduce((n, f) => n + f.votes.length, 0), icon: ThumbsUp },
      { label: 'Contributors', value: new Set(feedbacks.map((f) => f.author_id)).size, icon: Users },
      { label: 'Waiting for a reply', value: feedbacks.filter((f) => !f.response).length, icon: MessageSquareReply },
    ],
    [feedbacks],
  )

  const visible = useMemo(() => {
    const list =
      filter === 'unanswered' ? feedbacks.filter((f) => !f.response) : filter === 'private' ? feedbacks.filter((f) => f.is_private) : feedbacks
    return [...list].sort((a, b) => b.votes.length - a.votes.length || b.created_at.localeCompare(a.created_at))
  }, [feedbacks, filter])

  if (loading) return null
  if (!user) return <Navigate to="/login?next=/dashboard" replace />

  if (company === undefined) {
    return (
      <div className="mx-auto grid max-w-5xl gap-4 px-4 py-10">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-28" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (company === null) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Create your company page</CardTitle>
            <CardDescription>You'll get a public page where your customers can share feedback and vote on ideas.</CardDescription>
          </CardHeader>
          <CardContent>
            <CompanyForm submitLabel="Create company page" onSaved={setCompany} />
          </CardContent>
        </Card>
      </div>
    )
  }

  const publicUrl = `${window.location.origin}/c/${company.slug}`
  const update = (id: string, changes: Partial<Feedback>) => setFeedbacks((list) => list.map((f) => (f.id === id ? { ...f, ...changes } : f)))

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-muted-foreground text-sm">Dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard.writeText(publicUrl).then(() => toast.success('Link copied — share it with your customers!'))}
          >
            <Copy /> Copy public link
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/c/${company.slug}`}>
              <ExternalLink /> View page
            </Link>
          </Button>
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Pencil /> Edit profile
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Edit company profile</DialogTitle>
                <DialogDescription>This is what customers see on your public page.</DialogDescription>
              </DialogHeader>
              <CompanyForm
                company={company}
                onSaved={(c) => {
                  setCompany(c)
                  setEditOpen(false)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="gap-2 py-5">
            <CardHeader className="px-5">
              <CardDescription className="flex items-center justify-between">
                {s.label} <s.icon className="size-4" />
              </CardDescription>
              <CardTitle className="text-3xl tabular-nums">{s.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Feedback</h2>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unanswered">Needs reply</TabsTrigger>
              <TabsTrigger value="private">Private</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {visible.map((f) => (
          <AdminFeedbackCard key={f.id} feedback={f} onUpdate={(changes) => update(f.id, changes)} />
        ))}
        {visible.length === 0 && (
          <div className="text-muted-foreground rounded-xl border border-dashed p-12 text-center">
            {feedbacks.length === 0 ? 'No feedback yet. Share your public link to collect some!' : 'Nothing here.'}
          </div>
        )}
      </div>
    </div>
  )
}

function AdminFeedbackCard({ feedback, onUpdate }: { feedback: Feedback; onUpdate: (changes: Partial<Feedback>) => void }) {
  const [editing, setEditing] = useState(!feedback.response)
  const [saving, setSaving] = useState(false)

  async function save(changes: Partial<Feedback>) {
    setSaving(true)
    const { error } = await supabase.from('feedbacks').update(changes).eq('id', feedback.id)
    setSaving(false)
    if (error) {
      toast.error('Could not save', { description: error.message })
      return false
    }
    onUpdate(changes)
    return true
  }

  async function reply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const response = String(new FormData(event.currentTarget).get('response')).trim()
    if (await save({ response, responded_at: new Date().toISOString() })) {
      toast.success('Reply published')
      setEditing(false)
    }
  }

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          {feedback.title}
          {feedback.is_private && <PrivateBadge />}
        </CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 font-medium">
            <ChevronUp className="size-4" /> {feedback.votes.length}
          </span>
          <ImportanceBadge importance={feedback.importance} />
          <span>{timeAgo(feedback.created_at)}</span>
        </CardDescription>
        <div data-slot="card-action" className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
          <Select value={feedback.status} onValueChange={(v) => save({ status: v as FeedbackStatus })}>
            <SelectTrigger size="sm" className="w-36" aria-label="Status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p className="text-sm whitespace-pre-line">{feedback.description}</p>
        {editing ? (
          <form onSubmit={reply} className="grid gap-2">
            <Textarea name="response" required defaultValue={feedback.response ?? ''} placeholder="Write your official reply…" rows={3} />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? 'Publishing…' : 'Publish reply'}
              </Button>
              {feedback.response && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        ) : (
          <div className="bg-muted/60 flex items-start justify-between gap-4 rounded-md border p-3 text-sm">
            <div>
              <div className="mb-1 flex items-center gap-1.5 text-xs font-medium">
                <MessageSquareReply className="size-3.5" /> Your reply
              </div>
              <p className="whitespace-pre-line">{feedback.response}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              <Pencil /> Edit
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
