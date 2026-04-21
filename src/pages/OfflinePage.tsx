import { useState, useEffect } from 'react'
import { getDB } from '../db'
import TestResult from '../components/TestResult'

interface Card {
  id?: number
  name: string
  description: string
  synced: number
  createdAt: number
}

export default function OfflinePage() {
  const [online, setOnline] = useState(navigator.onLine)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [items, setItems] = useState<Card[]>([])
  const [swActive, setSwActive] = useState(false)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    const onSynced = () => loadItems()
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    window.addEventListener('sync-complete', onSynced)

    navigator.serviceWorker?.getRegistration().then((r) => setSwActive(!!r))
    loadItems()

    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
      window.removeEventListener('sync-complete', onSynced)
    }
  }, [])

  const loadItems = async () => {
    const db = await getDB()
    const all = await db.getAll('cards')
    setItems(all.reverse())
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const db = await getDB()
    await db.add('cards', {
      name: name.trim(),
      description: description.trim(),
      synced: 0,
      createdAt: Date.now(),
    })
    setName('')
    setDescription('')
    loadItems()
  }

  return (
    <div className="page">
      <h2>📡 Mode Offline</h2>
      <p className="page-desc">
        Ajoutez des cartes à votre collection même sans connexion. Elles seront
        synchronisées automatiquement au retour du réseau.
      </p>

      <div className="test-section">
        <h3>Résultats</h3>
        <TestResult
          status={swActive ? 'supported' : 'pending'}
          label={
            swActive
              ? 'Service Worker actif'
              : "Service Worker en cours d'enregistrement..."
          }
        />
        <TestResult
          status={online ? 'supported' : 'partial'}
          label={
            online
              ? 'En ligne — passez en mode avion pour tester'
              : "Hors ligne — l'app fonctionne toujours !"
          }
        />
        <TestResult status="supported" label="IndexedDB disponible" />
      </div>

      <div
        className="status-banner"
        style={{
          background: online ? '#e8f5e9' : '#fff3e0',
          color: online ? '#2e7d32' : '#e65100',
        }}
      >
        {online
          ? '✅ Connexion active'
          : '🔴 Mode hors ligne — données stockées localement'}
      </div>

      <form onSubmit={submit} className="form">
        <h3>Ajouter un item</h3>
        <input
          type="text"
          placeholder="Titre (ex: Mon premier item)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
        />
        <textarea
          placeholder="Effet / Description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input textarea"
          rows={3}
        />
        <button type="submit" className="btn-primary">
          Enregistrer {!online && '(hors ligne)'}
        </button>
      </form>

      {items.length > 0 && (
        <div className="list-section">
          <h3>Mes items ({items.length} cartes)</h3>
          {items.map((item) => (
            <div key={item.id} className="list-item">
              <div className="list-item-header">
                <strong>{item.name}</strong>
                <span
                  className={`sync-badge ${item.synced ? 'synced' : 'pending'}`}
                >
                  {item.synced ? '✅ Sync' : '⏳ En attente'}
                </span>
              </div>
              {item.description && <p className="list-item-note">{item.description}</p>}
              <small className="list-item-date">
                {new Date(item.createdAt).toLocaleString('fr-FR')}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
