"""
« N'oublier personne » : des rappels fondés sur des faits datés, jamais sur un score (rapport, P2 et section 6.1).

- Aucun échange enregistré depuis NO_CONTACT_MONTHS mois.
- Entretien de parcours professionnel : dans l'année qui suit l'embauche, puis tous les quatre ans
  (loi du 24 octobre 2025).
- Jalons d'intégration : bilan à 30 jours et fin de période d'essai.

C'est une simple règle de gestion : aucun appel à une IA (règle de sobriété, section 5.5).
"""

from dataclasses import dataclass
from datetime import date, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import NO_CONTACT_MONTHS, REMINDER_DAYS_BEFORE, TRIAL_PERIOD_MONTHS
from app.models.appointment import Appointment, AppointmentCategory, AppointmentStatus
from app.models.user import Role, User
from app.schemas.follow_up import ContactIndicator, Reminder, RemindersOut

PARCOURS_YEARS = 4


def add_months(day: date, months: int) -> date:
    month = day.month - 1 + months
    year = day.year + month // 12
    month = month % 12 + 1
    return date(year, month, min(day.day, 28))


@dataclass
class MemberAgenda:
    """Rendez-vous d'un membre, déjà triés pour les règles."""

    held: list[Appointment]      # acceptés et passés : des échanges qui ont eu lieu
    planned: list[Appointment]   # à venir, non refusés


def agenda_of(db: Session, member_id: int, now: datetime) -> MemberAgenda:
    appointments = db.scalars(select(Appointment).where(Appointment.member_id == member_id)).all()
    return MemberAgenda(
        held=[a for a in appointments if a.status == AppointmentStatus.ACCEPTE and a.starts_at <= now],
        planned=[a for a in appointments if a.status != AppointmentStatus.REFUSE and a.starts_at > now],
    )


def _last(appointments: list[Appointment], category: AppointmentCategory | None = None) -> date | None:
    dates = [a.starts_at.date() for a in appointments if category is None or a.category == category]
    return max(dates) if dates else None


def _has(appointments: list[Appointment], category: AppointmentCategory, start: date, end: date) -> bool:
    return any(a.category == category and start <= a.starts_at.date() <= end for a in appointments)


def member_reminders(member: User, agenda: MemberAgenda, today: date) -> list[Reminder]:
    reminders = []
    soon = today + timedelta(days=REMINDER_DAYS_BEFORE)

    def add(kind: str, label: str, due: date | None):
        reminders.append(
            Reminder(
                member_id=member.id,
                member_name=member.name,
                kind=kind,
                label=label,
                due_date=due,
                overdue=due is not None and due < today,
            )
        )

    # 1. Aucun échange depuis longtemps (sauf les nouveaux entrants, suivis par leurs jalons)
    new_hire = member.hired_on is not None and member.hired_on > add_months(today, -12)
    last_contact = _last(agenda.held)
    if not new_hire and not agenda.planned:
        limit = add_months(today, -NO_CONTACT_MONTHS)
        if last_contact is None:
            add("sans_contact", "Aucun échange enregistré", None)
        elif last_contact < limit:
            months = (today.year - last_contact.year) * 12 + today.month - last_contact.month
            add("sans_contact", f"Aucun échange depuis {months} mois (dernier le {last_contact:%d/%m/%Y})", last_contact)

    # 2. Entretien de parcours professionnel
    if member.hired_on is not None:
        last_parcours = _last(agenda.held, AppointmentCategory.PARCOURS)
        due = add_months(member.hired_on, 12) if last_parcours is None else add_months(last_parcours, 12 * PARCOURS_YEARS)
        planned = any(a.category == AppointmentCategory.PARCOURS for a in agenda.planned)
        if due <= soon and not planned:
            label = "Entretien de parcours professionnel " + ("en retard" if due < today else "à prévoir")
            add("parcours", f"{label} (échéance le {due:%d/%m/%Y})", due)

    # 3. Jalons d'intégration, pendant la première année
    if new_hire:
        everything = agenda.held + agenda.planned
        milestones = [
            ("Bilan à 30 jours", member.hired_on + timedelta(days=30)),
            ("Bilan de fin de période d'essai", add_months(member.hired_on, TRIAL_PERIOD_MONTHS)),
        ]
        for label, day in milestones:
            done = _has(everything, AppointmentCategory.INTEGRATION, day - timedelta(days=21), day + timedelta(days=30))
            if not done and day - timedelta(days=REMINDER_DAYS_BEFORE) <= today <= day + timedelta(days=60):
                add("integration", f"{label} ({day:%d/%m/%Y})", day)

    return reminders


def compute_reminders(db: Session) -> RemindersOut:
    now = datetime.now()
    today = now.date()
    members = db.scalars(select(User).where(User.role == Role.MEMBRE).order_by(User.name)).all()

    reminders, contacted = [], 0
    for member in members:
        agenda = agenda_of(db, member.id, now)
        last = _last(agenda.held)
        if last is not None and last >= add_months(today, -NO_CONTACT_MONTHS):
            contacted += 1
        reminders.extend(member_reminders(member, agenda, today))

    # Les retards d'abord, puis les échéances les plus proches
    reminders.sort(key=lambda r: (not r.overdue, r.due_date or date.min))
    total = len(members)
    return RemindersOut(
        reminders=reminders,
        indicator=ContactIndicator(contacted=contacted, total=total, percent=round(100 * contacted / total) if total else 0),
    )
