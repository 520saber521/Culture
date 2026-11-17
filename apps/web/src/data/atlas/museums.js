// City correspondence and addresses supplied by the project owner.
// These are outbound reading links, not a live availability or booking feed.
export const cityMuseums = [
  { cityId: 'nanjing', cityName: '南京', museums: [{ name: '南京博物院', url: 'https://www.njmuseum.com/zh' }] },
  { cityId: 'wuxi', cityName: '无锡', museums: [{ name: '无锡博物院', url: 'https://www.wxmuseum.cn/' }] },
  { cityId: 'xuzhou', cityName: '徐州', museums: [{ name: '徐州博物馆', url: 'http://xuzhoumuseum.cn/' }] },
  { cityId: 'changzhou', cityName: '常州', museums: [{ name: '常州博物馆', url: 'https://www.czmuseum.cn/' }] },
  { cityId: 'suzhou', cityName: '苏州', museums: [{ name: '苏州博物馆', url: 'https://www.szmuseum.com/' }] },
  { cityId: 'nantong', cityName: '南通', museums: [{ name: '南通博物苑', url: 'http://www.ntmuseum.com/pcweb/home/index' }] },
  { cityId: 'lianyungang', cityName: '连云港', museums: [{ name: '连云港市博物馆', url: 'https://www.lygmuseum.cn/' }] },
  { cityId: 'huaian', cityName: '淮安', museums: [{ name: '淮安市博物馆', url: 'https://www.haggwh.cn/hasbwgzy/index.html' }] },
  { cityId: 'yancheng', cityName: '盐城', museums: [{ name: '中国海盐博物馆', url: 'https://www.chinahymuseum.com/' }] },
  { cityId: 'yangzhou', cityName: '扬州', museums: [
    { name: '扬州中国大运河博物馆', url: 'https://www.grandcanalmuseum.cn/' },
    { name: '扬州博物馆', subtitle: '扬州中国雕版印刷博物馆', url: 'https://www.yzmuseum.com/' },
  ] },
  { cityId: 'zhenjiang', cityName: '镇江', museums: [{ name: '镇江博物馆', url: 'https://www.zj-museum.com.cn/zjbwg/zjbwg/zs/jbzl/index.html' }] },
  { cityId: 'taizhou', cityName: '泰州', museums: [{ name: '泰州市博物馆', url: 'http://www.tzmuseum.cn/' }] },
  { cityId: 'suqian', cityName: '宿迁', museums: [{ name: '宿迁市博物馆', url: 'http://www.sqmuseum.cn/', alternateUrl: 'http://sqmuseum.suqian.gov.cn/' }] },
]

export function museumsForCity(city) {
  return cityMuseums.find(entry => entry.cityId === city || entry.cityName === city)?.museums ?? []
}
