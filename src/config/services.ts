import { ChartColumn, Globe, RefreshCw, type LucideIcon } from "lucide-react";

export type Service = {
  id: string;
  title: string;
  summary: string;
  icon: LucideIcon;
  points: string[];
};

export type Plan = {
  name: string;
  summary: string;
  features: string[];
  featured?: boolean;
};

export type Step = { title: string; description: string };

/** Copy for the services home page. Edit here; components stay unchanged. */
export const servicesContent = {
  hero: {
    title: "Stop rebuilding the same report every Monday",
    description:
      "We set up your website, your Power BI or Superset dashboards and reports that send themselves, then keep all of it running for one monthly fee.",
    primaryCta: { href: "/contact", label: "Book a free call" },
    secondaryCta: { href: "/#pricing", label: "See pricing" },
    highlights: [
      "Live in about a week",
      "Hosting, updates and fixes included",
      "One monthly plan, no surprise bills",
    ],
    /** Sample data for the hero preview; not a real client. */
    report: {
      subject: "Weekly sales report",
      sentAt: "Sent automatically, Monday 9:00 am",
      metrics: [
        { label: "Sales", value: "₹2.4L", change: "+12% vs last week" },
        { label: "Orders", value: "318", change: "+5%" },
        { label: "Avg. order", value: "₹755", change: "" },
      ],
      days: [
        { label: "Mon", value: 28 },
        { label: "Tue", value: 31 },
        { label: "Wed", value: 26 },
        { label: "Thu", value: 35 },
        { label: "Fri", value: 41 },
        { label: "Sat", value: 52 },
        { label: "Sun", value: 37 },
      ],
      caption: "Example report with sample numbers. Yours is built from your own sales data.",
    },
  },

  services: [
    {
      id: "websites",
      title: "Websites",
      summary: "A fast landing page or site that we build, host and keep up to date.",
      icon: Globe,
      points: ["Design and build", "Domain, hosting and SSL", "Monthly content updates", "Enquiry form to your inbox"],
    },
    {
      id: "dashboards",
      title: "Dashboards",
      summary: "Clear Power BI or Superset dashboards on top of the data you already have.",
      icon: ChartColumn,
      points: ["Connect your sources", "KPI and sales dashboards", "Access for your team", "Monthly refresh and tweaks"],
    },
    {
      id: "automation",
      title: "Report automation",
      summary: "End-to-end reporting that runs itself, set up and managed by us.",
      icon: RefreshCw,
      points: ["Scheduled data pulls", "Automatic refresh", "Reports emailed on time", "Monitoring when things break"],
    },
  ] satisfies Service[],

  steps: [
    { title: "Free call", description: "Tell us what you need. We suggest the smallest setup that does the job." },
    { title: "Setup in a week", description: "We build it, connect your data and hand you a working first version." },
    { title: "We run it monthly", description: "Hosting, updates, refreshes and fixes are on us. You just use it." },
  ] satisfies Step[],

  plans: [
    {
      name: "Presence",
      summary: "For businesses that need a solid online front door.",
      features: ["Landing page or small site", "Hosting, domain and SSL", "Enquiry form with lead alerts", "Small monthly edits"],
    },
    {
      name: "Insights",
      summary: "Everything in Presence, plus dashboards you'll actually open.",
      features: ["Everything in Presence", "3 to 5 dashboards", "Power BI or Superset", "Monthly refresh and changes"],
      featured: true,
    },
    {
      name: "Automation",
      summary: "Reporting that runs end to end without anyone pressing a button.",
      features: ["Everything in Insights", "Automated data pipelines", "Scheduled report emails", "Monitoring and support"],
    },
  ] satisfies Plan[],

  closing: {
    title: "Tell us what you need",
    description: "A short call is enough to scope it. No commitment, and you'll get a clear price.",
    cta: { href: "/contact", label: "Book a free call" },
  },
};
