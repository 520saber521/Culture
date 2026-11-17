<template>
  <section v-if="museums.length" class="city-museums" :data-city="identity.cityId" :style="{ '--museum-ink': visual.ink, '--museum-paper': visual.paper }" :aria-label="`${identity.cityName}城市博物馆`">
    <div class="museum-intro">
      <div class="museum-portrait">
        <img v-if="!imageFailed" :src="cover.src" alt="" :style="{ objectPosition: cover.position }" loading="lazy" @error="imageFailed = true" />
        <span v-else class="museum-image-fallback" aria-hidden="true">{{ identity.cityName }}</span>
        <span class="museum-city-label">{{ identity.cityName }}</span>
        <span class="museum-image-caption">城市意象</span>
      </div>
      <div class="museum-intro-copy"><span class="museum-kicker">{{ identity.cityId.toUpperCase() }} / 城市文脉</span>
        <h3>{{ visual.label }}</h3>
        <p>{{ museumInvitations[identity.cityId] }}</p>
      </div>
    </div>
    <div class="museum-list">
      <div class="museum-list-heading"><span>走进博物馆</span><small>馆藏延伸 / {{ String(museums.length).padStart(2, '0') }}</small></div>
      <div v-for="museum in museums" :key="museum.url" class="museum-entry">
        <a class="museum-link" :href="museum.url" target="_blank" rel="noopener noreferrer" :aria-label="`${museum.name}官网（新标签页打开）`">
          <span class="museum-name"><strong>{{ museum.name }}</strong><small v-if="museum.subtitle">{{ museum.subtitle }}</small></span>
          <span class="museum-action">访问官网 <span aria-hidden="true">↗</span></span>
        </a>
        <a v-if="museum.alternateUrl" class="museum-alternate" :href="museum.alternateUrl" target="_blank" rel="noopener noreferrer" :aria-label="`${museum.name}备用地址（新标签页打开）`">备用地址 <span aria-hidden="true">↗</span></a>
      </div>
      <span class="museum-note">官网将在新标签页打开，可随时回到这里继续阅读。</span>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { cityMuseums, museumsForCity, museumInvitations } from '@/data/atlas/museums'
import { cityVisuals, getMedia } from '@/data/atlas/visuals'

const props = defineProps({ city: { type: String, required: true } })
const museums = computed(() => museumsForCity(props.city))
const identity = computed(() => cityMuseums.find(c => c.cityId === props.city || c.cityName === props.city))
const visual = computed(() => cityVisuals[identity.value?.cityId] || {})
const cover = computed(() => getMedia(identity.value?.cityId))
const imageFailed = ref(false)
watch(() => props.city, () => { imageFailed.value = false })
</script>

<style scoped>
.city-museums{display:grid;grid-template-columns:minmax(240px,.8fr) minmax(0,1.5fr);margin:0 0 44px;background:var(--brand-surface);border:1px solid var(--brand-line);color:var(--brand-ink);font-family:var(--brand-sans)}
.museum-intro{min-width:0;background:var(--museum-paper);color:var(--museum-ink);border-right:1px solid var(--brand-line)}
.museum-portrait{position:relative;height:135px;overflow:hidden;background:var(--museum-paper)}
.museum-portrait img{display:block;width:100%;height:100%;object-fit:cover}
.museum-city-label{position:absolute;left:20px;top:0;padding:16px 11px 12px;background:var(--museum-paper);color:var(--museum-ink);writing-mode:vertical-rl;font:400 28px/1.1 var(--brand-display);letter-spacing:5px;border-bottom:3px solid var(--museum-ink)}
.museum-image-caption{position:absolute;right:10px;bottom:10px;padding:3px 6px;background:var(--brand-paper);color:var(--brand-ink);font-size:10px;letter-spacing:.12em}
.museum-image-fallback{display:grid;place-items:center;height:100%;font:400 62px var(--brand-serif);opacity:.18}
.museum-intro-copy{padding:20px 24px 24px}
.museum-kicker{font-size:10px;letter-spacing:.12em;color:var(--museum-ink)}
.museum-intro h3{margin:8px 0;font:400 25px/1.4 var(--brand-serif);letter-spacing:.12em}
.museum-intro p{margin:0;font-size:13px;line-height:1.8;color:var(--brand-ink)}
.museum-list{min-width:0;align-self:center;padding:24px 32px}
.museum-list-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-bottom:16px;border-bottom:1px solid var(--brand-line);color:var(--museum-ink);font:400 18px var(--brand-serif)}
.museum-list-heading small{font:11px var(--brand-sans);color:var(--brand-muted)}
.museum-entry+.museum-entry{border-top:1px solid var(--brand-line)}
.museum-link{display:flex;align-items:center;justify-content:space-between;gap:20px;min-height:60px;padding:12px 0;color:inherit;text-decoration:none}
.museum-name{min-width:0}.museum-name strong{display:block;font:400 20px/1.5 var(--brand-serif);overflow-wrap:anywhere}.museum-name small{display:block;margin-top:4px;font-size:12px;color:var(--brand-deep-green)}
.museum-action{flex-shrink:0;font-size:13px;color:var(--brand-red)}
.museum-action span{margin-left:10px}
.museum-link:hover .museum-name strong{color:var(--museum-ink);text-decoration:underline;text-underline-offset:5px}
.museum-link:focus-visible,.museum-alternate:focus-visible{outline:2px solid var(--brand-red);outline-offset:4px}
.museum-alternate{display:inline-flex;align-items:center;min-height:44px;gap:10px;color:var(--brand-deep-green);font-size:12px;text-underline-offset:4px}
.museum-note{display:block;margin-top:8px;font-size:11px;line-height:1.8;color:var(--brand-deep-green)}
@media(max-width:720px){.city-museums{grid-template-columns:1fr;margin-bottom:32px}.museum-intro{border-right:0;border-bottom:1px solid var(--brand-line)}.museum-portrait{height:120px}.museum-intro-copy{padding:16px 20px}.museum-intro h3{font-size:23px}.museum-list{padding:20px}.museum-link{gap:12px}.museum-name strong{font-size:18px}.museum-action{font-size:12px}.museum-action span{margin-left:3px}}
@media(max-width:360px){.museum-link{align-items:flex-start;flex-direction:column;gap:6px}.museum-action{align-self:flex-end}}
</style>
