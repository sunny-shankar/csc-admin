import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { AuthHydrator } from '@/components/providers/AuthHydrator';
import './globals.css';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CNC Admin | Smart CHD',
  description: 'Civic & Nomination Connect admin panel',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full antialiased">
        <QueryProvider>
          <AuthHydrator>
            {children}
            <Toaster position="top-right" />
          </AuthHydrator>
        </QueryProvider>
      </body>
    </html>
  );
}
