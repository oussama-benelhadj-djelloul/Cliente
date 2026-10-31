import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, BarChart3, Lock, ThumbsUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import type { Company } from '@/lib/types'

const features = [
  { icon: ThumbsUp, title: 'Votes show what matters', text: 'Customers upvote ideas, so the biggest pain points rise to the top.' },
  { icon: Lock, title: 'Public or private', text: 'Ideas go on the public board; complaints can be sent privately to the company.' },
  { icon: BarChart3, title: 'Close the loop', text: 'Reply officially and move feedback from planned to done.' },
]

export function HomePage() {
  const [companies, setCompanies] = useState<Company[] | null>(null)

  useEffect(() => {
    supabase
      .from('companies')
      .select('*')
      .order('created_at')
      .then(({ data }) => setCompanies((data as Company[]) ?? []))
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="flex flex-col items-center gap-6 py-20 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">Listen to your customers. Build what they need.</h1>
        <p className="text-muted-foreground max-w-xl text-lg">
          Cliente gives your company a feedback page. Customers share ideas and complaints, vote on what matters most, and see your answers.
        </p>
        <div className="flex gap-3">
          <Button size="lg" asChild>
            <Link to="/dashboard">
              Create your company page <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 pb-16 sm:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title} className="gap-3">
            <CardHeader>
              <f.icon className="mb-2 size-5" />
              <CardTitle>{f.title}</CardTitle>
              <CardDescription>{f.text}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="pb-24">
        <h2 className="mb-4 text-xl font-semibold">Companies listening on Cliente</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {companies === null
            ? [0, 1].map((i) => <Skeleton key={i} className="h-28" />)
            : companies.map((c) => (
                <Link key={c.id} to={`/c/${c.slug}`} className="group">
                  <Card className="group-hover:border-primary/40 h-full gap-2 transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {c.name}
                        <ArrowRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5" />
                      </CardTitle>
                      <CardDescription>{c.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
        </div>
      </section>
    </div>
  )
}
