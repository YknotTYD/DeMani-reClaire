import { useState } from 'react'
import { APPOINTMENT_CATEGORIES } from '../../utils/agenda'
import ChipGroup from '../common/ChipGroup'
import DeleteButton from '../common/DeleteButton'
import PersonSelect from '../common/PersonSelect'
import MemberDayAvailability from './MemberDayAvailability'

const DURATIONS = [30, 45, 60, 90, 120]
const KINDS = [
  { value: 'membre', label: 'Avec un membre' },
  { value: 'candidat', label: 'Avec un candidat' },
]

/**
 * Création / modification d'un rendez-vous, avec un membre ou un candidat.
 * - `people` : { membre: [{id, name, detail}], candidat: [...] }
 * - `lockPerson` : la personne est imposée (fiche d'un candidat ou d'un membre)
 * - `editing` : le rendez-vous modifié (pour ne pas le compter comme conflit avec lui-même)
 */
export default function AppointmentForm({ initial, people, lockPerson, editing, onSave, onDelete, onCancel }) {
  const [form, setForm] = useState(initial)
  const set = (field) => (value) => setForm({ ...form, [field]: value })
  const update = (field) => (e) => set(field)(e.target.value)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...form, startsAt: `${form.date}T${form.time}:00` })
  }

  return (
    <form className="stacked-form" onSubmit={handleSubmit}>
      {!lockPerson && (
        <>
          <ChipGroup label="Type de rendez-vous" options={KINDS} value={form.kind} onChange={(kind) => setForm({ ...form, kind, personId: '' })} />
          <PersonSelect
            people={people?.[form.kind] ?? []}
            value={form.personId}
            onChange={set('personId')}
            placeholder={form.kind === 'membre' ? 'Rechercher un membre…' : 'Rechercher un candidat…'}
          />
        </>
      )}
      {form.kind === 'membre' && (
        <ChipGroup label="Nature du rendez-vous" options={APPOINTMENT_CATEGORIES} value={form.category} onChange={set('category')} />
      )}
      <div className="form-row">
        <input type="date" value={form.date} onChange={update('date')} required />
        <input type="time" value={form.time} onChange={update('time')} required />
        <select value={form.durationMinutes} onChange={update('durationMinutes')}>
          {DURATIONS.map((d) => (
            <option key={d} value={d}>
              {d} min
            </option>
          ))}
        </select>
      </div>
      {form.kind === 'membre' && form.personId && form.date && (
        <MemberDayAvailability
          memberId={form.personId}
          date={form.date}
          time={form.time}
          durationMinutes={form.durationMinutes}
          excludeAppointmentId={editing?.id}
        />
      )}
      {form.kind === 'membre' && !editing && (
        <p className="muted">Le membre recevra la proposition et pourra l'accepter ou la refuser.</p>
      )}
      <input placeholder="Lieu ou lien visio" value={form.location} onChange={update('location')} />
      <textarea className="note" rows={3} placeholder="Note" value={form.note} onChange={update('note')} />
      <div className="form-row">
        <button type="submit" disabled={!form.personId}>
          {form.kind === 'membre' && !editing ? 'Proposer le rendez-vous' : 'Enregistrer'}
        </button>
        {onCancel && (
          <button type="button" className="button--ghost" onClick={onCancel}>
            Annuler
          </button>
        )}
        {onDelete && <DeleteButton confirmMessage="Supprimer ce rendez-vous ?" onDelete={onDelete} />}
      </div>
    </form>
  )
}
