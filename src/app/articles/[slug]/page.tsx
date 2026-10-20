import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ArticleBody from "@/components/articles/ArticleBody";
import ArticleCover from "@/components/articles/ArticleCover";
import ArticleHeader from "@/components/articles/ArticleHeader";
import ArticleNav from "@/components/articles/ArticleNav";
import AuthorBox from "@/components/articles/AuthorBox";
import CommentSection from "@/components/articles/CommentSection";
import InlineContents from "@/components/articles/InlineContents";
import ReadingProgress from "@/components/articles/ReadingProgress";
import ShareButtons from "@/components/articles/ShareButtons";
import TableOfContents from "@/components/articles/TableOfContents";
import ArticleRail from "@/components/home/ArticleRail";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";
import { getArticleBySlug, getCommentsForSlug, getPublishedArticles } from "@/lib/articles";
import { extractHeadings } from "@/lib/headings";
import { articleUrl } from "@/lib/share";
import { Article } from "@/types/article";

const FETCH_LIMIT = 200;
const RELATED_LIMIT = 6;

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article Not Found",
      description: siteConfig.description,
    };
  }

  const description = article.meta_description || article.excerpt || siteConfig.description;
  const image = article.open_graph_image || article.featured_image_url;

  return {
    title: article.seo_title || article.title,
    description,
    alternates: { canonical: article.canonical_url || `/articles/${slug}` },
    openGraph: {
      title: article.open_graph_title || article.title,
      description: article.open_graph_description || description,
      type: "article",
      url: articleUrl(slug),
      publishedTime: article.published_at || undefined,
      authors: [siteConfig.author.name],
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: article.open_graph_title || article.title,
      description,
    },
  };
}

/** schema.org Article markup for search engines. */
function structuredData(article: Article, slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": article.schema_type || "Article",
    headline: article.title,
    description: article.meta_description || article.excerpt || undefined,
    image: article.featured_image_url || article.open_graph_image || undefined,
    datePublished: article.published_at || article.created_at || undefined,
    dateModified: article.updated_at || article.published_at || undefined,
    keywords: (article.keywords || []).join(", ") || undefined,
    author: { "@type": "Person", name: siteConfig.author.name },
    publisher: { "@type": "Organization", name: siteConfig.brandName, url: `https://${siteConfig.domain}` },
    mainEntityOfPage: articleUrl(slug),
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const [comments, { articles }] = await Promise.all([
    getCommentsForSlug(slug),
    getPublishedArticles(FETCH_LIMIT),
  ]);

  // The list is newest first: the previous index is newer, the next is older.
  const position = articles.findIndex((item) => item.slug === slug);
  const newer = position > 0 ? articles[position - 1] : null;
  const older = position >= 0 && position < articles.length - 1 ? articles[position + 1] : null;

  // Same category first, then the rest, never the current article.
  const others = articles.filter((item) => item.slug !== slug);
  const related = [
    ...others.filter((item) => item.category && item.category === article.category),
    ...others.filter((item) => !item.category || item.category !== article.category),
  ].slice(0, RELATED_LIMIT);

  const headings = article.content ? extractHeadings(article.content) : [];
  const tags = article.tags || [];
  const ld = JSON.stringify(structuredData(article, slug)).replace(/</g, "\\u003c");

  return (
    <>
      <ReadingProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />

      <article className="flex flex-col gap-8">
        <ArticleHeader article={article} />

        <ArticleCover article={article} className="aspect-[3/1] rounded-2xl border border-border" />

        <div className="grid gap-8 lg:grid-cols-[2.5rem_minmax(0,48rem)_15rem] lg:justify-between lg:gap-8">
          <aside className="hidden lg:block" aria-label="Share">
            <div className="sticky top-[calc(var(--header-height)+1.5rem)]">
              <ShareButtons slug={slug} title={article.title} direction="column" />
            </div>
          </aside>

          <div className="flex min-w-0 flex-col gap-8">
            <InlineContents headings={headings} />

            {article.content && <ArticleBody content={article.content} title={article.title} />}

            {tags.length > 0 && (
              <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
                {tags.map((tag) => (
                  <li key={`${article.id}-${tag}`}>
                    <Badge variant="secondary">{tag}</Badge>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex items-center gap-3 lg:hidden">
              <span className="text-sm text-muted-foreground">Share</span>
              <ShareButtons slug={slug} title={article.title} />
            </div>

            <AuthorBox />
            <ArticleNav newer={newer} older={older} />
            <CommentSection key={slug} slug={slug} initialComments={comments} />
          </div>

          <aside className="hidden lg:block" aria-label="Table of contents">
            <div className="sticky top-[calc(var(--header-height)+1.5rem)]">
              <TableOfContents headings={headings} />
            </div>
          </aside>
        </div>
      </article>

      <div className="mt-14">
        <ArticleRail
          id="keep-reading-title"
          title="Keep reading"
          description={article.category ? `More from ${article.category} and beyond.` : undefined}
          articles={related}
          action={{ href: "/articles", label: "All articles" }}
        />
      </div>
    </>
  );
}
