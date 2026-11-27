import { useState } from 'react'
import { CANDIDATE_STATUSES, DOCUMENT_TYPES, guessDocType } from '../../utils/recruitment'
import ChipGroup from '../common/ChipGroup'
import PositionPicker from './PositionPicker'

/**
 * Message du bot après lecture d'un fichier : le RH vérifie le nom / l'email,
 * choisit le poste, le type de document et le statut, puis envoie.
 */
export default function FilingForm({ fileName, extracted, positions, defaultPositionId, onCreatePosition, onSubmit }) {
  const [name, setName] = useState(extracted.name)
  const [email, setEmail] = useState(extracted.email)
  const [positionId, setPositionId] = useState(defaultPositionId)
  const [docType, setDocType] = useState(guessDocType(fileName))
  const [status, setStatus] = useState('nouveau')
  const [sending, setSending] = useState(false)
  const [informed, setInformed] = useState(false)

  const ready = name.trim() && positionId && informed

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    await onSubmit({ positionId, name: name.trim(), email: email.trim(), docType, status, informed })
    setSending(false)
  }

  return (
    <form className="filing-form" onSubmit={handleSubmit}>
      <p className="ai-mention">IA utilisée : non. Lecture automatique du texte du fichier, à vérifier par toi.</p>
      <p>
        {extracted.name
          ? "J'ai lu le fichier. Vérifie les informations du candidat :"
          : "Je n'ai pas trouvé le nom dans le fichier, peux-tu l'écrire ?"}
      </p>
      <div className="filing-form__contact">
        <input placeholder="Nom du candidat" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email (facultatif)" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <p className="filing-form__label">Poste visé</p>
      <PositionPicker positions={positions} value={positionId} onChange={setPositionId} onCreate={onCreatePosition} />

      <p className="filing-form__label">Type de document</p>
      <ChipGroup label="Type de document" options={DOCUMENT_TYPES} value={docType} onChange={setDocType} />

      <p className="filing-form__label">Statut du candidat</p>
      <ChipGroup label="Statut" options={CANDIDATE_STATUSES} value={status} onChange={setStatus} />

      <label className="inline-label informed-check">
        <input type="checkbox" checked={informed} onChange={(e) => setInformed(e.target.checked)} />
        Le candidat a été informé du traitement de ses données et de leur durée de conservation (2 ans après le dernier contact)
      </label>
      <button type="submit" disabled={!ready || sending}>
        Ranger le fichier
      </button>
    </form>
  )
}
