import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import GameTabs from './components/GameTabs';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Modern Arcade 2024',
  description: 'Experience classic games reimagined for the modern era',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GameTabs/>
        {children}
      </body>
    </html>
  )
}
