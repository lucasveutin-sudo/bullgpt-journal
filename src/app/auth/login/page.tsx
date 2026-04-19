'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button, Field, Input } from '@/components/ui'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-black font-bold text-lg shadow-glow-brand mb-5">
            B
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100 mb-1">
            Connexion
          </h1>
          <p className="text-sm text-zinc-500">Accède à ton journal de trading.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <Field label="Email">
            <Input
              type="email"
              placeholder="toi@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </Field>
          <Field label="Mot de passe">
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </Field>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            icon={loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
            fullWidth
            size="lg"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>

        <p className="text-zinc-500 text-sm mt-8 text-center">
          Pas de compte ?{' '}
          <Link
            href="/auth/signup"
            className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            Inscris-toi
          </Link>
        </p>
      </div>
    </div>
  )
}
