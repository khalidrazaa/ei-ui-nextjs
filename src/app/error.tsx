"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="empty-state" role="alert">
      <h1>Unable to load content</h1>
      <p>Please try again in a moment.</p>
      <button type="button" className="chip-button" onClick={reset}>Try again</button>
    </section>
  );
}
