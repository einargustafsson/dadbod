# Dadbod

Personal strength and fat-loss workout PWA. Mobile-first, offline, all data stored on-device (IndexedDB).

- Generates alternating upper/lower sessions from a 60-exercise gym library
- Double progression with automatic weight/rep targets, stall handling and deload weeks
- Warm-up mobility and balance/carry finishers
- Body weight trend toward a goal, running log (hard runs adjust leg day)
- Optional weekly review from Claude (your own API key, aggregate data only)
- JSON export/import (the API key is never exported)

## Develop

```
npm install
npm run dev      # http://localhost:5173
npm test         # engine, service and coach tests
npm run build    # production build with service worker
npm run preview  # serve the build, test offline/install
```

Engine logic lives in `src/engine/` (pure, unit tested); data access in `src/services/`; UI in `src/screens/`.

## Install on a phone

Deploy `dist/` to any static host over HTTPS, open it in the phone browser, and use "Add to Home Screen".
