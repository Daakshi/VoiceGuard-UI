# VoiceGuard Workspace

Clean, separated repository containing both the Web Dashboard (`frontend/`) and the unified Node.js API + WebSocket Signaling Server (`backend/`).

---

## Project Structure

```
VoiceGuard-UI/
├── frontend/                 # React + Vite Web Dashboard
│   ├── src/
│   │   ├── components/       # UI components (Navbar, Hero, Mockup, etc.)
│   │   ├── api.js            # Live REST client (PostgreSQL auth, calls, users)
│   │   ├── config.js         # API & WebSocket endpoints configuration
│   │   ├── signaling.js      # WebSocket listener for real-time mobile events
│   │   ├── main.jsx          # App router & pages (Dashboard, History, Analytics, etc.)
│   │   ├── styles.css        # Dashboard styling & live pulse indicators
│   │   └── landing.css       # Marketing landing page styling
│   ├── index.html            # Entry HTML
│   ├── vite.config.js        # Vite build configuration
│   └── package.json          # Frontend dependencies
│
├── backend/                  # Node.js + Express + PostgreSQL + WebSocket Server
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js       # /api/v1/auth/register, /api/v1/auth/login
│   │   │   ├── users.js      # /api/v1/users/me, /api/v1/users (presence)
│   │   │   └── calls.js      # /api/v1/calls (call history, state transitions)
│   │   ├── auth.js           # JWT helpers & Bearer auth middleware
│   │   ├── db.js             # PostgreSQL pool & auto schema migration
│   │   ├── hub.js            # Multi-device WebSocket session manager
│   │   └── server.js         # Main HTTP server & WS upgrade handler
│   ├── .env                  # Port 8080 & PostgreSQL connection string
│   └── package.json          # Backend dependencies
│
├── package.json              # Root script runner
├── .gitignore                # Workspace git ignore rules
└── README.md
```

---

## How to Run

### 1. Ensure PostgreSQL is running
```powershell
docker start voiceguard-postgres
```

### 2. Start the Backend
From the root directory:
```powershell
npm run dev:backend
```
*Or navigate to `backend/` directly:*
```powershell
cd backend
npm run dev
```
Backend runs on `http://0.0.0.0:8080` (`/api/v1/health` and `/ws?token=<jwt>`).

### 3. Start the Frontend
From the root directory:
```powershell
npm run dev:frontend
```
*Or navigate to `frontend/` directly:*
```powershell
cd frontend
npm run dev
```
Web dashboard opens on `http://localhost:5173`.
