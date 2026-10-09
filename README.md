# ei-ui-nextjs

Mobile-first public blogging frontend for `explainit.tech`.

## Environment

Copy `.env.example` to `.env.local`:

```env
API_URL=http://localhost:8000/v1
PUBLIC_APP_KEY=ei_public_key_here
```

- `PUBLIC_APP_KEY` must match the backend map for `explainit.tech`.
- This key is only used server-side by Next.js server components, server actions, and route handlers.
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

The Contact form invokes a Next.js server action on `/contact`. Like articles,
the backend request runs on the Next.js server through `fetchPublicApi`, using
the same `API_URL` and `PUBLIC_APP_KEY`. The shared server-only contact helper
validates the request and sends `POST /v1/public/contact?host_site=explainit.tech`.
The form no longer makes a browser request to `/api/contact`, so a production
proxy mapping `/api/` to FastAPI cannot intercept contact submissions. The existing
`POST /api/contact` route remains available to clients that reach Next.js directly
and uses the same validation and submission helper. The API key is never
sent to the browser. The backend sends accepted messages to `core@explainit.tech`
through its configured email provider, using the visitor's email as Reply-To.

The form shows success after the backend confirms the enquiry was saved.
Failures retain the entered fields and show a retry or direct-email message.

Phone is optional. Edit the country code directly (default India, +91) or choose
one from its dropdown. The phone input stores national digits only. Formatted
pastes are normalized; a full international paste must match the selected code.
`libphonenumber-js/max` checks country-specific lengths and number prefixes in
the browser and Next.js server; the backend repeats validation with `phonenumbers`.
National trunk prefixes are handled by the library, preserving significant zeros.
Valid values are sent as E.164 and included in the contact email. This validates
numbering rules, not ownership or reachability. Keep both phone libraries updated
to refresh their country metadata.

After `npm run build`, run `npm run test:contact` to exercise production submissions
against an isolated mock backend. These checks never send real emails.
