import { getDictionary } from "../../dictionaries";
import { getCatalog } from "@/lib/db";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PricesClient } from "@/components/PricesClient";

export const dynamic = 'force-dynamic';

export default async function PricesPage({
  params,
}: {
  params: Promise<{ lang: 'en' | 'ro' | 'ru' }>;
}) {
  const resolvedParams = await params;
  const dict = await getDictionary(resolvedParams.lang);
  const catalog = await getCatalog();

  return (
    <main style={{ overflow: 'visible', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation lang={resolvedParams.lang} dict={dict.navigation} />
      <div style={{ flex: 1, paddingTop: '100px' }}>
        <PricesClient 
          catalog={catalog} 
          lang={resolvedParams.lang} 
          dict={dict.pricingPage || {}} 
        />
      </div>
      <Footer dict={dict.footer} />
    </main>
  );
}
