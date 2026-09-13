import { useState } from 'react'
import { supabase } from '../services/supabase'
import { LogIn, UserPlus, Loader2 } from 'lucide-react'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState(null)

  async function handleAuth() {
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert("Controlla la tua email per confermare l'account!")
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 text-white">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-zinc-900 p-8 shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-emerald-400">Vinyl Catalog</h1>
          <p className="mt-2 text-zinc-400">
            {isSignUp ? 'Crea il tuo account collezionista' : 'Bentornato nella tua collezione'}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg bg-zinc-800 p-3 text-white ring-emerald-500 focus:ring-2 focus:outline-none"
              placeholder="email@esempio.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg bg-zinc-800 p-3 text-white ring-emerald-500 focus:ring-2 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
              {error}
            </div>
          )}

          <button
            onClick={handleAuth}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 p-3 font-bold text-black transition-colors hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : isSignUp ? (
              <><UserPlus size={20} /> Registrati</>
            ) : (
              <><LogIn size={20} /> Accedi</>
            )}
          </button>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="block w-full text-center text-sm text-zinc-400 hover:text-emerald-400 transition-colors"
          >
            {isSignUp ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
          </button>
        </div>
      </div>
    </div>
  )
}
