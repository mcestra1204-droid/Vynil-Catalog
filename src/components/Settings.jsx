import { useState } from 'react'
import { supabase } from '../services/supabase'
import { User, Mail, Lock, Save, Loader2, Download, Upload } from 'lucide-react'
import { getAllAlbums, addAlbum } from '../services/db'

export default function Settings({ profile, onProfileUpdate }) {
  const [username, setUsername] = useState(profile?.username || '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  async function handleUpdateProfile() {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: username.trim().toLowerCase(),
          updated_at: new Date()
        })
        .eq('id', profile.id)

      if (error) throw error

      if (onProfileUpdate) onProfileUpdate()
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateEmail() {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error } = await supabase.auth.updateUser({ email: email.trim() })
      if (error) throw error
      setSuccess(true)
      alert('Richiesta di cambio email inviata. Controlla la tua inbox per confermare!')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdatePassword() {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error } = await supabase.auth.updateUser({ password: password })
      if (error) throw error
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleExportLibrary() {
    setLoading(true)
    setError(null)
    try {
      const albums = await getAllAlbums()
      const dataStr = JSON.stringify(albums, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `vinyl-catalog-backup-${profile.username}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setSuccess(true)
    } catch (err) {
      setError('Errore durante l\'esportazione: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleImportLibrary(event) {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const text = await file.text()
      const albums = JSON.parse(text)

      if (!Array.isArray(albums)) throw new Error('Il file selezionato non è un backup valido.')

      let importedCount = 0
      for (const album of albums) {
        // addAlbum gestisce già i duplicati internamente
        const result = await addAlbum(album)
        if (result) importedCount++
      }

      setSuccess(`Importazione completata! Aggiunti ${importedCount} dischi.`)
    } catch (err) {
      setError('Errore durante l\'importazione: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Impostazioni Account</h2>

      {/* Sezione Profilo */}
      <section className="space-y-4 rounded-2xl bg-zinc-900 p-6 border border-slate-800">
        <div className="flex items-center gap-2 text-emerald-400 mb-4">
          <User size={20} />
          <h3 className="font-semibold">Informazioni Pubbliche</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400">Nome Utente</label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 rounded-lg bg-zinc-800 p-3 text-white ring-emerald-500 focus:ring-2 focus:outline-none border border-slate-700"
                placeholder="es. mattia_vinili"
              />
              <button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="rounded-lg bg-emerald-500 p-3 text-black hover:bg-emerald-400 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sezione Account */}
      <section className="space-y-4 rounded-2xl bg-zinc-900 p-6 border border-slate-800">
        <div className="flex items-center gap-2 text-emerald-400 mb-4">
          <Lock size={20} />
          <h3 className="font-semibold">Sicurezza e Account</h3>
        </div>
        <div className="space-y-6">
          {/* Cambio Email */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-400">Cambia Email</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg bg-zinc-800 py-3 pl-10 pr-4 text-white ring-emerald-500 focus:ring-2 focus:outline-none border border-slate-700"
                  placeholder="nuovaemail@esempio.com"
                />
              </div>
              <button
                onClick={handleUpdateEmail}
                disabled={loading}
                className="rounded-lg bg-zinc-800 px-4 py-3 text-emerald-400 hover:bg-zinc-700 transition-colors disabled:opacity-50 border border-slate-700"
              >
                Aggiorna
              </button>
            </div>
          </div>

          {/* Cambio Password */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-400">Cambia Password</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg bg-zinc-800 py-3 pl-10 pr-4 text-white ring-emerald-500 focus:ring-2 focus:outline-none border border-slate-700"
                  placeholder="Nuova password"
                />
              </div>
              <button
                onClick={handleUpdatePassword}
                disabled={loading}
                className="rounded-lg bg-zinc-800 px-4 py-3 text-emerald-400 hover:bg-zinc-700 transition-colors disabled:opacity-50 border border-slate-700"
              >
                Aggiorna
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sezione Dati */}
      <section className="space-y-4 rounded-2xl bg-zinc-900 p-6 border border-slate-800">
        <div className="flex items-center gap-2 text-emerald-400 mb-4">
          <Download size={20} />
          <h3 className="font-semibold">Gestione Dati</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleExportLibrary}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-zinc-800 p-4 text-slate-100 hover:bg-zinc-700 transition-colors border border-slate-700 disabled:opacity-50"
          >
            <Download size={20} />
            Esporta Libreria
          </button>
          <label className="flex items-center justify-center gap-2 rounded-xl bg-zinc-800 p-4 text-slate-100 hover:bg-zinc-700 transition-colors border border-slate-700 cursor-pointer disabled:opacity-50">
            <Upload size={20} />
            Importa Libreria
            <input
              type="file"
              accept=".json"
              onChange={handleImportLibrary}
              className="hidden"
            />
          </label>
        </div>
      </section>

      {(error || success) && (
        <div className={`rounded-lg p-4 text-center text-sm font-medium border ${
          success
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {success ? success : error}
        </div>
      )}
    </div>
  )
}
