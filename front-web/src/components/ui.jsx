import { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Info, Loader2, X } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   Shared public-site primitives.

   Every public page composes these so spacing, type scale,
   colour, and focus behaviour stay consistent instead of being
   re-declared per component.
   ═══════════════════════════════════════════════════════════ */

const CONTAINER_WIDTH = {
  narrow: 'max-w-3xl',
  default: 'max-w-5xl',
  wide: 'max-w-7xl',
};

export function Container({ size = 'wide', className = '', children }) {
  return (
    <div className={`mx-auto w-full ${CONTAINER_WIDTH[size] || CONTAINER_WIDTH.wide} px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Page-level header used by every route. The mesh + fading grid + grain stack
 * is what gives the public pages their depth; keeping it in one place stops
 * each page from reinventing a slightly different backdrop.
 */
export function PageHeader({ eyebrow, icon: Icon, title, highlight, description, meta, size = 'default', children }) {
  return (
    <header className="relative isolate overflow-hidden border-b border-slate-200/60 dark:border-slate-800/60 night:border-purple-900/10">
      <div className="mesh-hero absolute inset-0 -z-10" />
      <div className="grid-fade absolute inset-0 -z-10" />
      <div className="noise-overlay absolute inset-0 -z-10" />
      <div className="aurora-blob -right-32 -top-40 -z-10 h-[26rem] w-[26rem] bg-indigo-500/20 dark:bg-violet-500/20" />
      <div className="aurora-blob -left-40 top-40 -z-10 h-[22rem] w-[22rem] bg-fuchsia-500/15 [animation-delay:-8s]" />

      <Container size={size} className="pb-14 pt-20 sm:pb-16 sm:pt-24 lg:pb-20 lg:pt-28">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="eyebrow animate-pop">
              {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
              {eyebrow}
            </p>
          )}
          <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            {title}
            {highlight && <> <span className="text-gradient-primary">{highlight}</span></>}
          </h1>
          {description && (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              {description}
            </p>
          )}
          {meta && <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2">{meta}</div>}
          {children}
        </div>
      </Container>
    </header>
  );
}

/** Section wrapper providing the standard vertical rhythm and dividers. */
export function SectionShell({ id, size = 'wide', tone = 'plain', divider = true, className = '', children }) {
  const toneClass = tone === 'muted'
    ? 'bg-slate-50/70 dark:bg-slate-900/40 night:bg-black/40'
    : '';
  const borderClass = divider
    ? 'border-b border-slate-200/60 dark:border-slate-800/60 night:border-purple-900/10'
    : '';
  return (
    <section
      id={id}
      className={`relative scroll-mt-24 ${borderClass} ${toneClass} ${className}`}
    >
      {tone === 'muted' && <div className="mesh-muted pointer-events-none absolute inset-0 -z-10" />}
      <Container size={size} className="py-20 sm:py-24 lg:py-28">
        {children}
      </Container>
    </section>
  );
}

/** Eyebrow + heading + lede, used at the top of each section. */
export function SectionHeading({ eyebrow, icon: Icon, title, highlight, description, align = 'left', className = '', children, headingLevel: Heading = 'h2' }) {
  const centered = align === 'center';
  return (
    <div className={`${centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'} ${className}`}>
      {eyebrow && (
        <p className={`eyebrow ${centered ? 'mx-auto' : ''}`}>
          {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
          {eyebrow}
        </p>
      )}
      <Heading className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        {title}
        {highlight && <> <span className="text-gradient-primary">{highlight}</span></>}
      </Heading>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

export function Card({ as: Tag = 'div', interactive = true, className = '', children, ...rest }) {
  const interactiveClass = interactive ? 'card-surface hover:-translate-y-1' : 'card-surface';
  return (
    <Tag className={`${interactiveClass} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * Summary card that closes a home-page section: a few real numbers pulled from
 * the API plus a link through to the section's dedicated page.
 */
export function SectionLinkCard({ icon: Icon, eyebrow, title, description, to, linkLabel, facts = [], children, className = '' }) {
  return (
    <Card interactive={false} className={`mt-8 p-6 sm:p-8 ${className}`}>
      <div className="flex items-start gap-3.5">
        {Icon && (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/15 text-indigo-600 dark:text-violet-300">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">{eyebrow}</p>
          )}
          <h3 className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">{title}</h3>
          {description && (
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
          )}
        </div>
      </div>

      {facts.length > 0 && (
        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.label} className="rounded-xl border border-slate-200/60 bg-white/60 px-3.5 py-3 dark:border-slate-700/60 dark:bg-slate-800/40 night:border-purple-900/15">
              <dt className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">{fact.label}</dt>
              <dd className="counter-value mt-1 text-lg font-extrabold text-slate-900 dark:text-white">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {children}

      <ButtonLink to={to} variant="secondary" size="sm" className="mt-6" iconRight={ArrowRight}>
        {linkLabel}
      </ButtonLink>
    </Card>
  );
}

const CHIP_TONE = {
  neutral: '',
  accent: 'border-indigo-200/70 bg-indigo-50/80 text-indigo-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200',
  emerald: 'border-emerald-200/70 bg-emerald-50/80 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  amber: 'border-amber-200/70 bg-amber-50/80 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  rose: 'border-rose-200/70 bg-rose-50/80 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
};

export function Chip({ tone = 'neutral', icon: Icon, className = '', children, ...rest }) {
  return (
    <span className={`chip ${CHIP_TONE[tone] || ''} ${className}`} {...rest}>
      {Icon && <Icon className="h-3 w-3" aria-hidden="true" />}
      {children}
    </span>
  );
}

const BUTTON_SIZE = {
  sm: 'px-3.5 py-2 text-xs',
  md: 'px-5 py-3 text-sm',
  lg: 'px-6 py-3.5 text-base',
};

const BUTTON_VARIANT = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-violet-300',
  solid: 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700',
  outline: 'border border-slate-200/80 bg-white/70 text-slate-700 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:hover:bg-slate-700',
};

export function Button({ variant = 'primary', size = 'md', loading = false, icon: Icon, iconRight: IconRight, className = '', children, disabled, ...rest }) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`focus-ring cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${BUTTON_SIZE[size]} ${BUTTON_VARIANT[variant]} ${className}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
      {children}
      {IconRight && <IconRight className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}

/**
 * Button that routes internally when `to` is set and falls back to a plain
 * anchor for `href`, so callers never branch on link type themselves.
 */
export function ButtonLink({ to, href, variant = 'primary', size = 'md', icon: Icon, iconRight: IconRight, className = '', children, ...rest }) {
  const classes = `focus-ring ${BUTTON_SIZE[size]} ${BUTTON_VARIANT[variant]} ${className}`;
  const content = (
    <>
      {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
      {children}
      {IconRight && <IconRight className="h-4 w-4" aria-hidden="true" />}
    </>
  );

  if (to) {
    return <Link to={to} className={classes} {...rest}>{content}</Link>;
  }
  return <a href={href} className={classes} {...rest}>{content}</a>;
}

const NOTICE_TONE = {
  info: {
    icon: Info,
    wrapper: 'border-indigo-200/70 bg-indigo-50/70 text-indigo-900 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-100',
    iconClass: 'text-indigo-500 dark:text-indigo-300',
  },
  success: {
    icon: CheckCircle2,
    wrapper: 'border-emerald-200/70 bg-emerald-50/70 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
  },
  error: {
    icon: AlertCircle,
    wrapper: 'border-rose-200/70 bg-rose-50/70 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100',
    iconClass: 'text-rose-500 dark:text-rose-400',
  },
};

export function Notice({ tone = 'info', title, className = '', children, ...rest }) {
  const style = NOTICE_TONE[tone] || NOTICE_TONE.info;
  const Icon = style.icon;
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm font-medium ${style.wrapper} ${className}`} {...rest}>
      <Icon className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${style.iconClass}`} aria-hidden="true" />
      <div className="min-w-0 leading-relaxed">
        {title && <p className="font-bold">{title}</p>}
        {children && <div className={title ? 'mt-0.5 font-medium opacity-90' : 'font-medium'}>{children}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300/80 bg-white/50 px-6 py-16 text-center dark:border-slate-700/80 dark:bg-slate-900/40 night:border-purple-900/25 ${className}`}>
      {Icon && (
        <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/15 text-indigo-500 dark:text-violet-300">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      )}
      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = 'h-64' }) {
  return <div className={`animate-shimmer rounded-3xl bg-slate-200/70 dark:bg-slate-800/70 ${className}`} />;
}

const BAR_HEIGHT = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

/** Thin progress meter used by plans, skills, and stats. */
export function ProgressBar({ value = 0, label, size = 'md', className = '' }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div
      className={`${BAR_HEIGHT[size] || BAR_HEIGHT.md} w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800 ${className}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 transition-[width] duration-700 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function StatTile({ value, label, hint, delay = 0 }) {
  return (
    <div
      className="card-surface animate-pop flex flex-col items-center px-5 py-6 text-center"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="counter-value text-gradient-warm text-3xl font-extrabold sm:text-4xl">{value}</span>
      <span className="mt-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">{label}</span>
      {hint && <span className="mt-1 text-xs text-slate-400">{hint}</span>}
    </div>
  );
}

/* ─────────────── Form controls ─────────────── */

const CONTROL = 'w-full rounded-xl border border-slate-200/90 bg-white/85 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/12 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/70 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-violet-400 dark:focus:ring-violet-500/12 night:border-purple-900/25';

export function Field({ id, label, hint, error, required = false, className = '', children }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
          {label}
          {required && <span className="ml-1 text-rose-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
      {error && <p role="alert" className="mt-1.5 text-xs font-semibold text-rose-500">{error}</p>}
    </div>
  );
}

export function TextInput({ className = '', invalid, ...props }) {
  return (
    <input
      {...props}
      aria-invalid={invalid || undefined}
      className={`${CONTROL} ${invalid ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/15' : ''} ${className}`}
    />
  );
}

export function TextArea({ className = '', invalid, ...props }) {
  return (
    <textarea
      {...props}
      aria-invalid={invalid || undefined}
      className={`${CONTROL} resize-y leading-relaxed ${invalid ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/15' : ''} ${className}`}
    />
  );
}

export function Select({ options = [], className = '', children, ...props }) {
  return (
    <select {...props} className={`${CONTROL} cursor-pointer ${className}`}>
      {children ||
        options.map((option) =>
          typeof option === 'string'
            ? <option key={option} value={option}>{option}</option>
            : <option key={option.value} value={option.value}>{option.label}</option>,
        )}
    </select>
  );
}

/* ─────────────── Dialog ─────────────── */

const MODAL_WIDTH = {
  sm: 'max-w-md',
  default: 'max-w-2xl',
  lg: 'max-w-4xl',
  full: 'max-w-6xl',
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog: focus moves in on open, Tab is trapped, Escape closes,
 * background scroll is locked, and focus returns to the trigger on close.
 */
export function Modal({ open, onClose, title, description, size = 'default', className = '', children, bare = false }) {
  const titleId = useId();
  const panelRef = useRef(null);
  const restoreFocusRef = useRef(null);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose?.();
      return;
    }
    if (event.key !== 'Tab' || !panelRef.current) return;
    const focusable = [...panelRef.current.querySelectorAll(FOCUSABLE)].filter(
      (node) => node.offsetParent !== null || node === document.activeElement,
    );
    if (focusable.length === 0) {
      event.preventDefault();
      panelRef.current.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    restoreFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Defer so the panel exists before we move focus into it.
    const frame = window.requestAnimationFrame(() => {
      const target = panelRef.current?.querySelector(FOCUSABLE) || panelRef.current;
      target?.focus?.();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      if (restoreFocusRef.current instanceof HTMLElement) restoreFocusRef.current.focus();
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto p-4 sm:p-6 ${bare ? 'bg-slate-950/90 backdrop-blur-md' : 'bg-slate-950/60 backdrop-blur-sm'}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={`relative my-auto w-full ${MODAL_WIDTH[size]} ${bare ? '' : 'overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-950/25 dark:border-slate-800/80 dark:bg-slate-950/95'} ${className}`}
      >
        {!bare && (
          <>
            <div className="flex items-start justify-between gap-5 border-b border-slate-200/70 px-5 py-4 dark:border-slate-800/70 sm:px-6">
              <div className="min-w-0">
                <h2 id={titleId} className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">{title}</h2>
                {description && <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="focus-ring -mr-1 shrink-0 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="max-h-[70dvh] overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">{children}</div>
          </>
        )}
        {bare && (
          <>
            {/* Keeps aria-labelledby pointing at a real node in bare mode. */}
            <h2 id={titleId} className="sr-only">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="focus-ring absolute right-4 top-4 rounded-xl border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            {children}
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
