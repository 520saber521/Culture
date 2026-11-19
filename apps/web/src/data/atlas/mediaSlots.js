import mediaAssets from './mediaAssets.json' with { type: 'json' }
// Two independent image slots per featured entry. Keep src null until an asset
// and its provenance have been supplied; never substitute a city hero here.
export const priorityMedia = [
  ['nanjing-cloud-brocade', '南京', '南京云锦', '云锦织物完整纹样或织机上的织造场景', '同一织物的金线、彩线与经纬交织微距'],
  ['wuxi-zisha', '无锡', '宜兴紫砂', '一件宜兴紫砂壶的完整器形，壶嘴、壶把均入画', '同一把壶的泥料颗粒、壶口与壶盖接合细节'],
  ['xuzhou-han-stone', '徐州', '汉画像石', '有明确徐州来源的一块画像石完整画面', '同一石刻的车马、人物或雕刻线条局部'],
  ['changzhou-bamboo', '常州', '留青竹刻', '一件留青竹刻作品的完整画面', '同一作品竹青层次、刀痕与留白近景'],
  ['suzhou-humble-garden', '苏州', '拙政园', '园内水面、亭榭与廊道形成关系的横向实景', '同一园内花窗框景、廊柱或山石近景'],
  ['nantong-indigo', '南通', '蓝印花布', '南通蓝印花布完整纹样或印染制作场景', '同一作品的布面肌理、蓝白边界或对应花版'],
  ['lianyungang-gongdiao', '连云港', '海州五大宫调', '可确认曲种的演唱与伴奏同框场景', '同场演出的手部、乐器或演唱动作细节'],
  ['huaian-grain-transport', '淮安', '漕运记忆', '淮安漕运相关遗址或明确标注地点的展陈全景', '同一地点的运粮器物、碑刻或展陈模型局部'],
  ['yancheng-hair-embroidery', '盐城', '东台发绣', '一件东台发绣作品完整绣面', '同一作品的发丝针脚、底料与浓淡层次微距'],
  ['yangzhou-ge-garden', '扬州', '个园', '个园内竹、叠石与建筑相结合的实景', '同一园内叠石材质、竹影或漏窗局部'],
  ['zhenjiang-xijindu', '镇江', '西津渡古街', '可辨识西津渡的街巷纵深与临街建筑', '同一街区石阶、砖木构件或门窗局部'],
  ['taizhou-mei-opera', '泰州', '梅派艺术在泰州', '泰州相关纪念展陈或来源明确的梅派演出场景', '同一展陈的文献或同场演出的手势、服饰细节'],
  ['suqian-palace', '宿迁', '龙王庙行宫', '皂河龙王庙行宫院落轴线或古戏台全景', '同一建筑的匾额、木构或雕饰局部'],
].map(([entryId, cityName, title, overview, detail]) => ({ entryId, cityName, title, overview, detail }))

export const entryMediaSlots = Object.fromEntries(priorityMedia.flatMap(entry =>
  ['overview', 'detail'].map(kind => [`${entry.entryId}:${kind}`, {
    src: null, entryId: entry.entryId, kind, title: entry.title,
    brief: entry[kind], expectedPath: `/images/atlas/entries/${entry.entryId}-${kind}.webp`,
    alt: `${entry.title} · ${kind === 'overview' ? '全貌' : '细节'}`,
    position: '50% 50%', credit: '', sourceUrl: '', license: '',
    ...mediaAssets[`${entry.entryId}:${kind}`],
  }])
))
