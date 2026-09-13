import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library'
import { X, Camera, Loader2 } from 'lucide-react'

/**
 * Scanner — apre la fotocamera del dispositivo e decodifica in continuo
 * i fotogrammi cercando un barcode EAN-13/UPC-A (gli standard usati dai
 * codici a barre stampati su CD e vinili).
 *
 * Usiamo @zxing/library invece della BarcodeDetector nativa perché
 * quest'ultima non è ancora disponibile su Safari/iOS: ZXing funziona
 * in modo identico su iOS, Android e desktop, via getUserMedia + canvas.
 *
 * Props:
 *  - onDetected(barcode: string)  callback quando un codice viene letto
 *  - onClose()                    callback per chiudere l'overlay scanner
 */
export default function Scanner({ onDetected, onClose }) {
  const videoRef = useRef(null)
  const readerRef = useRef(null)
  const [error, setError] = useState(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader()
    readerRef.current = codeReader
    let stopped = false

    async function start() {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices()
        if (devices.length === 0) {
          setError('Nessuna fotocamera trovata su questo dispositivo.')
          setInitializing(false)
          return
        }

        // Preferisci la fotocamera posteriore (back/environment) se disponibile
        const backCamera = devices.find((d) => /back|rear|environment/i.test(d.label))
        const deviceId = (backCamera || devices[devices.length - 1]).deviceId

        setInitializing(false)

        codeReader.decodeFromVideoDevice(deviceId, videoRef.current, (result, err) => {
          if (stopped) return
          if (result) {
            // Vibrazione breve di feedback, se supportata
            if (navigator.vibrate) navigator.vibrate(80)
            onDetected(result.getText())
          }
          // NotFoundException viene lanciata ad ogni frame senza codice:
          // è normale rumore, va ignorata.
          if (err && !(err instanceof NotFoundException)) {
            console.warn('Errore decodifica scanner:', err)
          }
        })
      } catch (err) {
        console.error(err)
        setError(
          err?.name === 'NotAllowedError'
            ? 'Permesso fotocamera negato. Abilitalo nelle impostazioni del browser.'
            : 'Impossibile avviare la fotocamera.'
        )
        setInitializing(false)
      }
    }

    start()

    return () => {
      stopped = true
      codeReader.reset()
    }
  }, [onDetected])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between p-4 text-white">
        <div className="flex items-center gap-2">
          <Camera size={20} />
          <span className="font-medium">Inquadra il codice a barre</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-full bg-white/10 p-2 active:bg-white/20"
          aria-label="Chiudi scanner"
        >
          <X size={22} />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          muted
          playsInline
        />

        {/* Mirino guida, puramente visivo */}
        {!error && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-28 w-64 rounded-xl border-2 border-emerald-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
          </div>
        )}

        {initializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 text-white">
            <Loader2 className="animate-spin" size={28} />
            <p>Avvio fotocamera…</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 p-6 text-center text-white">
            <p>{error}</p>
            <button
              onClick={onClose}
              className="rounded-lg bg-emerald-500 px-4 py-2 font-medium text-black"
            >
              Torna alla ricerca manuale
            </button>
          </div>
        )}
      </div>

      <p className="p-4 text-center text-sm text-white/70">
        Se lo scanner non trova il codice, chiudi e usa la ricerca manuale qui sotto.
      </p>
    </div>
  )
}
