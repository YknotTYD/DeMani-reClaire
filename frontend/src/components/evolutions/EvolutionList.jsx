import EvolutionItem from './EvolutionItem'

export default function EvolutionList({ evolutions, onSave }) {
  if (evolutions.length === 0) return <p className="muted">Aucun membre n'a demandé à évoluer.</p>

  return (
    <ul className="alert-list">
      {evolutions.map((evolution) => (
        <EvolutionItem
          // la clé inclut le statut et la note : le formulaire repart des valeurs enregistrées après sauvegarde
          key={`${evolution.id}-${evolution.status}-${evolution.note}`}
          evolution={evolution}
          onSave={onSave}
        />
      ))}
    </ul>
  )
}
