/**
 * 本地存储管理模块
 * 封装 localStorage 和 sessionStorage 的操作，提供更加便捷和安全的存储方式
 */

import { STORAGE_KEYS } from '../constants';

/**
 * localStorage 操作封装
 */
export const localStorage = {
  /**
   * 设置本地存储
   * @param {string} key - 存储键名
   * @param {*} value - 存储值
   * @returns {void}
   * @example
   * localStorage.set('userInfo', { name: '张三' });
   */
  set(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      window.localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('localStorage 设置错误:', error);
    }
  },

  /**
   * 获取本地存储
   * @param {string} key - 存储键名
   * @param {*} defaultValue - 默认值
   * @returns {*} 存储值或默认值
   * @example
   * const userInfo = localStorage.get('userInfo', {});
   */
  get(key, defaultValue = null) {
    try {
      const serializedValue = window.localStorage.getItem(key);
      if (serializedValue === null) {
        return defaultValue;
      }
      return JSON.parse(serializedValue);
    } catch (error) {
      console.error('localStorage 获取错误:', error);
      return defaultValue;
    }
  },

  /**
   * 删除本地存储
   * @param {string} key - 存储键名
   * @returns {void}
   * @example
   * localStorage.remove('userInfo');
   */
  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('localStorage 删除错误:', error);
    }
  },

  /**
   * 清空本地存储
   * @returns {void}
   * @example
   * localStorage.clear();
   */
  clear() {
    try {
      window.localStorage.clear();
    } catch (error) {
      console.error('localStorage 清空错误:', error);
    }
  },
};

/**
 * sessionStorage 操作封装
 */
export const sessionStorage = {
  /**
   * 设置会话存储
   * @param {string} key - 存储键名
   * @param {*} value - 存储值
   * @returns {void}
   * @example
   * sessionStorage.set('tempData', { token: '123456' });
   */
  set(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      window.sessionStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('sessionStorage 设置错误:', error);
    }
  },

  /**
   * 获取会话存储
   * @param {string} key - 存储键名
   * @param {*} defaultValue - 默认值
   * @returns {*} 存储值或默认值
   * @example
   * const tempData = sessionStorage.get('tempData', {});
   */
  get(key, defaultValue = null) {
    try {
      const serializedValue = window.sessionStorage.getItem(key);
      if (serializedValue === null) {
        return defaultValue;
      }
      return JSON.parse(serializedValue);
    } catch (error) {
      console.error('sessionStorage 获取错误:', error);
      return defaultValue;
    }
  },

  /**
   * 删除会话存储
   * @param {string} key - 存储键名
   * @returns {void}
   * @example
   * sessionStorage.remove('tempData');
   */
  remove(key) {
    try {
      window.sessionStorage.removeItem(key);
    } catch (error) {
      console.error('sessionStorage 删除错误:', error);
    }
  },

  /**
   * 清空会话存储
   * @returns {void}
   * @example
   * sessionStorage.clear();
   */
  clear() {
    try {
      window.sessionStorage.clear();
    } catch (error) {
      console.error('sessionStorage 清空错误:', error);
    }
  },
};

/**
 * 用户相关存储操作
 */
export const userStorage = {
  /**
   * 保存用户信息
   * @param {Object} userInfo - 用户信息
   * @returns {void}
   */
  saveUserInfo(userInfo) {
    localStorage.set(STORAGE_KEYS.USER_INFO, userInfo);
    localStorage.set(STORAGE_KEYS.IS_LOGIN, true);
    if (userInfo.username) {
      localStorage.set(STORAGE_KEYS.USERNAME, userInfo.username);
    }
    if (userInfo.avatar) {
      localStorage.set(STORAGE_KEYS.AVATAR, userInfo.avatar);
    }
  },

  /**
   * 获取用户信息
   * @returns {Object} 用户信息
   */
  getUserInfo() {
    return localStorage.get(STORAGE_KEYS.USER_INFO, {});
  },

  /**
   * 保存认证令牌
   * @param {string} token - 认证令牌
   * @returns {void}
   */
  saveAuthToken(token) {
    localStorage.set(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  /**
   * 获取认证令牌
   * @returns {string} 认证令牌
   */
  getAuthToken() {
    return localStorage.get(STORAGE_KEYS.AUTH_TOKEN, '');
  },

  /**
   * 清除用户信息
   * @returns {void}
   */
  clearUserInfo() {
    localStorage.remove(STORAGE_KEYS.USER_INFO);
    localStorage.remove(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.remove(STORAGE_KEYS.IS_LOGIN);
    localStorage.remove(STORAGE_KEYS.USERNAME);
    localStorage.remove(STORAGE_KEYS.AVATAR);
  },

  /**
   * 检查是否已登录
   * @returns {boolean} 是否已登录
   */
  isLoggedIn() {
    return localStorage.get(STORAGE_KEYS.IS_LOGIN, false);
  },
};

/**
 * 设计历史相关存储操作
 */
export const designStorage = {
  /**
   * 保存设计历史
   * @param {Array} history - 设计历史列表
   * @returns {void}
   */
  saveDesignHistory(history) {
    localStorage.set(STORAGE_KEYS.DESIGN_HISTORY, history);
  },

  /**
   * 获取设计历史
   * @returns {Array} 设计历史列表
   */
  getDesignHistory() {
    return localStorage.get(STORAGE_KEYS.DESIGN_HISTORY, []);
  },

  /**
   * 添加设计历史记录
   * @param {Object} design - 设计记录
   * @returns {void}
   */
  addDesignHistory(design) {
    const history = this.getDesignHistory();
    // 限制历史记录数量
    const limitedHistory = [design, ...history].slice(0, 20);
    this.saveDesignHistory(limitedHistory);
  },

  /**
   * 清除设计历史
   * @returns {void}
   */
  clearDesignHistory() {
    localStorage.remove(STORAGE_KEYS.DESIGN_HISTORY);
  },
};

/**
 * 文化偏好相关存储操作
 */
export const preferenceStorage = {
  /**
   * 保存文化偏好
   * @param {Object} preferences - 文化偏好
   * @returns {void}
   */
  saveCulturalPreferences(preferences) {
    localStorage.set(STORAGE_KEYS.CULTURAL_PREFERENCES, preferences);
  },

  /**
   * 获取文化偏好
   * @returns {Object} 文化偏好
   */
  getCulturalPreferences() {
    return localStorage.get(STORAGE_KEYS.CULTURAL_PREFERENCES, {});
  },
};

export default {
  localStorage,
  sessionStorage,
  userStorage,
  designStorage,
  preferenceStorage,
};
