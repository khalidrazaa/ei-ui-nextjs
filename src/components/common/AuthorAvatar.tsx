import { cn } from "@/lib/utils";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type AuthorAvatarProps = {
  name: string;
  className?: string;
};

/** Initials in a circle; sized by the caller through className. */
export default function AuthorAvatar({ name, className }: AuthorAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
