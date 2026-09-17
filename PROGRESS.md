# 💿 Vinyl Catalog - Diario di Bordo

> 📝 *Questo documento viene aggiornato automaticamente da Claude ad ogni passaggio del progetto.*

## 📌 Stato Attuale
L'app è passata da una struttura "Local-First" (IndexedDB) a una struttura "Cloud-First" utilizzando **Supabase**. È stata pubblicata su Vercel ed è accessibile via HTTPS.

## ✅ Traguardi Raggiunti
- [x] Setup di Supabase (Auth e Database).
- [x] Creazione tabelle `profiles`, `collection` e `friendships` con RLS (Row Level Security).
- [x] Implementazione schermata di Login/Registrazione (`Auth.jsx`).
- [x] Implementazione del recupero password (Password Reset).
- [x] Implementazione setup del nome utente (`ProfileSetup.jsx`).
- [x] Deploy su Vercel con risoluzione errori di build e 403 Forbidden.
- [x] Rimosso l'obbligo di inserimento manuale del token Discogs (ora gestito via `VITE_DISCOGS_TOKEN` in Vercel).
- [x] Migrazione Dati: Spostata la logica di `src/services/db.js` da IndexedDB $\rightarrow$ Supabase Cloud.
- [x] Implementazione Sistema Social:
    - Ricerca utenti tramite username.
    - Gestione richieste di amicizia (Invio, Accettazione, Rifiuto).
    - Visualizzazione della collezione degli amici.
    - Integrazione Tab Social in App.jsx.
- [x] **Configurazione Finale**: Attivazione di `VITE_DISCOGS_TOKEN` nelle variabili d'ambiente di Vercel.

## 🛠️ Lavori in Corso / Da Fare
*(Tutti i task principali di migrazione e social sono stati completati)*

## 🔑 Note Tecniche
- **Supabase URL**: `https://semybkykisazqrwvewyw.supabase.co`
- **Auth**: Gestita tramite Supabase Auth.
- **Database**: PostgreSQL su Supabase.
- **Deploy**: Vercel (con HTTPS attivo per la fotocamera).
