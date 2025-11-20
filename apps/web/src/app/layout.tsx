import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SalesScope - Business Intelligence Dashboard',
  description:
    'Multi-tenant analytics platform for e-commerce businesses. Upload sales data, gain insights, and make data-driven decisions.',
  keywords: [
    'business intelligence',
    'analytics',
    'dashboard',
    'sales data',
    'e-commerce',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
