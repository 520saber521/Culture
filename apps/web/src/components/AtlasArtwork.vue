<template>
  <div class="atlas-art" :style="{ '--art-ink': visual.ink, '--art-paper': visual.paper }" :class="{ 'has-photo': source && !failed }">
    <img v-if="source && !failed" :src="source" :style="{ '--cover-position': media.position || '50% 50%', '--cover-position-mobile': media.mobilePosition || media.position || '50% 50%' }" :alt="media.alt || title" :loading="priority ? 'eager' : 'lazy'" :fetchpriority="priority ? 'high' : 'auto'" decoding="async" @load="emit('photo-state', true)" @error="failed = true; emit('photo-state', false)" />
    <div v-else-if="media.kind" class="media-reservation" :data-media-slot="`${media.entryId}:${media.kind}`">
      <span class="reservation-kicker">{{ media.kind === 'detail' ? '细看 / DETAIL' : '观物 / PORTRAIT' }}</span>
      <span class="reservation-title">{{ title }}</span>
      <span class="reservation-rule" aria-hidden="true"></span>
      <span class="reservation-note">{{ media.kind === 'detail' ? '细节影像待补' : '主题影像待补' }}</span>
    </div>
    <template v-else>
      <svg class="art-motif" viewBox="0 0 600 400" aria-hidden="true">
        <defs><pattern :id="patternId" width="72" height="72" patternUnits="userSpaceOnUse"><g fill="none" stroke="currentColor" stroke-width="1">
          <template v-if="visual.motif === 'weave'"><path d="M36 2 70 36 36 70 2 36Z M36 14 58 36 36 58 14 36Z M0 0 72 72 M72 0 0 72"/><circle cx="36" cy="36" r="6"/></template>
          <template v-else-if="visual.motif === 'window'"><path d="M0 0H72V72H0Z M0 36H72 M36 0V72 M18 18H54V54H18Z M0 18 18 0 M54 0 72 18 M72 54 54 72 M18 72 0 54"/></template>
          <template v-else-if="visual.motif === 'indigo'"><circle cx="36" cy="36" r="24"/><path d="M36 12Q12 12 36 36Q60 12 36 12 M60 36Q60 12 36 36Q60 60 60 36 M36 60Q60 60 36 36Q12 60 36 60 M12 36Q12 60 36 36Q12 12 12 36"/></template>
          <template v-else-if="visual.motif === 'bamboo'"><path d="M20 0V72 M26 0V72 M18 23H28 M18 58H28 M48 0V72 M54 0V72 M46 10H56 M46 45H56 M26 35Q45 15 38 8 M20 51Q0 31 4 25"/></template>
          <template v-else-if="visual.motif === 'stone'"><path d="M0 10H62V62H10V28H44V44H28 M0 18H54V54H18V36H36 M0 70H72"/></template>
          <template v-else-if="visual.motif === 'reeds'"><path d="M15 72Q25 40 20 0 M40 72Q32 30 50 0 M15 56Q0 30 4 22 M42 40Q60 25 61 10"/><ellipse cx="20" cy="15" rx="3" ry="14"/></template>
          <template v-else><path d="M-18 36Q0 10 18 36T54 36T90 36 M-18 46Q0 20 18 46T54 46T90 46 M-18 56Q0 30 18 56T54 56T90 56"/></template>
        </g></pattern></defs>
        <rect x="80" y="-20" width="500" height="440" :fill="`url(#${patternId})`" opacity=".42"/>
        <g fill="var(--art-paper)" stroke="currentColor" stroke-width="1.5">
          <template v-if="visual.motif === 'vessel'"><path d="M190 160Q160 270 280 285Q400 270 370 160Z M205 160Q215 120 280 120Q345 120 355 160 M370 180Q455 150 425 230Q410 255 374 245 M190 180 133 130 153 232 195 246"/><ellipse cx="280" cy="116" rx="12" ry="6"/></template>
          <template v-else-if="visual.motif === 'fan'"><path d="M300 340 110 120Q300-50 490 120Z"/><path v-for="n in 11" :key="n" :d="`M300 340 ${120+n*30} ${80+Math.abs(6-n)*8}`"/></template>
          <template v-else-if="visual.motif === 'arch'"><path d="M100 310V230Q300 20 500 230V310H420V245Q300 110 180 245V310Z M80 310H520 M110 220H490 M300 125V165 M205 150 225 190 M395 150 375 190"/></template>
          <template v-else-if="visual.motif === 'mountain'"><path d="M80 300 210 90 285 210 360 60 530 300Z M210 90 235 270 M360 60 390 260 M70 320Q220 290 300 320T550 320"/></template>
          <template v-else-if="visual.motif === 'stage'"><path d="M130 70H470V325H130Z M150 85Q230 180 150 305 M450 85Q370 180 450 305 M150 305H450 M150 100Q300 220 450 100 M255 210Q300 170 345 210L330 280H270Z"/></template>
          <template v-else-if="visual.motif === 'canal'"><path d="M230-20Q430 110 250 240T300 420 M290-20Q490 110 310 240T360 420 M180 140H400V155H180Z M160 290H360V305H160Z"/></template>
          <template v-else-if="visual.motif === 'ripple'"><ellipse v-for="n in 7" :key="n" cx="320" cy="220" :rx="n*29" :ry="n*17" fill="none"/><path d="M230 215H400L365 240H260Z M318 92V215H380Z"/></template>
        </g>
      </svg>
      <svg class="art-outline" :viewBox="cityViewBox(cityId)" aria-hidden="true"><path :d="region?.path" fill-rule="evenodd" /></svg>
      <span class="art-word" aria-hidden="true">{{ visual.label }}</span>
      <span class="art-caption">{{ visual.label }} · 装饰示意</span>
    </template>
    <span v-if="source && !failed && media.credit" class="art-caption">{{ media.credit }}</span>
  </div>
</template>
<script setup>
import { computed, ref, watch, useId } from 'vue'
import { cityVisuals, getMedia } from '@/data/atlas/visuals'
import { regions, cityViewBox } from '@/data/atlas/geometry'
const props = defineProps({ cityId: String, title: String, src: String, mediaId: String, variant: { type: String, default: 'overview' }, priority: Boolean, index: { type: Number, default: 0 } })
const emit = defineEmits(['photo-state'])
const failed = ref(false)
const patternId = `atlas-pattern-${useId()}`
const media = computed(() => getMedia(props.mediaId || props.cityId, props.variant))
const source = computed(() => media.value.kind === 'detail' ? media.value.src : props.src || media.value.src)
const visual = computed(() => cityVisuals[props.cityId] || cityVisuals.nanjing)
watch(source, () => { failed.value = false; emit('photo-state', false) })
const region = computed(() => regions.find(r => r.id === props.cityId))
</script>
<style scoped>
.atlas-art{position:relative;overflow:hidden;min-height:140px;height:100%;background:var(--art-paper);color:var(--art-ink)}
.media-reservation{position:absolute;inset:18px;border:1px solid currentColor;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:16px;gap:15px;opacity:.85}
.reservation-kicker{font-size:10px;letter-spacing:.15em}
.reservation-title{font:400 clamp(19px,2.3vw,34px)/1.5 var(--brand-serif);text-wrap:balance}
.reservation-rule{width:36px;height:1px;background:currentColor}
.reservation-note{font-size:12px;letter-spacing:.12em}
.atlas-art:after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 3px,#65543b05 4px);pointer-events:none}
.atlas-art img{width:100%;height:100%;object-fit:cover;object-position:var(--cover-position);display:block}
.has-photo:after{background:none}
@media(max-width:720px){.atlas-art img{object-position:var(--cover-position-mobile)}}
.art-motif{position:absolute;right:0;top:0;width:80%;height:100%;opacity:.75}
.art-outline{position:absolute;left:4%;bottom:9%;width:25%;height:45%;fill:none;stroke:currentColor;stroke-width:.8;opacity:.25}
.art-word{position:absolute;left:9%;top:16%;font-family:'STSong','SimSun',serif;font-size:clamp(25px,3.5vw,60px);writing-mode:vertical-rl;letter-spacing:.18em;opacity:.3}
.art-caption{position:absolute;right:16px;bottom:12px;letter-spacing:.12em;font-size:10px;color:var(--art-ink)}
.has-photo .art-caption{background:#f7f3e7e8;color:#504737;padding:5px 8px;max-width:90%;line-height:1.5}
</style>
