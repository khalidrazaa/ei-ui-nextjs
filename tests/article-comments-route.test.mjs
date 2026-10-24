import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { NextRequest, NextResponse } from "next/server.js";
import ts from "typescript";

const comment = {
  id: 1,
  article_id: 10,
  host_site: "explainit.tech",
  author_name: "Reader",
  content: "A thoughtful comment.",
  created_at: "2026-10-24T00:00:00Z",
};

async function loadRoute(articles) {
  const source = await readFile(new URL("../src/app/article-comments/route.ts", import.meta.url), "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const context = {
    exports: {},
    require(name) {
      if (name === "next/server") return { NextResponse };
      if (name === "@/lib/articles") return articles;
      throw new Error(`Unexpected import: ${name}`);
    },
  };
  vm.runInNewContext(code, context);
  return context.exports;
}

function request(payload) {
  return new NextRequest("https://explainit.tech/article-comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

test("loads current comments outside the production /api proxy path and disables caching", async () => {
  const slugs = [];
  const route = await loadRoute({ getCommentsForSlug: async (slug) => { slugs.push(slug); return [comment]; } });
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await route.GET(new NextRequest("https://explainit.tech/article-comments?slug=example"));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual(await response.json(), [comment]);
  }
  assert.deepEqual(slugs, ["example", "example"]);
  assert.equal(route.dynamic, "force-dynamic");
});

test("rejects missing slugs before calling the database API", async () => {
  const route = await loadRoute({ getCommentsForSlug: () => assert.fail("Must not fetch comments") });
  const response = await route.GET(new NextRequest("https://explainit.tech/article-comments?slug=%20"));
  assert.equal(response.status, 400);
});

test("continues saving comments through the existing database API", async () => {
  const calls = [];
  const route = await loadRoute({ createCommentForSlug: async (...args) => { calls.push(args); return comment; } });
  const response = await route.POST(request({ slug: " example ", author_name: " Reader ", content: " A thoughtful comment. " }));
  assert.equal(response.status, 201);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), comment);
  assert.equal(calls[0][0], "example");
  assert.deepEqual(JSON.parse(JSON.stringify(calls[0][1])), { author_name: "Reader", content: "A thoughtful comment." });
});

test("rejects malformed and oversized comments before writing", async () => {
  const route = await loadRoute({ createCommentForSlug: () => assert.fail("Must not save invalid comments") });
  for (const payload of [null, [], {}, { slug: "example", author_name: {}, content: "Hello" },
    { slug: "example", author_name: "R".repeat(81), content: "Hello" },
    { slug: "example", author_name: "Reader", content: "x".repeat(2001) }]) {
    assert.equal((await route.POST(request(payload))).status, 400);
  }
  const malformed = new NextRequest("https://explainit.tech/article-comments", { method: "POST", body: "{" });
  assert.equal((await route.POST(malformed)).status, 400);
});

test("returns safe errors when comment reads or saves fail", async () => {
  const fail = () => { throw new Error("Sensitive backend error"); };
  const route = await loadRoute({ getCommentsForSlug: fail, createCommentForSlug: fail });
  const read = await route.GET(new NextRequest("https://explainit.tech/article-comments?slug=example"));
  const write = await route.POST(request({ slug: "example", author_name: "Reader", content: "Hello" }));
  assert.equal(read.status, 500);
  assert.equal(write.status, 500);
  assert.deepEqual(await read.json(), { detail: "Unable to load comments" });
  assert.deepEqual(await write.json(), { detail: "Unable to create comment" });
});

test("does not expose malformed backend success responses to the comment UI", async () => {
  const route = await loadRoute({ getCommentsForSlug: async () => [null], createCommentForSlug: async () => ({}) });
  assert.equal((await route.GET(new NextRequest("https://explainit.tech/article-comments?slug=example"))).status, 500);
  assert.equal((await route.POST(request({ slug: "example", author_name: "Reader", content: "Hello" }))).status, 500);
});
