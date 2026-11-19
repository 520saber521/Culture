<template>
  <svg viewBox="0 0 100 100" aria-hidden="true" class="landmark-art">
    <g stroke="#385548" stroke-width="1.35" stroke-linejoin="round" stroke-linecap="round">
      <path d="M12 90 Q48 87 88 90 M20 94H80" fill="none" opacity=".45" />
      <template v-if="tower">
        <path :d="tower.base" fill="#eee4cc" />
        <g v-for="(tier,i) in tower.tiers" :key="i">
          <path :d="`M${50-tier.w/2} ${tier.y}v${tier.h}h${tier.w}v-${tier.h}`" fill="#e5d8b9" />
          <path :d="`M${46-tier.w/2} ${tier.y+2}Q50 ${tier.y-8} ${54+tier.w/2} ${tier.y+2}L${50+tier.w/2} ${tier.y+5}H${50-tier.w/2}Z`" fill="#9eae96" />
          <path :d="`M47 ${tier.y+6}h6v${Math.max(3,tier.h-7)}h-6Z`" fill="#926253" />
          <path :d="`M${53-tier.w/2} ${tier.y+tier.h-2}H${47+tier.w/2}`" fill="none" opacity=".55" />
        </g>
        <path :d="`M50 ${tower.tiers[0].y-6}v-9m-3 4h6`" fill="none" />
      </template>
      <template v-else-if="city==='nanjing'">
        <path d="M20 87V64H80V87ZM29 64V44H71V64ZM37 44V27H63V44" fill="#e9dcc1" />
        <path d="M12 65Q30 61 33 55H67Q70 61 88 65L77 69H23ZM22 45Q36 40 39 35H61Q64 40 78 45L68 49H32ZM29 27Q42 23 50 12Q58 23 71 27L62 31H38Z" fill="#a7b29a" />
        <path d="M26 73H74M26 80H74M34 52H66M34 59H66M43 33V42M50 32V42M57 33V42M32 70V86M44 70V86M56 70V86M68 70V86" fill="none" stroke="#986056" />
      </template>
      <template v-else-if="city==='wuxi'">
        <path d="M13 86V61H87V86ZM27 61V44H73V61ZM41 44V26H59V44" fill="#e8d4a5" />
        <path d="M8 62L20 52L32 62M26 45L50 34L74 45M36 26L50 12L64 26ZM20 52V39L26 31L32 39V56M68 56V39L74 31L80 39V52" fill="#c1b77c" />
        <path d="M18 69H82M24 76V85M36 76V85M48 69V85M60 76V85M72 76V85M44 50H56V59H44Z" fill="none" />
        <path d="M46 82V73Q50 66 54 73V82" fill="#a56857" />
      </template>
      <template v-else-if="city==='xuzhou'">
        <path d="M10 88L22 72H78L90 88ZM27 72V48H73V72M37 48V32H63V48" fill="#dbd4bd" />
        <path d="M17 49Q36 46 39 39H61Q64 46 83 49L73 53H27ZM29 32L50 18L71 32L62 36H38Z" fill="#8fa28b" />
        <path d="M45 72V57Q50 50 55 57V72M26 79H74M20 84H80" fill="none" />
        <path d="M43 39H57V45H43Z" fill="#a45b50" />
      </template>
      <template v-else-if="city==='nantong'">
        <path d="M14 87V52H86V87M38 52V30H62V87" fill="#e4d9bc" />
        <path d="M8 53L26 39L38 47V31L50 18L62 31V47L74 39L92 53Z" fill="#91a58f" />
        <path d="M46 87V73Q50 66 54 73V87M20 59H28V68H20ZM72 59H80V68H72ZM20 75H28V83H20ZM72 75H80V83H72ZM45 40H55V50H45Z" fill="#a66a56" />
        <path d="M14 71H38M62 71H86M42 57H58" fill="none" />
      </template>
      <template v-else-if="city==='huaian'">
        <path d="M13 88V67H87V88ZM26 67V45H74V67ZM35 45V28H65V45" fill="#dfd4ba" />
        <path d="M17 45Q36 40 38 35H62Q64 40 83 45L73 49H27ZM27 28L50 15L73 28L64 32H36Z" fill="#98a88d" />
        <path d="M41 88V78Q50 65 59 78V88" fill="#587160" />
        <path d="M32 53V64M42 53V64M58 53V64M68 53V64M16 72H84M44 35H56V41H44Z" fill="none" stroke="#a06352" />
      </template>
      <template v-else-if="city==='yancheng'">
        <path d="M11 84V48L35 40L57 51V86ZM40 84V33L66 22L88 36V84Z" fill="#e8e5cf" />
        <path d="M40 33L62 45L88 36M62 45V85M11 48L32 58L57 51M32 58V85M48 39V78M55 42V80M68 44V79M77 41V79M19 55V79M25 57V81" fill="none" stroke="#8d9e8a" />
        <path d="M65 73H79V86H65Z" fill="#8a5b4b" />
      </template>
      <template v-else-if="city==='yangzhou'">
        <path d="M25 87V63H75V87M30 63V44H70V63M37 44V28H63V44" fill="#e7dbc0" />
        <path d="M16 64Q32 60 35 54H65Q68 60 84 64L73 68H27ZM22 45Q36 40 39 35H61Q64 40 78 45L69 49H31ZM29 29Q42 24 50 13Q58 24 71 29L62 33H38Z" fill="#91a28b" />
        <path d="M43 87V76Q50 65 57 76V87M36 51V61M50 51V61M64 51V61" fill="#b47e63" />
      </template>
      <template v-else-if="city==='taizhou'">
        <path d="M14 87V68H86V87M23 68V48H77V68M33 48V30H67V48" fill="#e4d5b4" />
        <path d="M7 68Q22 64 29 58H71Q78 64 93 68L84 72H16ZM16 48Q32 42 36 38H64Q68 42 84 48L75 52H25ZM25 30L50 16L75 30L65 34H35Z" fill="#9fa88b" />
        <path d="M20 77H80M29 57H71M39 38V46M50 37V46M61 38V46M29 73V86M43 73V86M57 73V86M71 73V86" fill="none" stroke="#995f50" />
      </template>
      <template v-else-if="city==='suqian'">
        <path d="M12 87V54H31V87M69 87V54H88V87M30 65H70V82H30Z" fill="#d8cfb4" />
        <path d="M7 54L13 47H30L36 54ZM64 54L70 47H87L93 54ZM29 43L50 25L71 43L65 49H35Z" fill="#879b84" />
        <path d="M35 49H65V65H35ZM44 87V73H56V87" fill="#ab7560" />
        <path d="M17 61H26M17 69H26M74 61H83M74 69H83M39 55H61M10 90H90" fill="none" />
      </template>
    </g>
  </svg>
</template>
<script setup>
import { computed } from 'vue'
const props=defineProps({city:String})
const designs={
 changzhou:{levels:13,top:15,step:5.6,w:12,grow:2.4,base:'M23 89V82H77V89Z'},
 suzhou:{levels:9,top:15,step:8,w:14,grow:3,base:'M29 90V85H71V90Z'},
 lianyungang:{levels:9,top:17,step:8,w:16,grow:2.3,base:'M30 90L34 85H66L70 90Z'},
 zhenjiang:{levels:7,top:20,step:9,w:17,grow:2.8,base:'M12 91L25 84L35 87L45 80L59 85L73 83L89 91Z'},
}
const tower=computed(()=>{const d=designs[props.city];return d&&{base:d.base,tiers:Array.from({length:d.levels},(_,i)=>({y:d.top+i*d.step,w:d.w+i*d.grow,h:d.step+2}))}})
</script>
<style scoped>.landmark-art{width:100%;height:100%;overflow:visible;filter:drop-shadow(0 2px 1px #233a2915)}</style>
