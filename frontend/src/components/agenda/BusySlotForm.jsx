import { useState } from 'react'
import { toDayKey } from '../../utils/calendar'

/** Le membre bloque un créneau où il n'est pas disponible. Le RH verra « occupé », sans le libellé. */
export default function BusySlotForm({ onAdd }) {
  const [form, setForm] = useState({ date: toDayKey(new Date()), start: '09:00', end: '12:00', label: '' })
  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await onAdd({
      startsAt: `${form.date}T${form.start}:00`,
      endsAt: `${form.date}T${form.end}:00`,
      label: form.label,
    })
    if (ok) setForm({ ...form, label: '' })
  }

  return (
    <form className="stacked-form" onSubmit={handleSubmit}>
      <input type="date" value={form.date} onChange={update('date')} required />
      <div className="form-row">
        <input type="time" value={form.start} onChange={update('start')} required aria-label="Début" />
        <span>→</span>
        <input type="time" value={form.end} onChange={update('end')} required aria-label="Fin" />
      </div>
      <input placeholder="Pour moi : ex. Formation (le RH ne le voit pas)" value={form.label} onChange={update('label')} />
      <button type="submit">Bloquer ce créneau</button>
    </form>
  )
}
