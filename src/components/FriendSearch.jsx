import { useState } from 'react'
import { supabase } from '../services/supabase'
import { Search, UserPlus, Loader2, User } from 'lucide-react'

export default function FriendSearch({ onFriendAdded }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSearch() {
    if (!query.trim()) return
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utente non autenticato')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${query.trim().toLowerCase()}%`)
        .neq('id', user.id) // Non cercare se stessi

      if (error) throw error
      setResults(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function sendRequest(targetUserId) {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: targetUserId,
          status: 'pending'
        })

      if (error) throw error

      if (onFriendAdded) onFriendAdded()
      // Rimuovi l'utente dai risultati della ricerca per feedback visivo
      setResults(prev => prev.filter(p => p.id !== targetUserId))
      alert('Richiesta di amicizia inviata!')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full rounded-xl bg-zinc-900 py-3 pl-10 pr-4 text-white ring-emerald-500 focus:ring-2 focus:outline-none border border-slate-800"
              placeholder="Cerca un utente (es. @mattia_vinili)..."
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="rounded-xl bg-emerald-500 px-4 py-3 font-bold text-black transition-colors hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Cerca'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
          {error}
        </div>
      )}

      <div className="grid gap-3">
        {results.map((profile) => (
          <div key={profile.id} className="flex items-center justify-between rounded-xl bg-zinc-900 p-4 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <User size={20} />
              </div>
              <span className="font-medium text-slate-100">@{profile.username}</span>
            </div>
            <button
              onClick={() => sendRequest(profile.id)}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-zinc-700 transition-colors"
            >
              <UserPlus size={14} />
              Aggiungi
            </button>
          </div>
        ))}
        {!loading && results.length === 0 && query && (
          <p className="text-center py-10 text-slate-500 text-sm">
            Nessun utente trovato con questo nome.
          </p>
        )}
      </div>
    </div>
  )
}
