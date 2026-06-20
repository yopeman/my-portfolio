import React from 'react';

/**
 * Shared markdown component overrides for markdown-to-jsx.
 * Use as: <Markdown options={{ overrides: markdownOverrides }}>...</Markdown>
 */
export const markdownOverrides = {
  // Headings
  h1: {
    component: ({ children, ...props }) => (
      <h1 className="text-4xl font-bold mt-8 mb-4 text-slate-900 dark:text-white" {...props}>
        {children}
      </h1>
    ),
  },
  h2: {
    component: ({ children, ...props }) => (
      <h2 className="text-3xl font-bold mt-6 mb-3 text-slate-900 dark:text-white" {...props}>
        {children}
      </h2>
    ),
  },
  h3: {
    component: ({ children, ...props }) => (
      <h3 className="text-2xl font-bold mt-5 mb-3 text-slate-800 dark:text-slate-100" {...props}>
        {children}
      </h3>
    ),
  },
  h4: {
    component: ({ children, ...props }) => (
      <h4 className="text-xl font-bold mt-4 mb-2 text-slate-800 dark:text-slate-100" {...props}>
        {children}
      </h4>
    ),
  },
  h5: {
    component: ({ children, ...props }) => (
      <h5 className="text-lg font-bold mt-3 mb-2 text-slate-700 dark:text-slate-200" {...props}>
        {children}
      </h5>
    ),
  },
  h6: {
    component: ({ children, ...props }) => (
      <h6 className="text-base font-bold mt-3 mb-2 text-slate-700 dark:text-slate-200" {...props}>
        {children}
      </h6>
    ),
  },

  // Text elements
  p: {
    component: ({ children, ...props }) => (
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-300" {...props}>
        {children}
      </p>
    ),
  },
  strong: {
    component: ({ children, ...props }) => (
      <strong className="font-bold text-slate-800 dark:text-slate-100" {...props}>
        {children}
      </strong>
    ),
  },
  em: {
    component: ({ children, ...props }) => (
      <em className="italic text-slate-600 dark:text-slate-400" {...props}>
        {children}
      </em>
    ),
  },
  del: {
    component: ({ children, ...props }) => (
      <del className="line-through text-slate-400 dark:text-slate-500" {...props}>
        {children}
      </del>
    ),
  },
  blockquote: {
    component: ({ children, ...props }) => (
      <blockquote
        className="border-l-4 border-indigo-400 dark:border-violet-500 night:border-purple-500 pl-4 my-4 italic text-slate-500 dark:text-slate-400"
        {...props}
      >
        {children}
      </blockquote>
    ),
  },

  // Code
  code: {
    component: ({ children, className, ...props }) => {
      const isInline = !className;
      return isInline ? (
        <code
          className="px-1.5 py-0.5 bg-indigo-50 dark:bg-violet-950/40 night:bg-purple-950/40 rounded text-sm font-mono text-indigo-600 dark:text-violet-400 night:text-purple-300"
          {...props}
        >
          {children}
        </code>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  },
  pre: {
    component: ({ children, ...props }) => (
      <pre
        className="p-4 bg-slate-50 dark:bg-slate-800/60 night:bg-black/60 rounded-xl overflow-x-auto border border-slate-200 dark:border-slate-700/50 night:border-purple-900/20 my-4 text-sm font-mono"
        {...props}
      >
        {children}
      </pre>
    ),
  },

  // Lists
  ul: {
    component: ({ children, ...props }) => (
      <ul className="list-disc list-inside mb-4 space-y-2 text-slate-600 dark:text-slate-300" {...props}>
        {children}
      </ul>
    ),
  },
  ol: {
    component: ({ children, ...props }) => (
      <ol className="list-decimal list-inside mb-4 space-y-2 text-slate-600 dark:text-slate-300" {...props}>
        {children}
      </ol>
    ),
  },
  li: {
    component: ({ children, ...props }) => (
      <li className="text-slate-600 dark:text-slate-300" {...props}>
        {children}
      </li>
    ),
  },

  // Links
  a: {
    component: ({ children, ...props }) => (
      <a
        className="text-indigo-600 dark:text-violet-400 night:text-purple-400 underline decoration-indigo-300 dark:decoration-violet-700 hover:decoration-indigo-600 dark:hover:decoration-violet-400 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    ),
  },

  // Images
  img: {
    component: ({ ...props }) => (
      <img className="rounded-lg max-w-full h-auto my-4 shadow-md" loading="lazy" {...props} />
    ),
  },

  // Tables
  table: {
    component: ({ children, ...props }) => (
      <div className="overflow-x-auto my-4">
        <table
          className="w-full border-collapse border border-slate-200 dark:border-slate-700/50 night:border-purple-900/20"
          {...props}
        >
          {children}
        </table>
      </div>
    ),
  },
  thead: {
    component: ({ children, ...props }) => (
      <thead className="bg-slate-50 dark:bg-slate-800/60 night:bg-purple-950/20" {...props}>
        {children}
      </thead>
    ),
  },
  tbody: {
    component: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
  },
  tr: {
    component: ({ children, ...props }) => (
      <tr className="border-b border-slate-200 dark:border-slate-700/50 night:border-purple-900/15" {...props}>
        {children}
      </tr>
    ),
  },
  th: {
    component: ({ children, ...props }) => (
      <th
        className="px-4 py-2 text-left font-semibold text-slate-700 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700/50 last:border-r-0"
        {...props}
      >
        {children}
      </th>
    ),
  },
  td: {
    component: ({ children, ...props }) => (
      <td
        className="px-4 py-2 text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700/50 last:border-r-0"
        {...props}
      >
        {children}
      </td>
    ),
  },

  // Horizontal rule
  hr: {
    component: ({ ...props }) => (
      <hr className="my-8 border-slate-200 dark:border-slate-700/50 night:border-purple-900/20" {...props} />
    ),
  },
};

export default markdownOverrides;
