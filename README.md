# ei-ui-nextjs

Mobile-first public blogging frontend for `explainit.tech`.

## Environment

Copy `.env.example` to `.env.local`:

```env
API_URL=http://localhost:8000/v1/api
PUBLIC_APP_KEY=ei_public_key_here
```

- `PUBLIC_APP_KEY` must match the backend map for `explainit.tech`.
- This key is only used server-side by Next.js route handlers/server components.
- In production, set `API_URL` and `PUBLIC_APP_KEY` on the running container or hosting platform; do not bake them into the image or expose them as `NEXT_PUBLIC_*` variables.

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

### Backend configuration at runtime

Article requests run when a visitor opens a page, not during image builds. Set `API_URL` (including `/v1`) and `PUBLIC_APP_KEY` on the running container. `API_URL` takes precedence over the legacy `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_API_BASE_URL` aliases. Do not pass the API key as a Docker build argument. Local environment files are excluded from the Docker build context.
