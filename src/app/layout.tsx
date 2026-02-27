import type { Metadata } from 'next'
import './globals.css'

// All pages in this app require runtime data — disable static prerendering globally
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Jaxtina IELTS — AI Writing Examiner',
  description: 'AI-powered IELTS Writing practice and feedback by Jaxtina',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
