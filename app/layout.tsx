import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { AuthHydrator } from '@/components/providers/AuthHydrator';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
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
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full antialiased">
        <QueryProvider>
          <AuthHydrator>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                className:
                  '!rounded-[6px] !border !border-[#ededed] !bg-white !text-[#383838] !text-[13px] !shadow-sm',
                success: {
                  iconTheme: { primary: '#22c55e', secondary: '#fff' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: '#fff' },
                },
              }}
            />
          </AuthHydrator>
        </QueryProvider>
      </body>
    </html>
  );
}
