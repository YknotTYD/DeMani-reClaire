import logging
import smtplib
from email.message import EmailMessage

from app.core.config import SMTP_FROM, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USER

logger = logging.getLogger("suivi_rh.email")


def send_email(recipients: list[str], subject: str, body: str) -> None:
    """Envoie un email texte. Ne fait rien (sauf un log) si le SMTP n'est pas configuré."""
    if not recipients:
        return
    if not SMTP_HOST:
        logger.warning("SMTP non configuré, email non envoyé : %s", subject)
        return

    message = EmailMessage()
    message["From"] = SMTP_FROM
    message["To"] = ", ".join(recipients)
    message["Subject"] = subject
    message.set_content(body)

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp:
            smtp.starttls()
            if SMTP_USER:
                smtp.login(SMTP_USER, SMTP_PASSWORD)
            smtp.send_message(message)
    except (smtplib.SMTPException, OSError):
        # L'alerte reste visible dans l'app même si l'email échoue
        logger.exception("Échec de l'envoi de l'email : %s", subject)
