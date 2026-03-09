import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Telugu Cultural Chatbot',
  description: 'A multimodal chatbot for exploring and preserving Telugu culture.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="te">
      <body className={inter.className}>
        <nav className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                  తెలుగు బంధువు
                </span>
                <span className="text-sm text-slate-400 hidden sm:block">| Telugu Cultural Bot</span>
              </div>
              <div className="flex space-x-4">
                <Link href="/" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Chat</Link>
                <Link href="/collect" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Contribute</Link>
                <Link href="/admin" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Admin</Link>
              </div>
            </div>
          </div>
        </nav>
        
        <main className="flex-grow flex flex-col">
          {children}
        </main>
      </body>
    </html>
  )
}
