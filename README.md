# ExplainIt public site

Mobile-first Next.js blogging frontend for `explainit.tech`; branding and host filtering live in [`src/config/site.ts`](src/config/site.ts).

## Setup and runtime configuration

Use Node.js 24 (matching Docker). Copy `.env.example` to `.env.local` and supply:

```env
API_URL=http://localhost:8000/v1
PUBLIC_APP_KEY=your_backend_registered_key
```

Register an active public key for `explainit.tech` in the backend. [`fetchPublicApi`](src/lib/public-api.ts) uses it only on the Next.js server. `API_URL` includes `/v1` and takes precedence over legacy `NEXT_PUBLIC_API_URL`/`NEXT_PUBLIC_API_BASE_URL` aliases.

```bash
npm ci
npm run dev
```

Open http://localhost:3000. Use port 3000 for the public site and 3001 for admin.

Production article/contact requests use runtime configuration; builds need no live backend. Set `API_URL` and `PUBLIC_APP_KEY` on the running container/platform. Keep the key out of browser variables and Docker build arguments; `.dockerignore` excludes local environment files. Docker runs the standalone server on port 3000.

## Checks and production

```bash
npx eslint src
node --test tests/content-markdown.test.mjs
npm run build
npm run test:contact
npm run start
```

`test:contact` requires the build and starts Next.js against an isolated mock backend; it sends no real emails. `npm run lint` still invokes `next lint`, absent in Next.js 16; use ESLint directly.

## Contact behavior

The form uses a server action on `/contact`, then the shared server-only helper sends `POST /v1/public/contact?host_site=explainit.tech`. This survives production proxies routing `/api/` to FastAPI. The compatibility `POST /api/contact` route remains for clients reaching Next.js directly; both paths share validation and runtime credentials.

The backend saves accepted enquiries and emails `core@explainit.tech`, using the visitor as Reply-To. Success follows backend confirmation; failures retain fields and offer retry/direct email.

Phone is optional: editable/dropdown country code (default `+91`), national digits, normalized formatted pastes, and matching country code for international pastes. Browser/server `libphonenumber-js/max` and backend `phonenumbers` validate country lengths/prefixes, handle trunk prefixes/significant zeros, and send E.164 values in contact emails. Validation checks numbering rules, not ownership/reachability; update both libraries for current metadata.
