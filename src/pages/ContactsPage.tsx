import { useState } from 'react'
import { isNativeApp } from '../usePlatform'
import TestResult from '../components/TestResult'

interface Contact {
  name: string
  phones: string[]
  emails: string[]
}

export default function ContactsPage() {
  const native = isNativeApp()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadContacts = async () => {
    setLoading(true)
    setError(null)
    try {
      const { Contacts } = await import('@capacitor-community/contacts')
      const perm = await Contacts.requestPermissions()
      if (perm.contacts !== 'granted') {
        setError('Permission refusée. Active l\'accès Contacts dans les paramètres Android.')
        return
      }
      const result = await Contacts.getContacts({
        projection: { name: true, phones: true, emails: true },
      })
      const mapped: Contact[] = (result.contacts || []).slice(0, 50).map((c) => ({
        name: c.name?.display || '(sans nom)',
        phones: (c.phones || []).map((p) => p.number || '').filter(Boolean),
        emails: (c.emails || []).map((e) => e.address || '').filter(Boolean),
      }))
      setContacts(mapped)
    } catch (e) {
      setError(`Erreur : ${(e as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h2>📇 Contacts</h2>
      <p className="page-desc">
        L'API web ne permet pas de lire les contacts. C'est le cas le plus
        parlant pour comprendre la différence PWA / Capacitor.
      </p>

      <div className="test-section">
        <h3>Sécurité du navigateur</h3>
        <TestResult
          status={native ? 'supported' : 'unsupported'}
          label={
            native
              ? 'Mode natif (APK Capacitor) — accès aux contacts dispo'
              : 'Mode navigateur — accès contacts impossible (sandbox)'
          }
        />
      </div>

      {!native ? (
        <div className="install-card">
          <h3>❌ Pourquoi pas en PWA ?</h3>
          <p>
            Aucune API web standard ne permet de lire le carnet d'adresses du
            téléphone. Trois raisons :
          </p>
          <ol>
            <li>
              <strong>Sécurité</strong> — Un site web qu'on visite 5 secondes
              pourrait aspirer tous les contacts en silence. Vecteur de spam et
              phishing massif.
            </li>
            <li>
              <strong>Vie privée / RGPD</strong> — Les contacts sont des données
              personnelles de tiers (Marie qui est dans ton carnet n'a pas
              donné son consentement à un site web).
            </li>
            <li>
              <strong>Apple s'oppose totalement</strong> — Aucun consensus W3C,
              proposition <code>Contact Picker API</code> bloquée sur Safari.
              Chrome Android l'expose partiellement, mais c'est trop limité
              pour un usage métier.
            </li>
          </ol>
          <p className="hint">
            💡 <strong>Dans l'APK Capacitor</strong>, le plugin{' '}
            <code>@capacitor-community/contacts</code> demande la permission
            native Android, et avec son accord on peut lister, lire, créer.
            Démontre-le en installant l'APK depuis la page Install.
          </p>
        </div>
      ) : (
        <div className="install-card">
          <h3>✅ Accès natif via Capacitor</h3>
          <p>
            On va appeler <code>@capacitor-community/contacts</code>. Au premier
            clic, Android demandera la permission. Si tu acceptes, la liste de
            tes contacts (50 premiers) s'affichera.
          </p>
          <button
            className="btn-primary"
            onClick={loadContacts}
            disabled={loading}
          >
            {loading ? '⏳ Chargement…' : '📇 Charger mes contacts'}
          </button>
          {error && (
            <div className="info-box" style={{ marginTop: '1rem' }}>
              ⚠️ {error}
            </div>
          )}
          {contacts.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>
                {contacts.length} contacts chargés
              </h4>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  maxHeight: '40vh',
                  overflowY: 'auto',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                }}
              >
                {contacts.map((c, i) => (
                  <li
                    key={i}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderBottom: '1px solid var(--border)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div style={{ fontWeight: 500 }}>{c.name}</div>
                    {c.phones[0] && (
                      <div style={{ color: 'var(--text-secondary)' }}>
                        📞 {c.phones[0]}
                      </div>
                    )}
                    {c.emails[0] && (
                      <div style={{ color: 'var(--text-secondary)' }}>
                        ✉️ {c.emails[0]}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
