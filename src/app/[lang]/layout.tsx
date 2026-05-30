import type { Metadata } from "next";
import "../globals.css";
import { Intro } from "@/components/Intro";
import { CustomScrollbar } from "@/components/CustomScrollbar";
import { CustomCursor } from "@/components/CustomCursor";
import { SmoothScroll } from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: "Lux Event Agency | Elevate Your Brand",
  description: "Creating unforgettable premium events and powerful brand promotion.",
};

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'ro' }, { lang: 'ru' }];
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const resolvedParams = await params;
  return (
    <html lang={resolvedParams.lang}>
      <body>
        <SmoothScroll />
        <CustomCursor />
        <Intro />
        <CustomScrollbar />
        {children}
      </body>
    </html>
  );
}
