# Syntrix AI - Production Deployment Checklist

## Files Modified

| File | Change |
|------|--------|
| `backend/app/core/config.py` | Added `FRONTEND_URL` setting; `BACKEND_CORS_ORIGINS` defaults to `["http://localhost:3000"]` |
| `backend/app/services/ai_service.py` | `HTTP-Referer` now uses `settings.FRONTEND_URL` instead of hardcoded `http://localhost:3000` |
| `backend/main.py` | CORS middleware uses `settings.BACKEND_CORS_ORIGINS` with `allow_credentials=True` (was `["*"]`) |
| `backend/.env` | Removed commented-out localhost line; added `FRONTEND_URL` |
| `backend/.env.example` | **NEW** - Template for production env vars |
| `frontend/.env.local` | Added `NEXT_PUBLIC_WIDGET_URL` |
| `frontend/.env.example` | **NEW** - Template for frontend env vars |
| `frontend/src/app/layout.tsx` | Full SEO metadata (title, description, OG, Twitter, icons, robots) |
| `frontend/next.config.mjs` | Added `output: 'standalone'` and `images.remotePatterns` |
| `frontend/public/widget.js` | `BACKEND_URL` supports `data-backend-url` attribute override |
| `frontend/src/app/dashboard/settings/page.tsx` | Embed code uses `NEXT_PUBLIC_WIDGET_URL` env var |
| `frontend/README.md` | Removed hardcoded `http://localhost:3000` reference |

## Environment Variables Required

### Backend (`backend/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `OPENROUTER_API_KEY` | OpenRouter AI API key | `sk-or-v1-...` |
| `FRONTEND_URL` | Deployed frontend URL | `https://app.syntrix.ai` |
| `BACKEND_CORS_ORIGINS` | Allowed CORS origins (JSON array) | `["https://app.syntrix.ai"]` |
| `SECRET_KEY` | JWT signing secret | (generate a long random string) |
| `SUPABASE_URL` | Supabase project URL | `https://your-project.supabase.co` |
| `SUPABASE_JWT_SECRET` | Supabase JWT secret | from Supabase dashboard |
| `OTP_DIGITS` | OTP code length | `6` |

### Frontend (`frontend/.env.local`)
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://api.syntrix.ai/api/v1` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | from Supabase dashboard |
| `NEXT_PUBLIC_OTP_LENGTH` | OTP code length | `6` |
| `NEXT_PUBLIC_WIDGET_URL` | Public URL where widget.js is served | `https://app.syntrix.ai` |

## Supabase Settings to Update

Navigate to **Authentication > Settings** in your Supabase dashboard:

| Setting | Value | Description |
|---------|-------|-------------|
| **Site URL** | `https://app.syntrix.ai` | Main app URL |
| **Redirect URLs** | `https://app.syntrix.ai/auth/callback` | OAuth redirect after Google sign-in |
| | `https://app.syntrix.ai/reset-password` | Password reset redirect |
| **Password Reset URL** | `https://app.syntrix.ai/reset-password` | Same as above |
| **Email Verification URL** | `https://app.syntrix.ai/auth/callback` | Email verification redirect |

These URLs are currently set to `http://localhost:3000` equivalents. After deployment, update all to your production domain.

## Vercel Settings to Configure

1. **Environment Variables** (in Vercel dashboard for the project):
   - `NEXT_PUBLIC_API_URL` → `https://your-backend-domain.com/api/v1`
   - `NEXT_PUBLIC_SUPABASE_URL` → Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Supabase anonymous key
   - `NEXT_PUBLIC_OTP_LENGTH` → `6`
   - `NEXT_PUBLIC_WIDGET_URL` → `https://your-vercel-domain.vercel.app`

2. **Build Settings** (Vercel auto-detects Next.js):
   - Framework Preset: Next.js
   - Build Command: `next build`
   - Output Directory: `.next`
   - Node.js Version: 18.x or 20.x

3. **Functions** (if using serverless):
   - No special config needed for Next.js 14 App Router

## Backend Deployment (e.g., Render, Railway, Fly.io)

1. Set all backend environment variables from the table above
2. Build command: `pip install -r requirements.txt`
3. Start command: `uvicorn main:app --host 0.0.0.0 --port 8000`
4. Ensure `FRONTEND_URL` points to your Vercel deployment
5. Ensure `BACKEND_CORS_ORIGINS` includes your Vercel domain

## Widget Embed Code

Users will see embed code like:
```html
<script src="https://YOUR_DOMAIN/widget.js" data-api-key="xxx" async></script>
```

For production deployments where backend is on a different domain, set `data-backend-url`:
```html
<script src="https://YOUR_DOMAIN/widget.js" data-api-key="xxx" data-backend-url="https://api.your-domain.com" async></script>
```

## Security Notes

1. **CORS**: Now locked to specific origins via `BACKEND_CORS_ORIGINS` (was `["*"]`)
2. **Auth Bypass** (`backend/app/api/deps.py:25`): Current code uses `jwt.get_unverified_claims()`. This is a known dev workaround for Supabase ES256 tokens. For production, consider implementing proper JWT verification.
3. **SECRET_KEY**: Generate a strong random key for production
4. **Static Uploads**: Logo uploads stored in `static/uploads/` - ensure this directory is properly secured in production

## Deployment Steps (In Order)

1. Update Supabase Authentication settings with production URLs
2. Deploy backend to your hosting provider with all env vars
3. Deploy frontend to Vercel with all env vars
4. Update `BACKEND_CORS_ORIGINS` on backend to include Vercel domain
5. Update `FRONTEND_URL` on backend to include Vercel domain
6. Test the full flow: signup, login, widget embed, lead capture
7. Update DNS if using custom domain
8. Monitor logs for any CORS or auth errors
