import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description: `${siteConfig.brandName} makes data, analytics and technology easier to understand.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <section aria-labelledby="about-title" className="flex flex-col gap-4">
        <h1 id="about-title">About {siteConfig.brandName}</h1>
        <p className="text-lg font-medium">
          {siteConfig.brandName} makes data, analytics and technology easier to understand.
        </p>
        <p className="text-muted-foreground">
          We focus on practical explanations, real-world use cases, architecture, automation, tools
          and cost considerations — without unnecessary jargon.
        </p>
        <p className="text-muted-foreground">
          Topics include data platforms, BigQuery, Power BI, Microsoft Fabric, APIs, reporting,
          dashboards and workflow automation.
        </p>
      </section>

      <Card className="shadow-none">
        <CardContent className="flex flex-col gap-3">
          <h2 id="behind-title">Behind {siteConfig.brandName}</h2>
          <p className="text-muted-foreground">
            I&apos;m Khalid Raza, a technology professional working across data, analytics, software
            and automation.
          </p>
          <p className="text-muted-foreground">
            {siteConfig.brandName} is where I share practical ideas, solution patterns and lessons
            from working with technology in real-world environments.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col items-start gap-3">
        <p className="font-semibold">Have a question or an idea?</p>
        <Button asChild>
          <Link href="/contact">
            Get in touch
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
