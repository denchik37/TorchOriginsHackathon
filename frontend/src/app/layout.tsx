import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { headers } from 'next/headers';
import ContextProvider from '../../context';
import ApolloProviderClient from '@/components/apollo-client-provider';
import client from '@/lib/apolloClient';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Torch - Crypto Prediction Market',
  description: 'Predict cryptocurrency token prices and earn rewards',
};

// ATTENTION!!! RootLayout must be an async function to use headers()
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Retrieve cookies from request headers on the server
  const headersObj = await headers(); // IMPORTANT: await the headers() call
  const cookies = headersObj.get('cookie');

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ApolloProviderClient>
          <ContextProvider cookies={cookies}>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </ContextProvider>
        </ApolloProviderClient>
      </body>
    </html>
  );
}
