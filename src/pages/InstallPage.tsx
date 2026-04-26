import { useState, useEffect } from 'react'
import TestResult from '../components/TestResult'

type Platform = 'android' | 'ios' | 'desktop'

function detectPlatform(): Platform {
  const ua = navigator.userAgent
  if (/android/i.test(ua)) return 'android'
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
  return 'desktop'
}

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [installed, setInstalled] = useState(false)
  const [standalone] = useState(
    window.matchMedia('(display-mode: standalone)').matches,
  )
  const [platform] = useState<Platform>(detectPlatform())

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
      <h2>📲 Installer PWA Demo</h2>
      <p className="page-desc">
        Le même code React, deux façons de l'installer selon la plateforme.
      </p>

      <div className="test-section">
        <h3>Résultats</h3>
        <TestResult
          status="supported"
          label={`Plateforme détectée : ${platform === 'android' ? 'Android' : platform === 'ios' ? 'iOS' : 'Desktop'}`}
        />
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
              ? 'PWA installée avec succès'
              : deferredPrompt
                ? "Installation PWA disponible"
                : "En attente du prompt PWA..."
          }
        />
      </div>

      {platform === 'android' && (
        <div className="install-options">
          <div className="install-card">
            <h3>🌐 Option 1 — Installer la PWA</h3>
            <p>
              Le navigateur télécharge l'app dans son cache et l'ajoute à
              l'écran d'accueil. Aucun APK, aucun store.
            </p>
            {deferredPrompt ? (
              <button className="btn-primary" onClick={handleInstall}>
                📲 Installer la PWA
              </button>
            ) : (
              <p className="hint">
                💡 Le prompt apparaît après quelques secondes, ou via Chrome ⋮ →
                « Installer l'application ».
              </p>
            )}
          </div>

          <div className="install-card">
            <h3>📦 Option 2 — Télécharger l'APK Capacitor</h3>
            <p>
              Le même code React, emballé dans un APK natif (via Capacitor). À
              installer comme une vraie app Android.
            </p>
            <a
              className="btn-primary"
              href="/pwa-demo.apk"
              download="pwa-demo.apk"
            >
              ⬇️ Télécharger l'APK (~8 Mo)
            </a>
            <p className="hint">
              Activer « Sources inconnues » dans les paramètres Android avant
              installation.
            </p>
          </div>
        </div>
      )}

      {platform === 'desktop' && (
        <div className="install-options">
          <div className="install-card">
            <h3>💻 Installer la PWA sur ton ordinateur</h3>
            <p>
              Chrome / Edge propose un bouton « Installer » dans la barre
              d'adresse. L'app obtient sa propre fenêtre, sans barre du
              navigateur.
            </p>
            {deferredPrompt ? (
              <button className="btn-primary" onClick={handleInstall}>
                📲 Installer PWA Demo
              </button>
            ) : standalone ? (
              <div className="info-box success">
                🎉 L'app tourne déjà en mode standalone !
              </div>
            ) : (
              <p className="hint">
                💡 Cherche l'icône 🖥️ dans la barre d'adresse de Chrome / Edge.
              </p>
            )}
          </div>

          <div className="install-card">
            <h3>📦 Bonus — l'APK Android Capacitor</h3>
            <p>
              Le même code React, emballé dans un APK natif (via Capacitor).
              Récupère l'APK depuis ton ordi puis transfère-le sur Android.
            </p>
            <a
              className="btn-primary"
              href="/pwa-demo.apk"
              download="pwa-demo.apk"
            >
              ⬇️ Télécharger l'APK (~8 Mo)
            </a>
            <p className="hint">
              Une seule codebase React, plusieurs véhicules de distribution.
              C'est tout le message du Day 2.
            </p>
          </div>
        </div>
      )}

      {platform === 'ios' && (
        <div className="install-card">
          <h3>📱 Installer la PWA sur iPhone (Safari)</h3>
          <p>iOS ne propose pas de prompt automatique. Suis ces 3 étapes :</p>
          <ol>
            <li>Ouvrir cette page dans <strong>Safari</strong> (pas Chrome iOS)</li>
            <li>Bouton <strong>Partager</strong> 📤 en bas de l'écran</li>
            <li>« <strong>Sur l'écran d'accueil</strong> » puis Ajouter</li>
          </ol>
          <p className="hint">
            ⚠️ iOS limite les PWA (push partiel, stockage Safari purgé après 7j
            d'inactivité). Pour un support complet, il faudrait Capacitor + IPA.
          </p>
        </div>
      )}

      {installed && (
        <div className="info-box success">
          ✅ PWA installée ! Ferme cet onglet et lance depuis l'écran
          d'accueil.
        </div>
      )}
    </div>
  )
}
