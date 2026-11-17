import { project } from './geometry'

export const waterStories = {
  yangtze: {
    name: '长江', title: '长江 · 江苏段', subtitle: '沿江读城，一水相连',
    center: project([120.1, 32.03]), span: [135, 80],
    geography: '长江穿行江苏南部，向东通向江海。近景聚焦江中洲岛与分汊，细看河道转折处的水流。',
    culture: '从南京、镇江到南通，沿江城市串起不同的地方文化。循着江岸，可以继续读古城、港口与江海相遇的故事。',
    source: 'https://www.mct.gov.cn/wlbphone/wlbydd/xxfb/qglb/qg/202601/t20260126_964372.html',
  },
  taihu: {
    name: '太湖', title: '太湖', subtitle: '湖光山色，吴地生活',
    center: project([120.17, 31.24]), span: [90, 84],
    geography: '太湖位于江苏、浙江之间。开阔湖面与曲折湖岸、岛屿相映，微风下的波纹比江流更舒缓。',
    culture: '在太湖周边，湖光山色与吴文化、古典园林和水乡古镇相互映照，构成江南生活的一幅画卷。',
    source: 'https://www.jiangsu.gov.cn/art/2022/1/21/art_64797_10324249.html',
  },
}
