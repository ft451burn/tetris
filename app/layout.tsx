import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tetris Game',
  description: 'A Tetris game with improved L-piece collision detection',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}