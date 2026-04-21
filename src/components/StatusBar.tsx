import { useState, useEffect } from 'react'

export default function StatusBar() {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  return (
    <header className="status-bar">
      <div className="status-left">
        <h1>PWA Demo</h1>
        <span className="version-tag">v{__APP_VERSION__}</span>
      </div>
      <span className={`status-badge ${online ? 'online' : 'offline'}`}>
        {online ? '✅ En ligne' : '🔴 Hors ligne'}
      </span>
    </header>
  )
}
