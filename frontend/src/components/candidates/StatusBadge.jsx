import { CANDIDATE_STATUSES, labelOf } from '../../utils/recruitment'

export default function StatusBadge({ status }) {
  return <span className={`status status--${status}`}>{labelOf(CANDIDATE_STATUSES, status)}</span>
}
