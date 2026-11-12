import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Luxe Event Agency — Панель Управления',
  description: 'Административная панель управления заявками, прайсами и аналитикой',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="admin-root">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          /* RESTORE NATIVE CURSORS IN ADMIN PANEL */
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
        `}} />
      </head>
      <body className="admin-root" style={{ background: '#0e1015', color: '#f3f4f6', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
