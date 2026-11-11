/**
 * 通用工具函数模块
 * 包含日期格式化、字符串处理、数字处理、数组处理等通用工具函数
 */

/**
 * 日期格式化函数
 * @param {Date|string|number} date - 日期对象、字符串或时间戳
 * @param {string} format - 格式化模板，默认为 'YYYY-MM-DD'
 * @returns {string} 格式化后的日期字符串
 * @example
 * formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss') // 2024-01-01 12:00:00
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 字符串截断函数
 * @param {string} str - 原始字符串
 * @param {number} length - 截断长度
 * @param {string} suffix - 后缀，默认为 '...'
 * @returns {string} 截断后的字符串
 * @example
 * truncateString('这是一个很长的字符串', 10) // 这是一个很长的...
 */
export function truncateString(str, length = 100, suffix = '...') {
  if (!str || str.length <= length) return str;
  return str.substring(0, length) + suffix;
}

/**
 * 数字格式化函数（用于格式化大数字）
 * @param {number} num - 原始数字
 * @param {number} decimals - 小数位数，默认为 2
 * @returns {string} 格式化后的数字字符串
 * @example
 * formatNumber(1234567.89) // 1,234,567.89
 */
export function formatNumber(num, decimals = 2) {
  if (typeof num !== 'number') return '0';
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 数组排序函数
 * @param {Array} arr - 原始数组
 * @param {string} key - 排序键
 * @param {string} order - 排序顺序，'asc' 或 'desc'，默认为 'asc'
 * @returns {Array} 排序后的数组
 * @example
 * sortArray([{name: 'b'}, {name: 'a'}], 'name') // [{name: 'a'}, {name: 'b'}]
 */
export function sortArray(arr, key, order = 'asc') {
  if (!Array.isArray(arr)) return [];
  return [...arr].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * 数组筛选函数
 * @param {Array} arr - 原始数组
 * @param {Function} predicate - 筛选条件函数
 * @returns {Array} 筛选后的数组
 * @example
 * filterArray([1, 2, 3, 4, 5], item => item > 2) // [3, 4, 5]
 */
export function filterArray(arr, predicate) {
  if (!Array.isArray(arr)) return [];
  return arr.filter(predicate);
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖处理后的函数
 * @example
 * const debouncedFunc = debounce(() => console.log('执行'), 1000);
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} limit - 时间限制（毫秒）
 * @returns {Function} 节流处理后的函数
 * @example
 * const throttledFunc = throttle(() => console.log('执行'), 1000);
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 深拷贝函数
 * @param {*} obj - 要拷贝的对象
 * @returns {*} 拷贝后的对象
 * @example
 * const copy = deepClone({a: 1, b: {c: 2}});
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * 生成唯一 ID
 * @returns {string} 唯一 ID
 * @example
 * const id = generateUniqueId(); // 'uuid-12345'
 */
export function generateUniqueId() {
  return `uuid-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

/**
 * 检查值是否为空
 * @param {*} value - 要检查的值
 * @returns {boolean} 是否为空
 * @example
 * isEmpty(null) // true
 * isEmpty('') // true
 * isEmpty([]) // true
 * isEmpty({}) // true
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}
