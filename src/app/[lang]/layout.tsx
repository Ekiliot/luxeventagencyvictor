import type { Metadata } from "next";
import "../globals.css";
import { Intro } from "@/components/Intro";

export const metadata: Metadata = {
  title: "Lux Event Agency | Elevate Your Brand",
  description: "Premium Event Agency specializing in Promotions, Advertising, and High-End Video Shoots.",
};

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'ro' }, { lang: 'ru' }];
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  return (
    <html lang={resolvedParams.lang}>
      <body>
        <Intro />
        {children}
      </body>
    </html>
  );
}
