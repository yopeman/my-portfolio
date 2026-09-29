/* Shared renderer for About text, project notes, blog posts, and chat replies. */

const HEADING = 'scroll-mt-28 font-extrabold tracking-tight text-slate-900 dark:text-white';
const LINK = 'text-indigo-600 underline decoration-indigo-300/70 underline-offset-2 transition-colors hover:text-indigo-500 dark:text-violet-300 dark:decoration-violet-500/40 dark:hover:text-violet-200';

// `pre` owns the dark surface; the inner `code` stays transparent so blocks do
// not stack two backgrounds and two rounded corners.
const CODE_BLOCK = 'block overflow-x-auto p-4 font-mono text-sm leading-relaxed text-slate-100';

export const markdownComponents = {
  h1: (props) => <h1 className={`${HEADING} mt-10 mb-4 text-3xl`} {...props} />,
  h2: (props) => <h2 className={`${HEADING} mt-9 mb-3 text-2xl`} {...props} />,
  h3: (props) => <h3 className={`${HEADING} mt-7 mb-3 text-xl`} {...props} />,
  h4: (props) => <h4 className={`${HEADING} mt-6 mb-2.5 text-lg`} {...props} />,
  h5: (props) => <h5 className={`${HEADING} mt-5 mb-2 text-base`} {...props} />,
  h6: (props) => <h6 className={`${HEADING} mt-4 mb-2 text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400`} {...props} />,

  p: (props) => <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-300" {...props} />,
  strong: (props) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
  em: (props) => <em className="italic text-slate-700 dark:text-slate-200" {...props} />,
  del: (props) => <del className="text-slate-500 line-through dark:text-slate-500" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="my-6 rounded-2xl border-l-4 border-indigo-400 bg-slate-50 px-5 py-4 italic text-slate-600 dark:border-violet-400/60 dark:bg-slate-900/60 dark:text-slate-300"
      {...props}
    />
  ),

  code: ({ className, children, ...props }) => {
    const isBlock = Boolean(className) || String(children).includes('\n');
    if (isBlock) {
      return <code className={`${CODE_BLOCK} ${className || ''}`} {...props}>{children}</code>;
    }
    return (
      <code
        className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-rose-300"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: (props) => (
    <pre
      className="my-5 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-lg"
      {...props}
    />
  ),

  ul: (props) => <ul className="mb-4 list-disc space-y-1.5 pl-6 text-slate-600 marker:text-indigo-400 dark:text-slate-300" {...props} />,
  ol: (props) => <ol className="mb-4 list-decimal space-y-1.5 pl-6 text-slate-600 marker:font-bold marker:text-indigo-400 dark:text-slate-300" {...props} />,
  li: (props) => <li className="leading-relaxed" {...props} />,

  a: ({ children, ...props }) => (
    <a className={LINK} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  ),

  img: (props) => (
    <img
      className="my-5 h-auto max-w-full rounded-2xl border border-slate-200/70 shadow-md dark:border-slate-800"
      loading="lazy"
      {...props}
    />
  ),

  table: (props) => (
    <div className="my-5 overflow-x-auto rounded-2xl border border-slate-200/70 dark:border-slate-800">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  thead: (props) => <thead className="bg-slate-100 dark:bg-slate-900" {...props} />,
  tbody: (props) => <tbody {...props} />,
  tr: (props) => (
    <tr className="border-b border-slate-200/70 last:border-0 dark:border-slate-800/70" {...props} />
  ),
  th: (props) => (
    <th className="px-4 py-3 text-left font-extrabold text-slate-900 dark:text-slate-100" {...props} />
  ),
  td: (props) => <td className="px-4 py-3 text-slate-600 dark:text-slate-300" {...props} />,

  hr: (props) => <hr className="my-8 border-slate-200 dark:border-slate-800" {...props} />,

  input: ({ type, ...props }) => {
    if (type === 'checkbox') {
      return (
        <input
          type="checkbox"
          className="mr-2 h-4 w-4 rounded border-slate-300 accent-indigo-600 dark:border-slate-600 dark:accent-violet-400"
          disabled
          {...props}
        />
      );
    }
    if (type === 'radio') {
      return (
        <input
          type="radio"
          className="mr-2 h-4 w-4 border-slate-300 accent-indigo-600 dark:border-slate-600 dark:accent-violet-400"
          disabled
          {...props}
        />
      );
    }
    return <input {...props} />;
  },
};

export default markdownComponents;
