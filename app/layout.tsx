import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Merchat Warrior Api Intergration',
  description: 'Created with v0',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
