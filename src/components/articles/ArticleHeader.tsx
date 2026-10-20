import ArticleMeta from "@/components/common/ArticleMeta";
import AuthorAvatar from "@/components/common/AuthorAvatar";
import Breadcrumbs, { type Crumb } from "@/components/common/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";
import { formatDate, formatReadingTime } from "@/lib/format";
import { Article } from "@/types/article";

type ArticleHeaderProps = {
  article: Article;
};

/** Centred editorial header: trail, kicker, serif title, lead and byline. */
export default function ArticleHeader({ article }: ArticleHeaderProps) {
  const { author } = siteConfig;
  const lead = article.excerpt || article.meta_description;
  const crumbs: Crumb[] = [
    { label: "Articles", href: "/articles" },
    ...(article.category ? [{ label: article.category }] : []),
    { label: article.title },
  ];

  return (
    <header className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
      <div className="flex flex-col items-center gap-3">
        <Breadcrumbs items={crumbs} />
        <div className="flex flex-wrap items-center justify-center gap-2">
          {article.category && <Badge>{article.category}</Badge>}
          {article.subcategory && <Badge variant="outline">{article.subcategory}</Badge>}
        </div>
      </div>

      <h1 className="text-balance font-serif text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
        {article.title}
      </h1>

      {lead && <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">{lead}</p>}

      <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
        <span className="flex items-center gap-2.5">
          <AuthorAvatar name={author.name} className="size-8 text-xs" />
          <span className="font-medium">{author.name}</span>
        </span>
        <span className="hidden h-4 w-px bg-border sm:block" aria-hidden="true" />
        <ArticleMeta
          className="text-muted-foreground"
          date={formatDate(article.published_at || article.created_at)}
          readingTime={formatReadingTime(article.reading_time)}
        />
      </div>
    </header>
  );
}
