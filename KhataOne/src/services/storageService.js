import { initialData } from '../data/initialData.js'

export const STORAGE_KEY = 'khataone-workspace-v1'
export function loadWorkspace() { try { return { ...initialData, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } } catch { return initialData } }
export function saveWorkspace(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }