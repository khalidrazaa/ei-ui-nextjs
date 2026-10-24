import assert from "node:assert/strict";
import test from "node:test";
import { preparePublishedArticles } from "../scripts/build-articles.mjs";
import { loadArticlePages, PUBLIC_ARTICLES_PAGE_SIZE } from "../src/lib/article-pages.mjs";

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

test("prepares snapshots beyond the previous 500-article cap", () => {
  const articles = preparePublishedArticles(Array.from({ length: 501 }, (_, index) => article(index + 1)), hostSite);
  assert.equal(articles.length, 501);
  assert.equal(articles[500].slug, "article-501");
});

function articlePage(articles, page, size = PUBLIC_ARTICLES_PAGE_SIZE) {
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

test("fetches all 501 published articles in six bounded requests", async () => {
  const articles = Array.from({ length: 501 }, (_, index) => article(index + 1));
  const requests = [];
  const loaded = await loadArticlePages(async (page, size) => {
    requests.push({ page, size });
    return articlePage(articles, page, size);
  });
  assert.deepEqual(loaded, articles);
  assert.deepEqual(requests, Array.from({ length: 6 }, (_, index) => ({ page: index + 1, size: 100 })));
});

test("stops after a full final page and supports an empty site", async () => {
  for (const count of [0, 100, 200]) {
    const articles = Array.from({ length: count }, (_, index) => article(index + 1));
    let requests = 0;
    assert.deepEqual(await loadArticlePages(async (page, size) => {
      requests += 1;
      return articlePage(articles, page, size);
    }), articles);
    assert.equal(requests, Math.max(1, count / 100));
  }
});

test("rejects legacy lists and inconsistent pagination before silently dropping articles", async () => {
  const articles = Array.from({ length: 101 }, (_, index) => article(index + 1));
  for (const change of [
    () => articles,
    (response) => ({ ...response, page: 2 }),
    (response) => ({ ...response, size: 500 }),
    (response) => ({ ...response, total: -1 }),
    (response) => ({ ...response, total_pages: 1 }),
    (response) => ({ ...response, has_next: false }),
    (response) => ({ ...response, has_previous: true }),
    (response) => ({ ...response, items: response.items.slice(1) }),
  ]) {
    let requests = 0;
    await assert.rejects(loadArticlePages(async (page, size) => {
      requests += 1;
      return change(articlePage(articles, page, size));
    }), /Invalid|incomplete/);
    assert.equal(requests, 1);
  }
});

test("rejects changing totals and duplicate IDs or slugs between pages", async () => {
  const articles = Array.from({ length: 101 }, (_, index) => article(index + 1));
  for (const change of [
    (response) => ({ ...response, total: 102 }),
    (response) => ({ ...response, items: [article(1, { slug: "different-slug" })] }),
    (response) => ({ ...response, items: [article(101, { slug: "article-1" })] }),
  ]) {
    let requests = 0;
    await assert.rejects(loadArticlePages(async (page, size) => {
      requests += 1;
      const response = articlePage(articles, page, size);
      return page === 2 ? change(response) : response;
    }), /changed|duplicate/);
    assert.equal(requests, 2);
  }
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
