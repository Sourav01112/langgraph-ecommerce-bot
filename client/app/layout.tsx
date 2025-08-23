import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BuildMart - Construction Materials Dashboard',
  description: 'Modern dashboard for construction materials and raw materials inventory management',
  keywords: 'construction materials, building supplies, steel, concrete, lumber, roofing, dashboard',
  authors: [{ name: 'BuildMart Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="h-full bg-gray-50 antialiased">
        {children}
      </body>
    </html>
  )
}