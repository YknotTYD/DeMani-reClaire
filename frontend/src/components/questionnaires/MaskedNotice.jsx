/** Seuil d'anonymat (rapport, section 5.5) : aucun résultat collectif pour un petit groupe. */
export default function MaskedNotice({ answered, minGroup = 10 }) {
  return (
    <p className="notice notice--privacy">
      Résultats masqués : {answered} réponse{answered > 1 ? 's' : ''} sur les {minGroup} nécessaires pour préserver
      l'anonymat. Ils s'afficheront dès le {minGroup}<sup>e</sup> répondant.
    </p>
  )
}
