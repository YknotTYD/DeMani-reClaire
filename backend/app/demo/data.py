"""Données fictives de la démonstration. Toute ressemblance avec des personnes réelles serait fortuite."""

EMAIL_DOMAIN = "demo-trajectoires.fr"
MEMBER_PASSWORD = "demo1234"

# Équipe -> membres (prénom nom). Le profil sert à générer des réponses crédibles :
# "solide" (plutôt satisfait), "moyen", "fragile" (plus bas), "baisse" (baisse nette au dernier trimestre)
TEAMS = {
    "Agence Metz Centre": [
        ("Claire Muller", "solide"), ("Julien Becker", "moyen"), ("Sarah Benali", "solide"),
        ("Thomas Klein", "baisse"), ("Manon Schmitt", "moyen"), ("Karim Haddad", "solide"),
    ],
    "Agence Nancy Stanislas": [
        ("Pauline Girard", "solide"), ("Antoine Lefèvre", "moyen"), ("Inès Moreau", "fragile"),
        ("Hugo Marchal", "solide"), ("Camille Petitjean", "moyen"),
    ],
    "Agence Strasbourg Kléber": [
        ("Léa Wagner", "moyen"), ("Mathieu Roth", "solide"), ("Yasmine Cherif", "baisse"),
        ("Nicolas Fischer", "moyen"), ("Élodie Meyer", "solide"), ("Romain Hoffmann", "fragile"),
    ],
    "Siège · Ressources humaines": [
        ("Nathalie Durand", "solide"), ("Sophie Lambert", "solide"), ("Olivier Mercier", "moyen"),
        ("Amandine Fabre", "solide"),
    ],
    "Siège · Crédits professionnels": [
        ("Vincent Garnier", "moyen"), ("Aurélie Colin", "solide"), ("Mehdi Boukhari", "moyen"),
        ("Lucie Perrin", "fragile"), ("François Weber", "solide"),
    ],
}

# Nouveaux entrants de septembre : déjà dans une agence, réunis aussi dans une équipe d'intégration
NEW_HIRES_TEAM = "Nouveaux entrants · sept. 2026"
NEW_HIRES = ["Manon Schmitt", "Hugo Marchal", "Romain Hoffmann", "Lucie Perrin", "Camille Petitjean"]

BASE_LEVEL = {"solide": 4.2, "moyen": 3.5, "fragile": 2.8, "baisse": 4.0}

# Commentaires libres, selon le niveau de la réponse
COMMENTS = {
    "haut": [
        "Bonne dynamique d'équipe en ce moment.",
        "Le binôme avec mon tuteur fonctionne très bien.",
        "Les points hebdomadaires avec la direction d'agence aident beaucoup.",
        "Je me sens à ma place, merci pour l'accompagnement.",
        "Les nouveaux outils de prise de rendez-vous font gagner du temps.",
        "Ambiance très positive depuis l'arrivée des renforts.",
    ],
    "moyen": [
        "Période chargée avec la fin d'année, mais ça reste gérable.",
        "J'aimerais plus de visibilité sur les priorités du trimestre.",
        "Les objectifs commerciaux sont ambitieux, l'équipe suit.",
        "Il manque parfois un relais quand un collègue est absent.",
        "Formation utile, mais difficile à caser dans le planning.",
    ],
    "bas": [
        "Beaucoup de dossiers en retard depuis le départ d'un collègue.",
        "J'ai du mal à concilier l'accueil clients et le back-office.",
        "Je souhaiterais en parler lors d'un point avec mon gestionnaire.",
        "La réorganisation n'a pas été bien expliquée à l'équipe.",
        "Charge difficile à tenir sur la durée.",
    ],
}

# Postes ouverts et candidats (nom, email, statut, ville, expérience)
POSITIONS = {
    "Conseiller clientèle particuliers": [
        ("Emma Rousseau", "emma.rousseau@mail-demo.fr", "entretien", "Metz", "2 ans en agence bancaire"),
        ("Lucas Bernard", "lucas.bernard@mail-demo.fr", "nouveau", "Thionville", "BTS NDRC, alternance en assurance"),
        ("Chloé Martin", "chloe.martin@mail-demo.fr", "retenu", "Nancy", "3 ans conseillère en mutuelle"),
        ("Bilal Amrani", "bilal.amrani@mail-demo.fr", "nouveau", "Metz", "Licence pro banque, stage 6 mois"),
        ("Julie Fontaine", "julie.fontaine@mail-demo.fr", "refuse", "Épinal", "Vente en grande distribution"),
    ],
    "Chargé d'affaires professionnels": [
        ("Maxime Dubois", "maxime.dubois@mail-demo.fr", "entretien", "Strasbourg", "5 ans chargé de clientèle pro"),
        ("Laura Henry", "laura.henry@mail-demo.fr", "nouveau", "Colmar", "Master finance, 2 ans en cabinet comptable"),
        ("Adrien Lopez", "adrien.lopez@mail-demo.fr", "entretien", "Reims", "Conseiller entreprises, 4 ans"),
    ],
    "Analyste risques crédit": [
        ("Sofia Rinaldi", "sofia.rinaldi@mail-demo.fr", "nouveau", "Metz", "Master gestion des risques"),
        ("Pierre Leclerc", "pierre.leclerc@mail-demo.fr", "retenu", "Nancy", "3 ans analyste crédit"),
    ],
    "Gestionnaire back-office": [
        ("Noémie Faure", "noemie.faure@mail-demo.fr", "nouveau", "Mulhouse", "Assistante administrative, 4 ans"),
        ("Kevin Morel", "kevin.morel@mail-demo.fr", "entretien", "Troyes", "Gestionnaire de contrats, 2 ans"),
    ],
}

TEAMS_LINK = "https://teams.microsoft.com/l/meetup-join/demo-{n}"
