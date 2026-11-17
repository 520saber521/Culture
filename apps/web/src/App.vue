<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import SiteNavigation from '@/components/SiteNavigation.vue'
import '@surely-vue/table/dist/index.less';

const route = useRoute()
const footerRef = ref(null)

// 波浪动画效果
function handleMouseMove(event) {
  if (!footerRef.value) return
  
  const footer = footerRef.value
  const rect = footer.getBoundingClientRect()
  
  // 检查鼠标是否在页脚区域内
  if (event.clientX < rect.left || event.clientX > rect.right || 
      event.clientY < rect.top || event.clientY > rect.bottom) {
    resetWaves()
    return
  }
  
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  
  // 计算鼠标与中心的距离比例
  const ratioX = (x - centerX) / centerX
  const ratioY = (y - centerY) / centerY
  
  // 获取波浪元素
  const waves = footer.querySelectorAll('.wave')
  waves.forEach((wave, index) => {
    // 不同波浪的振幅和延迟
    const amplitude = 10 + index * 5
    const delay = index * 0.1
    
    // 计算波浪的位移
    const offsetX = ratioX * amplitude
    const offsetY = ratioY * amplitude
    
    // 应用变换
    wave.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${ratioX * 5}deg)`
    wave.style.opacity = 0.3 + Math.abs(ratioX) * 0.5
  })
}

// 重置波浪位置
function resetWaves() {
  if (!footerRef.value) return
  
  const waves = footerRef.value.querySelectorAll('.wave')
  waves.forEach(wave => {
    wave.style.transform = 'translate(0, 0) rotate(0deg)'
    wave.style.opacity = 0.5
  })
}

onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseleave', resetWaves)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseleave', resetWaves)
})


</script>

<template>
  <!-- 导航栏 -->
  <SiteNavigation />
  <!-- 页面切换过渡效果 -->
  <router-view v-slot="{ Component }">
    <transition name="page-transition" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>

  <!-- 全局页脚 -->
  <footer v-if="route.path !== '/design'" class="page-footer" :class="{ 'footer-auth': ['/login', '/culture', '/feiyi', '/celebrities', '/traditional-arts', '/gallery', '/profile'].includes(route.path) }" ref="footerRef">
    <div class="wave-container">
      <div v-for="i in 3" :key="i" :class="`wave wave-${i}`"></div>
    </div>
    <div class="footer-content">
      <p class="copyright">© 2024 文化传承与创新平台 版权所有</p>
      <p class="contact">联系电话：010-12345678 | 邮箱：contact@culture.com</p>
      <p class="icp">京ICP备12345678号</p>
    </div>
  </footer>
</template>

<style scoped>
/* 页脚样式 */
.page-footer {
  background-color: #333333;
  color: white;
  padding: 40px 0;
  margin-top: 80px;
  position: relative;
  overflow: hidden;
}

.page-footer.footer-design {
  margin-top: 0;
  padding: 25px 0;
  border-top: 2px solid #3b3027;
  background: #eee3cf;
  color: #4d4034;
}

.footer-design .wave-container { display: none; }
.footer-design .contact, .footer-design .icp { color: #6f5e4e; }

/* 波浪动画容器 */
.wave-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  overflow: hidden;
}

/* 波浪元素 */
.wave {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transition: all 0.3s ease;
  transform-origin: center;
}

/* 不同波浪的样式 */
.wave-1 {
  top: 10px;
  z-index: 3;
}

.wave-2 {
  top: 15px;
  z-index: 2;
  width: 110%;
  left: -5%;
}

.wave-3 {
  top: 20px;
  z-index: 1;
  width: 120%;
  left: -10%;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
  position: relative;
  z-index: 10;
}

.copyright {
  font-size: 14px;
  margin: 0 0 10px 0;
}

.contact {
  font-size: 14px;
  margin: 0 0 10px 0;
  opacity: 0.8;
}

.icp {
  font-size: 12px;
  margin: 0;
  opacity: 0.6;
}

/* 页脚响应式设计 */
@media (max-width: 767px) {
  .page-footer {
    padding: 30px 0;
    margin-top: 60px;
  }
  
  .footer-content {
    padding: 0 15px;
  }
  
  .copyright {
    font-size: 13px;
  }
  
  .contact {
    font-size: 12px;
  }
  
  .icp {
    font-size: 11px;
  }
}


.footer-auth{margin-top:0;background:var(--brand-paper);color:var(--brand-muted);border-top:1px solid var(--brand-line);padding:24px 0}.footer-auth .wave-container{display:none}
</style>
