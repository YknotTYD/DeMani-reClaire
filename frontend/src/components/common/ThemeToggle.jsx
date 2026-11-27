import { useTheme } from '../../hooks/useTheme'

/** Interrupteur mode clair / mode sombre. */
export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'

  return (
    <button
      type="button"
      className="theme-toggle"
      role="switch"
      aria-checked={dark}
      onClick={toggle}
      title={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
    >
      <span className="theme-toggle__track">
        <span className="theme-toggle__thumb">{dark ? '☾' : '☀'}</span>
      </span>
      {dark ? 'Mode sombre' : 'Mode clair'}
    </button>
  )
}
