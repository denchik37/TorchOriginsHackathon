import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import ContextProvider from '../../context';
import ApolloProviderClient from '@/components/apollo-client-provider';
import client from '@/lib/apolloClient';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Torch - Crypto Prediction Market',
  description: 'Predict cryptocurrency token prices and earn rewards',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ApolloProviderClient>
          <ContextProvider>
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
