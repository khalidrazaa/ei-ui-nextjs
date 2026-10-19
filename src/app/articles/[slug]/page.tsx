import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import ArticleMeta from "@/components/common/ArticleMeta";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ArticleBody from "@/components/articles/ArticleBody";
import CommentSection from "@/components/articles/CommentSection";
import { siteConfig } from "@/config/site";
import { getArticleBySlug, getCommentsForSlug, getRelatedArticles } from "@/lib/articles";
import { articlePath, formatDate, formatReadingTime } from "@/lib/format";

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
  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-8">
      <header className="flex flex-col gap-4">
        {(article.category || article.subcategory) && (
          <p className="text-sm font-medium text-primary">
            {[article.category, article.subcategory].filter(Boolean).join(" › ")}
          </p>
        )}

        <h1 className="text-balance text-4xl sm:text-5xl">{article.title}</h1>
        {(article.excerpt || article.meta_description) && (
          <p className="text-lg text-muted-foreground">{article.excerpt || article.meta_description}</p>
        )}

        <ArticleMeta
          className="text-sm text-muted-foreground"
          date={formatDate(article.published_at || article.created_at)}
          readingTime={formatReadingTime(article.reading_time)}
        />
      </header>

      {article.featured_image_url && (
        <Image
          src={article.featured_image_url}
          alt={article.image_alt_text || article.title}
          width={1200}
          height={680}
          className="w-full rounded-xl border border-border object-cover"
          unoptimized
        />
      )}

      {article.content && <ArticleBody content={article.content} title={article.title} />}

      {(article.tags || []).length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Tags">
          {(article.tags || []).map((tag) => (
            <li key={`${article.id}-${tag}`}>
              <Badge variant="secondary">{tag}</Badge>
            </li>
          ))}
        </ul>
      )}

      <Separator />

      <CommentSection key={slug} slug={slug} initialComments={comments} />

      {related.length > 0 && (
        <section className="flex flex-col gap-4" aria-labelledby="related-title">
          <h2 id="related-title">Related reads</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {related.map((item) => (
              <li key={item.id}>
                <Link
                  href={articlePath(item)}
                  className="flex h-full flex-col gap-1 rounded-xl border border-border bg-card p-4 transition-[transform,border-color] hover:border-primary/40 active:scale-[0.99]"
                >
                  <h3 className="text-base">{item.title}</h3>
                  {item.excerpt && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{item.excerpt}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
