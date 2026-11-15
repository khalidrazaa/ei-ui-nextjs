import ClosingCta from "@/components/home/ClosingCta";
import LatestArticles from "@/components/home/LatestArticles";
import PricingPlans from "@/components/home/PricingPlans";
import ProcessSteps from "@/components/home/ProcessSteps";
import ServiceGrid from "@/components/home/ServiceGrid";
import ServicesHero from "@/components/home/ServicesHero";
import { getPublishedArticles } from "@/lib/articles";

const LATEST_ARTICLES = 3;

export default async function HomePage() {
  const { articles } = await getPublishedArticles(LATEST_ARTICLES);

  return (
    <div className="flex flex-col gap-16">
      <ServicesHero />
      <ServiceGrid />
      <ProcessSteps />
      <PricingPlans />
      <LatestArticles articles={articles} />
      <ClosingCta />
    </div>
  );
}
