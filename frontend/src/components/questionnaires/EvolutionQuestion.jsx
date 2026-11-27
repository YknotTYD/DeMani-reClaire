const EVOLUTION_QUESTION = 'Souhaitez-vous évoluer dans votre poste ou votre carrière ?'

/**
 * Question Oui / Non posée avec le questionnaire trimestriel.
 * `value` : true, false ou null (pas de réponse). Lecture seule si `onChange` n'est pas fourni.
 */
export default function EvolutionQuestion({ value, onChange }) {
  if (!onChange) {
    const answer = value === null ? 'Pas de réponse' : value ? 'Oui' : 'Non'
    return (
      <p>
        {EVOLUTION_QUESTION} <strong>{answer}</strong>
      </p>
    )
  }

  return (
    <fieldset className="evolution-question">
      <legend>
        {EVOLUTION_QUESTION}
        <span className="column-hint">Si tu réponds oui, ton gestionnaire RH en sera informé pour en parler avec toi.</span>
      </legend>
      {[
        { label: 'Oui', val: true },
        { label: 'Non', val: false },
      ].map(({ label, val }) => (
        <label key={label} className="inline-label">
          <input type="radio" name="wants-evolution" checked={value === val} onChange={() => onChange(val)} />
          {label}
        </label>
      ))}
    </fieldset>
  )
}
