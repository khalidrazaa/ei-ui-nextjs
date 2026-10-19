import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ArticleMeta from "@/components/common/ArticleMeta";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ArticleBody from "@/components/articles/ArticleBody";
import ArticleCard from "@/components/articles/ArticleCard";
import ArticleCover from "@/components/articles/ArticleCover";
import ReadingProgress from "@/components/articles/ReadingProgress";
import TableOfContents from "@/components/articles/TableOfContents";
import Breadcrumbs, { type Crumb } from "@/components/common/Breadcrumbs";
import CopyLinkButton from "@/components/common/CopyLinkButton";
import CommentSection from "@/components/articles/CommentSection";
import { siteConfig } from "@/config/site";
import { getArticleBySlug, getCommentsForSlug, getRelatedArticles } from "@/lib/articles";
import { formatDate, formatReadingTime } from "@/lib/format";
import { extractHeadings } from "@/lib/headings";

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

  return {
    title: article.seo_title || article.title,
    description,
    openGraph: {
      title: article.open_graph_title || article.title,
      description: article.open_graph_description || description,
      type: "article",
      images: article.open_graph_image ? [{ url: article.open_graph_image }] : undefined,
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();
  const [comments, related] = await Promise.all([
    getCommentsForSlug(slug),
    getRelatedArticles(slug, 4),
  ]);
  const headings = article.content ? extractHeadings(article.content) : [];
  const published = formatDate(article.published_at || article.created_at);
  const crumbs: Crumb[] = [
    { label: "Articles", href: "/articles" },
    ...(article.category ? [{ label: article.category }] : []),
    { label: article.title },
  ];

  return (
    <>
      <ReadingProgress />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_13rem]">
        <article className="flex min-w-0 max-w-2xl flex-col gap-6">
          <header className="flex flex-col gap-3">
            <Breadcrumbs items={crumbs} />

            <div className="flex flex-wrap items-center gap-2">
              {article.category && <Badge variant="secondary">{article.category}</Badge>}
              {article.subcategory && <Badge variant="outline">{article.subcategory}</Badge>}
            </div>

            <h1 className="text-balance text-3xl sm:text-4xl">{article.title}</h1>
            {(article.excerpt || article.meta_description) && (
              <p className="text-base text-muted-foreground sm:text-lg">
                {article.excerpt || article.meta_description}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-y border-border py-2.5">
              <ArticleMeta
                className="text-sm text-muted-foreground"
                date={published}
                readingTime={formatReadingTime(article.reading_time)}
              />
              <CopyLinkButton />
            </div>
          </header>

          <ArticleCover article={article} className="aspect-[3/1] rounded-xl border border-border" />

          {article.content && <ArticleBody content={article.content} title={article.title} />}

          {(article.tags || []).length > 0 && (
            <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
              {(article.tags || []).map((tag) => (
                <li key={`${article.id}-${tag}`}>
                  <Badge variant="secondary">{tag}</Badge>
                </li>
              ))}
            </ul>
          )}

          <Separator />

          <CommentSection key={slug} slug={slug} initialComments={comments} />
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--header-height)+1.25rem)]">
            <TableOfContents headings={headings} />
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-10 flex flex-col gap-3" aria-labelledby="related-title">
          <h2 id="related-title">Related reads</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.slice(0, 3).map((item) => (
              <li key={item.id}>
                <ArticleCard article={item} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
