import { useState, useRef, useEffect } from 'react'
import { getDB } from '../db'
import TestResult from '../components/TestResult'

interface Photo {
  id?: number
  dataUrl: string
  createdAt: number
}

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [saved, setSaved] = useState<Photo[]>([])
  const mediaOk =
    'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices

  useEffect(() => {
    loadPhotos()
    return () => {
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [stream])

  const loadPhotos = async () => {
    const db = await getDB()
    const all = await db.getAll('photos')
    setSaved(all.reverse().slice(0, 6))
  }

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      setStream(s)
      if (videoRef.current) videoRef.current.srcObject = s
    } catch (err) {
      alert(`Erreur caméra : ${err}`)
    }
  }

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const v = videoRef.current
    const c = canvasRef.current
    c.width = v.videoWidth
    c.height = v.videoHeight
    c.getContext('2d')?.drawImage(v, 0, 0)
    setPhoto(c.toDataURL('image/jpeg', 0.8))
    stream?.getTracks().forEach((t) => t.stop())
    setStream(null)
  }

  const savePhoto = async () => {
    if (!photo) return
    const db = await getDB()
    await db.add('photos', { dataUrl: photo, createdAt: Date.now() })
    loadPhotos()
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="page">
      <h2>📷 Photographier une carte</h2>
      <p className="page-desc">
        Prenez en photo vos cartes Yu-Gi-Oh! pour les ajouter à votre collection visuelle.
      </p>

      <div className="test-section">
        <h3>Résultats</h3>
        <TestResult
          status={mediaOk ? 'supported' : 'unsupported'}
          label={
            mediaOk
              ? 'navigator.mediaDevices.getUserMedia supporté'
              : 'getUserMedia non supporté'
          }
        />
        <TestResult
          status="supported"
          label='<input capture="environment"> disponible'
        />
      </div>

      <h3>Méthode 1 : Flux caméra (getUserMedia)</h3>
      {!stream && !photo && (
        <button className="btn-primary" onClick={startCamera} disabled={!mediaOk}>
          📷 Ouvrir la caméra
        </button>
      )}

      {stream && (
        <div className="camera-preview">
          <video ref={videoRef} autoPlay playsInline className="video-preview" />
          <button
            className="btn-primary"
            onClick={takePhoto}
            style={{ marginTop: '0.5rem' }}
          >
            📸 Capturer la carte
          </button>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <h3>Méthode 2 : Input file capture</h3>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="file-input"
      />

      {photo && (
        <div className="photo-result">
          <h3>Carte photographiée</h3>
          <img src={photo} alt="Capture" className="photo-preview" />
          <button className="btn-primary" onClick={savePhoto}>
            💾 Sauvegarder dans IndexedDB
          </button>
        </div>
      )}

      {saved.length > 0 && (
        <div className="list-section">
          <h3>Photos de cartes ({saved.length})</h3>
          <div className="photo-grid">
            {saved.map((p) => (
              <img
                key={p.id}
                src={p.dataUrl}
                alt="Sauvegardée"
                className="photo-thumb"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
