import { useState } from 'react'
import { ANSWER_TYPES } from '../../utils/criteria'
import ChipGroup from '../common/ChipGroup'

const EMPTY = { label: '', answerType: 'stars', options: '', minValue: '', maxValue: '', required: true }

/** Ajout d'une colonne : son nom, la façon d'y répondre, et si la réponse est obligatoire. */
export default function ColumnForm({ onAdd }) {
  const [form, setForm] = useState(EMPTY)
  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.label.trim()) return
    const ok = await onAdd({
      label: form.label.trim(),
      answer_type: form.answerType,
      options: form.answerType === 'choice' ? form.options.split('\n') : [],
      min_value: form.answerType === 'number' && form.minValue !== '' ? Number(form.minValue) : null,
      max_value: form.answerType === 'number' && form.maxValue !== '' ? Number(form.maxValue) : null,
      required: form.required,
    })
    if (ok) setForm(EMPTY)
  }

  return (
    <form className="column-form" onSubmit={handleSubmit}>
      <input placeholder="Nom de la colonne, ex. Satisfaction" value={form.label} onChange={(e) => set('label')(e.target.value)} />
      <p className="form-label">Comment répondre ?</p>
      <ChipGroup label="Type de réponse" options={ANSWER_TYPES} value={form.answerType} onChange={set('answerType')} />

      {form.answerType === 'choice' && (
        <textarea
          rows={3}
          placeholder={'Une option par ligne, ex.\nLégère\nNormale\nLourde'}
          value={form.options}
          onChange={(e) => set('options')(e.target.value)}
        />
      )}
      {form.answerType === 'number' && (
        <div className="form-row">
          <input type="number" placeholder="Minimum" value={form.minValue} onChange={(e) => set('minValue')(e.target.value)} />
          <input type="number" placeholder="Maximum" value={form.maxValue} onChange={(e) => set('maxValue')(e.target.value)} />
        </div>
      )}

      <label className="inline-label">
        <input type="checkbox" checked={form.required} onChange={(e) => set('required')(e.target.checked)} />
        Réponse obligatoire
      </label>
      <button type="submit">Ajouter la colonne</button>
    </form>
  )
}
