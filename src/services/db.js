/**
 * db.js — Layer di persistenza dati.
 *
 * Ora migrato a Supabase per supportare il cloud e le funzioni social.
 * Le funzioni mantengono la stessa "interfaccia pubblica" per non rompere
 * il resto dell'app (hook useLibrary, componenti).
 */
import { supabase } from './supabase'

export async function getAllAlbums() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('collection')
    .select('*')
    .eq('user_id', user.id)
    .order('added_at', { ascending: false })

  if (error) {
    console.error('Errore recupero collezione:', error)
    throw error
  }

  // Normalizziamo i nomi delle colonne per mantenere compatibilità con l'UI
  // (es. discogs_id -> discogsId)
  return data.map(item => ({
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
}

export async function addAlbum(album) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Utente non autenticato')

  const record = {
    user_id: user.id,
    discogs_id: album.discogsId,
    barcode: album.barcode,
    title: album.title,
    artist: album.artist,
    year: album.year,
    format: album.format,
    genre: album.genre,
    cover_url: album.coverUrl,
    added_at: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('collection')
    .insert(record)
    .select()
    .single()

  if (error) {
    console.error('Errore salvataggio album:', error)
    throw error
  }

  // Ritorna l'oggetto in formato compatibile con l'UI
  return {
    id: data.id,
    discogsId: data.discogs_id,
    barcode: data.barcode,
    title: data.title,
    artist: data.artist,
    year: data.year,
    format: data.format,
    genre: data.genre,
    coverUrl: data.cover_url,
    addedAt: data.added_at
  }
}

export async function deleteAlbum(id) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Utente non autenticato')

  const { error } = await supabase
    .from('collection')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) // Sicurezza extra

  if (error) {
    console.error('Errore eliminazione album:', error)
    throw error
  }
  return true
}

/**
 * Evita doppioni: controlla se un disco con lo stesso discogsId
 * (o, in mancanza, stesso barcode) è già in libreria dell'utente.
 */
export async function albumExists({ discogsId, barcode }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  if (discogsId) {
    const { data } = await supabase
      .from('collection')
      .select('*')
      .eq('user_id', user.id)
      .eq('discogs_id', discogsId)
      .maybeSingle()

    if (data) return data
  }

  if (barcode) {
    const { data } = await supabase
      .from('collection')
      .select('*')
      .eq('user_id', user.id)
      .eq('barcode', barcode)
      .maybeSingle()

    if (data) return data
  }

  return null
}
