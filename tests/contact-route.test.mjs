import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { setTimeout as delay } from "node:timers/promises";
import { after, before, beforeEach, test } from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const appDirectory = fileURLToPath(new URL("../", import.meta.url));
const validMessage = { name: "Test Visitor", email: "visitor@example.com", message: "A contact form test." };
let backend;
let nextProcess;
let endpoint;
let reply;
let requests;

async function listen(server) {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return server.address().port;
}

async function post(payload, options = {}) {
  return fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...options.headers },
    body: options.rawBody ?? JSON.stringify(payload),
  });
}

before(async () => {
  backend = createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    requests.push({
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: JSON.parse(Buffer.concat(chunks).toString("utf8")),
    });
    response.writeHead(reply.status, { "Content-Type": "application/json" });
    response.end(reply.raw ?? JSON.stringify(reply.body));
  });
  const backendPort = await listen(backend);
  const portReservation = createServer();
  const appPort = await listen(portReservation);
  await new Promise((resolve) => portReservation.close(resolve));
  endpoint = `http://127.0.0.1:${appPort}/api/contact`;

  nextProcess = spawn(process.execPath, [
    fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url)),
    "start", "--hostname", "127.0.0.1", "--port", String(appPort),
  ], {
    cwd: appDirectory,
    windowsHide: true,
    env: {
      ...process.env,
      API_URL: `http://127.0.0.1:${backendPort}/v1`,
      PUBLIC_APP_KEY: "contact-test-key",
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let startupOutput = "";
  for (const stream of [nextProcess.stdout, nextProcess.stderr]) {
    stream.on("data", (chunk) => { startupOutput = (startupOutput + chunk).slice(-2000); });
  }
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (nextProcess.exitCode !== null) break;
    try {
      if ((await fetch(endpoint, { signal: AbortSignal.timeout(500) })).status === 405) return;
    } catch {
      // Wait for the isolated production server to become ready.
    }
    await delay(100);
  }
  throw new Error(`Contact test server failed to start. Run npm run build first.\n${startupOutput}`);
}, { timeout: 20_000 });

beforeEach(() => {
  requests = [];
  reply = { status: 200, body: { status: true, message: "Provider accepted the message." } };
});

after(async () => {
  if (nextProcess && nextProcess.exitCode === null) {
    const exited = once(nextProcess, "exit");
    nextProcess.kill();
    await exited;
  }
  if (backend) {
    backend.closeAllConnections();
    await new Promise((resolve) => backend.close(resolve));
  }
});

test("forwards trimmed fields using the server-only app key and fixed host", async () => {
  const response = await post({
    name: "  Test Visitor  ", email: "  visitor@example.com  ", message: "  A contact form test.  ",
    recipient: "attacker@example.com", host_site: "another.example.com",
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: true, message: "Your message has been submitted." });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].method, "POST");
  assert.equal(requests[0].url, "/v1/public/contact?host_site=explainit.tech");
  assert.equal(requests[0].headers["x-public-app-key"], "contact-test-key");
  assert.deepEqual(requests[0].body, validMessage);
});

test("forwards a subject and bounded source attribution without private URL parameters", async () => {
  const response = await post({
    ...validMessage,
    subject: "  Consulting enquiry  ",
    landing_page: "  https://explainit.tech/articles/start?token=PRIVATE&utm_source=newsletter#private  ",
    referrer: "  https://example.com/guide?email=PRIVATE#private  ",
    utm_source: " newsletter ", utm_medium: "email", utm_campaign: "consulting",
    utm_term: "automation", utm_content: "footer", website: "",
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: true, message: "Your message has been submitted." });
  assert.deepEqual(requests[0].body, {
    ...validMessage, subject: "Consulting enquiry",
    landing_page: "https://explainit.tech/articles/start", referrer: "https://example.com/guide",
    utm_source: "newsletter", utm_medium: "email", utm_campaign: "consulting",
    utm_term: "automation", utm_content: "footer",
  });
  assert.equal(JSON.stringify(requests[0].body).includes("PRIVATE"), false);
});

test("keeps subject and attribution optional for existing clients", async () => {
  const response = await post({
    ...validMessage, subject: null, landing_page: "", referrer: null,
    utm_source: " ", utm_campaign: null, website: null,
  });
  assert.equal(response.status, 200);
  assert.deepEqual(requests[0].body, validMessage);
});

test("rejects malformed or oversized metadata without contacting the backend", async () => {
  for (const metadata of [
    { subject: 123 }, { subject: "a".repeat(201) }, { subject: "Header\r\nInjected" },
    { landing_page: "javascript:alert(1)" }, { landing_page: "/contact" },
    { landing_page: "https://user:password@example.com/" },
    { landing_page: "https://example.com/a b" },
    { landing_page: "https://example.com/\\private" },
    { referrer: "https://example.com/a\u0085b" },
    { landing_page: "https://example.com/" + "a".repeat(2048) },
    { referrer: {} }, { referrer: "https://example.com/\n" }, { referrer: "ftp://example.com/" },
    { utm_source: [] }, { utm_medium: "a".repeat(201) }, { utm_campaign: "line\nline" },
    { utm_term: "\u0000" }, { utm_content: "\u007f" },
  ]) {
    assert.equal((await post({ ...validMessage, ...metadata })).status, 422);
  }
  assert.equal(requests.length, 0);
});

test("rejects filled or malformed honeypots before contacting the backend", async () => {
  for (const website of ["https://spam.example.com", " ", "a".repeat(201), 123, {}, []]) {
    assert.equal((await post({ ...validMessage, website })).status, 422);
  }
  assert.equal(requests.length, 0);
});

test("captures the first session landing page and campaign when navigating to contact", async () => {
  const source = await readFile(new URL("../src/lib/contact-attribution.ts", import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2017, module: ts.ModuleKind.ESNext },
  });
  const { getContactAttribution } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
  const savedWindow = globalThis.window;
  const savedDocument = globalThis.document;
  const storage = new Map();
  try {
    globalThis.window = {
      location: { href: "https://explainit.tech/articles/first?utm_source=newsletter&utm_campaign=consulting&token=PRIVATE#private" },
      sessionStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    };
    globalThis.document = { referrer: "https://example.com/start?email=PRIVATE#private" };
    const expected = {
      landing_page: "https://explainit.tech/articles/first", referrer: "https://example.com/start",
      utm_source: "newsletter", utm_campaign: "consulting",
    };
    assert.deepEqual(getContactAttribution(), expected);
    globalThis.window.location.href = "https://explainit.tech/contact?utm_source=changed";
    assert.deepEqual(getContactAttribution(), expected);
    assert.equal([...storage.values()].join("").includes("PRIVATE"), false);
    const reloaded = await import(`data:text/javascript;base64,${Buffer.from(outputText + "\n// session reload").toString("base64")}`);
    assert.deepEqual(reloaded.getContactAttribution(), expected);
  } finally {
    if (savedWindow === undefined) delete globalThis.window;
    else globalThis.window = savedWindow;
    if (savedDocument === undefined) delete globalThis.document;
    else globalThis.document = savedDocument;
  }
});

test("rejects malformed and non-object JSON without contacting the backend", async () => {
  for (const rawBody of ["{", "", "null", "[]", '"a string"']) {
    const response = await post(null, { rawBody });
    assert.equal(response.status, 400);
  }
  assert.equal(requests.length, 0);
});

test("forwards a normalized phone number including its country code", async () => {
  const response = await post({ ...validMessage, phone: " +91 (98765) 43210 " });
  assert.equal(response.status, 200);
  assert.deepEqual(requests[0].body, { ...validMessage, phone: "+919876543210" });
});

test("validates national numbers against different selected country codes", async () => {
  for (const [country_code, phone, normalized] of [
    ["+91", "9876543210", "+919876543210"],
    ["+1", "2025550198", "+12025550198"],
    ["+1", "6045550123", "+16045550123"],
    ["+44", "02079460018", "+442079460018"],
    ["+971", "0501234567", "+971501234567"],
    ["+61", "0412345678", "+61412345678"],
    ["+65", "81234567", "+6581234567"],
    ["+49", "030123456", "+4930123456"],
    ["+33", "0123456789", "+33123456789"],
    ["+966", "0512345678", "+966512345678"],
    ["+27", "0821234567", "+27821234567"],
    ["+39", "0612345678", "+390612345678"],
    ["+1", "+12025550198", "+12025550198"],
  ]) {
    assert.equal((await post({ ...validMessage, country_code, phone })).status, 200);
    assert.deepEqual(requests.at(-1).body, { ...validMessage, phone: normalized });
  }
});

test("rejects invalid country rules and country-code mismatches before forwarding", async () => {
  for (const [country_code, phone] of [
    ["+91", "987654321"], ["+91", "98765432100"], ["+91", "0000000000"],
    ["+1", "1234567890"], ["+1", "202555019"], ["+65", "8123456789"],
    ["+971", "123456789"], ["+999", "9876543210"], ["India", "9876543210"],
    ["+91", "+12025550198"], ["+1", "+919876543210"],
    ["+91", "98765abc10"], ["+91", "9876543210 ext 1"],
    [91, "+919876543210"], [null, "+919876543210"],
  ]) {
    assert.equal((await post({ ...validMessage, country_code, phone })).status, 422);
  }
  assert.equal(requests.length, 0);
});

test("keeps the phone field optional", async () => {
  for (const phone of [null, "", "   "]) {
    assert.equal((await post({ ...validMessage, phone })).status, 200);
    assert.deepEqual(requests.at(-1).body, validMessage);
  }
});

test("rejects malformed international phone numbers before contacting the backend", async () => {
  for (const phone of [
    919876543210, {}, "9876543210", "+01234567", "+123456", "+1234567890123456",
    "+91 98765 ext123", "+91+9876543210", "+91\n9876543210", "\n+919876543210", "\t",
    "(+1)2025550198", "--+12025550198",
    "+999123456789", "+11234567890", "+91987654321", "+9198765432100",
    "+١٢٣٤٥٦٧٨٩", "+" + " ".repeat(40),
  ]) {
    assert.equal((await post({ ...validMessage, phone })).status, 422);
  }
  assert.equal(requests.length, 0);
});

test("rejects invalid or oversized fields without contacting the backend", async () => {
  for (const payload of [
    {}, { ...validMessage, name: 123 }, { ...validMessage, name: " " },
    { ...validMessage, name: "a".repeat(81) }, { ...validMessage, name: "Visitor\r\nInjected" },
    { ...validMessage, name: "Visitor\u0000Injected" },
    { ...validMessage, email: "not-an-email" }, { ...validMessage, message: " " },
    { ...validMessage, message: "a".repeat(5001) },
    { ...validMessage, message: "A question\u0000Injected" },
  ]) {
    assert.equal((await post(payload)).status, 422);
  }
  assert.equal(requests.length, 0);
});

test("bounds request bytes including irrelevant fields", async () => {
  assert.equal((await post({ ...validMessage, extra: "a".repeat(24_000) })).status, 413);
  assert.equal(requests.length, 0);
});

test("requires JSON content type", async () => {
  assert.equal((await post(validMessage, { headers: { "Content-Type": "text/plain" } })).status, 415);
  assert.equal(requests.length, 0);
});

test("never treats malformed backend success responses as accepted messages", async () => {
  for (const body of [null, {}, { status: false }, { status: "true" }]) {
    reply = { status: 200, body };
    const response = await post(validMessage);
    assert.equal(response.status, 502);
    assert.equal((await response.json()).status, undefined);
  }
  reply = { status: 200, raw: "not-json" };
  assert.equal((await post(validMessage)).status, 502);
});

test("preserves safe failure statuses without leaking backend details", async () => {
  for (const [upstreamStatus, expectedStatus] of [
    [401, 503], [403, 503], [422, 422], [429, 429], [500, 503], [502, 502], [503, 503], [504, 504],
  ]) {
    reply = { status: upstreamStatus, body: { detail: "PRIVATE_PROVIDER_OR_CONFIG_ERROR" } };
    const response = await post(validMessage);
    assert.equal(response.status, expectedStatus);
    assert.equal((await response.text()).includes("PRIVATE_PROVIDER_OR_CONFIG_ERROR"), false);
  }
});

test("production Contact page exposes the form without the backend key", async () => {
  const response = await fetch(endpoint.replace("/api/contact", "/contact"));
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.ok(html.includes('mailto:core@explainit.tech'));
  assert.ok(html.includes('name="message"'));
  assert.ok(html.includes('name="phone"'));
  assert.ok(html.includes('name="subject"'));
  assert.ok(html.includes('name="website"'));
  assert.ok(html.includes('aria-label="Country code"'));
  assert.ok(html.includes('id="contact-country-code"'));
  assert.ok(html.includes('role="combobox"'));
  assert.ok(html.includes('aria-expanded="false"'));
  assert.ok(html.includes('inputMode="numeric"'));
  assert.ok(html.includes('pattern="[0-9]*"'));
  assert.ok(html.includes("Send Message"));
  assert.equal(html.includes("This form is currently unavailable"), false);
  assert.equal(html.includes("contact-test-key"), false);
});
