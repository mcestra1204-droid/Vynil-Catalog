import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { ArrowLeft, Loader2 } from 'lucide-react'
import LibraryGallery from './LibraryGallery'

export default function FriendLibrary({ userId, username, onBack }) {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchFriendAlbums() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('collection')
          .select('*')
          .eq('user_id', userId)
          .order('added_at', { ascending: false })

        if (error) throw error

        // Normalizziamo per compatibilità con LibraryGallery
        const normalized = data.map(item => ({
          id: item.id,
          discogsId: item.discogs_id,
          barcode: item.barcode,
          title: item.title,
          artist: item.artist,
          year: item.year,
          format: item.format,
          genre: item.genre,
          coverUrl: item.cover_url,
          addedAt: item.added_at
        }))

        setAlbums(normalized)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchFriendAlbums()
  }, [userId])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-zinc-900 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">Collezione di @{username}</h2>
          <p className="text-sm text-slate-500">Esplora i vinili di questo collezionista</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg bg-red-500/10 p-4 text-center text-red-400 border border-red-500/20">
          {error}
        </div>
      ) : (
        <LibraryGallery
          albums={albums}
          loading={loading}
          onDelete={null} // Non possiamo eliminare i dischi degli amici!
        />
      )}
    </div>
  )
}
