# FPS App

## Structure
- `frontend/` — React 19 + Vite (port 3500)
- `backend/` — Express 5 + Prisma 6 + PostgreSQL (port 3001)

## Backend
- Package manager: **npm** (not pnpm)
- Entry: `backend/server.ts` → `backend/src/app.ts`
- Prisma singleton: `backend/config/prisma.ts`
- Customer CRUD: `src/customers/` (routes → controller → service)
- All imports use `.ts` extensions (`tsconfig` has `rewriteRelativeImportExtensions`)
- Deployed to **Cloud Run**: `https://fps-backend-687545653075.us-central1.run.app`
- Database: **Neon PostgreSQL** (connection string in Cloud Run env vars)

## Frontend
- Backend URL set via `VITE_BACKEND_URL` env var (hardcoded fallback to Cloud Run URL in `api.ts`)
- External data from `aepos.ap.gov.in` — CORS handled via Vite proxy (dev) and Netlify redirect (prod)

## Dev
```
cd backend && npm run dev
cd frontend && npm run dev
```
