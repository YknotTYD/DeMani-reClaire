import { SOURCES } from '../../utils/sources'

/** Petite étiquette qui dit de quel système de la banque vient une donnée. */
export default function SourceBadge({ source }) {
  const s = SOURCES[source]
  return (
    <span className={`source-badge source-badge--${source}`} title={s.title}>
      <span aria-hidden="true">⇄</span> {s.label}
    </span>
  )
}
