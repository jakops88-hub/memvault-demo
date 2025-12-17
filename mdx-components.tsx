import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mt-8 mb-4">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white mt-8 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white mt-6 mb-3">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white mt-4 mb-2">
        {children}
      </h4>
    ),
    p: ({ children }) => (
      <p className="text-base text-slate-700 dark:text-slate-300 leading-7 mb-4">
        {children}
      </p>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline underline-offset-4 font-medium"
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
    code: ({ children, className }) => {
      const isInline = !className
      
      if (isInline) {
        return (
          <code className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-1.5 py-0.5 rounded text-sm font-mono">
            {children}
          </code>
        )
      }
      
      return (
        <code className={`${className} block bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono my-4`}>
          {children}
        </code>
      )
    },
    pre: ({ children }) => (
      <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-lg overflow-x-auto my-4">
        {children}
      </pre>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mb-4 ml-4">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside text-slate-700 dark:text-slate-300 space-y-2 mb-4 ml-4">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="leading-7">{children}</li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 py-2 my-4 italic text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50">
        {children}
      </blockquote>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="px-4 py-2 text-left text-sm font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800">
        {children}
      </td>
    ),
    hr: () => (
      <hr className="my-8 border-slate-200 dark:border-slate-800" />
    ),
    ...components,
  }
}
