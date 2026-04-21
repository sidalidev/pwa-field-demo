import { useState, useEffect } from 'react'
import TestResult from '../components/TestResult'

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [installed, setInstalled] = useState(false)
  const [standalone] = useState(
    window.matchMedia('(display-mode: standalone)').matches,
  )

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prompt = deferredPrompt as any
    prompt.prompt()
    const result = await prompt.userChoice
    if (result.outcome === 'accepted') setInstalled(true)
    setDeferredPrompt(null)
  }

  return (
    <div className="page">
      <h2>📲 Installer Yu-Gi-Oh! Collection</h2>
      <p className="page-desc">
        Installez l'app sur votre écran d'accueil pour gérer votre collection
        comme une vraie application, même hors ligne.
      </p>

      <div className="test-section">
        <h3>Résultats</h3>
        <TestResult
          status={standalone ? 'supported' : 'pending'}
          label={
            standalone
              ? 'Mode standalone actif — pas de barre Chrome'
              : "Ouvrir depuis l'écran d'accueil pour le mode standalone"
          }
        />
        <TestResult
          status={
            installed ? 'supported' : deferredPrompt ? 'supported' : 'pending'
          }
          label={
            installed
              ? 'App installée avec succès'
              : deferredPrompt
                ? "Installation disponible — cliquez le bouton ci-dessous"
                : "En attente du prompt d'installation..."
          }
        />
      </div>

      {deferredPrompt && (
        <button className="btn-primary" onClick={handleInstall}>
          📲 Installer Yu-Gi-Oh! Collection
        </button>
      )}

      {installed && (
        <div className="info-box success">
          ✅ Yu-Gi-Oh! Collection installée ! Fermez cette fenêtre et ouvrez
          l'app depuis l'écran d'accueil.
        </div>
      )}

      {!deferredPrompt && !installed && !standalone && (
        <div className="info-box">
          💡 Sur Chrome Android, le prompt d'installation apparaît après
          quelques secondes. Vous pouvez aussi utiliser le menu Chrome ⋮ →
          « Installer l'application » pour ajouter Yu-Gi-Oh! Collection.
        </div>
      )}

      {standalone && (
        <div className="info-box success">
          🎉 L'app tourne en mode standalone — pas de barre d'adresse Chrome !
        </div>
      )}
    </div>
  )
}
