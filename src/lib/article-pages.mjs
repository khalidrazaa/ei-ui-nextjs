export const PUBLIC_ARTICLES_PAGE_SIZE = 100;

/**
 * Read every reported page with bounded API requests. Reject incomplete pages
 * and detected overlaps before a build generates its published routes.
 * @param {(page: number, size: number) => Promise<any>} fetchPage
 */
export async function loadArticlePages(fetchPage) {
  const articles = [];
  const ids = new Set();
  const slugs = new Set();
  let total;
  let pages;

  for (let page = 1; ; page += 1) {
    const response = await fetchPage(page, PUBLIC_ARTICLES_PAGE_SIZE);
    if (!response || Array.isArray(response) || !Array.isArray(response.items) ||
        !Number.isSafeInteger(response.total) || response.total < 0 ||
        response.page !== page || response.size !== PUBLIC_ARTICLES_PAGE_SIZE ||
        response.total_pages !== Math.ceil(response.total / PUBLIC_ARTICLES_PAGE_SIZE) ||
        response.has_next !== (page < response.total_pages) ||
        response.has_previous !== (page > 1)) {
      throw new Error("Invalid paginated public article response. Deploy the paginated backend before building the site.");
    }
    if (total === undefined) {
      total = response.total;
      pages = response.total_pages;
    } else if (response.total !== total || response.total_pages !== pages) {
      throw new Error("Published articles changed while loading pages. Retry to build a consistent snapshot.");
    }
    const expectedCount = Math.min(PUBLIC_ARTICLES_PAGE_SIZE, total - (page - 1) * PUBLIC_ARTICLES_PAGE_SIZE);
    if (response.items.length !== expectedCount) {
      throw new Error("The public article API returned an incomplete page. Retry to build a complete snapshot.");
    }
    for (const article of response.items) {
      if (!article || !Number.isSafeInteger(article.id) || article.id < 1 ||
          typeof article.slug !== "string" || !article.slug.trim() ||
          ids.has(article.id) || slugs.has(article.slug)) {
        throw new Error("The public article API returned an invalid article or duplicate across pages. Retry the build.");
      }
      ids.add(article.id);
      slugs.add(article.slug);
      articles.push(article);
    }
    if (!response.has_next) return articles;
  }
}
