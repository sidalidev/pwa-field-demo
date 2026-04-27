import { useState, useEffect } from 'react'
import TestResult from '../components/TestResult'
import { detectRuntime, getDeviceUA, type RuntimePlatform } from '../usePlatform'

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [installed, setInstalled] = useState(false)
  const [standalone] = useState(
    window.matchMedia('(display-mode: standalone)').matches,
  )
  const [runtime] = useState<RuntimePlatform>(detectRuntime())
  const [device] = useState(getDeviceUA())

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

  const runtimeLabel = {
    'android-apk': '📦 APK Capacitor (Android natif)',
    'ios-ipa': '📦 IPA Capacitor (iOS natif)',
    'web-installed': '🌐 PWA installée (mode standalone)',
    'web-browser': `🌐 Navigateur ${device === 'android' ? 'Android' : device === 'ios' ? 'iOS' : 'Desktop'}`,
  }[runtime]

  return (
    <div className="page">
      <h2>📲 Installer PWA Demo</h2>
      <p className="page-desc">
        Le même code React, plusieurs véhicules de distribution selon la
        plateforme.
      </p>

      <div className="test-section">
        <h3>Mode d'exécution actuel</h3>
        <TestResult status="supported" label={runtimeLabel} />
        <TestResult
          status={standalone ? 'supported' : 'pending'}
          label={
            standalone
              ? 'Mode standalone actif (pas de barre navigateur)'
              : "Mode onglet — installer pour passer en standalone"
          }
        />
      </div>

      {/* Déjà dans l'APK / IPA Capacitor — rien à installer */}
      {(runtime === 'android-apk' || runtime === 'ios-ipa') && (
        <div className="install-card">
          <h3>✅ Tu es dans l'app native</h3>
          <p>
            Cette app tourne dans une <strong>WebView Capacitor</strong>{' '}
            emballée dans un{' '}
            {runtime === 'android-apk' ? 'APK Android' : 'IPA iOS'}. Tu as déjà
            le meilleur des deux mondes : le code React partagé avec la PWA, et
            les permissions natives (caméra, GPS, contacts, etc.).
          </p>
          <p className="hint">
            💡 La même codebase est aussi accessible en navigateur à{' '}
            <code>https://pwa-field-demo.vercel.app</code>. Pas de réécriture,
            juste deux véhicules de distribution.
          </p>
        </div>
      )}

      {/* PWA installée standalone — tout est OK */}
      {runtime === 'web-installed' && (
        <div className="install-card">
          <h3>🎉 PWA installée et active</h3>
          <p>
            L'app tourne en mode standalone (pas de barre navigateur). Le
            Service Worker garde tout en cache offline.
          </p>
          <p className="hint">
            Pour aller plus loin (contacts, push fiable iOS, biométrie), il
            faudrait passer en APK Capacitor — téléchargeable ci-dessous.
          </p>
          <a
            className="btn-primary"
            href="/pwa-demo.apk"
            download="pwa-demo.apk"
          >
            ⬇️ Télécharger l'APK Capacitor (~16 Mo)
          </a>
        </div>
      )}

      {/* Navigateur Android — 2 options */}
      {runtime === 'web-browser' && device === 'android' && (
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
              installer comme une vraie app Android. Permissions natives
              activées : caméra, GPS, contacts.
            </p>
            <a
              className="btn-primary"
              href="/pwa-demo.apk"
              download="pwa-demo.apk"
            >
              ⬇️ Télécharger l'APK (~16 Mo)
            </a>
            <p className="hint">
              Activer « Sources inconnues » dans les paramètres Android avant
              installation.
            </p>
          </div>
        </div>
      )}

      {/* Navigateur Desktop — 2 options */}
      {runtime === 'web-browser' && device === 'desktop' && (
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
              Récupère l'APK depuis ton ordi puis transfère-le sur Android pour
              comparer.
            </p>
            <a
              className="btn-primary"
              href="/pwa-demo.apk"
              download="pwa-demo.apk"
            >
              ⬇️ Télécharger l'APK (~16 Mo)
            </a>
            <p className="hint">
              Une seule codebase React, plusieurs véhicules de distribution.
              C'est tout le message du Day 2.
            </p>
          </div>
        </div>
      )}

      {/* Navigateur iOS — Safari Add to Home Screen */}
      {runtime === 'web-browser' && device === 'ios' && (
        <div className="install-card">
          <h3>📱 Installer la PWA sur iPhone (Safari)</h3>
          <p>iOS ne propose pas de prompt automatique. Suis ces 3 étapes :</p>
          <ol>
            <li>
              Ouvrir cette page dans <strong>Safari</strong> (pas Chrome iOS)
            </li>
            <li>
              Bouton <strong>Partager</strong> 📤 en bas de l'écran
            </li>
            <li>
              « <strong>Sur l'écran d'accueil</strong> » puis Ajouter
            </li>
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
