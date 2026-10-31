import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import type { Company } from '@/lib/types'

type Props = { company?: Company; onSaved: (company: Company) => void; submitLabel?: string }

const links = [
  { name: 'website', label: 'Website', placeholder: 'https://your-company.com' },
  { name: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/…' },
  { name: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/…' },
  { name: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/…' },
] as const

export function CompanyForm({ company, onSaved, submitLabel = 'Save' }: Props) {
  const { user } = useAuth()
  const [name, setName] = useState(company?.name ?? '')
  const [slug, setSlug] = useState(company?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(!!company)
  const [saving, setSaving] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const value = (key: string) => String(form.get(key) ?? '').trim() || null
    const payload = {
      name: name.trim(),
      slug,
      description: value('description'),
      website: value('website'),
      facebook: value('facebook'),
      linkedin: value('linkedin'),
      instagram: value('instagram'),
    }
    setSaving(true)
    const query = company
      ? supabase.from('companies').update(payload).eq('id', company.id)
      : supabase.from('companies').insert({ ...payload, owner_id: user!.id })
    const { data, error } = await query.select().single()
    setSaving(false)
    if (error) {
      toast.error('Could not save the company', {
        description: error.code === '23505' ? 'That page address is already taken.' : error.message,
      })
      return
    }
    toast.success('Company saved')
    onSaved(data as Company)
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="name">Company name</Label>
        <Input
          id="name"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (!slugTouched) setSlug(slugify(e.target.value))
          }}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="slug">Public page address</Label>
        <div className="flex items-center rounded-md border shadow-xs focus-within:ring-[3px] focus-within:ring-ring/50">
          <span className="text-muted-foreground pl-3 text-sm">{window.location.host}/c/</span>
          <input
            id="slug"
            required
            pattern="[a-z0-9-]+"
            title="Lowercase letters, numbers and dashes"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true)
              setSlug(slugify(e.target.value))
            }}
            className="h-9 flex-1 bg-transparent pr-3 text-sm outline-none"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={company?.description ?? ''}
          placeholder="Tell your customers what you do in one or two sentences."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((link) => (
          <div key={link.name} className="grid gap-2">
            <Label htmlFor={link.name}>{link.label}</Label>
            <Input id={link.name} name={link.name} type="url" placeholder={link.placeholder} defaultValue={company?.[link.name] ?? ''} />
          </div>
        ))}
      </div>
      <Button type="submit" disabled={saving} className="justify-self-start">
        {saving ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
