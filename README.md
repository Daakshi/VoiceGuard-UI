# VoiceGuard

VoiceGuard is a React/Vite frontend for a voice-call security dashboard. It currently uses mock API methods and is ready to connect to a Go backend.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173/login`.

## Routes

- `/login` and `/register`: authentication screens
- `/dashboard`: overview metrics, risk trend, and recent alerts
- `/call-history`: searchable, filterable, sortable call history
- `/call-history/:id`: detailed call security report
- `/analytics`: risk, detection, and suspicious-call timing analytics
- `/contacts`: trusted contacts used for speaker verification
- `/settings`: profile, security preferences, account, and danger-zone controls

## Project structure

- `src/main.jsx`: React entry point, pathname routing, page components, and UI interactions
- `src/api.js`: mock service boundary used by every page
- `src/styles.css`: shared visual system and responsive page styles
- `index.html`: Vite HTML entry point
- `vite.config.js`: Vite React configuration

## Connecting the Go backend

When the Go backend endpoints are ready, update exactly these two files:

1. `services/config.js`: add the backend base URL, environment configuration, and any request defaults.
2. `src/api.js`: replace the mock `resolveMockRequest()` calls with `fetch()` calls to the Go endpoints. Keep the existing exported method names (`login`, `register`, `getOverview`, `getAnalytics`, `getCalls`, `getCallById`, `getContacts`, `addContact`, `removeContact`, `getProfile`, `updateProfile`, and the call action methods) so the page components do not need to change.

The UI expects each API method to resolve to an object with a `payload` property, matching the current mock responses. Preserve that response shape while wiring the real endpoints.
