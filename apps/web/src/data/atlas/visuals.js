import { entryMediaSlots } from './mediaSlots.js'
// Original decorative interpretations, not reproductions of artifacts.
export const cityVisuals = Object.fromEntries([
  ['nanjing','#82524c','#e9dace','weave','金陵经纬','cloud-brocade'],
  ['suzhou','#55796e','#e0e7dd','window','一窗园影','humble-garden'],
  ['wuxi','#95694f','#eadfd1','vessel','泥火之间','zisha'],
  ['xuzhou','#78624e','#e6dcc9','stone','石上汉风','han-stone'],
  ['changzhou','#68744f','#e5e6d3','bamboo','竹上留青','bamboo'],
  ['nantong','#4f6b8b','#dce4ea','indigo','蓝白之间','indigo'],
  ['lianyungang','#5c8190','#dfe9e7','mountain','山海回声','gongdiao'],
  ['huaian','#7b6c4c','#eae2d1','canal','运河流韵','grain-transport'],
  ['yancheng','#6e856f','#e4e8dc','reeds','盐风苇影','hair-embroidery'],
  ['yangzhou','#8f684e','#ece0d2','fan','半扇烟水','ge-garden'],
  ['zhenjiang','#64766d','#e1e3d8','arch','古渡江声','xijindu'],
  ['taizhou','#8c5e62','#ecdedb','stage','一城戏韵','mei-opera'],
  ['suqian','#747c58','#e6e5d7','ripple','楚风水韵','palace'],
].map(([id,ink,paper,motif,label,feature])=>[id,{ink,paper,motif,label,feature}]))

// City IDs address hero slots; full entry IDs address card/detail slots.
export const atlasMedia = Object.fromEntries(Object.keys(cityVisuals).map(id => [id, {
  src:null, position:'50% 50%', alt:'', credit:'', sourceUrl:'', license:'',
}]))

// City mapping confirmed by the user in attachment order on 2026-11-16.
// These assets are city covers, not illustrations of individual heritage entries.
const cityCovers = [
  ['nanjing','南京','50% 50%','82% 50%'],
  ['wuxi','无锡','50% 55%','76% 55%'],
  ['xuzhou','徐州','50% 45%','80% 45%'],
  ['yangzhou','扬州','50% 55%','78% 55%'],
  ['changzhou','常州','50% 0%','76% 0%'],
  ['yancheng','盐城','50% 65%','0% 65%'],
  ['suqian','宿迁','50% 55%','76% 55%'],
  ['lianyungang','连云港','50% 75%','68% 75%'],
  ['nantong','南通','50% 50%','83% 50%'],
  ['huaian','淮安','50% 0%','77% 0%'],
  ['taizhou','泰州','50% 30%','75% 30%'],
  ['suzhou','苏州','50% 55%','72% 55%'],
  ['zhenjiang','镇江','50% 20%','73% 20%'],
]
for (const [id,name,position,mobilePosition] of cityCovers) {
  atlasMedia[id] = { ...atlasMedia[id], src:`/images/atlas/${id}-hero.webp`, position, mobilePosition,
    alt:`${name}城市封面`, provenance:'用户提供，城市对应关系已确认', license:'' }
}
export function getMedia(id, variant = 'overview') {
  return entryMediaSlots[`${id}:${variant}`] || atlasMedia[id] || { src:null, position:'50% 50%', alt:'', credit:'', sourceUrl:'', license:'' }
}
export function exhibitionItems(city, theme='all') {
  if (!city) return []
  const featured=`${city.id}-${cityVisuals[city.id].feature}`
  const priority=item=>(theme!=='all'&&item.themes.includes(theme)?10:0)+(item.id===featured?1:0)
  return [...city.items].sort((a,b)=>priority(b)-priority(a))
}
export function themeExamples(cities,theme) {
  if(theme==='all')return []
  return cities.flatMap(city=>{
    const entry=exhibitionItems(city,theme).find(item=>item.themes.includes(theme))
    return entry?[{cityId:city.id,cityName:city.name,title:entry.title}]:[]
  })
}
