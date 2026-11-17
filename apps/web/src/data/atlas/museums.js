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

// Editorial invitations describe the city, not current museum exhibitions.
export const museumInvitations = {
  nanjing: '沿金陵经纬，翻阅古都的岁月与匠心。',
  wuxi: '循太湖烟水，细读泥火之间的江南风物。',
  xuzhou: '从石上汉风出发，走近彭城的历史回声。',
  changzhou: '循竹上留青，慢读龙城的文脉与手艺。',
  suzhou: '借一窗园影，寻姑苏风雅的细微之处。',
  nantong: '从蓝白纹样到江海记忆，翻开通城往事。',
  lianyungang: '听山海回声，读港城漫长的人文足迹。',
  huaian: '沿运河流韵，回望淮上城池与漕运往事。',
  yancheng: '循盐风苇影，探寻海盐与一座城的来路。',
  yangzhou: '展开半扇烟水，在运河与书页间读扬州。',
  zhenjiang: '听古渡江声，在山水之间拾起城市记忆。',
  taizhou: '循一城戏韵，走近水城的人文与日常。',
  suqian: '从楚风水韵启程，读一方水土的岁月。',
}
