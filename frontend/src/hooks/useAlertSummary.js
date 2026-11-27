import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ALERTS_CHANGED_EVENT, getAlertSummary } from '../api/alerts'
import { useAsync } from './useAsync'

const REFRESH_EVERY_MS = 60_000

/** Compteurs d'alertes, rafraîchis à chaque changement de page, toutes les minutes et après une action. */
export function useAlertSummary() {
  const location = useLocation()
  const summary = useAsync(getAlertSummary)
  const { reload } = summary

  useEffect(() => {
    reload()
  }, [location.pathname, reload])

  useEffect(() => {
    const timer = setInterval(reload, REFRESH_EVERY_MS)
    window.addEventListener(ALERTS_CHANGED_EVENT, reload)
    return () => {
      clearInterval(timer)
      window.removeEventListener(ALERTS_CHANGED_EVENT, reload)
    }
  }, [reload])

  return summary.data
}
