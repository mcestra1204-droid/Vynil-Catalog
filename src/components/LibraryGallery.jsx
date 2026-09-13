import { useMemo, useState } from 'react'
import { Filter } from 'lucide-react'
import AlbumCard from './AlbumCard'

const FORMAT_FILTERS = ['Tutti', 'Vinyl', 'CD']

export default function LibraryGallery({ albums, loading, onDelete }) {
  const [query, setQuery] = useState('')
  const [formatFilter, setFormatFilter] = useState('Tutti')

  const filtered = useMemo(() => {
    return albums.filter((a) => {
      const matchesFormat =
        formatFilter === 'Tutti' ||
        a.format?.toLowerCase().includes(formatFilter.toLowerCase())
      const haystack = `${a.title} ${a.artist}`.toLowerCase()
      const matchesQuery = haystack.includes(query.toLowerCase())
      return matchesFormat && matchesQuery
    })
  }, [albums, query, formatFilter])

  if (loading) {
    return <p className="p-4 text-center text-slate-500">Caricamento libreria…</p>
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filtra per artista o titolo…"
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none sm:w-64"
        />
        <div className="flex items-center gap-1 text-slate-400">
          <Filter size={14} />
          {FORMAT_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFormatFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                formatFilter === f
                  ? 'bg-emerald-500 text-black'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-slate-500">
          {albums.length === 0
            ? 'La tua libreria è vuota. Scansiona o cerca il tuo primo disco!'
            : 'Nessun disco corrisponde al filtro.'}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((album) => (
            <AlbumCard key={album.id} album={album} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
