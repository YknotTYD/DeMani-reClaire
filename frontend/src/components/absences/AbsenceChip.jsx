import { useNavigate } from 'react-router-dom'
import { ABSENCE_KINDS } from '../../utils/absences'

/** « Thomas Klein » -> « Thomas K. » pour tenir dans une case du calendrier. */
const shortName = (name) => {
  const [first, ...rest] = name.split(' ')
  return rest.length ? `${first} ${rest[rest.length - 1][0]}.` : first
}

/** Absence dans le calendrier du RH ; un clic mène à l'onglet Absences. */
export default function AbsenceChip({ absence: a }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      className={`absence-chip absence-chip--${a.status}`}
      title={`Absent : ${a.member_name} · ${ABSENCE_KINDS[a.kind].label}${a.status === 'en_attente' ? ' · à traiter' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        navigate('/absences')
      }}
    >
      {shortName(a.member_name)}
    </button>
  )
}
