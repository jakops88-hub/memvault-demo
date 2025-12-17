import { DocsSidebar } from '@/components/DocsSidebar'
import Link from 'next/link'

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                MemVault
              </span>
            </Link>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Documentation
            </span>
          </div>

          <nav className="flex items-center gap-4">
            <Link
              href="/playground"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Playground
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/pricing"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <DocsSidebar />

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container max-w-4xl px-6 py-12">
            <article className="prose prose-slate dark:prose-invert max-w-none">
              {children}
            </article>
          </div>
        </main>
      </div>
    </div>
  )
}
