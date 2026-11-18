# Deploying Qyopic to Cloudflare Pages

Qyopic runs natively on **Cloudflare Pages** with **Cloudflare Pages Functions** (`functions/api/[[route]].ts`) for secure Admin-only Cloudinary upload, listing, and deletion.

---

## Cloudflare Pages Environment Variables & Secrets

In **Cloudflare Dashboard → Workers & Pages → `qyopic` → Settings → Variables and Secrets (Production & Preview)**:

### Secrets (Encrypted / Server-only — used by `functions/api/[[route]].ts`)
- `CLOUDINARY_CLOUD_NAME` = your Cloudinary Cloud Name
- `CLOUDINARY_API_KEY` = your Cloudinary API Key
- `CLOUDINARY_API_SECRET` = your Cloudinary API Secret
- `CLOUDINARY_UPLOAD_PRESET` = your Cloudinary Upload Preset name (e.g., `qyopic_upload`)
- `ADMIN_PASSWORD` = strong password for signing into `/admin`
- `ADMIN_SESSION_SECRET` = long random string for signing admin session cookies

### Plaintext Build Variables (Public)
- `VITE_CLOUDINARY_CLOUD_NAME` = your Cloudinary Cloud Name (for fast CDN URL formatting)
- `VITE_R2_PUBLIC_URL` = *(optional)* your legacy R2 bucket public URL during migration

---

## Build Settings
- **Build command**: `npm run build`
- **Build output directory**: `dist`

After adding or updating variables/secrets in Cloudflare Pages, trigger a new deployment (or **Retry deployment**) so the updated build variables and Pages Functions take effect.
