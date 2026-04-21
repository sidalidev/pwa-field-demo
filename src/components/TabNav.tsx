import type { Tab } from '../App'

const tabs: { id: Tab; icon: string; label: string }[] = [
  { id: 'install', icon: '📲', label: 'Install' },
  { id: 'offline', icon: '📡', label: 'Cartes' },
  { id: 'sync', icon: '🔄', label: 'Sync' },
  { id: 'camera', icon: '📷', label: 'Photo' },
  { id: 'geo', icon: '📍', label: 'Boutiques' },
  { id: 'signature', icon: '✍️', label: 'Dessin' },
  { id: 'storage', icon: '💾', label: 'Stock.' },
]

interface Props {
  active: Tab
  onChange: (tab: Tab) => void
}

export default function TabNav({ active, onChange }: Props) {
  return (
    <nav className="tab-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-btn ${active === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
