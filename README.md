# Trajectoires — version conforme au rapport de préconisation

Cette version reprend l'application d'origine et réoriente cinq fonctions pour respecter le rapport
« Trajectoires : l'IA au service de la fonction RH d'une banque régionale » (Trajectoire Consulting, novembre 2026).
Le travail d'origine est conservé : chaque fonction existe toujours, sous une forme compatible avec le rapport.

| # | Avant | Après (version conforme) | Ce que dit le rapport |
|---|-------|--------------------------|-----------------------|
| 1 | Le RH voit les notes de moral de chaque collaborateur et reçoit une alerte quand elles baissent | Les réponses individuelles restent **privées** ; le collaborateur voit ses résultats **en premier** et choisit de les **partager**. Le RH voit des **moyennes**, masquées sous **10 répondants**. Une baisse devient un **signal pour le collaborateur**, qui décide de demander un échange | 6.1 (leviers 1 et 2 : des faits, montrés d'abord au collaborateur), 5.5 (aucun résultat pour un groupe de moins de dix), R1 (aucun score individuel) |
| 2 | Alertes sur une baisse de moral | Rappels **« n'oublier personne »** sur des faits datés : aucun échange depuis 12 mois, entretien de parcours professionnel (1 an après l'embauche, puis tous les 4 ans), bilan à 30 jours et fin de période d'essai. Indicateur : part des collaborateurs vus dans les 12 mois (cible 95 %) | P2, brique 2 « Entretiens », 5.3 (loi du 24 octobre 2025), tableau 23 |
| 3 | Relations notées de 1 à 5 entre collègues | **Liens de travail** sans note : tuteur, parrain / marraine, binôme, remplaçant. La carte est conservée | R1 (sentiment de surveillance), parcours d'intégration (tuteur nommé, figure 13) |
| 4 | Dépôt de CV autonome | **Complément de Talentlink** (outil de référence) : suppression automatique **2 ans** après le dernier contact pour les non-retenus, confirmation que le candidat a été **informé**, mention **« IA utilisée : non »** | 5.1 (limites), annexe B (référentiel CNIL, Code du travail L. 1221-8), R9 |
| 5 | Le RH voit tout, le collaborateur ne voit rien | **Profil collaborateur** : il voit ce que la banque sait de son parcours, demande une **correction** ou un **échange**, et voit **qui a consulté son profil** (chaque consultation est journalisée) | 4.3 (profil unique consulté et corrigé), annexe C (qui voit quoi, journal des consultations) |

Réglages (variables d'environnement, voir `backend/app/core/config.py`) : `MIN_GROUP_SIZE` (10), `NO_CONTACT_MONTHS` (12),
`REMINDER_DAYS_BEFORE` (45), `TRIAL_PERIOD_MONTHS` (3), `CANDIDATE_RETENTION_MONTHS` (24).

## Faire la démo (sans être développeur)

1. Récupérer le projet depuis GitHub : bouton vert **Code** > **Download ZIP**, puis décompresser.
   (Ou, avec Git : `git clone <adresse du dépôt>`.)
2. Ouvrir le dossier **commands** et lancer :
   - **Mac** : double-clic sur **Lancer Trajectoires.command**. La première fois, macOS peut refuser
     (« développeur non identifié ») : clic droit sur le fichier > **Ouvrir** > **Ouvrir**.
     Si macOS dit que le fichier n'est pas exécutable : ouvrir le Terminal, taper `bash ` (avec l'espace),
     glisser le fichier dans la fenêtre, puis Entrée.
   - **Windows** : double-clic sur **Lancer Trajectoires.bat** (voir plus bas).
   - **Linux** : `bash "commands/Lancer Trajectoires.command"`.
3. La première fois, l'installation prend une à deux minutes (Python 3.10 ou plus récent est nécessaire ; s'il
   manque, la page de téléchargement s'ouvre).
4. Le navigateur s'ouvre sur `http://localhost:8000` : **on arrive dans Teams**. On clique sur **Trajectoires**
   dans la barre de gauche, et toute la suite de la démo se passe dans l'application.

**commands/Remettre la demo a zero** (.command ou .bat) remet les données d'origine. Trajectoires seul, sans Teams :
`http://localhost:8000/connexion`.

Le site déjà construit (`frontend/dist`) est versionné exprès : il évite d'installer Node.js pour la démo.
Après une modification du frontend, le reconstruire avec `npm run build` et le committer avec le reste.

## Démo vidéo : Trajectoires dans un « Teams » refait

On y arrive en ouvrant le site (`http://localhost:8000`, ou `:5173` en développement), ou par le lien
« Présentation : voir Trajectoires dans Teams » sous la page de connexion. Cette page affiche une maquette de Teams, sans logo officiel
ni connexion à Microsoft : rien n'est relié, tout est écrit dans `frontend/src/teams-demo/data.js`.

- Barre de gauche avec Trajectoires épinglée, catalogue **Applications** où elle figure parmi les applications de l'organisation.
- Conversations (dont des cartes envoyées par Trajectoires), activité, équipes avec un onglet Trajectoires dans un canal,
  calendrier avec les rendez-vous posés par Trajectoires, notification qui apparaît au bout de 6 secondes.
- Trajectoires s'ouvre dans un onglet, déjà connecté : la maquette imite la connexion automatique de Teams.
- Menu du profil (avatar en haut à droite) : statut, thème clair / sombre, et **changement de compte**
  (Claire Fournier, RH, ou Thomas Klein, collaborateur).

## Sous Windows, sans être développeur

1. Récupérer le projet (GitHub : **Code** > **Download ZIP**) et le décompresser (clic droit > Extraire tout).
2. Ouvrir le dossier **commands** et double-cliquer sur **Lancer Trajectoires.bat**.
   - Si Windows affiche « Windows a protégé votre ordinateur » : *Informations complémentaires* > *Exécuter quand même*.
   - La première fois, Python est installé s'il manque (relancer ensuite le fichier), puis l'application s'installe
     en une à deux minutes. Les fois suivantes, elle s'ouvre en quelques secondes.
3. Le navigateur s'ouvre sur Trajectoires. Laisser la fenêtre noire ouverte ; la fermer arrête l'application.

**commands/Remettre la demo a zero.bat** remplace toutes les données par la démonstration d'origine.
Node.js n'est pas nécessaire : le site est déjà construit (`frontend/dist`) et servi par le serveur Python
(`backend/app/serve.py`). Après une modification du frontend, reconstruire avec `npm run build`.

## Absences

- **Collaborateur** (« Mes absences ») : sa semaine en **vue agenda** (absences et rendez-vous), un clic sur un jour
  pour déclarer une absence. Types : **maladie** (justificatif obligatoire : volet employeur de l'arrêt de travail,
  sans motif médical), **congés** (aucun justificatif), **autre** (justificatif facultatif). Demi-journées possibles
  au début et à la fin ; la durée en jours ouvrés s'affiche. Une absence peut être annulée tant que le RH ne l'a pas traitée.
- **RH** : onglet **Absences** (à traiter, validées, refusées) avec validation ou refus et un mot pour le collaborateur ;
  les absences apparaissent aussi sur le **calendrier** (pointillés : à traiter). **Aucun email** n'est envoyé.
- Justificatifs : PDF, JPG ou PNG (contenu vérifié), rangés dans `dossiers_candidats/Membres/<id>/Absences/<id>/`,
  visibles par le collaborateur et le RH ; chaque consultation par le RH est inscrite dans le journal du collaborateur.
- Une absence à traiter ou validée rend le collaborateur indisponible pour les rendez-vous.

## Relié aux outils de la banque (rapport, sections 4.2 et 5.6)

Le rapport prévoit un outil ouvert dans Teams et branché sur les outils existants, sans les remplacer. Dans cette maquette :

- page **Connexions** (côté RH) : Teams, CRM RH, SIRH, Talentlink et plateforme de formation, avec ce que chacun apporte,
  ce que Trajectoires lit et renvoie, la version du déploiement (figure 16) et la zone de données (figure 17) ;
- **étiquettes de source** sur les données : rappels « CRM RH », date d'embauche et souhaits d'évolution « SIRH »,
  candidats « Talentlink », compte « Teams » ;
- la date d'embauche n'est plus modifiable dans Trajectoires : le SIRH reste la source. Une correction demandée par le
  collaborateur est validée par le RH puis transmise au SIRH ;
- les CV déposés sont transmis à Talentlink à la synchronisation suivante.

En démonstration (`CONNECTORS_MODE=demo`), les connecteurs lisent la base d'exemple. Chaque vrai connecteur se branche
dans `backend/app/connectors/registry.py` sans toucher au reste.

Restent hors de cette version : intégration réelle à Teams et connexion avec le compte professionnel, vrais connecteurs SIRH / CRM RH / Talentlink, rôles
manager / paie / direction, assistant MAiA, hébergement sur l'infrastructure du groupe.

---

# Trajectoires

Outil RH : suivi des membres d'équipe (questionnaires trimestriels, alertes, relations), recrutement (dépôt et recherche de CV), agenda partagé RH ↔ membres.
React (Vite) pour le front, FastAPI + SQLite pour le back.

## Lancer le projet

**Backend** (terminal 1)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows : .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Base de démonstration** (recommandé pour une présentation) : personnes, équipes, réponses sur quatre trimestres, questionnaire en cours, candidats, rendez-vous et documents, tous fictifs.

```bash
python -m app.demo.seed --force     # ATTENTION : remplace la base et les fichiers existants
```

Comptes : RH `rh@entreprise.fr` / `rh123456` ; membres `prenom.nom@demo-trajectoires.fr` / `demo1234`.
À essayer : `thomas.klein@…` (ses réponses baissent : il le voit dans « Mon profil », pas le RH, tant qu'il ne partage pas), `ines.moreau@…` (a demandé un échange), `lucie.perrin@…` (a demandé une correction). Côté RH : page Alertes (rappels, demandes), questionnaire d'intégration (masqué : 5 répondants), candidate Julie Fontaine (dossier bientôt supprimé).
Arrête le backend avant de lancer le script, puis relance-le.

Sans la démo, la base `suivi_rh.db` est créée au premier démarrage, avec un compte RH :
`rh@entreprise.fr` / `rh123456` (modifiable via les variables `RH_EMAIL`, `RH_PASSWORD`, voir `app/core/config.py`).
Documentation de l'API : http://localhost:8000/docs

> **Mise à jour depuis une version précédente** : le modèle de données a changé (questionnaires par modèle et par trimestre,
> rendez-vous avec les membres). Supprime `backend/suivi_rh.db` et `backend/dossiers_candidats/` avant de relancer.

**Frontend** (terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Ouvrir http://localhost:5173. Les appels `/api/...` sont redirigés vers le backend (voir `vite.config.js`).
Les polices (Outfit pour la marque et les titres, Nunito pour le texte) sont installées localement : l'application n'appelle aucun service extérieur.

**Fichiers** : rangés dans `backend/dossiers_candidats/` (modifiable avec `FILES_DIR`) :

```
Candidats/<Poste>/<Candidat>/CV.pdf
Membres/<id du membre>/<document>.pdf
```

Taille max d'un fichier : 10 Mo (`MAX_UPLOAD_MB`).

**Emails d'alerte (optionnel)** : sans `SMTP_HOST`, les alertes restent visibles dans l'app mais aucun email n'est envoyé.

```bash
export SMTP_HOST=smtp.office365.com   # ou le serveur SMTP de l'entreprise
export SMTP_PORT=587
export SMTP_USER=alertes@entreprise.fr
export SMTP_PASSWORD=...
export SMTP_FROM=alertes@entreprise.fr
```

Les emails partent vers tous les comptes RH. Le seuil de baisse (2 étoiles par défaut) se règle avec `CRITICAL_DROP`.

## Fonctionnement

### Général
- **Mode clair / sombre** : interrupteur en bas de la barre latérale (et sur la page de connexion). Par défaut, suit le réglage du système ; le choix est mémorisé.
- **Listes longues** : dès qu'une liste dépasse 5 éléments, elle est réduite aux 5 premiers (« Tout afficher »), avec une recherche (insensible aux accents, plusieurs mots possibles). Les listes de personnes, d'équipes et de modèles ont en plus un **filtre alphabétique A–Z**.

### Côté RH
- **Équipes** : création avec ses membres d'un coup, ou ajout ensuite depuis la page de l'équipe (recherche par nom). Diagramme des relations (force 1 à 5).
- **Questionnaires** :
  - des **modèles** (ex. « Baromètre trimestriel », « Intégration »), chacun avec son propre tableau (lignes × colonnes) ;
  - chaque **colonne choisit sa façon de répondre** : étoiles (1 à 5), nombre (avec minimum / maximum), oui / non, choix dans une liste, texte libre ; et peut être obligatoire ou facultative. Le type d'une colonne ne change plus une fois créée (les réponses déjà données deviendraient incohérentes) ;
  - un modèle est **envoyé à des équipes pour un trimestre** (Jan – Mar, Avr – Juin, Juil – Sep, Oct – Déc). La page Questionnaires les range par trimestre ;
  - chaque envoi a ses **résultats** selon le type (moyenne, % de oui, répartition des choix, textes libres affichés sans le nom de leur auteur), une moyenne générale (colonnes en étoiles), son taux de participation et la liste des destinataires ;
  - chaque modèle a sa **courbe d'évolution** trimestre par trimestre (colonnes en étoiles) (moyennes de tous, ou d'une ligne du tableau), avec survol, et une vue en tableau ;
  - le **rapport d'un membre** montre sa propre courbe et le détail de chaque trimestre.
- **Alertes** : baisse d'au moins 2 étoiles (colonnes en étoiles) sur une case par rapport au précédent questionnaire du même modèle ; souhait d'évolution (« Oui » à la question), avec statut et note de suivi.
- **Agenda** : calendrier mensuel des rendez-vous avec les membres et les candidats. Chaque rendez-vous a un statut dans le temps (**à venir / en cours / passé**), se supprime depuis les listes, et ses liens (visio Teams…) et emails sont **cliquables**.
  - Avec un **membre** : le RH voit seulement ses créneaux **occupés** (sans le contenu), est prévenu en cas de chevauchement, et propose un rendez-vous. Le membre l'**accepte ou le refuse**. Si l'horaire change, le membre doit de nouveau accepter.
  - Avec un **candidat** : le rendez-vous est directement confirmé.
- **Dépôt et recherche de CV** :
  - **recherche rapide** : on tape un nom ou un email, on obtient le poste, le statut, le contact, les documents (téléchargeables) et le prochain rendez-vous ;
  - **dépôt** dans une conversation : le bot lit le nom et l'email (PDF ou Word, sans IA), le RH choisit le poste, le type de document et le statut, et le fichier est rangé dans `Poste / Candidat / CV.pdf`.
- **Candidats** : les dossiers par poste, la fiche de chaque candidat (informations, documents, rendez-vous).

### Côté membre
- **Mes questionnaires** : ceux envoyés à ses équipes, rangés par trimestre, avec leur état (à remplir / répondu).
- **Mes rendez-vous** : les prochains rendez-vous, à accepter ou refuser ; on peut y **joindre des PDF**. Le membre bloque aussi ses **indisponibilités** (le libellé reste privé).
- **Mes documents** : dépôt de PDF par glisser-déposer, visibles par le membre et par les RH.

## Sécurité

En attente du document de référence de la Banque Populaire : chaque point qui ne correspond pas sera relevé avant d'adapter le logiciel.
Déjà en place : mots de passe chiffrés (bcrypt), accès par rôle (RH / membre) vérifié côté serveur, un membre ne voit que ses propres données et les questionnaires de ses équipes, le RH ne voit pas le contenu de l'agenda des membres, contrôle du type réel des fichiers déposés, aucune ressource chargée depuis l'extérieur.

## Couleurs et police

Aux couleurs de la Banque Populaire : bleu marine `#192A6B`, bleu `#1E50B4`, bleu ciel `#43B8EB`, avec une touche de corail pour rester accueillant. Tout est défini en haut de `frontend/src/index.css` (`--bp-navy`, `--bp-blue`, `--bp-sky`, `--coral`, puis les variables de chaque thème).

La police officielle de la Banque Populaire n'est pas publique : **Outfit** la remplace (variable `--font-brand`). Si la banque fournit sa police, ajoute le fichier `.woff2` dans `frontend/src/assets/`, déclare-le avec `@font-face` et remplace `Outfit` dans `--font-brand`.
Les couleurs des courbes (`--chart-1` à `--chart-5`) sont des teintes plus soutenues de la même famille, vérifiées pour le contraste et pour les daltonismes, dans chacun des deux thèmes.

## Structure

```
backend/app/
  core/         config, base de données, sécurité (mots de passe, JWT), dépendances (rôles)
  models/       tables : user, team, relation, questionnaire_model, criterion, questionnaire (+ équipes ciblées),
                submission, critical_alert, evolution, position, candidate, document, appointment, busy_slot, member_document
  schemas/      formats d'entrée/sortie de l'API (Pydantic)
  routers/      auth, members, teams, relations, questionnaire_models, criteria, questionnaires, critical_alerts, evolutions,
                positions, candidates, documents, appointments, member_agenda (vue RH sur un membre), me (espace membre)
  services/     answers (validation selon le type de réponse), questionnaire_stats (moyennes, évolution), quarters, drop_detection, submission_alerts, email_sender,
                agenda (libre/occupé, conflits), member_files, cv_extraction, file_storage, candidate_filing

frontend/src/
  api/          un fichier d'appels HTTP par domaine + client.js (token, erreurs, téléchargements)
  context/      AuthContext
  hooks/        useAuth, useAsync, useAction, useAlertSummary, useTheme, useDebounced, usePeople
  utils/        critères, dates, calendrier, trimestres, évolution (courbes), texte (recherche sans accents), thème, agenda
  components/
    branding/   Logo (illustration + favicon), Wordmark (logotype « Trajectoires » surligné), BackgroundBlobs
    common/     Linkify (liens et emails cliquables), SearchableList, SearchInput, AlphabetBar, PersonSelect, ChipGroup, MultiChipGroup, FileDropZone,
                ThemeToggle, StarRating, Avatar, InlineForm, DeleteButton, AsyncContent, ErrorMessage, Loader
    charts/     LineChart, EvolutionChart, ChartTable
    layout/     Layout, Navbar (barre latérale), AlertsLink, ProtectedRoute
    teams/      TeamList, TeamMembers, TeamCreateForm, MemberPicker
    members/    MemberList, MemberForm, MemberQuestionnaires, MemberDocumentList
    relations/  RelationDiagram (SVG), RelationForm, RelationList
    criteria/   CriteriaAxisEditor, CriterionItem, ColumnForm
    questionnaires/ AnswerGrid, AnswerInput, AnswerValue, ResultsGrid, QuarterGroups, QuestionnaireCards, ParticipationBar, LaunchQuestionnaireForm,
                ModelList, RespondentList, EvolutionQuestion
    alerts/     CriticalAlertList, CriticalAlertItem
    evolutions/ EvolutionList, EvolutionItem, EvolutionStatusSelect
    calendar/   MonthCalendar, MonthNav, AppointmentChip, AppointmentForm, AppointmentList, AppointmentStatus, MemberDayAvailability
    agenda/     MyAppointmentCard, BusySlotForm, BusySlotList
    cv-bot/     CandidateSearch, CandidateResult, CvChat, ChatBubble, FilingForm, PositionPicker
    candidates/ PositionSection, CandidateList, CandidateInfoForm, DocumentList, StatusBadge
  pages/
    LoginPage
    rh/         TeamsPage, TeamDetailPage, MembersPage, MemberReportPage, QuestionnairesPage, ModelPage, QuestionnaireDetailPage,
                AlertsPage, CvBotPage, CandidatesPage, CandidateDetailPage, CalendarPage
    membre/     MyQuestionnairesPage, FillQuestionnairePage, MyAppointmentsPage, MyDocumentsPage
```
