import { getDictionary } from '../../dictionaries';
import { getPortfolio } from '@/lib/db';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { PortfolioClient } from '@/components/PortfolioClient';

export const dynamic = 'force-dynamic';

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ lang: 'en' | 'ro' | 'ru' }>;
}) {
  const resolvedParams = await params;
  const [dict, portfolio] = await Promise.all([
    getDictionary(resolvedParams.lang),
    getPortfolio(),
  ]);

  return (
    <main style={{ overflow: 'visible', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation lang={resolvedParams.lang} dict={dict.navigation} />
      <div style={{ flex: 1, paddingTop: '100px' }}>
        <PortfolioClient
          items={portfolio}
          lang={resolvedParams.lang}
          dict={dict.gallery || {}}
        />
      </div>
      <Footer dict={dict.footer} />
    </main>
  );
}
