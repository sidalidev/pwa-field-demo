# PWA Field Demo

Prototype PWA pour démontrer que les fonctionnalités terrain critiques fonctionnent sur Chrome Android sans app native.

## Fonctionnalités testées

| # | Feature | API |
|---|---------|-----|
| 1 | Installation | `beforeinstallprompt`, `display: standalone` |
| 2 | Offline | Service Worker (Workbox), IndexedDB |
| 3 | Background Sync | `SyncManager` + fallback `navigator.onLine` |
| 4 | Appareil Photo | `getUserMedia` + `<input capture>` |
| 5 | Géolocalisation | `getCurrentPosition` + `watchPosition` |
| 6 | Signature tactile | Canvas + signature_pad |
| 7 | Stockage IndexedDB | `navigator.storage.estimate()`, benchmark r/w |

## Démarrage rapide

```bash
npm install
node scripts/generate-icons.js   # Génère les icônes PWA (192x192 + 512x512)
npm run dev
```

## Déployer sur Vercel

### Option 1 — CLI

```bash
npm run build
npx vercel --prod
```

### Option 2 — GitHub

1. Push le projet sur GitHub
2. Connecte le repo sur [vercel.com](https://vercel.com)
3. Vercel détecte Vite automatiquement → deploy auto à chaque push

## Tester sur Android

1. Ouvrir l'URL Vercel dans **Chrome Android**
2. Naviguer quelques secondes → le prompt « Installer » apparaît
3. Sinon : menu Chrome ⋮ → « Installer l'application »
4. L'app s'ouvre en **plein écran** depuis l'écran d'accueil

## Stack

- React 19 + TypeScript + Vite
- vite-plugin-pwa (Workbox)
- idb (IndexedDB wrapper)
- signature_pad
- Leaflet (carte OpenStreetMap)
- Zéro backend — tout côté client

## Note HTTPS

Caméra, géoloc et Service Worker nécessitent HTTPS.
- **Local** : `localhost` est considéré sécurisé
- **Vercel** : HTTPS automatique
