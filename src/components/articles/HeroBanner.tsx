import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function HeroBanner({ articleCount }: { articleCount: number }) {
  return (
    <section className="section-intro">
      <h1>{siteConfig.brandName}</h1>
      <p>{siteConfig.tagline}</p>
      <Link href="/articles">Browse articles ({articleCount})</Link>
    </section>
  );
}
