<template>
  <div class="atlas-landscape" aria-hidden="true">
    <svg class="distant-shore" viewBox="0 0 620 440" fill="none">
      <path d="M-20 315L32 264L62 277L110 207L137 226L173 165L203 207L229 192L274 246L310 230L348 269L391 259L439 307L494 293L548 335L620 351V440H-20Z" fill="#829b8b" opacity=".1"/>
      <path d="M-20 350L37 315L78 330L127 277L160 295L192 267L232 313L274 290L322 335L371 313L422 349L473 333L529 365L620 382" stroke="#6f8b7b" opacity=".22"/>
      <path d="M0 315L32 264L62 277L110 207L137 226L173 165L203 207L229 192L274 246L310 230L348 269M110 207L104 259L86 291M173 165L171 239L198 280M229 192L221 258L243 277M23 382Q133 356 228 378T440 396T620 411M0 403Q123 379 216 399T432 418" stroke="#71897b" opacity=".16"/>
    </svg>
  </div>
</template>
<style scoped>
.atlas-landscape{position:absolute;inset:0;pointer-events:none;overflow:hidden;background:#e9eee6}
.atlas-landscape:after{content:'';position:absolute;inset:0;background:url('/paper-grain.svg');opacity:.13}
.distant-shore{position:absolute;bottom:8%;left:-5%;width:40%;max-width:620px}
@media(max-width:720px){.distant-shore{width:78%;left:-35%;bottom:28%;opacity:.6}}
</style>
