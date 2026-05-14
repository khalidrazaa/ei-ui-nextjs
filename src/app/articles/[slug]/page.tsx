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

  if (!article) {
    notFound();
  }

  const related = await getRelatedArticles(slug, 4);
  const comments = await getCommentsForSlug(slug);

  return (
    <article className="article-page">
      <Link href="/articles" className="back-link">
        Back to Articles
      </Link>

      <header className="article-header">
        <div className="article-header-meta">
          <span className="chip chip-muted">{article.category || "Insight"}</span>
          <span>{formatDate(article.published_at || article.created_at)}</span>
          <span>{formatReadingTime(article.reading_time)}</span>
        </div>

        <h1>{article.title}</h1>
        <p>{article.excerpt || article.meta_description}</p>
      </header>

      <section className="article-cover">
        {article.featured_image_url ? (
          <Image
            src={article.featured_image_url}
            alt={article.image_alt_text || article.title}
            width={1200}
            height={680}
            className="article-cover-image"
            unoptimized
          />
        ) : (
          <div className="article-cover-fallback">
            <span>{siteConfig.brandName}</span>
            <strong>{article.category || "Analysis"}</strong>
          </div>
        )}
      </section>

      <ArticleBody content={article.content || "Content is coming soon."} />

      <section className="tag-row">
        {(article.tags || []).map((tag) => (
          <span key={`${article.id}-${tag}`} className="chip chip-soft">
            {tag}
          </span>
        ))}
      </section>

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
    </article>
  );
}
