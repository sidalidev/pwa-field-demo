import { getDB } from './db'

/**
 * Sync all pending cards (synced === 0) to the "server".
 * Returns the number of items synced.
 * Dispatches a 'sync-complete' event on window so pages can refresh.
 */
export async function syncPending(): Promise<number> {
  if (!navigator.onLine) return 0

  const db = await getDB()
  const pending = await db.getAllFromIndex('cards', 'by-synced', 0)
  if (pending.length === 0) return 0

  for (const item of pending) {
    await new Promise((r) => setTimeout(r, 200)) // simulate API call
    await db.put('cards', { ...item, synced: 1 })
  }

  window.dispatchEvent(
    new CustomEvent('sync-complete', { detail: { count: pending.length } }),
  )

  return pending.length
}
