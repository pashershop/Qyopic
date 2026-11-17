# Deploying Qyopic to Cloudflare

Qyopic is configured as a zero-backend, static SPA ready for **Cloudflare Pages** or **Cloudflare Workers (Static Assets)**, with built-in support for **Cloudflare R2** image delivery.

---

## Option 1: Cloudflare Pages (Recommended via Git)

1. Push this repository to GitHub or GitLab.
2. Open **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**.
3. Use these build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. *(Optional)* Add Environment Variable under **Settings → Environment Variables**:
   - `VITE_R2_PUBLIC_URL` = `https://media.yourdomain.com` (your Cloudflare R2 public custom domain or `r2.dev` URL)
5. Deploy. `public/_headers` and `public/_redirects` are automatically bundled into `dist/`.

---

## Option 2: Direct CLI Deploy (Wrangler)

### Cloudflare Pages CLI (`wrangler.jsonc`)
```bash
npm install
npm run build
npx wrangler pages deploy dist --project-name=qyopic
```

---

## Connecting Cloudflare R2 for Image Storage

1. Create an R2 bucket (e.g., `qyopic-media`) and enable Public Access via a custom domain (e.g., `https://media.qyopic.com`).
2. Set `VITE_R2_PUBLIC_URL="https://media.qyopic.com"` before running `npm run build`.
3. Upload your images matching the `r2Key` paths in `src/data/images.json` (or replace `r2Key` values with full `https://...` R2 URLs).
4. Configure an R2 CORS policy so the direct **Download** button can fetch image blobs cleanly:
```json
[
  {
    "AllowedOrigins": ["https://qyopic.pages.dev", "https://yourdomain.com"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 86400
  }
]
```
