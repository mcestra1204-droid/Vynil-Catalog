/**
 * db.js — Layer di persistenza dati.
 *
 * Oggi: IndexedDB (via Dexie) → funziona subito, offline, nessun account.
 * Domani: basta riscrivere le funzioni di questo file (stessa "interfaccia
 * pubblica") per puntare a Firebase / Supabase / un tuo backend REST.
 *
 * Tutto il resto dell'app (hook useLibrary, componenti) parla SOLO con
 * le funzioni esportate qui sotto: addAlbum, getAllAlbums, deleteAlbum,
 * albumExists. Non tocca mai Dexie direttamente. Questo disaccoppiamento
 * è quello che rende semplice il cambio di backend in futuro.
 */

import Dexie from 'dexie'

export const db = new Dexie('VinylCatalogDB')

// v1 dello schema. `id` autoincrementale, indici su barcode/discogsId
// per controlli veloci di duplicati e ricerche.
db.version(1).stores({
  // ++id = chiave primaria autoincrementale
  albums: '++id, discogsId, barcode, artist, title, format, addedAt'
})

/**
 * Struttura di un album salvato:
 * {
 *   id: number (auto),
 *   discogsId: number | null,
 *   barcode: string | null,
 *   title: string,
 *   artist: string,
 *   year: string,
 *   format: string,        // es. "Vinyl, LP, Album" oppure "CD, Album"
 *   genre: string[],
 *   coverUrl: string,
 *   addedAt: number (timestamp)
 * }
 */

export async function getAllAlbums() {
  // Più recenti prima
  return db.albums.orderBy('addedAt').reverse().toArray()
}

export async function addAlbum(album) {
  const record = {
    ...album,
    addedAt: Date.now()
  }
  const id = await db.albums.add(record)
  return { ...record, id }
}

export async function deleteAlbum(id) {
  return db.albums.delete(id)
}

/**
 * Evita doppioni: controlla se un disco con lo stesso discogsId
 * (o, in mancanza, stesso barcode) è già in libreria.
 */
export async function albumExists({ discogsId, barcode }) {
  if (discogsId) {
    const byId = await db.albums.where('discogsId').equals(discogsId).first()
    if (byId) return byId
  }
  if (barcode) {
    const byBarcode = await db.albums.where('barcode').equals(barcode).first()
    if (byBarcode) return byBarcode
  }
  return null
}

/* --------------------------------------------------------------------
 * ESEMPIO di come sarebbe l'adapter Supabase equivalente, da tenere
 * pronto per quando vorrai passare al cloud (NON attivo, solo riferimento):
 *
 * import { createClient } from '@supabase/supabase-js'
 * const supabase = createClient(URL, ANON_KEY)
 *
 * export async function getAllAlbums() {
 *   const { data, error } = await supabase
 *     .from('albums')
 *     .select('*')
 *     .order('addedAt', { ascending: false })
 *   if (error) throw error
 *   return data
 * }
 *
 * export async function addAlbum(album) {
 *   const { data, error } = await supabase
 *     .from('albums')
 *     .insert({ ...album, addedAt: Date.now() })
 *     .select()
 *     .single()
 *   if (error) throw error
 *   return data
 * }
 *
 * La firma delle funzioni resta identica: il resto dell'app non cambia.
 * ------------------------------------------------------------------ */
