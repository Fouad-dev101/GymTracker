/* Small formatting / date / unit helpers shared across the app. */

export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/* ── Dates ─────────────────────────────────────────────────── */

const DAYS_FR = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];
const MONTHS_FR = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
];

/** 'YYYY-MM-DD' for a Date, in local time. */
export const toISODate = (date = new Date()) => {
  const d = new Date(date);
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

export const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

export const parseISODate = (iso) => {
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

/** Monday-based start of week. Accepts a Date or a 'YYYY-MM-DD' string. */
export const startOfWeek = (date = new Date()) => {
  const d = typeof date === 'string' ? parseISODate(date) : new Date(date);
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const endOfWeek = (date = new Date()) => {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const diffInDays = (a, b) => {
  const ms = parseISODate(toISODate(a)) - parseISODate(toISODate(b));
  return Math.round(ms / 86400000);
};

export const formatShortDate = (value) => {
  const d = value instanceof Date ? value : parseISODate(value);
  return `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;
};

export const formatDayMonth = (value) => {
  const d = value instanceof Date ? value : parseISODate(value);
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;
};

export const formatLongDate = (value) => {
  const d = value instanceof Date ? value : parseISODate(value);
  return `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatMonthYear = (value) => {
  const d = value instanceof Date ? value : parseISODate(value);
  return `${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
};

/** "Aujourd'hui" / "Hier" / a short date. */
export const relativeDay = (value) => {
  const diff = diffInDays(new Date(), value);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Hier';
  if (diff > 1 && diff < 7) return `Il y a ${diff} jours`;
  return formatShortDate(value);
};

export const formatClock = (totalSeconds) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${`${m}`.padStart(2, '0')}:${`${sec}`.padStart(2, '0')}`;
  return `${`${m}`.padStart(2, '0')}:${`${sec}`.padStart(2, '0')}`;
};

export const formatDuration = (totalSeconds) => {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  if (h > 0) return m > 0 ? `${h} h ${m} min` : `${h} h`;
  if (s < 60) return `${s} s`;
  return `${m} min`;
};

/* ── Units ─────────────────────────────────────────────────── */

export const LB_PER_KG = 2.20462262185;

export const kgToLb = (kg) => kg * LB_PER_KG;
export const lbToKg = (lb) => lb / LB_PER_KG;

/** Weights are always stored in kg; convert for display. */
export const toDisplayWeight = (kg, unit) =>
  unit === 'lb' ? kgToLb(Number(kg) || 0) : Number(kg) || 0;

/** Convert a user-typed value back to kg before storing. */
export const fromDisplayWeight = (value, unit) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return unit === 'lb' ? lbToKg(n) : n;
};

export const unitLabel = (unit) => (unit === 'lb' ? 'lb' : 'kg');

/** 1 decimal max, French thousands separator. */
export const formatNumber = (n, decimals = 1) => {
  const value = Number(n) || 0;
  return value.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

export const formatWeight = (kg, unit, decimals = 1) =>
  `${formatNumber(toDisplayWeight(kg, unit), decimals)} ${unitLabel(unit)}`;

/** Big volumes read better without decimals. */
export const formatVolume = (kg, unit) => {
  const value = toDisplayWeight(kg, unit);
  if (value >= 1000) return `${formatNumber(value / 1000, 1)} t`;
  return `${formatNumber(value, 0)} ${unitLabel(unit)}`;
};

export const roundTo = (n, step = 2.5) => Math.round((Number(n) || 0) / step) * step;
