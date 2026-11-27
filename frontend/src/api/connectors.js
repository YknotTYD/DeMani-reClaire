import { request } from './client'

export const listConnectors = () => request('/connectors')
export const syncConnector = (id) => request(`/connectors/${id}/sync`, { method: 'POST' })
