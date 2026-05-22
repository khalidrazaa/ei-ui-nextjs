import Link from "next/link";
import { ArrowRight, DatabaseZap, Rocket, ShieldCheck, Workflow } from "lucide-react";

import { siteConfig } from "@/config/site";

type HeroBannerProps = {
  articleCount: number;
};

export default function HeroBanner({ articleCount }: HeroBannerProps) {
  return (
    <section className="hero-grid animate-float">
      <article className="hero-card hero-main">
        <p className="hero-label">Welcome to {siteConfig.brandName}</p>
        <h1>
          Data Automation Consulting That Turns Manual Ops Into Reliable Systems
          <span>
            Built by a Data Automation Engineer for teams that want faster insights, cleaner pipelines,
            and calmer operations.
          </span>
        </h1>

        <p className="hero-main-copy">
          I help founders and delivery teams automate reporting, data movement, and workflow orchestration
          so your business runs on signal, not spreadsheet chaos.
        </p>

        <div className="hero-cta-row">
          <Link href="/about" className="hero-cta hero-cta-primary">
            Start Consultation
            <ArrowRight size={16} />
          </Link>
          <Link href="/articles" className="hero-cta hero-cta-ghost">
            Explore Playbooks
          </Link>
        </div>

        <div className="hero-stats">
          <div>
            <strong>{articleCount}</strong>
            <span>Published breakdowns</span>
          </div>
          <div>
            <strong>1:1</strong>
            <span>Direct consulting support</span>
          </div>
          <div>
            <strong>ROI</strong>
            <span>Automation-first roadmap</span>
          </div>
        </div>
      </article>

      <article className="hero-card hero-support">
        <h2>How Explainit.tech helps you win</h2>
        <ul className="hero-service-list">
          <li>
            <DatabaseZap size={18} />
            <div>
              <strong>Data Pipeline Automation</strong>
              <p>Move data from tools to decisions with dependable scheduled flows.</p>
            </div>
          </li>
          <li>
            <Workflow size={18} />
            <div>
              <strong>Workflow Orchestration</strong>
              <p>Replace repetitive manual steps with robust, testable automation loops.</p>
            </div>
          </li>
          <li>
            <ShieldCheck size={18} />
            <div>
              <strong>Quality and Governance</strong>
              <p>Build checks, alerts, and ownership so your automations stay trusted.</p>
            </div>
          </li>
        </ul>
      </article>

      <article className="hero-card hero-proof">
        <h2>Consultation Tracks</h2>
        <div className="hero-track-grid">
          <div>
            <span>Track 01</span>
            <h3>Automation Blueprint</h3>
            <p>Audit current process friction and design a practical 30-60-90 day automation plan.</p>
          </div>
          <div>
            <span>Track 02</span>
            <h3>Pipeline Rescue</h3>
            <p>Stabilize fragile ETL and dashboard dependencies that are slowing delivery teams down.</p>
          </div>
          <div>
            <span>Track 03</span>
            <h3>Leadership Visibility</h3>
            <p>Build executive-ready reporting layers that keep goals, KPIs, and outcomes transparent.</p>
          </div>
        </div>
        <p className="hero-proof-note">
          <Rocket size={16} />
          Every engagement is outcome-driven: fewer manual hours, faster reporting cycles, clearer signals.
        </p>
      </article>
    </section>
  );
}
