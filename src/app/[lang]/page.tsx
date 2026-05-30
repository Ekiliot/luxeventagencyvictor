import { getDictionary } from "../dictionaries";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { About } from "@/components/About";
import { Divider } from "@/components/Divider";
import { Services } from "@/components/Services";
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

  return (
    <main style={{ overflow: 'visible' }}>
      <Navigation lang={resolvedParams.lang} dict={dict.navigation} />
      <Hero dict={dict.hero} />
      <Marquee dict={dict.marquee} />
      <About dict={dict.about} />
      <Divider />
      <Services dict={dict.services} />
      <Gallery dict={dict.gallery} />
      <Contact dict={dict.contact} />
      <Footer dict={dict.footer} />
    </main>
  );
}
