import type { Metadata } from "next";
import { Mail } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${siteConfig.brandName} for questions, feedback, projects or collaboration.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-[1fr_1.4fr]">
      <section aria-labelledby="contact-title" className="flex flex-col gap-4">
        <h1 id="contact-title">Contact</h1>
        <p className="text-muted-foreground">
          Have a question, suggestion or project you&apos;d like to discuss? Use the form or reach
          out directly.
        </p>
        <a
          href={`mailto:${siteConfig.contactEmail}`}
          className="inline-flex items-center gap-2 font-medium text-primary underline-offset-4 hover:underline"
        >
          <Mail className="size-4" aria-hidden="true" />
          {siteConfig.contactEmail}
        </a>

        <div className="mt-4">
          <h2 className="text-base">You can contact me about</h2>
          <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-muted-foreground">
            {siteConfig.enquiries.map((enquiry) => (
              <li key={enquiry}>{enquiry}</li>
            ))}
          </ul>
        </div>
      </section>

      <Card className="shadow-none">
        <CardContent className="px-4 sm:px-6">
          <ContactForm />
        </CardContent>
      </Card>
    </div>
  );
}
