import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Configuração otimizada da fonte Inter via next/font
// Evita FOUC (Flash of Unstyled Content) e carrega apenas os subsets necessários
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'RotaEscola Arapongas',
  description: 'Sistema de Gestão Integrada do Transporte Escolar — Secretaria Municipal de Educação de Arapongas, Paraná.',
  keywords: ['transporte escolar', 'arapongas', 'secretaria educação', 'gestão escolar', 'rota escolar'],
  authors: [{ name: 'Secretaria Municipal de Educação — Arapongas/PR' }],
  robots: 'index, follow',
  openGraph: {
    title: 'RotaEscola Arapongas',
    description: 'Sistema de Gestão Integrada do Transporte Escolar Municipal',
    locale: 'pt_BR',
    type: 'website',
  },
};

// Viewport separado do metadata (Next.js 14+)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover', // Suporte a notch / safe area no mobile (PWA)
  themeColor: '#0F172A', // Cor da barra de status no mobile
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
