/**
 * discogsApi.js — "ApiFetcher"
 *
 * Unico punto di contatto con l'API pubblica di Discogs.
 * Espone due funzioni principali usate sia dallo Scanner che dalla SearchBar:
 *
 *   - fetchByBarcode(barcode)   → usata dopo una scansione riuscita
 *   - searchByQuery({artist, title}) → usata dalla ricerca manuale
 *
 * Entrambe restituiscono un array di oggetti "normalizzati" con la stessa
 * forma, così i componenti UI (SearchResults, LibraryGallery...) non devono
 * sapere nulla della struttura grezza delle risposte Discogs.
 *
 * NOTA SICUREZZA: il Personal Access Token viene salvato in localStorage e
 * usato in chiaro nella query string, perché Discogs richiede l'auth anche
 * per le sole ricerche e la sua API non prevede un flusso "solo client"
 * più sicuro. Per un uso personale (app installata solo sul tuo device) è
 * accettabile; se in futuro pubblichi l'app per altri utenti, sposta
 * queste chiamate dietro una piccola funzione serverless (es. Vercel/
 * Netlify Function o una Cloud Function Firebase) che tiene il token lato
 * server e fa da proxy.
 */

const DISCOGS_BASE_URL = 'https://api.discogs.com'
const TOKEN_STORAGE_KEY = 'discogs_personal_access_token'

export function getDiscogsToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || import.meta.env.VITE_DISCOGS_TOKEN || null
}

export function setDiscogsToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token.trim())
}

export function hasDiscogsToken() {
  return Boolean(getDiscogsToken())
}

class DiscogsApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'DiscogsApiError'
    this.status = status
  }
}

async function discogsRequest(path, params = {}) {
  const token = getDiscogsToken()
  if (!token) {
    throw new DiscogsApiError('Nessun Personal Access Token Discogs configurato.', 401)
  }

  const url = new URL(`${DISCOGS_BASE_URL}${path}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  })
  url.searchParams.set('token', token)

  const response = await fetch(url.toString(), {
    headers: {
      // Molti browser ignorano/bloccano un header User-Agent custom in
      // fetch(); lo impostiamo comunque per rispettare le linee guida
      // Discogs, senza che questo blocchi la richiesta se viene filtrato.
      'User-Agent': 'VinylCatalogApp/1.0'
    }
  })

  if (response.status === 401 || response.status === 403) {
    throw new DiscogsApiError('Token Discogs non valido o scaduto.', response.status)
  }
  if (response.status === 429) {
    throw new DiscogsApiError('Troppe richieste a Discogs, riprova tra qualche secondo.', 429)
  }
  if (!response.ok) {
    throw new DiscogsApiError(`Errore Discogs (${response.status}).`, response.status)
  }

  return response.json()
}

/**
 * Normalizza un "result" grezzo dell'endpoint /database/search nella
 * forma comune usata da tutta l'app.
 */
function normalizeSearchResult(raw) {
  return {
    discogsId: raw.id,
    title: raw.title?.split(' - ')[1] || raw.title,
    artist: raw.title?.split(' - ')[0] || raw.artist || 'Sconosciuto',
    year: raw.year || '—',
    format: Array.isArray(raw.format) ? raw.format.join(', ') : raw.format || '—',
    genre: raw.genre || [],
    coverUrl: raw.cover_image || raw.thumb || '',
    barcode: null
  }
}

/**
 * Ricerca per codice a barre (EAN/UPC). Discogs indicizza il barcode
 * dentro il campo "barcode" dei filtri di ricerca release.
 */
export async function fetchByBarcode(barcode) {
  const data = await discogsRequest('/database/search', {
    barcode,
    type: 'release',
    per_page: 5
  })

  const results = (data.results || []).map((r) => ({
    ...normalizeSearchResult(r),
    barcode
  }))

  return results
}

/**
 * Ricerca manuale per artista / titolo album (uno dei due, o entrambi).
 */
export async function searchByQuery({ artist = '', title = '' }) {
  const params = { type: 'release', per_page: 20 }

  if (artist && title) {
    params.artist = artist
    params.release_title = title
  } else if (artist) {
    params.artist = artist
  } else if (title) {
    params.release_title = title
  } else {
    return []
  }

  const data = await discogsRequest('/database/search', params)
  return (data.results || []).map(normalizeSearchResult)
}

export { DiscogsApiError }
