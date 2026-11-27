import { downloadProof } from '../../api/absences'

/** Justificatifs joints, téléchargeables. */
export default function ProofLinks({ documents, onError }) {
  if (documents.length === 0) return null
  return (
    <p className="absence-proofs">
      <span className="muted">Justificatif :</span>{' '}
      {documents.map((d) => (
        <button key={d.id} type="button" className="button-link" onClick={() => downloadProof(d).catch((e) => onError?.(e.message))}>
          {d.filename}
        </button>
      ))}
    </p>
  )
}
