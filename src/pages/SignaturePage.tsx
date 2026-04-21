import { useEffect, useRef, useState } from 'react'
import SignaturePad from 'signature_pad'
import { getDB } from '../db'
import TestResult from '../components/TestResult'

interface Sig {
  id?: number
  dataUrl: string
  createdAt: number
}

export default function SignaturePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const padRef = useRef<SignaturePad | null>(null)
  const [signatures, setSignatures] = useState<Sig[]>([])
  const canvasOk = !!document.createElement('canvas').getContext
  const touchOk = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    resize(canvas)
    padRef.current = new SignaturePad(canvas, {
      backgroundColor: '#fff',
      penColor: '#1a3a5c',
    })
    loadSigs()

    const onResize = () => {
      if (!canvasRef.current) return
      const data = padRef.current?.toData()
      resize(canvasRef.current)
      if (data) padRef.current?.fromData(data)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const resize = (c: HTMLCanvasElement) => {
    const ratio = Math.max(window.devicePixelRatio || 1, 1)
    const rect = c.getBoundingClientRect()
    c.width = rect.width * ratio
    c.height = rect.height * ratio
    c.getContext('2d')?.scale(ratio, ratio)
  }

  const loadSigs = async () => {
    const db = await getDB()
    const all = await db.getAll('signatures')
    setSignatures(all.reverse().slice(0, 3))
  }

  const clear = () => padRef.current?.clear()

  const save = async () => {
    if (!padRef.current || padRef.current.isEmpty()) return
    const dataUrl = padRef.current.toDataURL('image/png')
    const db = await getDB()
    await db.add('signatures', { dataUrl, createdAt: Date.now() })
    padRef.current.clear()
    loadSigs()
  }

  return (
    <div className="page">
      <h2>✍️ Dessiner / Annoter</h2>
      <p className="page-desc">
        Dessinez ou annotez vos cartes favorites sur l'écran tactile.
      </p>

      <div className="test-section">
        <h3>Résultats</h3>
        <TestResult
          status={canvasOk ? 'supported' : 'unsupported'}
          label={canvasOk ? 'Canvas 2D supporté' : 'Canvas non supporté'}
        />
        <TestResult
          status={touchOk ? 'supported' : 'partial'}
          label={
            touchOk
              ? 'Écran tactile détecté'
              : 'Pas de tactile — utilisez la souris'
          }
        />
      </div>

      <div className="signature-area">
        <canvas ref={canvasRef} className="signature-canvas" />
        <div className="btn-group" style={{ marginTop: '0.5rem' }}>
          <button className="btn-secondary" onClick={clear}>
            Effacer
          </button>
          <button className="btn-primary" onClick={save}>
            💾 Enregistrer
          </button>
        </div>
      </div>

      {signatures.length > 0 && (
        <div className="list-section">
          <h3>Dessins sauvegardés</h3>
          {signatures.map((sig) => (
            <div key={sig.id} className="signature-saved">
              <img src={sig.dataUrl} alt="Signature" className="signature-preview" />
              <small>{new Date(sig.createdAt).toLocaleString('fr-FR')}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
