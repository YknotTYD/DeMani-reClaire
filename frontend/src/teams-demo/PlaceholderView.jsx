/** Vues secondaires (appels, fichiers) : de quoi remplir l'écran pendant la démo. */
const CONTENT = {
  appels: { title: 'Appels', lines: ['Jean Cule · Appel manqué (3) · 08:12', 'Sarah Croche · Appel entrant · 2 min · Hier', 'Nathalie Durand · Appel sortant · 4 min · Hier', 'Inès Moreau · Appel entrant · 12 min · Mar.', 'Réunion équipe RH · 58 min · Lun.'] },
  fichiers: { title: 'Fichiers', lines: ['Charte_Trajectoires_1page.pdf · Équipe RH · Hier', 'Registre_usages_IA.xlsx · Comité IA · Ven.', 'Trames_entretien_parcours.docx · Carrières · 18 nov.', 'Planning_siestes_T1.xlsx · Paul Ochon · 12 nov.'] },
}

export default function PlaceholderView({ view }) {
  const c = CONTENT[view]
  return (
    <section className="tm-store">
      <header className="tm-store__head"><h2>{c.title}</h2></header>
      <ul className="tm-plain-list">{c.lines.map((l) => <li key={l}>{l}</li>)}</ul>
    </section>
  )
}
