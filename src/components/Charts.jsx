import React from 'react';
import { MUSCLE_MAP } from '../data/exercises';
import { formatDayMonth } from '../utils/format';

/* ── Weekly volume bars ────────────────────────────────────── */

export function BarChart({ data, formatValue = (v) => v, height = 170 }) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="bar-chart" style={{ height }}>
      {data.map((item) => {
        const pct = (item.value / max) * 100;
        return (
          <div className="bar-col" key={item.key || item.label}>
            <div className="bar-value">{item.value > 0 ? formatValue(item.value) : ''}</div>
            <div className="bar-track" title={`${item.label} : ${formatValue(item.value)}`}>
              <div
                className={`bar-fill ${item.highlight ? 'today' : ''}`}
                style={{ height: `${Math.max(item.value > 0 ? 3 : 0, pct)}%` }}
              />
            </div>
            <div className="bar-label">{item.label}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Line / area chart (SVG) ───────────────────────────────── */

export function LineChart({
  points,
  formatValue = (v) => `${Math.round(v)}`,
  color = 'var(--accent)',
  height = 240,
  label = 'Valeur',
}) {
  const W = 700;
  const H = height;
  const PAD = { top: 18, right: 14, bottom: 26, left: 46 };

  if (!points || points.length < 2) {
    return (
      <div className="empty" style={{ padding: 30 }}>
        <p>Il faut au moins deux points de données pour tracer cette courbe.</p>
      </div>
    );
  }

  const values = points.map((p) => p.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const span = rawMax - rawMin || Math.max(1, rawMax * 0.1);
  const min = Math.max(0, rawMin - span * 0.15);
  const max = rawMax + span * 0.15;

  const x = (i) =>
    PAD.left + (i / Math.max(1, points.length - 1)) * (W - PAD.left - PAD.right);
  const y = (v) => PAD.top + (1 - (v - min) / (max - min || 1)) * (H - PAD.top - PAD.bottom);

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ');
  const area = `${line} L ${x(points.length - 1).toFixed(1)} ${H - PAD.bottom} L ${x(0).toFixed(1)} ${H - PAD.bottom} Z`;

  const gridValues = [min, (min + max) / 2, max];
  const gradientId = `grad-${label.replace(/\W/g, '')}`;

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label={label}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.34" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridValues.map((value) => (
          <g key={value}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(value)}
              y2={y(value)}
              stroke="var(--border)"
              strokeDasharray="4 6"
            />
            <text x={PAD.left - 10} y={y(value) + 4} textAnchor="end" fontSize="11" fill="var(--text-dim)">
              {formatValue(value)}
            </text>
          </g>
        ))}

        <path d={area} fill={`url(#${gradientId})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((point, i) => (
          <g key={`${point.date}-${i}`}>
            <circle cx={x(i)} cy={y(point.value)} r={i === points.length - 1 ? 5 : 3.5} fill={color} stroke="var(--surface)" strokeWidth="2">
              <title>{`${formatDayMonth(point.date)} — ${formatValue(point.value)}`}</title>
            </circle>
          </g>
        ))}

        <text x={PAD.left} y={H - 6} fontSize="11" fill="var(--text-dim)">
          {formatDayMonth(points[0].date)}
        </text>
        <text x={W - PAD.right} y={H - 6} textAnchor="end" fontSize="11" fill="var(--text-dim)">
          {formatDayMonth(points[points.length - 1].date)}
        </text>
      </svg>
    </div>
  );
}

/* ── Muscle balance bars ───────────────────────────────────── */

export function MuscleBalance({ data }) {
  if (!data.length) {
    return <p className="dim text-sm">Aucune donnée sur cette période.</p>;
  }
  const max = Math.max(...data.map((d) => d.sets));

  return (
    <div>
      {data.map((item) => {
        const muscle = MUSCLE_MAP[item.key];
        return (
          <div className="muscle-row" key={item.key}>
            <span className="truncate muted">
              {muscle ? `${muscle.emoji} ${muscle.label}` : item.key}
            </span>
            <span className="muscle-track">
              <span
                className="muscle-fill"
                style={{
                  width: `${(item.sets / max) * 100}%`,
                  background: muscle ? muscle.color : 'var(--accent)',
                }}
              />
            </span>
            <span className="val">{item.sets} séries</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Progress ring ─────────────────────────────────────────── */

export function RingProgress({ value, max, size = 108, thickness = 11, big, small }) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-3)"
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset .6s var(--ease)' }}
        />
      </svg>
      <div className="ring-center">
        <div>
          <div className="big">{big}</div>
          {small && <div className="small">{small}</div>}
        </div>
      </div>
    </div>
  );
}

/* ── Sparkline ─────────────────────────────────────────────── */

export function Sparkline({ values, width = 90, height = 30, color = 'var(--accent)' }) {
  if (!values || values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const step = width / (values.length - 1);
  const path = values
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i * step).toFixed(1)} ${(height - ((v - min) / span) * (height - 6) - 3).toFixed(1)}`)
    .join(' ');

  return (
    <svg width={width} height={height} aria-hidden="true">
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
