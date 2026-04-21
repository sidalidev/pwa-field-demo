import { openDB, type DBSchema } from 'idb'

interface CollectionDB extends DBSchema {
  cards: {
    key: number
    value: {
      id?: number
      name: string
      description: string
      synced: number // 0 = pending, 1 = synced
      createdAt: number
    }
    indexes: { 'by-synced': number }
  }
  photos: {
    key: number
    value: {
      id?: number
      dataUrl: string
      createdAt: number
    }
  }
  signatures: {
    key: number
    value: {
      id?: number
      dataUrl: string
      createdAt: number
    }
  }
  benchmarks: {
    key: number
    value: {
      id?: number
      data: string
    }
  }
}

export function getDB() {
  return openDB<CollectionDB>('ma-collection', 1, {
    upgrade(db) {
      const cards = db.createObjectStore('cards', {
        keyPath: 'id',
        autoIncrement: true,
      })
      cards.createIndex('by-synced', 'synced')
      db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true })
      db.createObjectStore('signatures', { keyPath: 'id', autoIncrement: true })
      db.createObjectStore('benchmarks', { keyPath: 'id', autoIncrement: true })
    },
  })
}
