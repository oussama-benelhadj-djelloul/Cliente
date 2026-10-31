export type Importance = 'nice-to-have' | 'important' | 'critical'
export type FeedbackStatus = 'new' | 'planned' | 'in_progress' | 'done'

export type Company = {
  id: string
  owner_id: string
  name: string
  slug: string
  description: string | null
  website: string | null
  facebook: string | null
  linkedin: string | null
  instagram: string | null
  created_at: string
}

export type Feedback = {
  id: string
  company_id: string
  author_id: string
  title: string
  description: string
  importance: Importance
  status: FeedbackStatus
  is_private: boolean
  response: string | null
  responded_at: string | null
  created_at: string
  votes: { user_id: string }[]
}

export const IMPORTANCE: { value: Importance; label: string }[] = [
  { value: 'nice-to-have', label: 'Nice to have' },
  { value: 'important', label: 'Important' },
  { value: 'critical', label: 'Critical' },
]

export const STATUSES: { value: FeedbackStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
]

export const FEEDBACK_SELECT = '*, votes(user_id)'
