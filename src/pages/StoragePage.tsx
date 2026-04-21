import { useState, useEffect } from 'react'
import { getDB } from '../db'
import TestResult from '../components/TestResult'

export default function StoragePage() {
  const [quota, setQuota] = useState<{ usage: number; quota: number } | null>(
    null,
  )
  const [count, setCount] = useState(0)
  const [writeMs, setWriteMs] = useState<number | null>(null)
  const [readMs, setReadMs] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const storageOk =
    'storage' in navigator && 'estimate' in navigator.storage

  useEffect(() => {
    estimate()
    countEntries()
  }, [])

  const estimate = async () => {
    if (!storageOk) return
    const est = await navigator.storage.estimate()
    setQuota({ usage: est.usage || 0, quota: est.quota || 0 })
  }

  const countEntries = async () => {
    const db = await getDB()
    setCount(await db.count('benchmarks'))
  }

  const fmt = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const units = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`
  }

  const benchWrite = async () => {
    setBusy(true)
    const db = await getDB()
    const payload = 'x'.repeat(1000)

    const t0 = performance.now()
    const tx = db.transaction('benchmarks', 'readwrite')
    for (let i = 0; i < 1000; i++) {
      tx.store.add({ data: `${payload}-${i}` })
    }
    await tx.done
    setWriteMs(Math.round(performance.now() - t0))

    setBusy(false)
    countEntries()
    estimate()
  }

  const benchRead = async () => {
    setBusy(true)
    const db = await getDB()

    const t0 = performance.now()
    const all = await db.getAll('benchmarks')
    setReadMs(Math.round(performance.now() - t0))

    setBusy(false)
    console.log(`Read ${all.length} entries`)
  }

  const clearBench = async () => {
    const db = await getDB()
    await db.clear('benchmarks')
    setCount(0)
    setWriteMs(null)
    setReadMs(null)
    estimate()
  }

  const pct = quota ? ((quota.usage / quota.quota) * 100).toFixed(2) : '—'

  return (
    <div className="page">
      <h2>💾 Stockage &amp; Performance</h2>
      <p className="page-desc">
        Espace disponible pour votre collection et performances de la base de
        données locale.
      </p>

      <div className="test-section">
        <h3>Résultats</h3>
        <TestResult
          status={storageOk ? 'supported' : 'unsupported'}
          label={
            storageOk
              ? 'Storage Manager API supportée'
              : 'Storage Manager non supportée'
          }
        />
        <TestResult status="supported" label="IndexedDB disponible" />
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{quota ? fmt(quota.quota) : '—'}</div>
          <div className="stat-label">Quota total</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{quota ? fmt(quota.usage) : '—'}</div>
          <div className="stat-label">Espace utilisé</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{pct}%</div>
          <div className="stat-label">Utilisation</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{count.toLocaleString()}</div>
          <div className="stat-label">Entrées IDB</div>
        </div>
      </div>

      <h3>Benchmark</h3>
      <div className="btn-group">
        <button className="btn-primary" onClick={benchWrite} disabled={busy}>
          {busy ? '⏳ En cours...' : '✏️ Écrire 1000 entrées'}
        </button>
        <button
          className="btn-primary"
          onClick={benchRead}
          disabled={busy || count === 0}
        >
          📖 Lire toutes les entrées
        </button>
        <button
          className="btn-danger"
          onClick={clearBench}
          disabled={busy || count === 0}
        >
          🗑 Vider le benchmark
        </button>
      </div>

      {(writeMs !== null || readMs !== null) && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Résultats du benchmark</h3>
          <div className="stats-grid">
            {writeMs !== null && (
              <div className="stat-card">
                <div className="stat-value">{writeMs} ms</div>
                <div className="stat-label">Écriture 1000 entrées</div>
              </div>
            )}
            {readMs !== null && (
              <div className="stat-card">
                <div className="stat-value">{readMs} ms</div>
                <div className="stat-label">
                  Lecture {count.toLocaleString()} entrées
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
