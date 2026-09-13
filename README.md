# Vinyl & CD Catalog — PWA

Catalogo personale di CD e vinili con scanner di codici a barre, ricerca
manuale via Discogs, e libreria offline in IndexedDB.

## Setup

```bash
npm install
npm run dev
```

Apri `http://localhost:5173` (per testare la fotocamera da smartphone in
LAN serve HTTPS: vedi sezione "Testare su iOS/Android" più sotto).

## Build di produzione

```bash
npm run build
npm run preview
```

## Personal Access Token Discogs

1. Vai su https://www.discogs.com/settings/developers (serve un account
   Discogs gratuito).
2. Clicca "Generate new token".
3. Copia il token e incollalo nella schermata iniziale dell'app (viene
   salvato in `localStorage`, resta solo sul tuo dispositivo).

## Testare lo scanner su iOS/Android

I browser richiedono un contesto sicuro (HTTPS o `localhost`) per dare
accesso alla fotocamera. Opzioni:

- **Deploy rapido**: pubblica su Vercel/Netlify (gratuito) e apri l'URL
  https:// dal telefono.
- **Test in LAN**: usa `npx vite --host --https` con un certificato locale
  (es. tramite `mkcert`), oppure un tunnel come `ngrok http 5173`.

## Installare come app

- **Android/Desktop (Chrome/Edge)**: apri il sito, poi menu → "Installa app".
- **iOS (Safari)**: apri il sito, tocca l'icona Condividi → "Aggiungi a
  Home".

## Struttura del progetto

```
src/
  components/   Scanner, SearchBar, SearchResults, LibraryGallery, AlbumCard, TokenSetup
  services/     discogsApi.js (ApiFetcher), db.js (storage IndexedDB)
  hooks/        useLibrary.js
```

Per passare in futuro a un backend cloud, basta riscrivere le funzioni in
`src/services/db.js` (vedi i commenti nel file per un esempio con
Supabase) mantenendo invariata la loro firma.
