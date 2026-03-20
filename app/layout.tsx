import { type Metadata } from 'next'
import {
  ClerkProvider,
} from '@clerk/nextjs'
import { Geist, Geist_Mono, Inter, Outfit } from 'next/font/google'
import './globals.css'
import { shadcn } from '@clerk/themes'
import { ThemeProvider } from '@/components/theme-provider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: 'Fantasy Football',
  description: 'A Premier League Fantasy Football Application',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider appearance={{
      theme: shadcn,
    }}>
      <html lang="en" suppressHydrationWarning className={outfit.variable}>
        <body >
          <header>
          </header>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}