import type { Metadata } from 'next';
import ConditionalNavbar from '@/components/conditional-navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'LMS & Real-Time Communication Platform',
  description: 'A comprehensive Learning Management System with real-time communication capabilities',
  viewport: 'width=device-width, initial-scale=1',
  authors: [{ name: 'Project Team' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Righteous&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-white text-gray-900">
        <ConditionalNavbar />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </body>
    </html>
  );
}
