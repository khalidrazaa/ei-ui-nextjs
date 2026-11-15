import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  id: string;
  title: string;
  description?: string;
  className?: string;
};

/** Shared heading block for home page sections. */
export default function SectionHeading({ id, title, description, className }: SectionHeadingProps) {
  return (
    <div className={cn("mb-6 max-w-2xl", className)}>
      <h2 id={id} className="font-serif text-3xl tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description && <p className="mt-2 max-w-[60ch] text-muted-foreground">{description}</p>}
    </div>
  );
}
