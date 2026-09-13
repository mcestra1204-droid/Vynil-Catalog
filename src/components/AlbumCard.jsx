import { useState } from 'react'
import { Trash2, Disc3 } from 'lucide-react'

export default function AlbumCard({ album, onDelete }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="group relative overflow-hidden rounded-xl bg-slate-900 shadow-sm ring-1 ring-slate-800">
      <div className="aspect-square w-full bg-slate-800">
        {album.coverUrl ? (
          <img
            src={album.coverUrl}
            alt={album.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Disc3 size={36} className="text-slate-600" />
          </div>
        )}
      </div>

      <div className="p-2">
        <p className="truncate text-sm font-medium text-slate-100">{album.title}</p>
        <p className="truncate text-xs text-slate-400">{album.artist}</p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          {album.year} · {album.format}
        </p>
      </div>

      {confirming ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 p-3 text-center">
          <p className="text-xs text-slate-200">Eliminare dalla libreria?</p>
          <div className="flex gap-2">
            <button
              onClick={() => onDelete(album.id)}
              className="rounded bg-red-500 px-3 py-1 text-xs font-semibold text-white"
            >
              Elimina
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded bg-slate-700 px-3 py-1 text-xs text-white"
            >
              Annulla
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1.5 opacity-0 transition group-hover:opacity-100 group-active:opacity-100"
          aria-label="Elimina disco"
        >
          <Trash2 size={14} className="text-white" />
        </button>
      )}
    </div>
  )
}
