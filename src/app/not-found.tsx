import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <section className="flex flex-col items-start gap-3 py-12">
      <h1>Page not found</h1>
      <p className="text-muted-foreground">
        The page may have moved or is not available.
      </p>
      <Button asChild className="mt-2">
        <Link href="/articles">Go to all articles</Link>
      </Button>
    </section>
  );
}
