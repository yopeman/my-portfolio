export const markdownComponents = {
  // Headings
  h1: ({...props}) => <h1 className="text-4xl font-bold mt-8 mb-4 text-slate-900 dark:text-white scroll-mt-24" {...props} />,
  h2: ({...props}) => <h2 className="text-3xl font-bold mt-6 mb-3 text-slate-900 dark:text-white scroll-mt-24" {...props} />,
  h3: ({...props}) => <h3 className="text-2xl font-bold mt-5 mb-3 text-slate-900 dark:text-white" {...props} />,
  h4: ({...props}) => <h4 className="text-xl font-bold mt-4 mb-2 text-slate-900 dark:text-white" {...props} />,
  h5: ({...props}) => <h5 className="text-lg font-bold mt-3 mb-2 text-slate-900 dark:text-white" {...props} />,
  h6: ({...props}) => <h6 className="text-base font-bold mt-3 mb-2 text-slate-900 dark:text-white" {...props} />,

  // Text elements
  p: ({...props}) => <p className="mb-4 leading-relaxed text-slate-700 dark:text-slate-300" {...props} />,
  strong: ({...props}) => <strong className="font-semibold text-slate-900 dark:text-white" {...props} />,
  em: ({...props}) => <em className="italic text-slate-700 dark:text-slate-300" {...props} />,
  del: ({...props}) => <del className="line-through text-slate-500 dark:text-slate-400" {...props} />,
  blockquote: ({...props}) => (
    <blockquote className="border-l-4 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 rounded-3xl px-5 py-4 my-6 italic text-slate-600 dark:text-slate-300 shadow-sm" {...props} />
  ),

  // Code
  code: ({className, ...props}) => {
    const isInline = !className;
    const codeClass = isInline
      ? 'inline-block px-1.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-mono'
      : `block rounded-3xl px-4 py-3 text-sm font-mono bg-slate-950 text-slate-100 shadow-sm overflow-x-auto ${className}`;

    return <code className={codeClass} {...props} />;
  },
  pre: ({...props}) => (
    <pre className="p-4 bg-slate-950 text-slate-100 rounded-3xl overflow-x-auto border border-slate-800/70 my-4 shadow-sm" {...props} />
  ),

  // Lists
  ul: ({...props}) => <ul className="list-disc list-inside mb-4 space-y-2 text-slate-700 dark:text-slate-300" {...props} />,
  ol: ({...props}) => <ol className="list-decimal list-inside mb-4 space-y-2 text-slate-700 dark:text-slate-300" {...props} />,
  li: ({...props}) => <li className="text-slate-700 dark:text-slate-300" {...props} />,

  // Links
  a: ({...props}) => (
    <a
      className="text-indigo-600 dark:text-violet-300 underline decoration-indigo-200/70 dark:decoration-violet-500/40 hover:text-indigo-500 dark:hover:text-violet-200 transition-colors"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),

  // Images
  img: ({...props}) => (
    <img
      className="rounded-3xl max-w-full h-auto my-4 shadow-lg border border-slate-200/70 dark:border-slate-800/70"
      loading="lazy"
      {...props}
    />
  ),

  // Tables (GFM)
  table: ({...props}) => (
    <div className="overflow-x-auto my-4 rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-950">
      <table className="w-full border-collapse" {...props} />
    </div>
  ),
  thead: ({...props}) => <thead className="bg-slate-100 dark:bg-slate-900/80" {...props} />,
  tbody: ({...props}) => <tbody {...props} />,
  tr: ({...props}) => <tr className="odd:bg-slate-50 even:bg-white dark:odd:bg-slate-950 dark:even:bg-slate-900 border-b border-slate-200/70 dark:border-slate-800/70" {...props} />,
  th: ({...props}) => (
    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100 border border-slate-200/70 dark:border-slate-800/70" {...props} />
  ),
  td: ({...props}) => (
    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-800/70" {...props} />
  ),

  // Horizontal rule
  hr: ({...props}) => <hr className="my-8 border-slate-200 dark:border-slate-800" {...props} />,

  // Task lists (GFM)
  input: ({...props}) => {
    if (props.type === 'checkbox') {
      return <input type="checkbox" className="mr-2 h-4 w-4 rounded border-slate-300 dark:border-slate-600 accent-indigo-600 dark:accent-violet-400" disabled {...props} />;
    } else if (props.type === 'radio') {
      return <input type="radio" className="mr-2 h-4 w-4 rounded-full border-slate-300 dark:border-slate-600 accent-indigo-600 dark:accent-violet-400" disabled {...props} />;
    }
    return <input {...props} />;
  },
};

export default markdownComponents;