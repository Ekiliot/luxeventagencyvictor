import { getDictionary } from "../dictionaries";
import { getCatalog } from "@/lib/db";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { Divider } from "@/components/Divider";
import { Services } from "@/components/Services";
import { PricingCarousel } from "@/components/PricingCarousel";
import { Gallery } from "@/components/Gallery";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: 'en' | 'ro' | 'ru' }>;
}) {
  const resolvedParams = await params;
  const dict = await getDictionary(resolvedParams.lang);
  const catalog = await getCatalog();

  return (
    <main style={{ overflow: 'visible' }}>
      <Navigation lang={resolvedParams.lang} dict={dict.navigation} />
      <Hero dict={dict.hero} />
      <Marquee dict={dict.marquee} />
      <Divider />
      <Services dict={dict.services} />
      <PricingCarousel 
        catalog={catalog} 
        lang={resolvedParams.lang} 
        dict={dict.pricingPage} 
      />
      <Gallery dict={dict.gallery} />
      <Contact dict={dict.contact} />
      <Footer dict={dict.footer} />
    </main>
  );
}
