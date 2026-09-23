import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ProductProvider } from '@/context/ProductContext';

export const metadata: Metadata = {
  title: 'Product Admin Dashboard | Nexgensis Technologies',
  description: 'A modern Product Admin Dashboard with authentication, CRUD, search, filter, and pagination.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        <ToastProvider>
          <AuthProvider>
            <ProductProvider>
              {children}
            </ProductProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
