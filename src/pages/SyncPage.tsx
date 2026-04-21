import { useState, useEffect, useCallback } from 'react'
import { getDB } from '../db'
import { syncPending } from '../sync'
import TestResult from '../components/TestResult'

export default function SyncPage() {
  const [pendingCount, setPendingCount] = useState(0)
  const [lastSync, setLastSync] = useState<number | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [bgSyncSupported, setBgSyncSupported] = useState(false)
  const [log, setLog] = useState<string[]>([])

  const addLog = useCallback((msg: string) => {
    setLog((prev) =>
      [`[${new Date().toLocaleTimeString('fr-FR')}] ${msg}`, ...prev].slice(
        0,
        20,
      ),
    )
  }, [])

  const countPending = useCallback(async () => {
    const db = await getDB()
    const pending = await db.getAllFromIndex('cards', 'by-synced', 0)
    setPendingCount(pending.length)
  }, [])

  const handleManualSync = useCallback(async () => {
    if (!navigator.onLine) {
      addLog('❌ Impossible de sync — pas de réseau')
      return
    }

    setSyncing(true)
    addLog('🔄 Synchronisation manuelle en cours...')

    try {
      const count = await syncPending()
      setLastSync(Date.now())
      addLog(`✅ ${count} carte(s) synchronisée(s)`)
      countPending()
    } catch (err) {
      addLog(`❌ Erreur sync : ${err}`)
    } finally {
      setSyncing(false)
    }
  }, [addLog, countPending])

  useEffect(() => {
    setBgSyncSupported('serviceWorker' in navigator && 'SyncManager' in window)
    countPending()

    const interval = setInterval(countPending, 3000)

    // Listen for global auto-sync completions
    const onSynced = (e: Event) => {
      const count = (e as CustomEvent).detail?.count ?? 0
      if (count > 0) {
        addLog(`✅ Auto-sync : ${count} carte(s) synchronisée(s)`)
        setLastSync(Date.now())
        countPending()
      }
    }

    const onOnline = () => addLog('Réseau détecté — sync automatique lancée')
    const onOffline = () => addLog('⚠️ Réseau perdu')

    window.addEventListener('sync-complete', onSynced)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    return () => {
      clearInterval(interval)
      window.removeEventListener('sync-complete', onSynced)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [addLog, countPending])

  const registerBgSync = async () => {
    try {
      const reg = await navigator.serviceWorker.ready
      // @ts-ignore Background Sync API
      await reg.sync.register('sync-cards')
      addLog('✅ Background Sync enregistré : sync-cards')
    } catch (err) {
      addLog(`⚠️ Background Sync failed : ${err}`)
    }
  }

  const timeSince = lastSync
    ? Math.round((Date.now() - lastSync) / 60000)
    : null

  return (
    <div className="page">
      <h2>🔄 Background Sync</h2>
      <p className="page-desc">
        Synchronisation automatique des cartes ajoutées hors ligne quand le
        réseau revient.
      </p>

      <div className="test-section">
        <h3>Résultats</h3>
        <TestResult
          status={bgSyncSupported ? 'supported' : 'partial'}
          label={
            bgSyncSupported
              ? 'Background Sync API supportée'
              : 'Fallback navigator.onLine (BG Sync non disponible)'
          }
        />
        <TestResult
          status={navigator.onLine ? 'supported' : 'partial'}
          label={
            navigator.onLine
              ? 'Réseau disponible'
              : 'Hors ligne — sync au retour du réseau'
          }
        />
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{pendingCount}</div>
          <div className="stat-label">En attente de sync</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {timeSince !== null
              ? timeSince === 0
                ? '< 1 min'
                : `${timeSince} min`
              : '—'}
          </div>
          <div className="stat-label">Dernière sync</div>
        </div>
      </div>

      <div className="btn-group">
        <button
          className="btn-primary"
          onClick={handleManualSync}
          disabled={syncing || pendingCount === 0}
        >
          {syncing
            ? '⏳ Sync en cours...'
            : `Synchroniser maintenant (${pendingCount})`}
        </button>
        {bgSyncSupported && (
          <button className="btn-secondary" onClick={registerBgSync}>
            Enregistrer Background Sync
          </button>
        )}
      </div>

      <div className="log-section">
        <h3>Journal de sync</h3>
        <div className="log-box">
          {log.length === 0 ? (
            <p className="log-empty">Aucune activité</p>
          ) : (
            log.map((entry, i) => (
              <div key={i} className="log-entry">
                {entry}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
