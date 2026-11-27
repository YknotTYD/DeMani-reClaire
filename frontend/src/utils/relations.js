/** Types de liens de travail : des faits, sans note sur la relation. */
export const RELATION_KINDS = [
  { value: 'tuteur', label: 'Tuteur', directed: true, verb: 'est tuteur de' },
  { value: 'parrain', label: 'Parrain / marraine', directed: true, verb: 'parraine' },
  { value: 'binome', label: 'Binôme', directed: false, verb: 'en binôme avec' },
  { value: 'remplacant', label: 'Remplaçant', directed: false, verb: 'se remplace avec' },
]

export const relationKind = (value) => RELATION_KINDS.find((k) => k.value === value)
