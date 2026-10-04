import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

/* ── Card ──────────────────────────────────────────────────── */

export function Card({ title, sub, actions, children, className = '', flat = false, ...rest }) {
  return (
    <section className={`card ${flat ? 'flat' : ''} ${className}`} {...rest}>
      {(title || actions) && (
        <header className="card-head">
          <div>
            {title && <h3>{title}</h3>}
            {sub && <div className="sub">{sub}</div>}
          </div>
          {actions && <div className="spacer flex items-center gap-8">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

/* ── Stat card ─────────────────────────────────────────────── */

export function StatCard({ icon, label, value, hint, tone = 'default' }) {
  const tones = {
    default: {},
    accent: { background: 'var(--accent-soft)' },
    info: { background: 'var(--accent-2-soft)' },
  };
  return (
    <div className="card stat">
      <div className="stat-icon" style={tones[tone] || tones.default}>
        <span aria-hidden="true">{icon}</span>
      </div>
      <div>
        <div className="label">{label}</div>
        <div className="value tabnum">{value}</div>
        {hint && <div className="hint">{hint}</div>}
      </div>
    </div>
  );
}

/* ── Buttons ───────────────────────────────────────────────── */

export function Button({
  variant = 'default',
  size,
  block,
  icon,
  children,
  className = '',
  ...rest
}) {
  const classes = [
    'btn',
    variant !== 'default' ? `btn-${variant}` : '',
    size ? `btn-${size}` : '',
    block ? 'btn-block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={classes} {...rest}>
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </button>
  );
}

export function IconButton({ label, children, ...rest }) {
  return (
    <button type="button" className="btn btn-icon btn-ghost" aria-label={label} title={label} {...rest}>
      <span aria-hidden="true">{children}</span>
    </button>
  );
}

/* ── Modal ─────────────────────────────────────────────────── */

export function Modal({ open, title, onClose, children, footer, maxWidth }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal" style={maxWidth ? { maxWidth } : undefined} role="dialog" aria-modal="true">
        <header className="modal-head">
          <h3>{title}</h3>
          <IconButton label="Fermer" className="ml-auto" onClick={onClose}>
            ✕
          </IconButton>
        </header>
        <div className="modal-body">
          {children}
          {footer && <div className="modal-foot">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title = 'Confirmer',
  message,
  confirmLabel = 'Confirmer',
  danger = true,
  onConfirm,
  onClose,
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="muted">{message}</p>
    </Modal>
  );
}

/* ── Empty state ───────────────────────────────────────────── */

export function EmptyState({ emoji = '🏋️', title, text, action }) {
  return (
    <div className="empty">
      <span className="emoji" aria-hidden="true">
        {emoji}
      </span>
      {title && <div className="text-lg">{title}</div>}
      {text && <p style={{ marginTop: title ? 6 : 0 }}>{text}</p>}
      {action}
    </div>
  );
}

/* ── Form bits ─────────────────────────────────────────────── */

export function Field({ label, hint, children }) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      {children}
      {hint && <div className="dim" style={{ fontSize: 12 }}>{hint}</div>}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Rechercher…', ...rest }) {
  return (
    <div className="search-wrap">
      <span className="search-icon" aria-hidden="true">
        🔍
      </span>
      <input
        className="input"
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
    </div>
  );
}

export function Segmented({ options, value, onChange }) {
  return (
    <div className="chips">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`chip ${option.value === value ? 'active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label, hint }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="row clickable"
      style={{ padding: '10px 0', gap: 12 }}
      aria-pressed={checked}
    >
      <span className="grow" style={{ textAlign: 'left' }}>
        <span className="title" style={{ display: 'block' }}>{label}</span>
        {hint && <span className="meta">{hint}</span>}
      </span>
      <span
        className="dot"
        style={{
          width: 44,
          height: 24,
          borderRadius: 999,
          background: checked ? 'var(--accent)' : 'var(--surface-3)',
          position: 'relative',
          transition: 'background .2s var(--ease)',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: checked ? 23 : 3,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: checked ? 'var(--accent-ink)' : 'var(--text-dim)',
            transition: 'left .2s var(--ease)',
          }}
        />
      </span>
    </button>
  );
}

/* ── Toasts ────────────────────────────────────────────────── */

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, tone = 'default') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            <span aria-hidden="true">
              {toast.tone === 'success' ? '✅' : toast.tone === 'error' ? '⚠️' : 'ℹ️'}
            </span>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  return ctx?.push || (() => {});
};
