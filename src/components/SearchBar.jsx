import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'

/**
 * SearchBar — ricerca manuale per Artista / Titolo album (basta compilarne
 * anche solo uno). Usata come alternativa allo scanner quando il codice a
 * barre non è disponibile o la scansione fallisce.
 *
 * Props:
 *  - onSearch({artist, title}) → eseguita al submit
 *  - loading: bool             → mostra lo spinner nel pulsante
 */
export default function SearchBar({ onSearch, loading }) {
  const [artist, setArtist] = useState('')
  const [title, setTitle] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!artist.trim() && !title.trim()) return
    onSearch({ artist: artist.trim(), title: title.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="text"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        placeholder="Artista (es. Pink Floyd)"
        className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
      />
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titolo album (es. The Wall)"
        className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={loading || (!artist.trim() && !title.trim())}
        className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-40"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
        Cerca
      </button>
    </form>
  )
}
