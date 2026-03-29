import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Drip — Learn anything. Effortlessly.',
  description: 'Passive learning through AI-generated knowledge pills delivered throughout your day.',
  keywords: ['learning', 'knowledge', 'AI', 'education', 'passive learning'],
  openGraph: {
    title: 'Drip — Learn anything. Effortlessly.',
    description: 'AI-curated knowledge pills on topics you love, delivered throughout your day.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
