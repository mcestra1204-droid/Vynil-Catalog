import { useCallback, useEffect, useState } from 'react'
import { ScanLine, Library, LogOut, Users, Settings as SettingsIcon } from 'lucide-react'
import Scanner from './components/Scanner'
import SearchBar from './components/SearchBar'
import SearchResults from './components/SearchResults'
import LibraryGallery from './components/LibraryGallery'
import Auth from './components/Auth'
import ProfileSetup from './components/ProfileSetup'
import FriendSearch from './components/FriendSearch'
import FriendList from './components/FriendList'
import FriendLibrary from './components/FriendLibrary'
import Settings from './components/Settings'
import { useLibrary } from './hooks/useLibrary'
import { fetchByBarcode, searchByQuery } from './services/discogsApi'
import { supabase } from './services/supabase'

const TABS = { ADD: 'add', LIBRARY: 'library', SOCIAL: 'social', SETTINGS: 'settings' }

export default function App() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [tab, setTab] = useState(TABS.LIBRARY)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [statusMsg, setStatusMsg] = useState(null)

  // Social state
  const [socialView, setSocialView] = useState('main') // 'main' or 'friend-library'
  const [selectedFriend, setSelectedFriend] = useState(null)

  const { albums, loading, saveAlbum, removeAlbum } = useLibrary()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const showStatus = useCallback((msg, type = 'info') => {
    setStatusMsg({ msg, type })
    setTimeout(() => setStatusMsg(null), 3000)
  }, [])

  const handleBarcodeDetected = useCallback(
    async (barcode) => {
      setScannerOpen(false)
      setSearching(true)
      try {
        const found = await fetchByBarcode(barcode)
        if (found.length === 0) {
          showStatus('Nessun disco trovato per questo codice a barre.', 'error')
        } else if (found.length === 1) {
          await handleSelectResult(found[0])
        } else {
          setResults(found)
        }
      } catch (err) {
        showStatus(err.message || 'Errore durante la ricerca.', 'error')
      } finally {
        setSearching(false)
      }
    },
    [showStatus, handleSelectResult]
  )

  const handleManualSearch = useCallback(async ({ artist, title }) => {
    setSearching(true)
    setResults([])
    try {
      const found = await searchByQuery({ artist, title })
      setResults(found)
      if (found.length === 0) showStatus('Nessun risultato trovato.', 'error')
    } catch (err) {
      showStatus(err.message || 'Errore durante la ricerca.', 'error')
    } finally {
      setSearching(false)
    }
  }, [showStatus])

  async function handleSelectResult(result) {
    const { saved, reason } = await saveAlbum(result)
    if (saved) {
      showStatus(`"${result.title}" aggiunto alla libreria!`, 'success')
      setResults([])
      setTab(TABS.LIBRARY)
    } else if (reason === 'duplicate') {
      showStatus('Questo disco è già in libreria.', 'error')
    }
  }

  if (!user) return <Auth />
  if (!profile) return <ProfileSetup onComplete={() => fetchProfile(user.id)} />

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-slate-100">🎵 Vinyl Catalog</h1>
          {profile && (
            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
              @{profile.username}
            </span>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-red-400 transition-colors"
          title="Esci"
        >
          <LogOut size={20} />
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-4">
        {tab === TABS.ADD && (
          <section>
            <button
              onClick={() => setScannerOpen(true)}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-semibold text-black active:scale-[0.99]"
            >
              <ScanLine size={20} />
              Scansiona codice a barre
            </button>

            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <div className="h-px flex-1 bg-slate-800" />
              oppure cerca manualmente
              <div className="h-px flex-1 bg-slate-800" />
            </div>

            <SearchBar onSearch={handleManualSearch} loading={searching} />
            <SearchResults results={results} onSelect={handleSelectResult} />
          </section>
        )}

        {tab === TABS.LIBRARY && (
          <LibraryGallery albums={albums} loading={loading} onDelete={removeAlbum} />
        )}

        {tab === TABS.SOCIAL && (
          <section className="space-y-8">
            {socialView === 'main' ? (
              <>
                <FriendSearch onFriendAdded={() => {}} />
                <FriendList
                  onRefresh={(friend) => {
                    setSelectedFriend(friend)
                    setSocialView('friend-library')
                  }}
                />
              </>
            ) : (
              <FriendLibrary
                userId={selectedFriend?.id}
                username={selectedFriend?.username}
                onBack={() => setSocialView('main')}
              />
            )}
          </section>
        )}

        {tab === TABS.SETTINGS && (
          <Settings profile={profile} onProfileUpdate={() => fetchProfile(user.id)} />
        )}
      </main>

      {scannerOpen && (
        <Scanner onDetected={handleBarcodeDetected} onClose={() => setScannerOpen(false)} />
      )}

      {statusMsg && (
        <div
          className={`fixed bottom-20 left-1/2 z-40 -translate-x-1/2 rounded-lg px-4 py-2 text-sm font-medium shadow-lg ${
            statusMsg.type === 'error'
              ? 'bg-red-500 text-white'
              : statusMsg.type === 'success'
                ? 'bg-emerald-500 text-black'
                : 'bg-slate-800 text-slate-100'
          }`}
        >
          {statusMsg.msg}
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-10 flex border-t border-slate-800 bg-slate-950">
        <button
          onClick={() => setTab(TABS.LIBRARY)}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs ${
            tab === TABS.LIBRARY ? 'text-emerald-400' : 'text-slate-500'
          }`}
        >
          <Library size={20} />
          Libreria
        </button>
        <button
          onClick={() => setTab(TABS.ADD)}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs ${
            tab === TABS.ADD ? 'text-emerald-400' : 'text-slate-500'
          }`}
        >
          <ScanLine size={20} />
          Aggiungi
        </button>
        <button
          onClick={() => setTab(TABS.SOCIAL)}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs ${
            tab === TABS.SOCIAL ? 'text-emerald-400' : 'text-slate-500'
          }`}
        >
          <Users size={20} />
          Social
        </button>
        <button
          onClick={() => setTab(TABS.SETTINGS)}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs ${
            tab === TABS.SETTINGS ? 'text-emerald-400' : 'text-slate-500'
          }`}
        >
          <SettingsIcon size={20} />
          Opzioni
        </button>
      </nav>
    </div>
  )
}
