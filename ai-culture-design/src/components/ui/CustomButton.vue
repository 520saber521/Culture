<template>
  <button
    :class="[
      'custom-button',
      `custom-button--${type}`,
      `custom-button--${size}`,
      { 'custom-button--disabled': disabled },
      { 'custom-button--loading': loading },
      { 'custom-button--icon-only': icon && !text },
      { 'custom-button--full-width': fullWidth }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <div v-if="loading" class="custom-button__loading">
      <div class="spinner"></div>
    </div>
    <i v-else-if="icon" :class="['custom-button__icon', icon]"></i>
    <span v-if="text" class="custom-button__text">{{ text }}</span>
  </button>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  /**
   * 按钮类型
   * @values primary, secondary, success, warning, error, info
   * @default primary
   */
  type: {
    type: String,
    default: 'primary',
    validator: (value) => {
      return ['primary', 'secondary', 'success', 'warning', 'error', 'info'].includes(value);
    }
  },

  /**
   * 按钮大小
   * @values small, medium, large
   * @default medium
   */
  size: {
    type: String,
    default: 'medium',
    validator: (value) => {
      return ['small', 'medium', 'large'].includes(value);
    }
  },

  /**
   * 按钮文本
   */
  text: {
    type: String,
    default: ''
  },

  /**
   * 按钮图标
   */
  icon: {
    type: String,
    default: ''
  },

  /**
   * 是否禁用
   * @default false
   */
  disabled: {
    type: Boolean,
    default: false
  },

  /**
   * 是否加载中
   * @default false
   */
  loading: {
    type: Boolean,
    default: false
  },

  /**
   * 是否全屏宽度
   * @default false
   */
  fullWidth: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);

/**
 * 处理按钮点击事件
 */
function handleClick(event) {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
}
</script>

<style scoped>
.custom-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 4px;
  font-family: '微软雅黑', Arial, sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

/* 按钮类型样式 */
.custom-button--primary {
  background-color: #C00C00;
  color: white;
}

.custom-button--primary:hover:not(:disabled):not(.custom-button--loading) {
  background-color: #A00A00;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(192, 12, 12, 0.3);
}

.custom-button--secondary {
  background-color: #F5F5F5;
  color: #333333;
  border: 1px solid #E0E0E0;
}

.custom-button--secondary:hover:not(:disabled):not(.custom-button--loading) {
  background-color: #E0E0E0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.custom-button--success {
  background-color: #4CAF50;
  color: white;
}

.custom-button--success:hover:not(:disabled):not(.custom-button--loading) {
  background-color: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.custom-button--warning {
  background-color: #FF9800;
  color: white;
}

.custom-button--warning:hover:not(:disabled):not(.custom-button--loading) {
  background-color: #f57c00;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
}

.custom-button--error {
  background-color: #F44336;
  color: white;
}

.custom-button--error:hover:not(:disabled):not(.custom-button--loading) {
  background-color: #d32f2f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

.custom-button--info {
  background-color: #2196F3;
  color: white;
}

.custom-button--info:hover:not(:disabled):not(.custom-button--loading) {
  background-color: #1976d2;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

/* 按钮大小样式 */
.custom-button--small {
  padding: 6px 12px;
  font-size: 14px;
  height: 32px;
}

.custom-button--medium {
  padding: 8px 16px;
  font-size: 16px;
  height: 40px;
}

.custom-button--large {
  padding: 10px 20px;
  font-size: 18px;
  height: 48px;
}

/* 图标样式 */
.custom-button__icon {
  font-size: 16px;
}

.custom-button--small .custom-button__icon {
  font-size: 14px;
}

.custom-button--large .custom-button__icon {
  font-size: 20px;
}

/* 文本样式 */
.custom-button__text {
  white-space: nowrap;
}

/* 加载状态 */
.custom-button__loading {
  width: 16px;
  height: 16px;
}

.spinner {
  width: 100%;
  height: 100%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 禁用状态 */
.custom-button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* 图标按钮 */
.custom-button--icon-only {
  border-radius: 50%;
  padding: 0;
  width: var(--button-height, 40px);
  height: var(--button-height, 40px);
}

.custom-button--small.custom-button--icon-only {
  --button-height: 32px;
}

.custom-button--large.custom-button--icon-only {
  --button-height: 48px;
}

/* 全宽按钮 */
.custom-button--full-width {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 767px) {
  .custom-button--large {
    padding: 8px 16px;
    font-size: 16px;
    height: 44px;
  }
  
  .custom-button--small {
    padding: 4px 8px;
    font-size: 12px;
    height: 28px;
  }
}
</style>
