import { getDictionary } from "../dictionaries";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
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
    <main>
      <Navigation lang={resolvedParams.lang} dict={dict.navigation} />
      <Hero dict={dict.hero} />
      <About dict={dict.about} />
      <Services dict={dict.services} />
      <Contact dict={dict.contact} />
      <Footer dict={dict.footer} />
    </main>
  );
}
