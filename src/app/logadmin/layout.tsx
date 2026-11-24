import type { Metadata, Viewport } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Luxe Event Agency — Admin Workspace',
  description: 'Панель управления заявками, клиентами, прайс-листом, портфолио и финансами',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Luxe Admin',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#08090d',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="admin-root">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          /* RESTORE NATIVE CURSORS, SANS-SERIF HEADINGS & SCROLLBARS IN ADMIN */
          html.admin-root,
          body.admin-root {
            background: #08090d !important;
            color: #f1f5f9 !important;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            scrollbar-width: thin !important;
            scrollbar-color: #262e42 #08090d !important;
          }
          body.admin-root::before,
          body.admin-root::after {
            display: none !important;
          }
          html.admin-root::-webkit-scrollbar,
          body.admin-root::-webkit-scrollbar,
          html.admin-root *::-webkit-scrollbar {
            display: block !important;
            width: 6px;
            height: 6px;
          }
          html.admin-root::-webkit-scrollbar-track,
          body.admin-root::-webkit-scrollbar-track,
          html.admin-root *::-webkit-scrollbar-track {
            background: transparent;
          }
          html.admin-root::-webkit-scrollbar-thumb,
          body.admin-root::-webkit-scrollbar-thumb,
          html.admin-root *::-webkit-scrollbar-thumb {
            background: rgba(148, 163, 184, 0.22);
            border-radius: 999px;
          }
          html.admin-root h1,
          html.admin-root h2,
          html.admin-root h3,
          html.admin-root h4,
          html.admin-root h5,
          html.admin-root h6 {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            letter-spacing: -0.015em;
          }
          html.admin-root,
          html.admin-root body,
          html.admin-root *,
          body.admin-root,
          body.admin-root * {
            cursor: auto !important;
          }
          html.admin-root a,
          html.admin-root button,
          html.admin-root select,
          html.admin-root [role="button"],
          body.admin-root a,
          body.admin-root button,
          body.admin-root select,
          body.admin-root [role="button"] {
            cursor: pointer !important;
          }
          html.admin-root input,
          html.admin-root textarea,
          body.admin-root input,
          body.admin-root textarea {
            cursor: text !important;
          }
        `,
          }}
        />
      </head>
      <body className="admin-root" style={{ minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  );
}
