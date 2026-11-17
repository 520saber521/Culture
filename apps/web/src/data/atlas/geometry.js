import geo from './jiangsu.geo.json'

export const cityIds = { 320100: 'nanjing', 320200: 'wuxi', 320300: 'xuzhou', 320400: 'changzhou', 320500: 'suzhou', 320600: 'nantong', 320700: 'lianyungang', 320800: 'huaian', 320900: 'yancheng', 321000: 'yangzhou', 321100: 'zhenjiang', 321200: 'taizhou', 321300: 'suqian' }
// Local equirectangular projection, longitude corrected at the province's mid-latitude.
export const project = ([lng, lat]) => [(lng - 119.25) * Math.cos(33 * Math.PI / 180) * 100, (lat - 33) * 100]
export const regions = geo.features.map(feature => {
  const polygons = (feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates).map(polygon => polygon.map(ring => ring.map(project)))
  const points = polygons.flat(2)
  const bounds = { minX: Math.min(...points.map(p => p[0])), maxX: Math.max(...points.map(p => p[0])), minY: Math.min(...points.map(p => p[1])), maxY: Math.max(...points.map(p => p[1])) }
  return { id: cityIds[feature.properties.adcode], name: feature.properties.name.replace('市', ''), polygons, bounds, center: project(feature.properties.centroid || feature.properties.center), path: polygons.map(p => p.map(r => r.map(([x,y],i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${(-y).toFixed(2)}`).join(' ') + 'Z').join(' ')).join(' ') }
})
export const bounds = { minX: Math.min(...regions.map(r => r.bounds.minX)), maxX: Math.max(...regions.map(r => r.bounds.maxX)), minY: Math.min(...regions.map(r => r.bounds.minY)), maxY: Math.max(...regions.map(r => r.bounds.maxY)) }
export const mapViewBox = `${bounds.minX - 8} ${-bounds.maxY - 8} ${bounds.maxX - bounds.minX + 16} ${bounds.maxY - bounds.minY + 16}`
export function cityViewBox(id) {
  const b = regions.find(r => r.id === id)?.bounds || bounds
  return `${b.minX - 8} ${-b.maxY - 8} ${b.maxX-b.minX+16} ${b.maxY-b.minY+16}`
}
