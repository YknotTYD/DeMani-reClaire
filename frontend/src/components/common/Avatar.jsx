const COLORS = [
  'var(--color-primary-soft)',
  'var(--color-complementary-soft)',
  'var(--color-secondary)',
  'var(--color-thirdary-soft)',
]

/** Pastille ronde avec l'initiale ; la couleur dépend du nom pour rester stable. */
export default function Avatar({ name }) {
  const index = [...name].reduce((sum, ch, i) => sum + ch.charCodeAt(0) * (i + 1), 0) % COLORS.length
  return (
    <span className="avatar" style={{ background: COLORS[index] }}>
      {name.charAt(0).toUpperCase()}
    </span>
  )
}
