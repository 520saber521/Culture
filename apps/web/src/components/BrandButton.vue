<script setup>
defineProps({
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  type: { type: String, default: 'button' }
})
</script>

<template>
  <button :type="type" class="brand-button" :disabled="disabled || loading" :aria-busy="loading">
    <span class="brand-button__label"><slot /></span>
    <span class="brand-button__end" aria-hidden="true">
      <span v-if="loading" class="brand-button__spinner"></span>
      <svg v-else width="20" height="12" viewBox="0 0 20 12" fill="none">
        <path d="M1 6h17M13 1l5 5-5 5" stroke="currentColor" stroke-width="1.2" />
      </svg>
    </span>
  </button>
</template>
