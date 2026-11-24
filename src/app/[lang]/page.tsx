import { getDictionary } from "../dictionaries";
import { getCatalog, getPortfolio } from "@/lib/db";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { Divider } from "@/components/Divider";
import { Services } from "@/components/Services";
import { PricingCarousel } from "@/components/PricingCarousel";
import { Gallery } from "@/components/Gallery";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export const dynamic = 'force-dynamic';

export default async function Home({
  params,
}: {
  params: Promise<{ lang: 'en' | 'ro' | 'ru' }>;
}) {
  const resolvedParams = await params;
  const [dict, catalog, portfolio] = await Promise.all([
    getDictionary(resolvedParams.lang),
    getCatalog(),
    getPortfolio(),
  ]);

  return (
    <main style={{ overflow: 'visible' }}>
      <Navigation lang={resolvedParams.lang} dict={dict.navigation} />
      <Hero
        dict={dict.hero}
        images={portfolio.filter((p) => p.active !== false && p.image).map((p) => p.image)}
      />
      <Marquee dict={dict.marquee} />
      <Divider />
      <Services dict={dict.services} />
      <PricingCarousel 
        catalog={catalog} 
        lang={resolvedParams.lang} 
        dict={dict.pricingPage} 
      />
      <Gallery dict={dict.gallery} items={portfolio} lang={resolvedParams.lang} />
      <Contact dict={dict.contact} />
      <Footer dict={dict.footer} />
    </main>
  );
}
