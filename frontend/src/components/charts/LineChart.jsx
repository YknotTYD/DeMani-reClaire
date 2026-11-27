import { useState } from 'react'

const WIDTH = 640
const HEIGHT = 260
const PAD = { top: 16, right: 110, bottom: 34, left: 34 }
const MAX_DIRECT_LABELS = 4
const LABEL_GAP = 14

const seriesColor = (index) => `var(--chart-${(index % 5) + 1})`

const format = (v) => (v === null || v === undefined ? '—' : v.toLocaleString('fr-FR', { maximumFractionDigits: 2 }))

/** Écarte verticalement les étiquettes de fin de courbe pour qu'elles ne se chevauchent pas. */
function spreadLabels(labels) {
  const sorted = [...labels].sort((a, b) => a.y - b.y)
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].y - sorted[i - 1].y < LABEL_GAP) sorted[i].y = sorted[i - 1].y + LABEL_GAP
  }
  return sorted
}

/**
 * Courbes sur une échelle fixe (1 à 5 étoiles par défaut).
 * - `labels` : valeurs de l'axe horizontal (trimestres)
 * - `series` : [{ key, name, colorIndex, values: (nombre | null)[] }]
 * Survol : ligne verticale + infobulle. Légende dès 2 courbes, noms en bout de courbe jusqu'à 4.
 */
export default function LineChart({ labels, series, yMin = 1, yMax = 5, unit = '★', ariaLabel }) {
  const [hover, setHover] = useState(null)

  const plotW = WIDTH - PAD.left - PAD.right
  const plotH = HEIGHT - PAD.top - PAD.bottom
  const step = labels.length > 1 ? plotW / (labels.length - 1) : 0
  const x = (i) => PAD.left + (labels.length > 1 ? i * step : plotW / 2)
  const y = (v) => PAD.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH
  const ticks = Array.from({ length: yMax - yMin + 1 }, (_, i) => yMin + i)

  const lastIndex = (values) => values.findLastIndex((v) => v !== null && v !== undefined)
  const endLabels =
    series.length <= MAX_DIRECT_LABELS
      ? spreadLabels(
          series
            .map((s) => ({ s, i: lastIndex(s.values) }))
            .filter(({ i }) => i >= 0)
            .map(({ s, i }) => ({ key: s.key, text: `${s.name} ${format(s.values[i])}`, x: x(i) + 10, y: y(s.values[i]) + 4 })),
        )
      : []

  const pathOf = (values) => {
    let d = ''
    values.forEach((v, i) => {
      if (v === null || v === undefined) return
      const previous = values[i - 1]
      d += `${d && previous !== null && previous !== undefined ? 'L' : 'M'}${x(i)} ${y(v)} `
    })
    return d.trim()
  }

  return (
    <div className="line-chart">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={ariaLabel}>
        {ticks.map((t) => (
          <g key={t} className="line-chart__grid">
            <line x1={PAD.left} x2={PAD.left + plotW} y1={y(t)} y2={y(t)} />
            <text x={PAD.left - 10} y={y(t) + 4} textAnchor="end">
              {t}
            </text>
          </g>
        ))}
        {labels.map((label, i) => (
          <text key={label} className="line-chart__axis" x={x(i)} y={HEIGHT - 10} textAnchor="middle">
            {label}
          </text>
        ))}

        {hover !== null && <line className="line-chart__crosshair" x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + plotH} />}

        {series.map((s) => (
          <g key={s.key}>
            <path className="line-draw" pathLength="1" d={pathOf(s.values)} fill="none" stroke={seriesColor(s.colorIndex)} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {s.values.map((v, i) =>
              v === null || v === undefined ? null : (
                <circle
                  key={i}
                  cx={x(i)}
                  cy={y(v)}
                  r={hover === i ? 6 : 4.5}
                  fill={seriesColor(s.colorIndex)}
                  stroke="var(--color-surface)"
                  strokeWidth="2"
                />
              ),
            )}
          </g>
        ))}

        {endLabels.map((l) => (
          <text key={l.key} className="line-chart__label" x={l.x} y={l.y}>
            {l.text}
          </text>
        ))}

        {/* Zones de survol, plus larges que les points */}
        {labels.map((label, i) => (
          <rect
            key={label}
            x={x(i) - Math.max(step, 60) / 2}
            y={PAD.top}
            width={Math.max(step, 60)}
            height={plotH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>

      {hover !== null && (
        <div
          className="chart-tooltip"
          style={{ left: `${(x(hover) / WIDTH) * 100}%`, top: `${(PAD.top / HEIGHT) * 100}%` }}
          role="status"
        >
          <strong>{labels[hover]}</strong>
          {series.map((s) => (
            <span key={s.key} className="chart-tooltip__row">
              <span className="legend__swatch" style={{ background: seriesColor(s.colorIndex) }} />
              {s.name}
              <b>
                {format(s.values[hover])} {s.values[hover] != null && unit}
              </b>
            </span>
          ))}
        </div>
      )}

      {series.length >= 2 && (
        <div className="legend">
          {series.map((s) => (
            <span key={s.key} className="legend__item">
              <span className="legend__swatch" style={{ background: seriesColor(s.colorIndex) }} />
              {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
