import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./suivi_rh.db")
SECRET_KEY = os.getenv("SECRET_KEY", "change-moi-en-production-avec-une-longue-cle-secrete")
TOKEN_EXPIRE_MINUTES = int(os.getenv("TOKEN_EXPIRE_MINUTES", "480"))
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

# Dossier racine où sont rangés les fichiers des candidats : <racine>/<Poste>/<Candidat>/CV.pdf
FILES_DIR = os.getenv("FILES_DIR", "./dossiers_candidats")
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "10"))

# Seuil de l'alerte : perte d'étoiles sur une case entre deux trimestres
CRITICAL_DROP = int(os.getenv("CRITICAL_DROP", "2"))

# ---- Règles issues du rapport de préconisation ----
# Aucun résultat collectif affiché pour un groupe de moins de N personnes (section 5.5)
MIN_GROUP_SIZE = int(os.getenv("MIN_GROUP_SIZE", "10"))
# « N'oublier personne » : un échange avec chaque collaborateur dans les 12 mois (tableau 23)
NO_CONTACT_MONTHS = int(os.getenv("NO_CONTACT_MONTHS", "12"))
# Prévenir N jours avant une échéance (entretien de parcours, jalon d'intégration)
REMINDER_DAYS_BEFORE = int(os.getenv("REMINDER_DAYS_BEFORE", "45"))
# Durée de la période d'essai utilisée pour le jalon de fin d'essai
TRIAL_PERIOD_MONTHS = int(os.getenv("TRIAL_PERIOD_MONTHS", "3"))
# Candidats non retenus : deux ans au plus après le dernier contact (référentiel CNIL 2026)
CANDIDATE_RETENTION_MONTHS = int(os.getenv("CANDIDATE_RETENTION_MONTHS", "24"))

# Connecteurs vers les systèmes de la banque (section 5.6 du rapport).
# « demo » : les données viennent de la base de démonstration ; un vrai connecteur se branche à la place.
CONNECTORS_MODE = os.getenv("CONNECTORS_MODE", "demo")

# Envoi des emails d'alerte aux RH. Si SMTP_HOST est vide, aucun email n'est envoyé.
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER)

# Compte RH créé au premier démarrage
RH_EMAIL = os.getenv("RH_EMAIL", "rh@entreprise.fr")
RH_PASSWORD = os.getenv("RH_PASSWORD", "rh123456")
RH_NAME = os.getenv("RH_NAME", "Claire Fournier")
