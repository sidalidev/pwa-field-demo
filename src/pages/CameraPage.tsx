import { useState, useRef, useEffect } from 'react'
import { getDB } from '../db'
import TestResult from '../components/TestResult'
import { isNativeApp } from '../usePlatform'

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
  const [cameraActive, setCameraActive] = useState(false)
  const native = isNativeApp()
  const mediaOk =
    'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices

  const takeNativePhoto = async () => {
    try {
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera')
      const result = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
      })
      if (result.dataUrl) setPhoto(result.dataUrl)
    } catch (err) {
      alert(`Erreur plugin Camera : ${(err as Error).message}`)
    }
  }

  useEffect(() => {
    loadPhotos()
  }, [])

  // Connecter le stream à la vidéo quand les deux sont prêts
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(() => {})
    }
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [stream])

  const loadPhotos = async () => {
    const db = await getDB()
    const all = await db.getAll('photos')
    setSaved(all.reverse().slice(0, 6))
  }

  const startCamera = async () => {
    setCameraActive(true)
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      setStream(s)
    } catch (err) {
      setCameraActive(false)
      alert(`Erreur caméra : ${err}`)
    }
  }

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const v = videoRef.current
    const c = canvasRef.current
    c.width = v.videoWidth || 640
    c.height = v.videoHeight || 480
    c.getContext('2d')?.drawImage(v, 0, 0)
    const dataUrl = c.toDataURL('image/jpeg', 0.8)
    setPhoto(dataUrl)
    stream?.getTracks().forEach((t) => t.stop())
    setStream(null)
    setCameraActive(false)
  }

  const savePhoto = async () => {
    if (!photo) return
    const db = await getDB()
    await db.add('photos', { dataUrl: photo, createdAt: Date.now() })
    setPhoto(null)
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
      <h2>📷 Prendre une photo</h2>
      <p className="page-desc">
        Prenez une photo pour l'ajouter à votre collection.
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
      {!cameraActive && !photo && (
        <button className="btn-primary" onClick={startCamera} disabled={!mediaOk}>
          📷 Ouvrir la caméra
        </button>
      )}

      {/* Vidéo toujours dans le DOM pour que le ref soit dispo */}
      <div className="camera-preview" style={{ display: cameraActive ? 'block' : 'none' }}>
        <video ref={videoRef} autoPlay playsInline muted className="video-preview" />
        <button
          className="btn-primary"
          onClick={takePhoto}
          style={{ marginTop: '0.5rem' }}
        >
          📸 Prendre la photo
        </button>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <h3>Méthode 2 : Input file capture</h3>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="file-input"
      />

      {native && (
        <>
          <h3>Méthode 3 : Plugin Capacitor (natif)</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>
            Ouvre l'app Camera système (Android/iOS). Permission native demandée
            au premier appel. UI native, qualité optimale, accès EXIF.
          </p>
          <button className="btn-primary" onClick={takeNativePhoto}>
            📸 Capacitor Camera
          </button>
        </>
      )}

      {photo && (
        <div className="photo-result">
          <h3>Photo capturée</h3>
          <img src={photo} alt="Capture" className="photo-preview" />
          <button className="btn-primary" onClick={savePhoto}>
            💾 Sauvegarder dans IndexedDB
          </button>
        </div>
      )}

      {saved.length > 0 && (
        <div className="list-section">
          <h3>Photos sauvegardées ({saved.length})</h3>
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
