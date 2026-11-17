<template>
  <section v-if="museums.length" class="city-museums" aria-label="城市博物馆">
    <div class="museum-intro">
      <span class="museum-kicker">城市延伸阅读 / MUSEUMS</span>
      <h3>走进博物馆</h3>
      <p>从城市风物，读到馆藏故事。</p>
    </div>
    <div class="museum-list">
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
import { computed } from 'vue'
import { museumsForCity } from '@/data/atlas/museums'

const props = defineProps({ city: { type: String, required: true } })
const museums = computed(() => museumsForCity(props.city))
</script>

<style scoped>
.city-museums{display:grid;grid-template-columns:minmax(180px,.75fr) minmax(0,1.5fr);gap:28px;margin:0 0 44px;padding:24px 28px;background:var(--brand-jade);border-block:1px solid var(--brand-line);color:var(--brand-ink);font-family:var(--brand-sans)}
.museum-kicker{font-size:10px;letter-spacing:.12em;color:var(--brand-deep-green)}
.museum-intro h3{margin:10px 0 8px;font:400 25px/1.4 var(--brand-serif)}
.museum-intro p{margin:0;font-size:13px;line-height:1.8;color:var(--brand-deep-green)}
.museum-list{min-width:0;align-self:center}
.museum-entry+.museum-entry{border-top:1px solid var(--brand-line)}
.museum-link{display:flex;align-items:center;justify-content:space-between;gap:20px;min-height:60px;padding:12px 0;color:inherit;text-decoration:none}
.museum-name{min-width:0}.museum-name strong{display:block;font:400 20px/1.5 var(--brand-serif);overflow-wrap:anywhere}.museum-name small{display:block;margin-top:4px;font-size:12px;color:var(--brand-deep-green)}
.museum-action{flex-shrink:0;font-size:13px;color:var(--brand-red)}
.museum-action span{margin-left:10px}
.museum-link:hover .museum-name strong{text-decoration:underline;text-underline-offset:5px}
.museum-link:focus-visible,.museum-alternate:focus-visible{outline:2px solid var(--brand-red);outline-offset:4px}
.museum-alternate{display:inline-flex;align-items:center;min-height:44px;gap:10px;color:var(--brand-deep-green);font-size:12px;text-underline-offset:4px}
.museum-note{display:block;margin-top:8px;font-size:11px;line-height:1.8;color:var(--brand-deep-green)}
@media(max-width:720px){.city-museums{grid-template-columns:1fr;gap:14px;padding:20px;margin-bottom:32px}.museum-intro h3{font-size:23px}.museum-link{gap:12px}.museum-name strong{font-size:18px}.museum-action{font-size:12px}.museum-action span{margin-left:3px}}
@media(max-width:360px){.museum-link{align-items:flex-start;flex-direction:column;gap:6px}.museum-action{align-self:flex-end}}
</style>
