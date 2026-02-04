'use client';

import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import { ToastContainer } from '@/components/Toast'
import { useStore } from '@/store/useStore'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { toasts, removeToast } = useStore();

  return (
    <html lang="en">
      <head>
        <title>Full Stack App - Next.js + Node.js</title>
        <meta name="description" content="Modern full-stack application with React, TypeScript, Next.js, and Node.js" />
      </head>
      <body className={inter.className}>
        <Navigation />
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          {children}
        </main>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </body>
    </html>
  )
}
