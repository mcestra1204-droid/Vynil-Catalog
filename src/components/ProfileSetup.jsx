import { useState } from 'react'
import { supabase } from '../services/supabase'
import { User, Check } from 'lucide-react'

export default function ProfileSetup({ onComplete }) {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSave() {
    if (!username.trim()) return

    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utente non autenticato')

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: username.trim().toLowerCase(),
          updated_at: new Date()
        })

      if (error) throw error
      onComplete()
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
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <User size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">Benvenuto!</h1>
          <p className="mt-2 text-zinc-400">
            Scegli un nome utente per la tua collezione. Sarà così che i tuoi amici ti troveranno.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300">Nome Utente</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-lg bg-zinc-800 p-3 text-white ring-emerald-500 focus:ring-2 focus:outline-none"
              placeholder="es. mattia_vinili"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
              {error}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 p-3 font-bold text-black transition-colors hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <><Check size={20} /> Salva Profilo</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Adding Loader2 import since it was used but not imported
import { Loader2 } from 'lucide-react'
