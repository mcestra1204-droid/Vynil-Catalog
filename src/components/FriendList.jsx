import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { User, Check, X, Loader2 } from 'lucide-react'

export default function FriendList({ onRefresh }) {
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchFriends() {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Recupera amici accettati (sia che io abbia invitato, sia che mi abbiano invitato)
      const { data: friendsData, error: friendsError } = await supabase
        .from('friendships')
        .select('friend_id, user_id')
        .or(`and(user_id.eq.${user.id},status.eq.accepted),and(friend_id.eq.${user.id},status.eq.accepted)`)

      if (friendsError) throw friendsError

      // Per ogni amicizia, recuperiamo il profilo dell'altro utente
      const friendsWithProfiles = await Promise.all(
        friendsData.map(async (f) => {
          const otherId = f.user_id === user.id ? f.friend_id : f.user_id
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', otherId)
            .single()
          return profile
        })
      )

      // 2. Recupera richieste in entrata (pending)
      const { data: requestsData, error: requestsError } = await supabase
        .from('friendships')
        .select('user_id')
        .eq('friend_id', user.id)
        .eq('status', 'pending')

      if (requestsError) throw requestsError

      const requestsWithProfiles = await Promise.all(
        requestsData.map(async (r) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', r.user_id)
            .single()
          return profile
        })
      )

      setFriends(friendsWithProfiles.filter(Boolean))
      setRequests(requestsWithProfiles.filter(Boolean))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFriends()
  }, [])

  async function acceptRequest(friendId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('user_id', friendId)
        .eq('friend_id', user.id)

      if (error) throw error
      await fetchFriends()
      if (onRefresh) onRefresh()
    } catch (err) {
      alert(err.message)
    }
  }

  async function declineRequest(friendId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', friendId)
        .eq('friend_id', user.id)

      if (error) throw error
      await fetchFriends()
      if (onRefresh) onRefresh()
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
        <Loader2 className="animate-spin mb-2" size={24} />
        <p>Caricamento amici…</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Richieste in entrata */}
      {requests.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Richieste in sospeso ({requests.length})
          </h3>
          <div className="grid gap-3">
            {requests.map((profile) => (
              <div key={profile.id} className="flex items-center justify-between rounded-xl bg-zinc-900 p-4 border border-emerald-500/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <User size={20} />
                  </div>
                  <span className="font-medium text-slate-100">@{profile.username}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => declineRequest(profile.id)}
                    className="rounded-lg bg-zinc-800 p-2 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <X size={18} />
                  </button>
                  <button
                    onClick={() => acceptRequest(profile.id)}
                    className="rounded-lg bg-emerald-500 p-2 text-black hover:bg-emerald-400 transition-colors"
                  >
                    <Check size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lista Amici */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-400 uppercase tracking-wider">
          I miei amici ({friends.length})
        </h3>
        {friends.length === 0 ? (
          <p className="text-center py-10 text-slate-500 text-sm">
            Non hai ancora amici. Usa la ricerca per trovarne qualcuno!
          </p>
        ) : (
          <div className="grid gap-3">
            {friends.map((profile) => (
              <button
                key={profile.id}
                onClick={() => onRefresh(profile.id)}
                className="flex w-full items-center justify-between rounded-xl bg-zinc-900 p-4 border border-slate-800 hover:border-emerald-500/50 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-slate-400">
                    <User size={20} />
                  </div>
                  <span className="font-medium text-slate-100">@{profile.username}</span>
                </div>
                <span className="text-xs text-slate-500">Vedi collezione $\rightarrow$</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
