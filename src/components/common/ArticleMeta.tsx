import { cn } from "@/lib/utils";

type ArticleMetaProps = {
  date: string;
  readingTime: string;
  className?: string;
};

export default function ArticleMeta({ date, readingTime, className }: ArticleMetaProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span>{date}</span>
      <span aria-hidden>·</span>
      <span>{readingTime}</span>
    </span>
  );
}
