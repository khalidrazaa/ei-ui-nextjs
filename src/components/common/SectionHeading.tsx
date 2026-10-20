import { ArrowRight } from "lucide-react";
import Link from "next/link";

type SectionHeadingProps = {
  id: string;
  title: string;
  description?: string;
  action?: { href: string; label: string };
};

/** Section title with an optional "view all" style link on the right. */
export default function SectionHeading({ id, title, description, action }: SectionHeadingProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 id={id}>{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {action.label}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
