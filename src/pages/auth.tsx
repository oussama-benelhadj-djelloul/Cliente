import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { MailCheck } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') ?? '/'
  const [loading, setLoading] = useState(false)
  const [checkEmail, setCheckEmail] = useState(false)

  if (user) return <Navigate to={next} replace />

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email'))
    const password = String(form.get('password'))
    setLoading(true)
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (error) return toast.error('Could not sign in', { description: error.message })
      toast.dismiss()
      navigate(next, { replace: true })
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}${next}` },
      })
      setLoading(false)
      if (error) return toast.error('Could not create your account', { description: error.message })
      toast.dismiss()
      if (!data.session) setCheckEmail(true)
      else navigate(next, { replace: true })
    }
  }

  if (checkEmail) {
    return (
      <div className="mx-auto max-w-sm px-4 py-24">
        <Card className="text-center">
          <CardHeader className="justify-items-center">
            <MailCheck className="mb-2 size-8" />
            <CardTitle>Check your email</CardTitle>
            <CardDescription>We sent you a link to confirm your account. Click it, then come back to sign in.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const isLogin = mode === 'login'
  const otherLink = `${isLogin ? '/signup' : '/login'}${params.toString() ? `?${params}` : ''}`

  return (
    <div className="mx-auto max-w-sm px-4 py-24">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{isLogin ? 'Welcome back' : 'Create your account'}</CardTitle>
          <CardDescription>
            {isLogin ? 'Sign in to share feedback and vote.' : 'One account to give feedback — or to run your company page.'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={submit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                minLength={6}
              />
            </div>
          </CardContent>
          <CardFooter className="mt-6 flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
            </Button>
            <p className="text-muted-foreground text-sm">
              {isLogin ? 'New here?' : 'Already have an account?'}{' '}
              <Link to={otherLink} className="text-foreground underline underline-offset-4">
                {isLogin ? 'Create an account' : 'Sign in'}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
