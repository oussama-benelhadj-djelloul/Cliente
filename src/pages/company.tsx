import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { Globe, MessageSquare } from 'lucide-react'

import { CreateFeedbackDialog } from '@/components/create-feedback-dialog'
import { FeedbackCard } from '@/components/feedback-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NotFoundPage } from '@/pages/not-found'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { FEEDBACK_SELECT, STATUSES, type Company, type Feedback, type FeedbackStatus } from '@/lib/types'

type Sort = 'top' | 'new'

export function CompanyPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [company, setCompany] = useState<Company | null | undefined>(undefined)
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [sort, setSort] = useState<Sort>('top')
  const [status, setStatus] = useState<FeedbackStatus | 'all'>('all')

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: c } = await supabase.from('companies').select('*').eq('slug', slug!).maybeSingle()
      if (cancelled) return
      setCompany((c as Company) ?? null)
      if (!c) return
      const { data: f } = await supabase.from('feedbacks').select(FEEDBACK_SELECT).eq('company_id', c.id)
      if (!cancelled) setFeedbacks((f as Feedback[]) ?? [])
    }
    load()
    return () => {
      cancelled = true
    }
    // Reload when the user signs in or out: private feedback visibility changes.
  }, [slug, user?.id])

  const visible = useMemo(() => {
    const list = status === 'all' ? feedbacks : feedbacks.filter((f) => f.status === status)
    return [...list].sort((a, b) =>
      sort === 'top'
        ? b.votes.length - a.votes.length || b.created_at.localeCompare(a.created_at)
        : b.created_at.localeCompare(a.created_at),
    )
  }, [feedbacks, sort, status])

  if (company === null) return <NotFoundPage message="We couldn't find this company." />

  const links = company
    ? (['website', 'facebook', 'linkedin', 'instagram'] as const).filter((k) => company[k]).map((k) => ({ key: k, url: company[k]! }))
    : []

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-[280px_1fr]">
      <aside className="md:sticky md:top-24 md:self-start">
        {company ? (
          <Card>
            <CardHeader>
              <div className="bg-primary text-primary-foreground mb-2 grid size-12 place-content-center rounded-lg text-xl font-bold">
                {company.name[0]}
              </div>
              <CardTitle className="text-xl">{company.name}</CardTitle>
              {company.description && <CardDescription>{company.description}</CardDescription>}
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center gap-2 text-sm">
                <MessageSquare className="text-muted-foreground size-4" />
                {feedbacks.length} feedback{feedbacks.length === 1 ? '' : 's'}
              </div>
              {links.length > 0 && (
                <>
                  <Separator />
                  <ul className="grid gap-2 text-sm">
                    {links.map((l) => (
                      <li key={l.key}>
                        <a href={l.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 capitalize hover:underline">
                          <Globe className="text-muted-foreground size-4" />
                          {l.key}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Skeleton className="h-64" />
        )}
      </aside>

      <main className="grid content-start gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Tabs value={sort} onValueChange={(v) => setSort(v as Sort)}>
              <TabsList>
                <TabsTrigger value="top">Top</TabsTrigger>
                <TabsTrigger value="new">Newest</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select value={status} onValueChange={(v) => setStatus(v as FeedbackStatus | 'all')}>
              <SelectTrigger size="sm" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {company && <CreateFeedbackDialog company={company} onCreated={(f) => setFeedbacks((list) => [f, ...list])} />}
        </div>

        {company === undefined
          ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-32" />)
          : visible.map((f) => (
              <FeedbackCard
                key={f.id}
                feedback={f}
                companyName={company.name}
                onVotesChange={(votes) => setFeedbacks((list) => list.map((x) => (x.id === f.id ? { ...x, votes } : x)))}
              />
            ))}

        {company && visible.length === 0 && (
          <div className="text-muted-foreground rounded-xl border border-dashed p-12 text-center">
            {feedbacks.length === 0 ? 'No feedback yet — be the first one!' : 'No feedback with this status.'}
          </div>
        )}
      </main>
    </div>
  )
}
