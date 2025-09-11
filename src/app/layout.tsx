import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  other: { 'grammarly:disabled': 'true' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
