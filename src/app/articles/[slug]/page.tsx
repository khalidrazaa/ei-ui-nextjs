import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

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
    <article className="article-page">
      <div className="article-reading-column">
        <Link href="/articles" className="back-link">
          Back to Articles
        </Link>

        <header className="article-header">
          {(article.category || article.subcategory) && (
            <p className="article-trail">
              {[article.category, article.subcategory].filter(Boolean).join(" > ")}
            </p>
          )}

          <h1>{article.title}</h1>
          <p>{article.excerpt || article.meta_description}</p>

          <div className="article-header-meta">
            <span>{formatDate(article.published_at || article.created_at)}</span>
            {article.reading_time && (article.published_at || article.created_at) ? <span aria-hidden>|</span> : null}
            <span>{formatReadingTime(article.reading_time)}</span>
          </div>
        </header>

        {article.featured_image_url && (
          <section className="article-cover">
            <Image
              src={article.featured_image_url}
              alt={article.image_alt_text || article.title}
              width={1200}
              height={680}
              className="article-cover-image"
              unoptimized
            />
          </section>
        )}

        {article.content && <ArticleBody content={article.content} />}

        {(article.tags || []).length > 0 && (
          <section className="tag-row">
            {(article.tags || []).map((tag) => (
              <span key={`${article.id}-${tag}`} className="chip chip-soft">
                {tag}
              </span>
            ))}
          </section>
        )}

        <CommentSection slug={slug} initialComments={comments} />

        {related.length > 0 && (
          <section className="related-wrap">
            <h2>Related Reads</h2>
            <div className="related-list">
              {related.map((item) => (
                <Link key={item.id} href={articlePath(item)}>
                  <h3>{item.title}</h3>
                  <p>{item.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
