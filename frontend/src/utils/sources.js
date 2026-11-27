/** Systèmes de la banque d'où viennent les données affichées (rapport, section 5.6). */
export const SOURCES = {
  teams: { label: 'Teams', title: 'Identité issue du compte professionnel Teams' },
  crm_rh: { label: 'CRM RH', title: 'Remonté par le CRM RH' },
  sirh: { label: 'SIRH', title: 'Lu dans le SIRH du groupe' },
  talentlink: { label: 'Talentlink', title: "Synchronisé avec Talentlink, l'outil de recrutement de référence" },
  formation: { label: 'Formation', title: 'Lu dans la plateforme de formation' },
}

export const ZONES = {
  libre: 'Zone libre',
  encadree: 'Zone encadrée',
  fermee: 'Zone fermée (aucune IA)',
}

export const VERSIONS = { 1: 'Version 1 · Exploiter', 2: 'Version 2 · Connecter', 3: 'Version 3 · Étendre' }
