/**
 * Contenu fictif de la maquette Teams (démo vidéo). Rien n'est connecté : tout est écrit ici.
 * Les personnes reprennent celles de la base de démonstration de Trajectoires.
 */

export const PERSONAS = {
  rh: {
    id: 'me',
    name: 'Claire Fournier',
    title: 'Gestionnaire de carrière · RH BPALC',
    email: 'rh@entreprise.fr',
    password: 'rh123456',
    home: '/',
  },
  membre: {
    id: 'me',
    name: 'Thomas Klein',
    title: 'Conseiller clientèle · Agence Metz Centre',
    email: 'thomas.klein@demo-trajectoires.fr',
    password: 'demo1234',
    home: '/',
  },
}

export const PEOPLE = {
  bot: { name: 'Trajectoires', app: true },
  nathalie: { name: 'Nathalie Durand', presence: 'available', color: '#c3d4f5' },
  sophie: { name: 'Sophie Lambert', presence: 'busy', color: '#f6d3cf' },
  olivier: { name: 'Olivier Mercier', presence: 'away', color: '#d8ecd9' },
  ines: { name: 'Inès Moreau', presence: 'available', color: '#efe0f7' },
  julien: { name: 'Julien Becker', presence: 'available', color: '#fbe6c9' },
  nicolas: { name: 'Nicolas Fischer', presence: 'dnd', color: '#d5eef5' },
  claire: { name: 'Claire Muller', presence: 'available', color: '#e3e3f6' },
  karim: { name: 'Karim Haddad', presence: 'offline', color: '#f3dbe4' },
  rh: { name: 'Claire Fournier', presence: 'available', color: '#d9e6c9' },
  alain: { name: 'Alain Térieur', presence: 'available', color: '#cfe8f3' },
  alex: { name: 'Alex Térieur', presence: 'away', color: '#f3e4cf' },
  jean: { name: 'Jean Cule', presence: 'busy', color: '#e9d5f3' },
  anne: { name: 'Anne Onyme', presence: 'offline', color: '#dcdcdc' },
  melusine: { name: 'Mélusine Enfaillite', presence: 'dnd', color: '#f6d9c6' },
  sarah: { name: 'Sarah Croche', presence: 'available', color: '#d5f0e2' },
}

const card = (title, body, action, extra = {}) => ({ type: 'trajectoires', title, body, action, ...extra })

/* ------------------------------------------------------------------ */
/* Conversations vues par la gestionnaire RH                           */
/* ------------------------------------------------------------------ */
const RH_CHATS = [
  {
    id: 'bot',
    with: 'bot',
    title: 'Trajectoires',
    unread: 1,
    messages: [
      { from: 'bot', time: 'Lun. 08:00', card: card('Rappels de la semaine', "9 collaborateurs à ne pas oublier : 2 sans échange depuis 12 mois, 2 entretiens de parcours en retard, 5 jalons d'intégration.", { label: 'Voir les rappels', path: '/alertes' }, { source: 'CRM RH' }) },
      { from: 'bot', time: 'Mar. 14:32', card: card('Demande de correction', "Lucie Perrin signale une erreur dans son profil : « Ma date d'embauche est le 1er septembre, pas le 3. »", { label: 'Traiter la demande', path: '/alertes' }, { source: 'SIRH' }) },
      { from: 'bot', time: '08:00', card: card('Échéance dans 45 jours', "Entretien de parcours professionnel de Karim Haddad (4 ans après le précédent).", { label: 'Proposer un rendez-vous', path: '/alertes' }, { source: 'CRM RH' }) },
    ],
  },
  {
    id: 'equipe-rh',
    title: 'Équipe RH · Carrières',
    group: ['nathalie', 'sophie', 'olivier'],
    typing: 'sophie',
    messages: [
      { from: 'nathalie', time: 'Hier 17:48', text: "Petit rappel : le CSE est informé jeudi avant l'ouverture de Trajectoires dans Teams." },
      { from: 'olivier', time: 'Hier 17:52', text: "Ok. J'ai mis la charte en une page dans le canal Général 👍" },
      { from: 'me', time: '08:41', text: "Bonne nouvelle : on est à 85 % de collaborateurs vus dans les 12 mois. Objectif 95 % d'ici l'été." },
      { from: 'nathalie', time: '08:43', text: 'Top. Il reste qui ?', reactions: ['👍 2'] },
      { from: 'me', time: '08:44', text: "Vincent et Olivier, plus deux entretiens de parcours en retard. Je cale les rendez-vous cette semaine." },
      { from: 'olivier', time: '08:45', text: "Attends… je fais partie des oubliés ? 😅" },
      { from: 'me', time: '08:45', text: "Tu es dans la liste depuis ce matin. Le CRM ne t'a pas raté 😉" },
    ],
  },
  {
    id: 'ines',
    with: 'ines',
    title: 'Inès Moreau',
    messages: [
      { from: 'ines', time: 'Mar. 11:05', text: "Bonjour Claire, j'ai demandé un échange depuis Trajectoires. Rien d'urgent, mais j'aimerais faire le point avant les congés." },
      { from: 'me', time: 'Mar. 11:20', text: "Bonjour Inès, bien reçu. Je t'ai proposé jeudi 10h30, dis-moi si ça te va." },
      { from: 'ines', time: 'Mar. 11:22', text: "Parfait, merci !", reactions: ['❤️ 1'] },
    ],
  },
  {
    id: 'pause',
    title: 'Pause café · 3e étage',
    group: ['alain', 'sophie', 'alex'],
    messages: [
      { from: 'alex', time: 'Lun. 10:02', text: 'La machine du 3e est encore en panne. Je descends au 2e, quelqu\'un veut quelque chose ?' },
      { from: 'sophie', time: 'Lun. 10:03', text: 'Un allongé sans sucre, merci 🙏' },
      { from: 'alain', time: 'Lun. 10:15', text: "Vous avez vu ? Le nouvel outil RH va sortir la liste des gens qu'on n'a pas vus depuis 12 mois 👀" },
      { from: 'sophie', time: 'Lun. 10:16', text: 'Ça aurait servi pour Gérard Menvussa, des archives.' },
      { from: 'alain', time: 'Lun. 10:16', text: "Il est parti où déjà, Gérard ?" },
      { from: 'sophie', time: 'Lun. 10:17', text: "Nulle part. C'est bien le problème." },
      { from: 'sophie', time: 'Lun. 10:17', text: "On l'a retrouvé à l'inventaire de mars. Le CRM le comptait encore « présent, peu sollicité »." },
      { from: 'alex', time: 'Lun. 10:19', text: "Ah. C'était donc ça, l'odeur au sous-sol." },
      { from: 'alain', time: 'Lun. 10:20', text: 'Bon. Qui reprend son bureau ? Il a une fenêtre.', reactions: ['😂 3'] },
      { from: 'alex', time: 'Lun. 10:31', text: 'Machine réparée. Fausse alerte, quelqu\'un avait juste débranché la prise.' },
    ],
  },
  {
    id: 'melusine',
    with: 'melusine',
    title: 'Mélusine Enfaillite',
    messages: [
      { from: 'melusine', time: 'Mer. 18:02', text: 'Contrôle de gestion : le budget formation 2027 est validé.' },
      { from: 'melusine', time: 'Mer. 18:02', text: 'Enfin, presque. Il manque juste le budget.' },
      { from: 'me', time: 'Mer. 18:10', text: 'On en reparle au comité de jeudi 🙂' },
    ],
  },
  {
    id: 'nathalie',
    with: 'nathalie',
    title: 'Nathalie Durand',
    messages: [
      { from: 'nathalie', time: 'Ven. 16:10', text: 'Tu peux me renvoyer le tableau des indicateurs pour le comité trimestriel ?' },
      { from: 'me', time: 'Ven. 16:25', text: "Plus besoin de tableau : tout est dans Trajectoires, je te montre jeudi." },
      { from: 'nathalie', time: 'Ven. 16:26', text: 'Enfin la fin du fichier Excel 🎉' },
    ],
  },
]

/* ------------------------------------------------------------------ */
/* Conversations vues par un collaborateur                             */
/* ------------------------------------------------------------------ */
const MEMBRE_CHATS = [
  {
    id: 'bot',
    with: 'bot',
    title: 'Trajectoires',
    unread: 2,
    messages: [
      { from: 'bot', time: 'Lun. 09:00', card: card('Questionnaire Oct – Déc 2026', 'Le baromètre trimestriel est ouvert. Tes réponses restent privées : tu choisis ensuite de les partager ou non.', { label: 'Répondre', path: '/mes-questionnaires' }) },
      { from: 'bot', time: '08:00', card: card('Un signal, visible par toi seul', "Tes dernières réponses sont plus basses qu'au trimestre précédent. Si tu veux, demande un échange avec ta gestionnaire RH.", { label: 'Voir mon profil', path: '/mon-profil' }) },
    ],
  },
  {
    id: 'agence',
    title: 'Agence Metz Centre',
    group: ['claire', 'julien', 'karim'],
    typing: 'claire',
    messages: [
      { from: 'claire', time: '08:30', text: "Rappel : réunion d'agence à 9h, on parle des objectifs de décembre." },
      { from: 'karim', time: '08:32', text: "Je serai là, mais j'ai un client à 9h30." },
      { from: 'julien', time: '08:35', text: 'Quelqu\'un a récupéré les clés de la salle 2 ?' },
      { from: 'me', time: '08:36', text: 'Oui, je les ai.' },
    ],
  },
  {
    id: 'rh',
    with: 'rh',
    title: 'Claire Fournier',
    messages: [
      { from: 'rh', time: 'Mar. 15:02', text: "Bonjour Thomas, je t'ai proposé un point vendredi 14h, c'est indiqué dans Trajectoires." },
    ],
  },
]

export const CHATS = { rh: RH_CHATS, membre: MEMBRE_CHATS }

/* ------------------------------------------------------------------ */
/* Activité                                                            */
/* ------------------------------------------------------------------ */
export const ACTIVITY = {
  rh: [
    { id: 1, from: 'bot', time: '08:00', title: 'Trajectoires', text: '9 rappels « N\'oublier personne » cette semaine', path: '/alertes', unread: true },
    { id: 2, from: 'sophie', time: '08:44', title: 'Sophie Lambert a réagi à votre message', text: 'Bonne nouvelle : on est à 85 % de collaborateurs vus…', chat: 'equipe-rh', unread: true },
    { id: 3, from: 'bot', time: 'Mar.', title: 'Trajectoires', text: 'Lucie Perrin a demandé une correction de son profil', path: '/alertes', unread: true },
    { id: 4, from: 'nathalie', time: 'Hier', title: 'Nathalie Durand vous a mentionnée', text: 'dans Équipe RH · Carrières : « le CSE est informé jeudi »', chat: 'equipe-rh' },
    { id: 5, from: 'bot', time: 'Lun.', title: 'Trajectoires', text: 'Le questionnaire « Intégration » reste masqué : 4 réponses sur 10', path: '/questionnaires' },
    { id: 6, from: 'anne', time: 'Lun.', title: 'Anne Onyme a répondu au sondage', text: '« Pot de Noël : jeudi ou vendredi ? »', chat: 'equipe-rh' },
    { id: 7, from: 'jean', time: '20 nov.', title: 'Jean Cule vous a ajoutée à une équipe', text: 'Séminaire 2027 · organisation', chat: 'equipe-rh' },
  ],
  membre: [
    { id: 1, from: 'bot', time: '08:00', title: 'Trajectoires', text: 'Un signal sur tes dernières réponses, visible par toi seul', path: '/mon-profil', unread: true },
    { id: 2, from: 'bot', time: 'Lun.', title: 'Trajectoires', text: 'Questionnaire Oct – Déc 2026 : à remplir', path: '/mes-questionnaires', unread: true },
    { id: 3, from: 'rh', time: 'Mar.', title: 'Claire Fournier vous a envoyé un message', text: "Je t'ai proposé un point vendredi 14h…", chat: 'rh' },
  ],
}

/* ------------------------------------------------------------------ */
/* Calendrier : semaine du 23 novembre 2026 (lundi = 0)                 */
/* ------------------------------------------------------------------ */
export const WEEK = { label: 'Novembre 2026', days: ['Lun. 23', 'Mar. 24', 'Mer. 25', 'Jeu. 26', 'Ven. 27'], today: 3 }

export const EVENTS = {
  rh: [
    { day: 0, start: 9, end: 10, title: 'Réunion équipe RH', kind: 'teams' },
    { day: 2, start: 14, end: 15.5, title: 'Comité trimestriel IA · DRH, DPO, CSE', kind: 'teams' },
    { day: 3, start: 10.5, end: 11, title: 'Point de suivi · Inès Moreau', kind: 'traj' },
    { day: 3, start: 15.5, end: 16.5, title: 'Entretien candidat · Maxime Dubois', kind: 'traj' },
    { day: 4, start: 14, end: 14.75, title: 'Point de suivi · Thomas Klein', kind: 'traj' },
    { day: 4, start: 16, end: 17, title: 'Information CSE · Trajectoires', kind: 'teams' },
  ],
  membre: [
    { day: 0, start: 9, end: 10, title: "Réunion d'agence", kind: 'teams' },
    { day: 2, start: 10, end: 12, title: 'Formation crédit immobilier', kind: 'teams' },
    { day: 4, start: 14, end: 14.75, title: 'Point de suivi · Claire Fournier', kind: 'traj' },
  ],
}

/* ------------------------------------------------------------------ */
/* Équipes et canaux                                                   */
/* ------------------------------------------------------------------ */
export const TEAMS = {
  rh: [
    {
      id: 'rh',
      name: 'BPALC · Ressources humaines',
      initials: 'RH',
      color: '#192a6b',
      channels: [
        {
          id: 'general',
          name: 'Général',
          posts: [
            { from: 'olivier', time: 'Hier 17:50', text: 'Charte Trajectoires : principe, trois tests et feu tricolore en une page. Merci de la relire avant jeudi.', file: 'Charte_Trajectoires_1page.pdf', replies: 4 },
            { from: 'nathalie', time: 'Lun. 09:12', text: "L'onglet Trajectoires est épinglé dans le canal Carrières. Les alertes du CRM RH y remontent désormais.", replies: 2 },
          ],
        },
        {
          id: 'carrieres',
          name: 'Carrières',
          trajectoiresTab: true,
          posts: [
            { from: 'bot', time: '08:00', card: card('Rappels de la semaine', '9 collaborateurs à ne pas oublier cette semaine.', { label: 'Ouvrir Trajectoires', path: '/alertes' }, { source: 'CRM RH' }) },
            { from: 'sophie', time: '08:52', text: "Je prends les deux jalons d'intégration de l'agence de Nancy.", replies: 1 },
          ],
        },
        {
          id: 'recrutement',
          name: 'Recrutement',
          posts: [
            { from: 'nicolas', time: 'Mar. 10:40', text: 'Rappel : Talentlink reste l\'outil de référence. Les CV déposés dans Trajectoires y sont renvoyés.', replies: 0 },
          ],
        },
      ],
    },
    {
      id: 'seminaire',
      name: 'Séminaire 2027',
      initials: 'S7',
      color: '#ff8f87',
      channels: [
        {
          id: 'general',
          name: 'Général',
          posts: [
            { from: 'jean', time: '20 nov.', text: 'Proposition de lieu : un spa à Gérardmer, deux jours. Le budget est à voir avec Mélusine.', replies: 7 },
            { from: 'melusine', time: '20 nov.', text: 'Le budget est vu. Il est non.', replies: 12 },
          ],
        },
      ],
    },
    {
      id: 'cse',
      name: 'Comité IA · DRH, DPO, CSE',
      initials: 'IA',
      color: '#43b8eb',
      channels: [
        { id: 'general', name: 'Général', posts: [{ from: 'nathalie', time: 'Ven.', text: 'Ordre du jour : registre des usages, feu tricolore, indicateurs du trimestre.', replies: 3 }] },
      ],
    },
  ],
  membre: [
    {
      id: 'agence',
      name: 'Agence Metz Centre',
      initials: 'MC',
      color: '#1e50b4',
      channels: [
        { id: 'general', name: 'Général', posts: [{ from: 'claire', time: '08:30', text: "Réunion d'agence à 9h : objectifs de décembre et planning des congés.", replies: 5 }] },
      ],
    },
  ],
}

/* ------------------------------------------------------------------ */
/* Applications                                                        */
/* ------------------------------------------------------------------ */
export const APPS = [
  { id: 'trajectoires', name: 'Trajectoires', by: 'BPALC · Ressources humaines', text: "Le suivi des parcours des collaborateurs : profil, rappels du CRM RH, questionnaires, recrutement.", org: true, added: true },
  { id: 'maia', name: 'MAiA', by: 'Groupe BPCE', text: "L'assistant d'IA du groupe. Questions générales et brouillons, sans donnée nominative.", org: true, soon: true },
  { id: 'taches', name: 'Tâches', by: 'Éditeur', text: 'Listes de tâches partagées par équipe.', color: '#3a7d44' },
  { id: 'sondages', name: 'Sondages', by: 'Éditeur', text: 'Sondages rapides dans les conversations.', color: '#b9750f' },
  { id: 'approbations', name: 'Approbations', by: 'Éditeur', text: 'Circuits de validation simples.', color: '#8a5cc2' },
  { id: 'wiki', name: 'Wiki', by: 'Éditeur', text: "Pages de documentation d'équipe.", color: '#d9614f' },
]

export const PRESENCES = {
  available: 'Disponible',
  busy: 'Occupé(e)',
  dnd: 'Ne pas déranger',
  away: 'Absent(e)',
  offline: 'Hors ligne',
}
