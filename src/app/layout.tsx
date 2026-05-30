import { Geist, Geist_Mono, Inter } from 'next/font/google'
import Script from 'next/script'

import { routing } from '@/i18n/routing'
import { cn } from '@/lib/utils'

import './globals.css'

type RootLayoutProps = {
  children: React.ReactNode
}

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      className={cn(
        'h-full',
        'antialiased',
        geistSans.variable,
        geistMono.variable,
        'font-sans',
        inter.variable
      )}
      lang={routing.defaultLocale}
    >
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#1d4ed8" />
        <link rel="apple-touch-icon" href="/icons/icon-512.svg" />
      </head>
      <body className="min-h-full flex flex-col">
        <Script id="pwa-sw-register" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); }); }`}
        </Script>
        {children}
      </body>
    </html>
  )
}
