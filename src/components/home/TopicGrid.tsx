import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import SectionHeading from "@/components/common/SectionHeading";
import { Topic, topicHref } from "@/lib/topics";

const TOPIC_LIMIT = 6;

/** "Browse by topic" tiles linking to the filtered Articles page. */
export default function TopicGrid({ topics }: { topics: Topic[] }) {
  if (!topics.length) return null;

  return (
    <section className="flex flex-col gap-4" aria-labelledby="topics-title">
      <SectionHeading id="topics-title" title="Browse by topic" />

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {topics.slice(0, TOPIC_LIMIT).map((topic) => (
          <li key={topic.name}>
            <Link
              href={topicHref(topic.name)}
              className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3.5 transition-colors hover:border-primary/40 hover:bg-accent/40"
            >
              <span className="flex flex-col">
                <span className="font-semibold">{topic.name}</span>
                <span className="text-xs text-muted-foreground">
                  {topic.count} {topic.count === 1 ? "article" : "articles"}
                </span>
              </span>
              <ArrowUpRight
                className="size-4 text-muted-foreground transition-colors group-hover:text-primary"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
