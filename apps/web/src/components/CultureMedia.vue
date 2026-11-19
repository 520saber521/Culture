<template>
  <figure class="culture-media" :class="[`media-${role}`, `media-${item?.featureType || 'hero'}`]" :data-media-slot="media.key">
    <template v-if="media.src && !failed">
      <img :src="media.src" :alt="media.alt" :loading="role === 'hero' ? 'eager' : 'lazy'" :fetchpriority="role === 'hero' ? 'high' : 'auto'" @error="failed = true" />
      <figcaption v-if="media.credit">{{ media.credit }}</figcaption>
    </template>
    <div v-else class="culture-media-placeholder">
      <span class="media-overline">{{ item ? `${item.city || ''} / ${category}` : 'JIANGSU / 城市风物' }}</span>
      <span class="media-title">{{ item?.name || '山水 · 手艺 · 烟火' }}</span>
      <i aria-hidden="true"></i>
      <span class="media-label">{{ role === 'hero' ? '主题影像待补' : role === 'detail' ? '细节影像待补' : '条目影像待补' }}</span>
    </div>
  </figure>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import { cultureMedia } from '@/data/cultureMedia'
const props = defineProps({ item: Object, role: { type: String, default: 'cover' } })
const media = computed(() => cultureMedia(props.item, props.role))
const category = computed(() => ({ attraction: '山水胜迹', activity: '在地日常', food: '风味手记' })[props.item?.featureType] || '城市风物')
const failed = ref(false)
watch(() => [media.value.key, media.value.src], () => { failed.value = false })
</script>
<style scoped>
.culture-media{position:relative;width:100%;height:100%;min-height:140px;margin:0;background:var(--brand-jade);color:var(--brand-deep-green);overflow:hidden}
.media-food{background:#eee3d4;color:#755640}.media-activity{background:#e5e5d8;color:#596044}
.culture-media img{display:block;width:100%;height:100%;object-fit:cover}
.culture-media figcaption{position:absolute;bottom:8px;right:8px;max-width:90%;padding:4px 8px;background:var(--brand-paper);color:var(--brand-ink);font:11px/1.6 var(--brand-sans)}
.culture-media-placeholder{position:absolute;inset:14px;border:1px solid var(--brand-line);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:16px;text-align:center}
.media-overline,.media-label{font:11px/1.6 var(--brand-sans);letter-spacing:.08em}
.media-title{font:400 clamp(18px,2vw,28px)/1.5 var(--brand-serif);text-wrap:balance}
.culture-media-placeholder i{display:block;width:28px;height:1px;background:currentColor;opacity:.5}
.media-hero{height:340px;background:#e9e4d7;color:#655541}
.media-detail{height:320px;margin-bottom:20px}.media-detail img{object-fit:contain}
@media(max-width:650px){.media-hero{height:230px}.media-detail{height:240px}.culture-media-placeholder{inset:9px;padding:10px;gap:7px}.media-overline,.media-label{font-size:10px}.media-title{font-size:18px}}
</style>
