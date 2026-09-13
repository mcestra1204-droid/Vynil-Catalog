import { Disc3 } from 'lucide-react'

/**
 * SearchResults — mostra i risultati di /database/search (sia da barcode
 * che da ricerca manuale) come lista cliccabile. Cliccando un risultato
 * lo si salva in libreria.
 */
export default function SearchResults({ results, onSelect }) {
  if (results.length === 0) return null

  return (
    <ul className="mt-3 divide-y divide-slate-800 overflow-hidden rounded-lg border border-slate-800">
      {results.map((r) => (
        <li key={`${r.discogsId}-${r.barcode || 'q'}`}>
          <button
            onClick={() => onSelect(r)}
            className="flex w-full items-center gap-3 bg-slate-900 p-3 text-left transition hover:bg-slate-800 active:bg-slate-700"
          >
            {r.coverUrl ? (
              <img
                src={r.coverUrl}
                alt={r.title}
                className="h-14 w-14 flex-shrink-0 rounded object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded bg-slate-800">
                <Disc3 size={22} className="text-slate-500" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-slate-100">{r.title}</p>
              <p className="truncate text-sm text-slate-400">{r.artist}</p>
              <p className="text-xs text-slate-500">
                {r.year} · {r.format}
              </p>
            </div>
          </button>
        </li>
      ))}
    </ul>
  )
}
