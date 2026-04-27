import { useState, useEffect, type ComponentType } from 'react'
import { syncPending } from './sync'
import StatusBar from './components/StatusBar'
import TabNav from './components/TabNav'
import InstallPage from './pages/InstallPage'
import OfflinePage from './pages/OfflinePage'
import SyncPage from './pages/SyncPage'
import CameraPage from './pages/CameraPage'
import GeoPage from './pages/GeoPage'
import SignaturePage from './pages/SignaturePage'
import StoragePage from './pages/StoragePage'
import ContactsPage from './pages/ContactsPage'

export type Tab =
  | 'install'
  | 'offline'
  | 'sync'
  | 'camera'
  | 'geo'
  | 'contacts'
  | 'signature'
  | 'storage'

const pages: Record<Tab, ComponentType> = {
  install: InstallPage,
  offline: OfflinePage,
  sync: SyncPage,
  camera: CameraPage,
  geo: GeoPage,
  contacts: ContactsPage,
  signature: SignaturePage,
  storage: StoragePage,
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('install')
  const Page = pages[activeTab]

  // Global auto-sync: runs regardless of which tab is active
  useEffect(() => {
    const onOnline = () => {
      syncPending()
    }
    window.addEventListener('online', onOnline)
    // Also sync on app start in case there are stale pending items
    syncPending()
    return () => window.removeEventListener('online', onOnline)
  }, [])

  return (
    <div className="app">
      <StatusBar />
      <main className="content">
        <Page />
      </main>
      <TabNav active={activeTab} onChange={setActiveTab} />
    </div>
  )
}
