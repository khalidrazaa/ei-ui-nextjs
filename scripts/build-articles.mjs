import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import { loadArticlePages } from "../src/lib/article-pages.mjs";

const articleFields = [
  "id", "title", "slug", "seo_title", "category", "subcategory", "status",
  "created_at", "updated_at", "published_at", "drafted_at", "content", "excerpt",
  "reading_time", "tags", "keywords", "host_site", "language", "meta_description",
  "canonical_url", "schema_type", "open_graph_title", "open_graph_description",
  "open_graph_image", "featured_image_url", "image_alt_text", "is_featured",
];

function normalizeHost(value) {
  return String(value || "").trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0].replace(/^www\./, "");
}

export function preparePublishedArticles(response, hostSite) {
  if (!Array.isArray(response)) throw new Error("Invalid public article list response.");
  if (response.some((article) => !article || typeof article !== "object" ||
      !["published", "draft"].includes(article.status) || typeof article.host_site !== "string" || !normalizeHost(article.host_site))) {
    throw new Error("Invalid public article status or host in the API response.");
  }

  const slugs = new Set();
  return response.filter((article) => article && article.status === "published" && normalizeHost(article.host_site) === normalizeHost(hostSite))
    .map((article) => {
      if (!Number.isInteger(article.id) || typeof article.title !== "string" || !article.title.trim() ||
          typeof article.slug !== "string" || !article.slug.trim() || article.slug !== article.slug.trim() ||
          article.slug.includes("/") || slugs.has(article.slug) ||
          !(typeof article.content === "string" || article.content === null)) {
        throw new Error("The public article API returned invalid content or a duplicate slug.");
      }
      slugs.add(article.slug);
      // Only public article fields belong in the app; never persist credentials
      // or unrelated properties from an upstream response.
      return Object.fromEntries(articleFields.filter((field) => Object.hasOwn(article, field))
        .map((field) => [field, article[field]]));
    });
}

export async function buildArticleSnapshot() {
  const appDirectory = fileURLToPath(new URL("../", import.meta.url));
  nextEnv.loadEnvConfig(appDirectory, process.argv.includes("--development"));
  const { hostSite } = JSON.parse(await readFile(new URL("../src/config/public-content.json", import.meta.url), "utf8"));
  const apiUrl = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/$/, "");
  const appKey = (process.env.PUBLIC_APP_KEY || "").trim();
  if (!apiUrl || !appKey) throw new Error("API_URL and PUBLIC_APP_KEY are required to build published article pages.");

  const response = await loadArticlePages(async (page, size) => {
    const url = new URL(`${apiUrl}/public/articles`);
    url.searchParams.set("host_site", normalizeHost(hostSite));
    url.searchParams.set("page", String(page));
    url.searchParams.set("size", String(size));
    let result;
    try {
      result = await fetch(url, {
        headers: { "X-Public-App-Key": appKey, "Accept": "application/json" },
        signal: AbortSignal.timeout(60_000),
      });
    } catch {
      throw new Error("Unable to reach the published article API. Ensure API_URL is reachable from the build environment.");
    }
    if (!result.ok) throw new Error(`Unable to load published articles for the build (HTTP ${result.status}).`);
    return result.json();
  });
  const articles = preparePublishedArticles(response, hostSite);

  const outputPath = fileURLToPath(new URL("../src/generated/published-articles.json", import.meta.url));
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(`${outputPath}.tmp`, `${JSON.stringify(articles)}\n`, "utf8");
  await rename(`${outputPath}.tmp`, outputPath);
  console.log(`Prepared ${articles.length} published articles for ${normalizeHost(hostSite)}.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await buildArticleSnapshot();
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Unable to build article pages.");
    process.exitCode = 1;
  }
}
