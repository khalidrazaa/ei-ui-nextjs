"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="flex flex-col items-start gap-3 py-12" role="alert">
      <h1>Unable to load content</h1>
      <p className="text-muted-foreground">Please try again in a moment.</p>
      <Button type="button" className="mt-2" onClick={reset}>
        Try again
      </Button>
    </section>
  );
}
