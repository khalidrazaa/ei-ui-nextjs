# ei-ui-nextjs

Mobile-first public blogging frontend for `explainit.tech`.

## Environment

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/v1/api
API_URL=http://localhost:8000/v1/api
PUBLIC_APP_KEY=ei_public_key_here
```

- `PUBLIC_APP_KEY` must match the backend map for `explainit.tech`.
- This key is only used server-side by Next.js route handlers/server components.

## Run

```bash
npm install
npm run dev
```

## Build Check

```bash
npx eslint src
npm run build
```
