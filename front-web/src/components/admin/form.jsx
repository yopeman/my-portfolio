import { useEffect, useId, useRef } from 'react';
import { Inbox, LoaderCircle, Paperclip, Search, UploadCloud, X } from 'lucide-react';

export function Field({ label, hint, error, required = false, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
          {label}
          {required && <span className="text-rose-500">*</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="mt-1.5 block text-xs text-slate-400">{hint}</span>}
      {error && <span role="alert" className="mt-1.5 block text-xs font-medium text-rose-500">{error}</span>}
    </label>
  );
}

const inputClass = 'w-full rounded-xl border border-slate-300/80 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900/70 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-violet-500 dark:focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60';

export function TextInput(props) {
  return <input {...props} className={`${inputClass} ${props.className || ''}`} />;
}

export function TextArea(props) {
  return <textarea {...props} className={`${inputClass} resize-y leading-relaxed ${props.className || ''}`} />;
}

export function Select({ options = [], ...props }) {
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

export function ActionButton({ variant = 'primary', className = '', loading = false, type = 'button', children, ...props }) {
  const { disabled, ...rest } = props;
  const base = 'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/15';
  const styles = {
    primary: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/15 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/20',
    danger: 'bg-rose-600 text-white shadow-md shadow-rose-600/15 hover:-translate-y-0.5 hover:bg-rose-500',
    neutral: 'border border-slate-200/80 bg-white/70 text-slate-700 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:hover:bg-slate-700',
    subtle: 'bg-transparent text-slate-500 hover:bg-rose-50 hover:text-rose-500 dark:text-slate-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-300',
    success: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/15 hover:-translate-y-0.5 hover:bg-emerald-500',
  };
  return (
    <button {...rest} type={type} disabled={disabled || loading} className={`${base} ${styles[variant] || styles.primary} ${className}`}>
      {loading && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  );
}

export function Badge({ children, tone = 'slate', className = '', dot = false }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    sky: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  };
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${tones[tone] || tones.slate} ${className}`}>{dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}{children}</span>;
}

export function AdminHeader({ eyebrow = 'Workspace', title, description, actions, children }) {
  return (
    <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-indigo-600 dark:text-violet-400">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      {children}
    </div>
  );
}

export function AdminPanel({ children, className = '', as: Element = 'section' }) {
  return <Element className={`rounded-2xl border border-slate-200/70 bg-white/75 shadow-sm backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70 night:border-purple-900/20 night:bg-black/70 ${className}`}>{children}</Element>;
}

export function AdminToolbar({ children, className = '' }) {
  return <div className={`flex flex-col gap-3 border-b border-slate-200/70 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800/70 ${className}`}>{children}</div>;
}

export function Modal({ open, onClose, title, description, eyebrow, children }) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden bg-slate-950/60 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="flex h-[100dvh] w-screen max-w-none flex-col overflow-hidden bg-white/95 shadow-2xl shadow-slate-950/20 backdrop-blur-xl dark:bg-slate-950/95">
        <div className="flex shrink-0 items-start justify-between gap-5 border-b border-slate-200/70 px-5 py-5 sm:px-7">
          <div className="min-w-0"><p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-indigo-600 dark:text-violet-400">{eyebrow}</p><h2 id={titleId} className="mt-1 text-xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-2xl">{title}</h2>{description && <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>}</div>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white"><X className="h-4 w-4" /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-7">{children}</div>
      </div>
    </div>
  );
}

export function AttachmentField({ label = 'Attachments', hint, files = [], existingFiles = [], onChange, onRemoveExisting, accept = 'image/*,.pdf,.doc,.docx', multiple = true, disabled = false }) {
  const inputRef = useRef(null);
  const addFiles = (incoming) => {
    const nextFiles = Array.from(incoming || []);
    if (nextFiles.length > 0) onChange?.([...files, ...nextFiles]);
    if (inputRef.current) inputRef.current.value = '';
  };
  const removeFile = (index) => onChange?.(files.filter((_, fileIndex) => fileIndex !== index));

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3"><span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{label}</span><span className="text-[10px] font-bold text-slate-400">{files.length + existingFiles.length} attached</span></div>
      <div className={`rounded-2xl border border-dashed p-5 text-center transition ${disabled ? 'cursor-not-allowed border-slate-200 opacity-60 dark:border-slate-800' : 'border-indigo-300/70 bg-indigo-50/40 hover:border-indigo-400 hover:bg-indigo-50 dark:border-violet-700/60 dark:bg-violet-950/20 dark:hover:bg-violet-950/30'}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (!disabled) addFiles(event.dataTransfer.files); }}>
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} disabled={disabled} className="sr-only" onChange={(event) => addFiles(event.target.files)} />
        <UploadCloud className="mx-auto h-7 w-7 text-indigo-500 dark:text-violet-300" />
        <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Drop files here or <button type="button" disabled={disabled} onClick={() => inputRef.current?.click()} className="font-extrabold text-indigo-600 hover:text-indigo-700 disabled:cursor-not-allowed dark:text-violet-300 dark:hover:text-violet-200">browse</button></p>
        <p className="mt-1 text-xs text-slate-400">{hint || 'Upload images, documents, or other supporting files.'}</p>
      </div>
      {(existingFiles.length > 0 || files.length > 0) && <div className="mt-3 space-y-2">
        {existingFiles.map((file) => <div key={file._id} className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2.5 dark:border-slate-800/70 dark:bg-slate-900/60"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"><Paperclip className="h-3.5 w-3.5" /></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-700 dark:text-slate-200">{file.name || file.title || 'Attachment'}</p><p className="text-[10px] text-slate-400">Already uploaded</p></div>{onRemoveExisting && <button type="button" disabled={disabled} onClick={() => onRemoveExisting(file)} aria-label={`Remove ${file.name || 'attachment'}`} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"><X className="h-3.5 w-3.5" /></button>}</div>)}
        {files.map((file, index) => <div key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 px-3 py-2.5 dark:border-violet-900/40 dark:bg-violet-950/20"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-violet-950/70 dark:text-violet-300"><Paperclip className="h-3.5 w-3.5" /></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-700 dark:text-slate-200">{file.name}</p><p className="text-[10px] text-indigo-500 dark:text-violet-300">Ready to upload</p></div><button type="button" disabled={disabled} onClick={() => removeFile(index)} aria-label={`Remove ${file.name}`} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"><X className="h-3.5 w-3.5" /></button></div>)}
      </div>}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input type="search" value={value} onChange={onChange} placeholder={placeholder} aria-label={placeholder} className="w-full rounded-xl border border-slate-200/80 bg-white/75 py-2.5 pl-10 pr-10 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900/70 dark:text-white dark:focus:border-violet-400" />
      {value && <button type="button" onClick={() => onChange({ target: { value: '' } })} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"><X className="h-3.5 w-3.5" /></button>}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"><Icon className="h-5 w-5" /></div>
      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function TableEmpty({ colSpan, icon: Icon, title, description }) {
  return <tr><td colSpan={colSpan} className="p-0"><EmptyState icon={Icon} title={title} description={description} /></td></tr>;
}

export function LoadingRows({ rows = 4 }) {
  return <>{Array.from({ length: rows }, (_, index) => <tr key={index}><td colSpan={8} className="px-4 py-4"><div className="h-9 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/80" /></td></tr>)}</>;
}
