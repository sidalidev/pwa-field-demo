import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import TestResult from '../components/TestResult'

export default function GeoPage() {
  const [position, setPosition] = useState<GeolocationPosition | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [watching, setWatching] = useState(false)
  const geoOk = 'geolocation' in navigator

  const watchRef = useRef<number | null>(null)
  const mapElRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.CircleMarker | null>(null)

  useEffect(() => {
    return () => {
      if (watchRef.current !== null)
        navigator.geolocation.clearWatch(watchRef.current)
      mapRef.current?.remove()
    }
  }, [])

  const updateMap = (lat: number, lng: number) => {
    if (!mapElRef.current) return

    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 15)
      markerRef.current?.setLatLng([lat, lng])
      return
    }

    const map = L.map(mapElRef.current).setView([lat, lng], 15)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)

    markerRef.current = L.circleMarker([lat, lng], {
      radius: 10,
      fillColor: '#2563eb',
      color: '#ffffff',
      weight: 3,
      fillOpacity: 1,
    }).addTo(map)

    mapRef.current = map
  }

  const getPosition = () => {
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition(pos)
        updateMap(pos.coords.latitude, pos.coords.longitude)
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const toggleWatch = () => {
    if (watching && watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current)
      watchRef.current = null
      setWatching(false)
      return
    }

    setWatching(true)
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition(pos)
        updateMap(pos.coords.latitude, pos.coords.longitude)
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true },
    )
  }

  return (
    <div className="page">
      <h2>📍 Trouver des points d'intérêt</h2>
      <p className="page-desc">
        Localisez-vous pour trouver les points d'intérêt proches de vous.
      </p>

      <div className="test-section">
        <h3>Résultats</h3>
        <TestResult
          status={geoOk ? 'supported' : 'unsupported'}
          label={
            geoOk
              ? 'Geolocation API supportée'
              : 'Geolocation non supportée'
          }
        />
        <TestResult
          status={position ? 'supported' : 'pending'}
          label={
            position
              ? `Position obtenue (±${Math.round(position.coords.accuracy)}m)`
              : 'Position non encore demandée'
          }
        />
      </div>

      <div className="btn-group">
        <button className="btn-primary" onClick={getPosition} disabled={!geoOk}>
          📍 Ma position
        </button>
        <button
          className={watching ? 'btn-danger' : 'btn-secondary'}
          onClick={toggleWatch}
          disabled={!geoOk}
        >
          {watching ? '⏹ Arrêter le suivi' : '🔄 Suivre ma position'}
        </button>
      </div>

      {error && <div className="info-box error">❌ Erreur : {error}</div>}

      {position && (
        <div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">
                {position.coords.latitude.toFixed(6)}
              </div>
              <div className="stat-label">Latitude</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {position.coords.longitude.toFixed(6)}
              </div>
              <div className="stat-label">Longitude</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {Math.round(position.coords.accuracy)} m
              </div>
              <div className="stat-label">Précision</div>
            </div>
          </div>
          <a
            href={`https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{
              display: 'inline-block',
              marginTop: '0.5rem',
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            🗺 Ouvrir dans Google Maps
          </a>
        </div>
      )}

      <div
        ref={mapElRef}
        className="map-container"
        style={{
          height: position ? '300px' : '0',
          marginTop: position ? '1rem' : '0',
          transition: 'height 0.3s',
        }}
      />
    </div>
  )
}
