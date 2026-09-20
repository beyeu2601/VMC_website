import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import React from 'react'

import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'

import './styles.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'VMC',
    template: '%s | VMC',
  },
  description:
    'VMC đồng hành cùng phụ nữ trong giai đoạn tiền mãn kinh và mãn kinh: kiến thức, đánh giá triệu chứng và chương trình chăm sóc cá nhân hóa.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${cormorant.variable} ${inter.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Bỏ qua và đến nội dung chính
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
