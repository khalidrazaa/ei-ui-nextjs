# ExplainIt public site

Mobile-first Next.js blogging frontend for `explainit.tech`; branding and host filtering live in [`src/config/site.ts`](src/config/site.ts).

The published-content host is set in [`src/config/public-content.json`](src/config/public-content.json), shared by the site configuration and the article build script.

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

Production builds require a reachable backend and valid `API_URL`/`PUBLIC_APP_KEY` to load all published articles for `explainit.tech`. Local `npm run build` reads `.env.local`; Docker builds receive these values through BuildKit secrets because `.dockerignore` excludes local environment files. Keep the key out of browser variables and Docker build arguments.

Also set `API_URL` and `PUBLIC_APP_KEY` on the running container/platform for live comments and contact submissions. Build secrets do not supply runtime configuration. Docker runs the standalone server on port 3000.

## Generated article pages

Before Next.js builds, `scripts/build-articles.mjs` reads published content from the database through the existing backend API and writes a public-content-only snapshot to `src/generated/published-articles.json`. The build then generates `/articles/[slug]` pages for every published article. Credentials are not written into the snapshot. Public article content is included in the application build, so opening an article does not wait for an article API/database request. The database remains the source of truth; saving, editing, publishing and deleting articles continue through the existing admin/backend.

The deployed article content is a build-time snapshot. After publishing, editing, unpublishing, deleting or changing an article slug, rebuild and deploy the site to update its public content. Every `npm run build` fetches a fresh snapshot, including local rebuilds; clearing the Next.js fetch cache is unnecessary. A new slug returns 404 until its generated page is deployed. There is no automatic refresh or publish webhook in this configuration. A failed content fetch fails the build rather than deploying an incomplete snapshot.

The backend currently supports at most 500 articles per list request and has no pagination. To prevent silently omitting pages, the build fails if it receives 500 articles. Add backend pagination and update the snapshot loader before reaching that limit. The homepage is generated during the build; filtered article listings render on request using the same bundled snapshot. Production article reads never request content from the backend, so listings and generated pages stay consistent. Development reads edits to existing articles live; restart `npm run dev` after publishing a new slug to refresh Next.js's route list.

Comments load separately after the article appears and remain live. Their Next.js endpoint is `/article-comments` (`GET ?slug=...` to load, `POST` to submit); reverse proxies must route this path to Next.js. It deliberately lives outside `/api/`, which production proxies may route to the backend. Comment submissions and contact enquiries continue to use runtime database/API access.

### Docker and GitHub Actions

Set the repository Actions secrets `API_URL` and `PUBLIC_APP_KEY`. The API address must include `/v1` and be reachable from the GitHub runner and the Docker build container. `localhost` inside Docker refers to the build container, so use a reachable production/staging backend or an appropriate host address for local Docker builds.

The **Build and Push** workflow runs on pushes to `master` and can also be started with **Run workflow** in GitHub Actions. Each run uses a new non-secret `CONTENT_BUILD_REVISION` so Docker regenerates article content even when source files have not changed. The workflow pushes the image to GHCR; deploy that image through your existing deployment process.

For a local Docker build, first export `API_URL` and `PUBLIC_APP_KEY` into your shell, then run:

```bash
docker build \
  --secret id=API_URL,env=API_URL \
  --secret id=PUBLIC_APP_KEY,env=PUBLIC_APP_KEY \
  --build-arg CONTENT_BUILD_REVISION=manual-1 \
  -t explainit-tech .
```

Use modern Docker with BuildKit enabled. Change `CONTENT_BUILD_REVISION` for each content rebuild, or use `--no-cache`, to avoid reusing an earlier generated snapshot. Credentials are supplied only to the build step through [BuildKit secret mounts](https://docs.docker.com/build/building/secrets/).

## Google Analytics

The GA4 measurement ID `G-4LND6SPQ4W` lives in [`src/config/site.ts`](src/config/site.ts) as `googleAnalyticsId`. The root layout uses the existing `@next/third-parties` integration across all routes. Analytics loads only in production; `npm run dev` does not track visits.

Standard production and Docker builds include this public ID automatically, with no extra environment variables or build arguments. To change the property, update `googleAnalyticsId`, rebuild, and deploy.

In the GA4 web stream's Enhanced measurement settings, enable Page views and its advanced option **Page changes based on browser history events** to measure client-side navigation, as described in the [Next.js pageview tracking guide](https://nextjs.org/docs/app/guides/third-party-libraries#tracking-pageviews). After deploying, visit the site and navigate between pages, then check the GA4 Realtime report for activity.

## Checks and production

```bash
npx eslint src
node --test tests/content-markdown.test.mjs tests/article-snapshot.test.mjs tests/article-comments-route.test.mjs
npm run test:articles
npm run build
npm run test:contact
npm run start
```

`test:articles` creates an isolated application with a mock backend, generates more than 200 article pages, checks that production reads work without the backend, then rebuilds to verify content updates. It does not use your database. `test:contact` requires the build and starts Next.js against an isolated mock backend; it sends no real emails. `npm run lint` still invokes `next lint`, absent in Next.js 16; use ESLint directly.

## Contact behavior

The form uses a server action on `/contact`, then the shared server-only helper sends `POST /v1/public/contact?host_site=explainit.tech`. This survives production proxies routing `/api/` to FastAPI. The compatibility `POST /api/contact` route remains for clients reaching Next.js directly; both paths share validation and runtime credentials.

The backend saves accepted enquiries and emails `core@explainit.tech`, using the visitor as Reply-To. Success follows backend confirmation; failures retain fields and offer retry/direct email.

Phone is optional: editable/dropdown country code (default `+91`), national digits, normalized formatted pastes, and matching country code for international pastes. Browser/server `libphonenumber-js/max` and backend `phonenumbers` validate country lengths/prefixes, handle trunk prefixes/significant zeros, and send E.164 values in contact emails. Validation checks numbering rules, not ownership/reachability; update both libraries for current metadata.
