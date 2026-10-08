import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:http";
import { setTimeout as delay } from "node:timers/promises";
import { after, before, beforeEach, test } from "node:test";
import { fileURLToPath } from "node:url";

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
    { ...validMessage, email: "not-an-email" }, { ...validMessage, message: " " },
    { ...validMessage, message: "a".repeat(5001) },
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
