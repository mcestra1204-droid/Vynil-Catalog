import { useCallback, useEffect, useState } from 'react'
import { addAlbum, albumExists, deleteAlbum, getAllAlbums } from '../services/db'

export function useLibrary() {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const data = await getAllAlbums()
    setAlbums(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const saveAlbum = useCallback(async (album) => {
    const existing = await albumExists({
      discogsId: album.discogsId,
      barcode: album.barcode
    })
    if (existing) {
      return { saved: false, reason: 'duplicate', album: existing }
    }
    const saved = await addAlbum(album)
    setAlbums((prev) => [saved, ...prev])
    return { saved: true, album: saved }
  }, [])

  const removeAlbum = useCallback(async (id) => {
    await deleteAlbum(id)
    setAlbums((prev) => prev.filter((a) => a.id !== id))
  }, [])

  return { albums, loading, saveAlbum, removeAlbum, refresh }
}
