/** Bouton de suppression avec confirmation. */
export default function DeleteButton({ confirmMessage, onDelete, label = 'Supprimer' }) {
  const handleClick = () => {
    if (window.confirm(confirmMessage)) onDelete()
  }

  return (
    <button type="button" className="button--danger" onClick={handleClick}>
      {label}
    </button>
  )
}
