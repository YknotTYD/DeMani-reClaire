import { useState } from 'react'
import { ABSENCE_KINDS, PROOF_ACCEPT, daysLabel, workingDays } from '../../utils/absences'
import ChipGroup from '../common/ChipGroup'

const KIND_OPTIONS = Object.entries(ABSENCE_KINDS).map(([value, k]) => ({ value, label: k.label }))

/** Déclaration d'une absence : type, dates (demi-journées possibles), commentaire, justificatif selon le type. */
export default function AbsenceForm({ initialDay, onSubmit, onCancel, pending }) {
  const [values, setValues] = useState({
    kind: 'conges',
    start_date: initialDay,
    end_date: initialDay,
    start_afternoon: false,
    end_morning: false,
    comment: '',
  })
  const [files, setFiles] = useState([])
  const set = (key) => (value) => setValues((v) => ({ ...v, [key]: value }))

  const rule = ABSENCE_KINDS[values.kind]
  const days = workingDays(values)
  const missingProof = rule.proof === 'obligatoire' && files.length === 0
  const singleDay = values.start_date === values.end_date

  const submit = (e) => {
    e.preventDefault()
    onSubmit({ ...values, files: rule.proof === 'aucun' ? [] : files })
  }

  return (
    <form className="absence-form" onSubmit={submit}>
      <ChipGroup label="Type d'absence" options={KIND_OPTIONS} value={values.kind} onChange={set('kind')} />
      <p className="muted">{rule.hint}</p>

      <div className="absence-form__dates">
        <label>
          Du
          <input type="date" required value={values.start_date} onChange={(e) => set('start_date')(e.target.value)} />
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={values.start_afternoon} onChange={(e) => set('start_afternoon')(e.target.checked)} />
          à partir de l'après-midi
        </label>
        <label>
          Au
          <input type="date" required min={values.start_date} value={values.end_date} onChange={(e) => set('end_date')(e.target.value)} />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={values.end_morning}
            disabled={singleDay && values.start_afternoon}
            onChange={(e) => set('end_morning')(e.target.checked)}
          />
          jusqu'à midi
        </label>
      </div>
      {days > 0 && <p className="absence-form__days">Soit {daysLabel(days)}</p>}

      <label>
        Commentaire (facultatif)
        <textarea rows={2} value={values.comment} onChange={(e) => set('comment')(e.target.value)} />
      </label>

      {rule.proof !== 'aucun' && (
        <label>
          Justificatif ({rule.proof}) · PDF, JPG ou PNG
          <input type="file" multiple accept={PROOF_ACCEPT} onChange={(e) => setFiles([...e.target.files])} />
        </label>
      )}

      <div className="form-actions">
        <button type="submit" disabled={pending || missingProof || days <= 0}>
          Déclarer l'absence
        </button>
        {onCancel && (
          <button type="button" className="button--ghost" onClick={onCancel}>
            Annuler
          </button>
        )}
      </div>
      {missingProof && <p className="muted">Le justificatif est obligatoire pour une absence maladie.</p>}
    </form>
  )
}
