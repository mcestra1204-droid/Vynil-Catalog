import { useState } from 'react'
import { KeyRound, ExternalLink } from 'lucide-react'
import { setDiscogsToken } from '../services/discogsApi'

export default function TokenSetup({ onSaved }) {
  const [value, setValue] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!value.trim()) return
    setDiscogsToken(value)
    onSaved()
  }

  return (
    <div className="mx-auto mt-16 max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 text-center">
      <KeyRound className="mx-auto mb-3 text-emerald-400" size={32} />
      <h2 className="text-lg font-semibold text-slate-100">Configura Discogs</h2>
      <p className="mt-1 text-sm text-slate-400">
        Per cercare i dischi serve un Personal Access Token gratuito di Discogs.
      </p>

      <a
        href="https://www.discogs.com/settings/developers"
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-sm text-emerald-400 hover:underline"
      >
        Genera il tuo token su Discogs <ExternalLink size={14} />
      </a>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Incolla qui il tuo token…"
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black"
        >
          Salva e continua
        </button>
      </form>
    </div>
  )
}
