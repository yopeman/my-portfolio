export const markdownComponents = {
  // Headings
  h1: ({node, ...props}) => <h1 className="text-4xl font-bold mt-8 mb-4" {...props} />,
  h2: ({node, ...props}) => <h2 className="text-3xl font-bold mt-6 mb-3" {...props} />,
  h3: ({node, ...props}) => <h3 className="text-2xl font-bold mt-5 mb-3" {...props} />,
  h4: ({node, ...props}) => <h4 className="text-xl font-bold mt-4 mb-2" {...props} />,
  h5: ({node, ...props}) => <h5 className="text-lg font-bold mt-3 mb-2" {...props} />,
  h6: ({node, ...props}) => <h6 className="text-base font-bold mt-3 mb-2" {...props} />,

  // Text elements
  p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
  strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
  em: ({node, ...props}) => <em className="italic" {...props} />,
  del: ({node, ...props}) => <del className="line-through text-muted-foreground" {...props} />,
  blockquote: ({node, ...props}) => (
    <blockquote className="border-l-4 border-primary/30 dark:border-secondary/30 pl-4 my-4 italic text-muted-foreground" {...props} />
  ),

  // Code
  code: ({node, className, ...props}) => {
    const isInline = !className;
    return isInline ? (
      <code className="px-1.5 py-0.5 bg-primary/10 dark:bg-secondary/10 rounded text-sm font-mono text-primary dark:text-secondary" {...props} />
    ) : (
      <code className={className} {...props} />
    );
  },
  pre: ({node, ...props}) => (
    <pre className="p-4 bg-primary/5 dark:bg-secondary/5 rounded-xl overflow-x-auto border border-primary/10 dark:border-secondary/10 my-4" {...props} />
  ),

  // Lists
  ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
  ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
  li: ({node, ...props}) => <li className="text-foreground" {...props} />,

  // Links
  a: ({node, ...props}) => (
    <a 
      className="text-primary dark:text-secondary underline decoration-primary/30 dark:decoration-secondary/30 hover:decoration-primary dark:hover:decoration-secondary transition-colors" 
      target="_blank" 
      rel="noopener noreferrer" 
      {...props} 
    />
  ),

  // Images
  img: ({node, ...props}) => (
    <img 
      className="rounded-lg max-w-full h-auto my-4 shadow-md" 
      loading="lazy" 
      {...props} 
    />
  ),

  // Tables (GFM)
  table: ({node, ...props}) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse border border-primary/10 dark:border-secondary/10" {...props} />
    </div>
  ),
  thead: ({node, ...props}) => <thead className="bg-primary/5 dark:bg-secondary/5" {...props} />,
  tbody: ({node, ...props}) => <tbody {...props} />,
  tr: ({node, ...props}) => <tr className="border-b border-primary/10 dark:border-secondary/10" {...props} />,
  th: ({node, ...props}) => <th className="px-4 py-2 text-left font-semibold border-r border-primary/10 dark:border-secondary/10 last:border-r-0" {...props} />,
  td: ({node, ...props}) => <td className="px-4 py-2 border-r border-primary/10 dark:border-secondary/10 last:border-r-0" {...props} />,

  // Horizontal rule
  hr: ({node, ...props}) => <hr className="my-8 border-primary/10 dark:border-secondary/10" {...props} />,

  // Task lists (GFM)
  input: ({node, ...props}) => {
    if (props.type === 'checkbox') {
      return <input type="checkbox" className="mr-2 rounded border-primary/30 dark:border-secondary/30" disabled {...props} />;
    } else if (props.type === 'radio') {
      return <input type="radio" className="mr-2 rounded border-primary/30 dark:border-secondary/30" disabled {...props} />;
    }
    return <input {...props} />;
  },
};

export default markdownComponents;