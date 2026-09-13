# 💿 Vinyl Catalog - Diario di Bordo

## 📌 Stato Attuale
L'app è passata da una struttura "Local-First" (IndexedDB) a una struttura "Cloud-First" utilizzando **Supabase**. È stata pubblicata su Vercel ed è accessibile via HTTPS.

## ✅ Traguardi Raggiunti
- [x] Setup di Supabase (Auth e Database).
- [x] Creazione tabelle `profiles`, `collection` e `friendships` con RLS (Row Level Security).
- [x] Implementazione schermata di Login/Registrazione (`Auth.jsx`).
- [x] Implementazione del recupero password (Password Reset).
- [x] Implementazione setup del nome utente (`ProfileSetup.jsx`).
- [x] Deploy su Vercel con risoluzione errori di build e 403 Forbidden.
- [x] Rimozo l'obbligo di inserimento manuale del token Discogs (ora gestito lato codice/env).
- [x] Migrazione Dati: Spostata la logica di `src/services/db.js` da IndexedDB $\rightarrow$ Supabase Cloud.
- [x] Implementazione Sistema Social:
    - Ricerca utenti tramite username.
    - Gestione richieste di amicizia (Invio, Accettazione, Rifiuto).
    - Visualizzazione della collezione degli amici.
    - Integrazione Tab Social in App.jsx.

## 🛠️ Lavori in Corso / Da Fare
- [ ] **Migrazione Dati**: Spostare la logica di `src/services/db.js` e `src/hooks/useLibrary.js` da IndexedDB $\rightarrow$ Supabase.
- [ ] **Sincronizzazione**: Assicurarsi che l'aggiunta di un disco salvi i dati nel cloud e non solo in locale.
- [ ] **Sistema Social**: 
    - Implementare ricerca utenti per username.
    - Gestire l'invio e l'accettazione di richieste di amicizia.
    - Creare la vista "Libreria dell'Amico".
- [ ] **Configurazione Finale**: Verificare l'attivazione di `VITE_DISCOGS_TOKEN` nelle variabili d'ambiente di Vercel.

## 🔑 Note Tecniche
- **Supabase URL**: `https://semybkykisazqrwvewyw.supabase.co`
- **Auth**: Gestita tramite Supabase Auth.
- **Database**: PostgreSQL su Supabase.
- **Deploy**: Vercel (con HTTPS attivo per la fotocamera).
