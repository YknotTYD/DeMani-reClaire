/** Icônes au trait de la maquette Teams (dessinées ici, aucune icône officielle). */
const paths = {
  activite: 'M12 3a5 5 0 0 0-5 5v3.5L5.5 15h13L17 11.5V8a5 5 0 0 0-5-5Zm-2 14a2 2 0 0 0 4 0',
  conversation: 'M4 5h16v10H9l-5 4V5Z',
  equipes: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7 0a2.5 2.5 0 1 0 0-5M3 19c0-3 2.7-5 6-5s6 2 6 5M15.5 14c2.8 0 5 1.6 5 4.5',
  calendrier: 'M4 6h16v14H4V6Zm0 4h16M8 3v4m8-4v4',
  appels: 'M6 4h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4 6a2 2 0 0 1 2-2Z',
  fichiers: 'M6 3h8l4 4v14H6V3Zm8 0v4h4',
  applications: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 3h6m-3-3v6',
  plus: 'M5 12h.01M12 12h.01M19 12h.01',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4-4',
  back: 'M15 5l-7 7 7 7',
  forward: 'M9 5l7 7-7 7',
  send: 'M4 12 20 4l-6 16-3-7-7-1Z',
  attach: 'M16 8l-6.5 6.5a2 2 0 0 0 2.8 2.8L19 10.6a4 4 0 0 0-5.7-5.7L6.6 11.6a6 6 0 0 0 8.5 8.5',
  emoji: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM8.5 14a4 4 0 0 0 7 0M9 9.5h.01M15 9.5h.01',
  format: 'M5 19h14M8 15l4-10 4 10M9.5 11h5',
  video: 'M3 7h12v10H3V7Zm12 4 6-3v8l-6-3',
  call: 'M6 4h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4 6a2 2 0 0 1 2-2Z',
  close: 'M6 6l12 12M18 6 6 18',
  edit: 'M4 20h4L19 9l-4-4L4 16v4Z',
  filter: 'M4 6h16M7 12h10M10 18h4',
  pin: 'M9 4h6l-1 5 3 3H7l3-3-1-5Zm3 8v8',
  file: 'M6 3h8l4 4v14H6V3Zm8 0v4h4M9 13h6M9 17h4',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  check: 'M5 12l4 4 10-10',
}

export default function Icon({ name, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  )
}
