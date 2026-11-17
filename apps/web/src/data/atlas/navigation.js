import { cities, items, themes } from './content.js'

const first = value => typeof value === 'string' ? value : ''
export function readAtlasQuery(query) {
  const item = items.find(i => i.id === first(query.item)) || null
  const city = cities.find(c => c.id === first(query.city)) || cities.find(c => c.id === item?.cityId) || null
  return { city, item: city ? item : null, theme: themes.some(t => t.id === first(query.theme)) ? query.theme : 'all' }
}
export function atlasQuery(query, state) {
  const result = { ...query, atlas: '1' }
  for (const key of ['city','item','theme']) delete result[key]
  if(state.city) result.city = state.city.id
  if(state.item) result.item = state.item.id
  if(state.theme !== 'all') result.theme = state.theme
  return result
}

const storageKey = 'jiangsu-atlas-reading-v1'
export function loadReading(storage) {
  const clean = { positions:{}, categories:{}, recentCity:null }
  try {
    const value = JSON.parse(storage.getItem(storageKey))
    if(!value || typeof value !== 'object') return clean
    for(const [key,position] of Object.entries(value.positions || {}).slice(0,500)) {
      if(typeof position==='number' && Number.isFinite(position) && position>=0) clean.positions[key] = Math.min(position,100000)
    }
    for(const city of cities) if(typeof value.categories?.[city.id]==='string') clean.categories[city.id]=value.categories[city.id]
    if(cities.some(c=>c.id===value.recentCity))clean.recentCity=value.recentCity
  } catch { /* Storage is optional, including in private browsing. */ }
  return clean
}
export function saveReading(storage, value) {
  try { storage.setItem(storageKey,JSON.stringify(value)) } catch { /* Navigation still works without persistence. */ }
}
