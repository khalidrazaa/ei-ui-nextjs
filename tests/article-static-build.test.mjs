import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { cp, lstat, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

const sourceDirectory = fileURLToPath(new URL("../", import.meta.url));
const testKey = "article-static-build-test-key";
const tempPrefix = "explainit-article-build-";
// Next's Windows webpack paths cannot span drives; keep the isolated app next
// to node_modules on Windows, inside the repository's ignored build directory.
const temporaryParent = process.platform === "win32" ? path.join(sourceDirectory, "build") : tmpdir();

function fixtures(count, revision) {
  return Array.from({ length: count }, (_, index) => {
    const id = index + 1;
    return {
      id,
      slug: `article-${id}`,
      title: `Fixture article ${id} ${revision}`,
      content: `## A generated article\n\nSnapshot ${revision} content for article ${id}.`,
      excerpt: `Snapshot ${revision} excerpt for article ${id}.`,
      status: "published",
      host_site: "explainit.tech",
      category: "Technology",
      tags: ["testing"],
      keywords: [],
      reading_time: 1,
      created_at: new Date(Date.UTC(2026, 0, 1, 0, 0, id)).toISOString(),
      published_at: new Date(Date.UTC(2026, 0, 1, 0, 0, id)).toISOString(),
    };
  });
}

function articlePage(articles, page, size) {
  const total_pages = Math.ceil(articles.length / size);
  return {
    items: articles.slice((page - 1) * size, page * size),
    total: articles.length,
    page,
    size,
    total_pages,
    has_next: page < total_pages,
    has_previous: page > 1,
  };
}

async function listen(server) {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return server.address().port;
}

async function freePort() {
  const reservation = createServer();
  const port = await listen(reservation);
  await new Promise((resolve) => reservation.close(resolve));
  return port;
}

// Only copy application inputs: .env files and the developer's .next are excluded.
async function copyApplication(directory) {
  for (const name of ["src", "public", "scripts", "next.config.ts", "postcss.config.mjs", "tsconfig.json", "package.json", "package-lock.json"]) {
    await cp(path.join(sourceDirectory, name), path.join(directory, name), {
      recursive: true,
      filter: (source) => source !== path.join(sourceDirectory, "src/generated"),
    });
  }
  await symlink(path.join(sourceDirectory, "node_modules"), path.join(directory, "node_modules"), process.platform === "win32" ? "junction" : "dir");
  await mkdir(path.join(directory, "tests"));
  await cp(path.join(sourceDirectory, "tests/contact-route.test.mjs"), path.join(directory, "tests/contact-route.test.mjs"));

  // Next's built-in font-test hook keeps these content tests offline.
  const fontMock = path.join(directory, "font-responses.cjs");
  await writeFile(fontMock, `module.exports = new Proxy({}, { get(_target, url) {
    const family = String(url).includes("family=Inter") ? "Inter" : "Source Serif 4";
    return "@font-face { font-family: '" + family + "'; src: local('Arial'); font-style: normal; font-weight: 100 900; }";
  } });\n`);
  return fontMock;
}

async function removeApplication(directory) {
  const absolute = path.resolve(directory);
  assert.equal(path.dirname(absolute), path.resolve(temporaryParent), "Cleanup must stay directly inside the temporary parent");
  assert.ok(path.basename(absolute).startsWith(tempPrefix), "Cleanup must target this test's temporary app");
  assert.equal((await lstat(absolute)).isSymbolicLink(), false, "Temporary app root must not be a link");
  // Remove the modules link first, so recursive cleanup cannot traverse it.
  await rm(path.join(absolute, "node_modules"), { force: true, recursive: true });
  await rm(absolute, { force: true, recursive: true });
}

function launch(directory, args, env, children) {
  const child = spawn(process.execPath, args, {
    cwd: directory,
    env,
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  children.add(child);
  let output = "";
  for (const stream of [child.stdout, child.stderr]) {
    stream.on("data", (chunk) => { output = (output + chunk).slice(-20_000); });
  }
  const completed = new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code, signal) => {
      children.delete(child);
      resolve({ code, signal, output });
    });
  });
  // A startup error may arrive while an HTTP readiness probe is pending.
  completed.catch(() => {});
  return { child, completed, output: () => output };
}

async function stop(processHandle) {
  if (!processHandle || processHandle.child.exitCode !== null || processHandle.child.signalCode !== null) return;
  if (process.platform === "win32") {
    // Next dev forks a server. Kill only this test-owned process tree.
    const killer = spawn("taskkill", ["/PID", String(processHandle.child.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
    await once(killer, "close");
  } else {
    processHandle.child.kill();
  }
  await processHandle.completed;
}

async function build(directory, env, children, context) {
  const started = Date.now();
  const snapshot = launch(directory, ["scripts/build-articles.mjs"], env, children);
  const prepared = await snapshot.completed;
  assert.equal(prepared.code, 0, `Article snapshot preparation failed:\n${prepared.output}`);
  // Webpack supports the shared node_modules junction outside the temporary app.
  const next = launch(directory, [path.join(directory, "node_modules/next/dist/bin/next"), "build", "--webpack"], env, children);
  const result = await next.completed;
  assert.equal(result.code, 0, `Production build failed:\n${result.output}`);
  context.diagnostic(`Production article build completed in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  return JSON.parse(await readFile(path.join(directory, ".next/prerender-manifest.json"), "utf8"));
}

async function start(directory, env, children, development = false) {
  const port = await freePort();
  const origin = `http://127.0.0.1:${port}`;
  const next = launch(directory, [path.join(directory, "node_modules/next/dist/bin/next"), ...(development ? ["dev", "--webpack"] : ["start"]), "--hostname", "127.0.0.1", "--port", String(port)], env, children);
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (next.child.exitCode !== null) break;
    try {
      const response = await fetch(`${origin}/about`, { signal: AbortSignal.timeout(500) });
      if (response.ok) return { ...next, origin };
    } catch {
      // The isolated production server is still starting.
    }
    await delay(100);
  }
  await stop(next);
  throw new Error(`Production article server failed to start:\n${next.output()}`);
}

async function assertRendered(origin, route, text) {
  const response = await fetch(`${origin}${route}`, { signal: AbortSignal.timeout(30_000) });
  assert.equal(response.status, 200, `${route} must render successfully`);
  const html = await response.text();
  assert.ok(html.includes(text), `${route} must contain ${JSON.stringify(text)}`);
  assert.ok(!html.includes(testKey), "Server-only API key must not be sent to visitors");
  return html;
}

test("builds every article beyond 200, serves without database reads, and refreshes content on rebuild", { timeout: 600_000 }, async (context) => {
  await mkdir(temporaryParent, { recursive: true });
  const directory = await mkdtemp(path.join(temporaryParent, tempPrefix));
  const children = new Set();
  const requests = [];
  let articles = fixtures(201, "initial");
  let readsAllowed = true;
  let running;
  const backend = createServer((request, response) => {
    requests.push({ method: request.method, url: request.url, key: request.headers["x-public-app-key"] });
    const url = new URL(request.url, "http://mock.test");
    const page = Number(url.searchParams.get("page"));
    const size = Number(url.searchParams.get("size"));
    const valid = request.method === "GET" && url.pathname === "/v1/public/articles" &&
      url.searchParams.get("host_site") === "explainit.tech" && size === 100 && Number.isInteger(page) && page > 0 &&
      request.headers["x-public-app-key"] === testKey;
    response.writeHead(readsAllowed && valid ? 200 : 503, { "Content-Type": "application/json" });
    response.end(JSON.stringify(readsAllowed && valid ? articlePage(articles, page, size) : { detail: "Mock content API is unavailable" }));
  });

  try {
    const backendPort = await listen(backend);
    const fontMock = await copyApplication(directory);
    const env = {
      ...process.env,
      NODE_ENV: "production",
      API_URL: `http://127.0.0.1:${backendPort}/v1`,
      PUBLIC_APP_KEY: testKey,
      NEXT_PUBLIC_API_URL: "",
      NEXT_PUBLIC_API_BASE_URL: "",
      NEXT_FONT_GOOGLE_MOCKED_RESPONSES: fontMock,
      NEXT_TELEMETRY_DISABLED: "1",
    };
    const firstManifest = await build(directory, env, children, context);
    assert.ok(requests.length > 0, "The build must fetch published articles from the API");
    assert.deepEqual(requests.map((request) => request.url), [1, 2, 3].map((page) => `/v1/public/articles?host_site=explainit.tech&page=${page}&size=100`), "Build must request each page exactly once");
    assert.ok(requests.every((request) => request.method === "GET" && request.key === testKey), "Build must authenticate every page request");
    for (const article of articles) {
      const route = firstManifest.routes[`/articles/${article.slug}`];
      assert.ok(route, `${article.slug} must be generated during the build`);
      assert.equal(route.initialRevalidateSeconds, false);
    }
    assert.equal(firstManifest.dynamicRoutes["/articles/[slug]"].fallback, false, "Unknown slugs must not render a fallback page");

    readsAllowed = false;
    const firstBuildRequestCount = requests.length;
    running = await start(directory, env, children);
    await assertRendered(running.origin, "/articles/article-201", "Snapshot initial content for article 201.");
    await assertRendered(running.origin, "/articles/article-1", "Snapshot initial content for article 1.");
    const home = await assertRendered(running.origin, "/", "Fixture article 201 initial");
    assert.ok(!home.includes("Snapshot initial content for article"), "Homepage client data must contain article summaries without full bodies");
    await assertRendered(running.origin, "/articles?category=Technology&q=Fixture", "Fixture article 201 initial");
    assert.equal((await fetch(`${running.origin}/articles/missing-article`)).status, 404);
    assert.equal(requests.length, firstBuildRequestCount, "Production article and home requests must not call the backend");
    await stop(running);
    running = undefined;

    // Keep the same origin/key and the entire .next/cache: only DB content changes.
    articles = fixtures(2, "updated");
    readsAllowed = true;
    const secondManifest = await build(directory, env, children, context);
    assert.ok(requests.length > firstBuildRequestCount, "A rebuild must fetch current database content despite the previous build cache");
    assert.ok(secondManifest.routes["/articles/article-1"]);
    assert.equal(secondManifest.routes["/articles/article-201"], undefined, "Removed articles must not survive the next build");
    readsAllowed = false;
    const secondBuildRequestCount = requests.length;
    running = await start(directory, env, children);
    const updated = await assertRendered(running.origin, "/articles/article-1", "Snapshot updated content for article 1.");
    assert.ok(!updated.includes("Snapshot initial content"), "A rebuild must replace stale article content");
    assert.ok(updated.includes("<title>Fixture article 1 updated"), "Article metadata must refresh with the content");
    await assertRendered(running.origin, "/", "Fixture article 2 updated");
    await assertRendered(running.origin, "/articles?category=Technology&q=Fixture", "Fixture article 2 updated");
    assert.equal((await fetch(`${running.origin}/articles/article-201`)).status, 404);
    assert.equal(requests.length, secondBuildRequestCount, "The rebuilt app must still render without database requests");
    await stop(running);
    running = undefined;

    // Reuse the isolated production artifacts to verify live contact writes and
    // runtime credentials still work after published reads move into the build.
    const contactTests = launch(directory, ["--test", "--test-isolation=none", "tests/contact-route.test.mjs"], env, children);
    const contactResult = await contactTests.completed;
    assert.equal(contactResult.code, 0, `Production contact regression tests failed:\n${contactResult.output}`);
    context.diagnostic("Production contact regression tests passed against the isolated build");

  } finally {
    await stop(running);
    for (const child of children) {
      await stop({ child, completed: once(child, "close") });
    }
    backend.closeAllConnections();
    await new Promise((resolve) => backend.close(resolve));
    await removeApplication(directory);
  }
});

test("development loads edits live and discovers new slugs after restarting", { timeout: 120_000 }, async () => {
  await mkdir(temporaryParent, { recursive: true });
  const directory = await mkdtemp(path.join(temporaryParent, tempPrefix));
  const children = new Set();
  let articles = fixtures(2, "development");
  let running;
  const backend = createServer((request, response) => {
    const url = new URL(request.url, "http://mock.test");
    const page = Number(url.searchParams.get("page"));
    const size = Number(url.searchParams.get("size"));
    const valid = request.method === "GET" && url.pathname === "/v1/public/articles" &&
      url.searchParams.get("host_site") === "explainit.tech" && size === 100 && Number.isInteger(page) && page > 0 &&
      request.headers["x-public-app-key"] === testKey;
    response.writeHead(valid ? 200 : 404, { "Content-Type": "application/json" });
    response.end(JSON.stringify(valid ? articlePage(articles, page, size) : { detail: "Unexpected mock API request" }));
  });
  try {
    const backendPort = await listen(backend);
    const fontMock = await copyApplication(directory);
    const env = {
      ...process.env,
      NODE_ENV: "development",
      API_URL: `http://127.0.0.1:${backendPort}/v1`,
      PUBLIC_APP_KEY: testKey,
      NEXT_PUBLIC_API_URL: "",
      NEXT_PUBLIC_API_BASE_URL: "",
      NEXT_FONT_GOOGLE_MOCKED_RESPONSES: fontMock,
      NEXT_TELEMETRY_DISABLED: "1",
    };
    const snapshot = launch(directory, ["scripts/build-articles.mjs", "--development"], env, children);
    const prepared = await snapshot.completed;
    assert.equal(prepared.code, 0, `Development snapshot preparation failed:\n${prepared.output}`);
    running = await start(directory, env, children, true);
    await assertRendered(running.origin, "/articles/article-1", "Snapshot development content for article 1.");
    articles = fixtures(3, "edited");
    await assertRendered(running.origin, "/articles/article-1", "Snapshot edited content for article 1.");
    assert.equal((await fetch(`${running.origin}/articles/article-3`)).status, 404, "Next dev caches generated paths until restart");
    await stop(running);
    running = await start(directory, env, children, true);
    await assertRendered(running.origin, "/articles/article-3", "Snapshot edited content for article 3.");
  } finally {
    await stop(running);
    for (const child of children) await stop({ child, completed: once(child, "close") });
    backend.closeAllConnections();
    await new Promise((resolve) => backend.close(resolve));
    await removeApplication(directory);
  }
});
