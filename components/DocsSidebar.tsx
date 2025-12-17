'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface DocSection {
  title: string
  items: {
    title: string
    href: string
  }[]
}

const docsSections: DocSection[] = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Introduction', href: '/docs' },
      { title: 'Quickstart', href: '/docs/quickstart' },
      { title: 'Authentication', href: '/docs/authentication' },
    ],
  },
  {
    title: 'Core Concepts',
    items: [
      { title: 'How it Works', href: '/docs/architecture' },
      { title: 'GraphRAG', href: '/docs/advanced/graphrag' },
      { title: 'Best Practices', href: '/docs/advanced/best-practices' },
    ],
  },
  {
    title: 'API Reference',
    items: [
      { title: 'Store Memory', href: '/docs/api/store-memory' },
      { title: 'Retrieve Memory', href: '/docs/api/retrieve-memory' },
      { title: 'Search Memory', href: '/docs/api/search-memory' },
    ],
  },
  {
    title: 'GitHub Action',
    items: [
      { title: 'Installation', href: '/docs/github-action/installation' },
      { title: 'Configuration', href: '/docs/github-action/configuration' },
      { title: 'Examples', href: '/docs/github-action/examples' },
    ],
  },
]

export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-y-auto">
      <div className="p-6">
        <Link href="/docs" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            MemVault Docs
          </span>
        </Link>

        <nav className="space-y-8">
          {docsSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'block px-3 py-2 rounded-md text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                        )}
                      >
                        {item.title}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}
