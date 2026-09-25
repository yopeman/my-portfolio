export function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
      )}
      {children}
    </label>
  );
}

const inputClass = 'w-full rounded-xl border border-slate-300/80 bg-white/75 px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/75 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-violet-500 dark:focus:ring-violet-500/10';

export function TextInput(props) {
  return <input {...props} className={`${inputClass} ${props.className || ''}`} />;
}

export function TextArea(props) {
  return <textarea {...props} className={`${inputClass} resize-y leading-relaxed ${props.className || ''}`} />;
}

export function Select({ options, ...props }) {
  return (
    <select {...props} className={`${inputClass} ${props.className || ''}`}>
      {options.map((opt) =>
        typeof opt === 'string' ? (
          <option key={opt} value={opt}>{opt}</option>
        ) : (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ),
      )}
    </select>
  );
}

export function ActionButton({ variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-indigo-500/15';
  const styles = {
    primary: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/15 hover:-translate-y-0.5 hover:shadow-lg',
    danger: 'bg-rose-600 text-white hover:-translate-y-0.5 hover:bg-rose-500',
    neutral: 'bg-slate-200/80 text-slate-800 hover:bg-slate-300 dark:bg-slate-700/80 dark:text-slate-100 dark:hover:bg-slate-600',
    subtle: 'bg-transparent text-slate-500 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/30',
  };
  return <button {...props} className={`${base} ${styles[variant] || styles.primary} ${className}`} />;
}

export function Badge({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  };
  return <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tones[tone] || tones.slate}`}>{children}</span>;
}
