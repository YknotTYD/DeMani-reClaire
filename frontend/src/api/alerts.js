import { request } from './client'

export const getAlertSummary = () => request('/alerts/summary')

// Prévient le badge de la barre de navigation qu'il doit se rafraîchir
export const ALERTS_CHANGED_EVENT = 'alerts-changed'
export const notifyAlertsChanged = () => window.dispatchEvent(new Event(ALERTS_CHANGED_EVENT))
