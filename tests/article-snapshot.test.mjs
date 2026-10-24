import assert from "node:assert/strict";
import test from "node:test";
import { preparePublishedArticles } from "../scripts/build-articles.mjs";

const hostSite = "explainit.tech";
const article = (id, overrides = {}) => ({
  id,
  slug: `article-${id}`,
  title: `Article ${id}`,
  status: "published",
  host_site: hostSite,
  content: `Content ${id}`,
  ...overrides,
});

test("includes older published articles beyond the previous 200-record limit", () => {
  const articles = preparePublishedArticles(Array.from({ length: 201 }, (_, index) => article(index + 1)), hostSite);
  assert.equal(articles.length, 201);
  assert.equal(articles[200].slug, "article-201");
});

test("bundles only published content for this host and only public schema fields", () => {
  const articles = preparePublishedArticles([
    article(1, { host_site: "https://www.explainit.tech/", private_field: "DO_NOT_BUNDLE" }),
    article(2, { status: "draft" }),
    article(3, { host_site: "another.example.com" }),
  ], hostSite);
  assert.equal(articles.length, 1);
  assert.equal(articles[0].slug, "article-1");
  assert.equal(JSON.stringify(articles).includes("DO_NOT_BUNDLE"), false);
});

test("fails at the backend cap instead of silently dropping published pages", () => {
  assert.throws(() => preparePublishedArticles(Array.from({ length: 500 }, (_, index) => article(index + 1)), hostSite), /pagination/);
});

test("rejects malformed responses, duplicate slugs and missing article bodies", () => {
  for (const response of [
    {}, null, [null], [article(1, { status: undefined })], [article(1, { host_site: undefined })],
    [article(1), article(2, { slug: "article-1" })],
    [article(1, { slug: "" })], [article(1, { slug: "has/slash" })],
    [article(1, { content: undefined })], [article(1, { title: "" })],
  ]) {
    assert.throws(() => preparePublishedArticles(response, hostSite), /Invalid|invalid|duplicate/);
  }
});

test("supports an empty site and preserves content and SEO metadata", () => {
  assert.deepEqual(preparePublishedArticles([], hostSite), []);
  const input = article(1, { seo_title: "SEO title", meta_description: "Description", tags: ["React"] });
  assert.deepEqual(preparePublishedArticles([input], hostSite), [input]);
});
