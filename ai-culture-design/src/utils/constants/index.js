/**
 * 常量定义模块
 * 集中管理项目中的各种常量，提高代码可维护性
 */

/**
 * 路由路径常量
 */
export const ROUTES = {
  HOME: '/',
  FEIYI: '/feiyi',
  CULTURE: '/culture',
  DESIGN: '/design',
  WORKS: '/works',
  LOGIN: '/login',
  PROFILE: '/profile',
  CELEBRITIES: '/celebrities',
  TRADITIONAL_ARTS: '/traditional-arts',
  INTANGIBLE_HERITAGE: '/intangible-heritage',
  GALLERY: '/gallery',
};

/**
 * 文化分类常量
 */
export const CULTURAL_CATEGORIES = {
  // 历史名人分类
  CELEBRITY_DYNASTIES: [
    { value: '', label: '全部' },
    { value: '先秦', label: '先秦' },
    { value: '秦汉', label: '秦汉' },
    { value: '魏晋南北朝', label: '魏晋南北朝' },
    { value: '隋唐', label: '隋唐' },
    { value: '宋元', label: '宋元' },
    { value: '明清', label: '明清' },
    { value: '近现代', label: '近现代' },
  ],
  CELEBRITY_FIELDS: [
    { value: '', label: '全部' },
    { value: '政治军事', label: '政治军事' },
    { value: '文学艺术', label: '文学艺术' },
    { value: '科学技术', label: '科学技术' },
    { value: '思想学术', label: '思想学术' },
    { value: '商业经济', label: '商业经济' },
  ],
  
  // 传统艺术分类
  ART_TYPES: [
    { value: '', label: '全部' },
    { value: '传统工艺', label: '传统工艺' },
    { value: '传统戏剧', label: '传统戏剧' },
    { value: '传统音乐', label: '传统音乐' },
    { value: '传统美术', label: '传统美术' },
    { value: '传统曲艺', label: '传统曲艺' },
  ],
  
  // 非物质文化遗产分类
  HERITAGE_LEVELS: [
    { value: '', label: '全部' },
    { value: '国家级', label: '国家级' },
    { value: '省级', label: '省级' },
    { value: '市级', label: '市级' },
  ],
  HERITAGE_CATEGORIES: [
    { value: '', label: '全部' },
    { value: '传统技艺', label: '传统技艺' },
    { value: '传统戏剧', label: '传统戏剧' },
    { value: '传统音乐', label: '传统音乐' },
    { value: '传统美术', label: '传统美术' },
    { value: '传统曲艺', label: '传统曲艺' },
    { value: '民间文学', label: '民间文学' },
    { value: '传统舞蹈', label: '传统舞蹈' },
    { value: '传统体育', label: '传统体育' },
    { value: '传统医药', label: '传统医药' },
  ],
};

/**
 * API 端点常量
 */
export const API_ENDPOINTS = {
  // 基础 API 地址
  BASE_URL: '/api',
  
  // 文化相关 API
  HERITAGE_LIST: '/heritage/list',
  NEWS_LIST: '/news/list',
  CITY_INFO: '/city/{cityId}/info',
  CELEBRITIES_LIST: '/celebrities/list',
  TRADITIONAL_ARTS_LIST: '/traditional-arts/list',
  
  // AI 相关 API
  AI_DESIGN_GENERATE: '/ai/design/generate',
  AI_IMAGE_GENERATE: '/ai/image/generate',
  AI_DESIGN_HISTORY: '/ai/design/history',
};

/**
 * 颜色主题常量
 */
export const COLORS = {
  // 主色调
  PRIMARY: '#333333', // 典雅黑
  ACCENT: '#C00C00', // 文化红
  BACKGROUND: '#FFFFFF', // 白色背景
  TEXT: '#333333', // 文本色
  LIGHT_TEXT: '#666666', // 浅色文本
  BORDER: '#E0E0E0', // 边框色
  CARD_BG: '#F5F5F5', // 卡片背景色
  
  // 功能色
  SUCCESS: '#4CAF50', // 成功色
  WARNING: '#FF9800', // 警告色
  ERROR: '#F44336', // 错误色
  INFO: '#2196F3', // 信息色
  
  // 文化特色色
  JIANGSU_BLUE: '#A7D7E8', // 江苏蓝
  JIANGSU_GREEN: '#B5E48C', // 江苏绿
  JIANGSU_LIGHT_GREEN: '#D9ED92', // 江苏浅绿
};

/**
 * 动画配置常量
 */
export const ANIMATION = {
  // 过渡时间
  TRANSITION_DURATION: {
    FAST: 300, // 快速过渡
    NORMAL: 500, // 正常过渡
    SLOW: 800, // 慢速过渡
  },
  
  // 缓动函数
  EASING: {
    LINEAR: 'linear',
    EASE: 'ease',
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
    // 自定义缓动函数
    EASE_OUT_QUINT: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
};

/**
 * 存储键名常量
 */
export const STORAGE_KEYS = {
  USER_INFO: 'user_info',
  AUTH_TOKEN: 'auth_token',
  IS_LOGIN: 'is_login',
  USERNAME: 'username',
  AVATAR: 'avatar',
  DESIGN_HISTORY: 'design_history',
  CULTURAL_PREFERENCES: 'cultural_preferences',
};

/**
 * 响应式断点常量
 */
export const BREAKPOINTS = {
  SMALL: 576,
  MEDIUM: 768,
  LARGE: 992,
  EXTRA_LARGE: 1200,
};

/**
 * 页面标题常量
 */
export const PAGE_TITLES = {
  HOME: '江苏文化传承与创新平台',
  FEIYI: '江苏非物质文化遗产',
  CULTURE: '江苏文化库',
  DESIGN: 'AI 文化设计',
  WORKS: '我的作品',
  LOGIN: '登录',
  PROFILE: '个人中心',
  CELEBRITIES: '江苏历史名人',
  TRADITIONAL_ARTS: '江苏传统艺术',
  INTANGIBLE_HERITAGE: '江苏非物质文化遗产',
  GALLERY: '江苏图库',
};
