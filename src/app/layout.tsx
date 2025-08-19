import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Mail API Server - Self-Hosted Email Service',
  description: 'A self-hosted email API server with queue management, monitoring, and configuration',
  keywords: 'email api, smtp server, self-hosted email, mail api, email service',
  authors: [{ name: 'Mail API Server' }],
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  themeColor: '#007AFF',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mail API Server',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📧</text></svg>" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${inter.className} ${inter.variable} antialiased`}>
        <div className="min-h-screen" style={{ 
          background: 'rgb(var(--background))',
          color: 'rgb(var(--foreground))'
        }}>
          {children}
        </div>
      </body>
    </html>
  )
}