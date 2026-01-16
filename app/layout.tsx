import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SPEAKEZ - Speech Understanding & Practice Platform',
  description: 'Understand how you speak. Learn how to practice. A supportive, non-judgmental platform for speech improvement.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
