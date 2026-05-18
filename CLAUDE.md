# FPS App — Backend Setup Progress

## What was done

### backend/package.json
- Added `"type": "module"` for ESM support
- Added scripts: `dev` (tsx watch), `build` (tsc), `start`, and Prisma helpers (`db:generate`, `db:migrate`, `db:studio`)
- Added `@prisma/client` to dependencies
- Added devDependencies: `typescript`, `tsx`, `@types/node`, `@types/express`, `@types/cors`, `@types/morgan`, `prisma`
- Added `pnpm.onlyBuiltDependencies` to allow Prisma and esbuild build scripts (required for pnpm v11)
- All packages installed and verified — Prisma CLI v6.19.3 working

### backend/server.ts ✅
- Entry point — starts Express on `PORT` (default 3001)

### backend/app.ts ✅
- Express app with `helmet`, `cors`, `morgan`, `express.json()`
- `GET /health` route
- Mounts `/api/customers` router (from `src/customers/customer.routes.js`)

### backend/prisma/schema.prisma ✅
- `Customer` model: `id`, `rcNumber` (unique), `name`, `phone` (optional), `address`, `createdAt`, `updatedAt`
- Provider: PostgreSQL

### backend/src/lib/prisma.ts ✅
- Prisma client singleton export

---

## What's still pending

### 1. Create backend/src/customers/customer.routes.ts
Routes: GET `/`, GET `/:id`, POST `/`, PUT `/:id`, DELETE `/:id`

### 2. Create backend/src/customers/customer.controller.ts
Handlers using Prisma: `getAllCustomers`, `getCustomerById`, `createCustomer`, `updateCustomer`, `deleteCustomer`

### 3. Create backend/.env
Add your PostgreSQL connection string:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
```

### 4. Run Prisma migrate
```bash
cd backend
pnpm db:migrate   # creates the customers table
pnpm db:generate  # generates the typed Prisma client
```

### 5. Start the dev server
```bash
cd backend
pnpm dev
```
Server will be available at `http://localhost:3001`

---

## Notes
- `tsconfig.json` uses `module: NodeNext` — all imports must use `.js` extensions (e.g., `import foo from './foo.js'`)
- pnpm v11 is in use — the `pnpm.onlyBuiltDependencies` config in `package.json` is what unblocks Prisma build scripts
