import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="empty-state">
      <h1>Article not found</h1>
      <p>The story may have moved or is not available for this host site.</p>
      <Link href="/articles" className="read-link">
        Go to all articles
      </Link>
    </section>
  );
}
