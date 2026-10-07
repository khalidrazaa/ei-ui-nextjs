# ei-ui-nextjs

Mobile-first public blogging frontend for `explainit.tech`.

## Environment

Copy `.env.example` to `.env.local`:

```env
API_URL=http://localhost:8000/v1
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

### Contact form

The Contact form posts to `POST /api/contact`. This server-side route validates the
request and forwards it to `POST /v1/public/contact?host_site=explainit.tech` using
the same `API_URL` and `PUBLIC_APP_KEY` as article requests. The API key is never
sent to the browser. The backend sends accepted messages to `core@explainit.tech`
through its configured email provider, using the visitor's email as Reply-To.

The form shows success only after the backend confirms email-provider acceptance.
Failures retain the entered fields and show a retry or direct-email message.

Phone is optional. Edit the country code directly (default India, +91), choose a
code from its dropdown, or paste a full number starting with +. Phone values are
normalized to + followed by 7–15 digits and included in the contact email when
provided; this checks formatting, not whether a number is assigned.

After `npm run build`, run `npm run test:contact` to exercise the production route
against an isolated mock backend. These checks never send real emails.
