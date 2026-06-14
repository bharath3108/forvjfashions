# VJ Fashions — Digital Catalog

A MERN-stack digital catalog for VJ Fashions (Chirala). Customers browse products and inquire via WhatsApp. Registered users can comment after email verification. Admins manage inventory via a protected dashboard.

> **Note:** Application code lives in `project/`. The `pdfs/` folder at the repo root is reference documentation only — do not modify it.

## Project structure

```
project/
├── backend/     Express API, MongoDB, Redis cache, Cloudinary uploads
├── frontend/    React + Tailwind customer site & admin panel
└── .github/     CI/CD pipeline (Render + Vercel)
```

## Quick start (local)

### 1. Backend

```bash
cd project/backend
cp .env.example .env
# Fill in MONGODB_URI, JWT secrets, etc.
npm install
node src/scripts/seedAdmin.js admin yourpassword
npm run dev
```

API runs at `http://localhost:5000`

### 2. Frontend

```bash
cd project/frontend
cp .env.example .env
# Set VITE_API_URL, VITE_CLOUDINARY_CLOUD_NAME, VITE_WHATSAPP_NUMBER
npm install
npm run dev
```

Site runs at `http://localhost:5173`

## Environment variables

| Service | File | Key variables |
|---------|------|---------------|
| Backend | `backend/.env` | `MONGODB_URI`, `JWT_ADMIN_SECRET`, `JWT_USER_SECRET`, `UPSTASH_REDIS_*`, `CLOUDINARY_*`, `SMTP_*`, `FRONTEND_URL` |
| Frontend | `frontend/.env` | `VITE_API_URL`, `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_WHATSAPP_NUMBER` |

## MongoDB Atlas Search setup

1. Open MongoDB Atlas → your cluster → **Search** tab
2. Create index on `vjfashions.products` named `product_search`:

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "name": { "type": "string" },
      "description": { "type": "string" }
    }
  }
}
```

Until the index is ready, search falls back to regex automatically.

## Features

- **Catalog** — category + age group filters, fuzzy search
- **WhatsApp CTA** — pre-filled inquiry messages per product
- **Redis cache** — `catalog:all` with 1-hour TTL, invalidated on admin changes
- **User auth** — register, email verification (SMTP), login
- **Comments** — verified users only
- **Admin** — multiple admins, product CRUD, Cloudinary image upload
- **Logging** — Winston → visible in Render dashboard logs

## Deployment

### Render (backend)
1. Connect repo, set root directory to `project/backend`
2. Build: `npm install` | Start: `npm start`
3. Add all env vars from `.env.example`
4. Create a Deploy Hook → add as `RENDER_DEPLOY_HOOK_URL` GitHub secret

### Vercel (frontend)
1. Import repo, set root directory to `project/frontend`
2. Framework: Vite | Build: `npm run build` | Output: `dist`
3. Add `VITE_*` env vars
4. Create Deploy Hook → add as `VERCEL_DEPLOY_HOOK_URL` GitHub secret

## API routes

| Method | Route | Auth |
|--------|-------|------|
| GET | `/api/products` | Public (cached) |
| GET | `/api/products/search?q=` | Public |
| GET | `/api/products/:id` | Public |
| POST | `/api/products` | Admin |
| POST | `/api/auth/user/register` | Public |
| GET | `/api/auth/user/verify?token=` | Public |
| POST | `/api/comments/product/:id` | Verified user |
| GET | `/api/store` | Public |
| GET | `/api/chat/status` | Public |
| POST | `/api/chat` | Public (rate limited) |

## Store placeholders

Update store details in `backend/src/routes/storeRoutes.js` or via env when ready:
- Address, phone, WhatsApp, hours, Google Maps embed URL
