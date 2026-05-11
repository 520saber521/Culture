const AMAP_KEY = '5ede3f0fff6a28d2e32634a500ec65b4'
const AMAP_VERSION = '2.0'
const AMAP_LOAD_TIMEOUT = 15000

let amapLoadingPromise = null
let amapLoaded = false

function loadAMapScript() {
  if (amapLoadingPromise) {
    return amapLoadingPromise
  }

  if (window.AMap && amapLoaded) {
    return Promise.resolve(window.AMap)
  }

  amapLoadingPromise = new Promise((resolve, reject) => {
    if (window.AMap) {
      amapLoaded = true
      resolve(window.AMap)
      return
    }

    window._AMapSecurityConfig = {
      securityJsCode: '',
    }

    const existingScript = document.querySelector('script[src*="webapi.amap.com/maps"]')
    if (existingScript) {
      existingScript.remove()
    }

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.async = true
    script.src = `https://webapi.amap.com/maps?v=${AMAP_VERSION}&key=${AMAP_KEY}&callback=onAMapLoaded`
    
    let resolved = false
    
    window.onAMapLoaded = () => {
      if (resolved) return
      resolved = true
      clearTimeout(timeoutId)
      amapLoaded = true
      resolve(window.AMap)
    }

    const timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true
        reject(new Error('地图加载超时，请检查网络连接'))
      }
    }, AMAP_LOAD_TIMEOUT)

    script.onload = () => {
      if (window.AMap && !resolved) {
        resolved = true
        clearTimeout(timeoutId)
        amapLoaded = true
        resolve(window.AMap)
      }
    }

    script.onerror = () => {
      if (!resolved) {
        resolved = true
        clearTimeout(timeoutId)
        reject(new Error('地图脚本加载失败，请检查网络'))
      }
    }

    document.head.appendChild(script)
  })

  return amapLoadingPromise
}

export function initMap(container, options = {}) {
  return new Promise((resolve, reject) => {
    loadAMapScript()
      .then(AMap => {
        const defaultOptions = {
          zoom: 7,
          center: [119.5, 32.9],
          mapStyle: 'amap://styles/normal',
          viewMode: '2D',
          features: ['bg', 'road', 'building', 'point'],
          showLabel: true,
          resizeEnable: true,
          dragEnable: true,
          zoomEnable: true,
          doubleClickZoom: true,
          keyboardEnable: true,
        }

        const mapOptions = { ...defaultOptions, ...options }
        
        let mapContainer = container
        if (typeof container === 'string') {
          mapContainer = document.getElementById(container)
        }
        
        if (!mapContainer) {
          reject(new Error('地图容器不存在'))
          return
        }
        
        const map = new AMap.Map(mapContainer, mapOptions)
        
        map.on('complete', () => {
          resolve({ map, AMap })
        })
        
        map.on('error', (e) => {
          reject(new Error('地图初始化失败: ' + (e.message || '未知错误')))
        })
      })
      .catch(error => {
        reject(error)
      })
  })
}

export function createLabelMarker(AMap, options) {
  const { position, name, isCapital, onClick } = options
  
  const marker = new AMap.Marker({
    position: position,
    offset: new AMap.Pixel(isCapital ? -12 : -9, isCapital ? -12 : -9),
    content: createMarkerContent(name, isCapital),
    zIndex: isCapital ? 100 : 50,
    extData: { name, isCapital }
  })

  if (onClick) {
    marker.on('click', () => onClick())
  }

  return marker
}

function createMarkerContent(name, isCapital) {
  const wrapper = document.createElement('div')
  wrapper.className = 'amap-custom-marker'
  wrapper.style.cssText = `
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    user-select: none;
    transform: translateZ(0);
    transition: transform 0.22s ease, filter 0.22s ease;
    will-change: transform;
  `
  
  const halo = document.createElement('div')
  halo.className = 'marker-halo'
  halo.style.cssText = isCapital ? `
    position: absolute;
    top: 2px;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(192, 12, 0, 0.22) 0%, rgba(192, 12, 0, 0.08) 42%, transparent 72%);
    filter: blur(1px);
    animation: markerPulse 2.8s ease-in-out infinite;
  ` : `
    position: absolute;
    top: 3px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(192, 12, 0, 0.16) 0%, rgba(192, 12, 0, 0.05) 45%, transparent 72%);
  `
  
  const dot = document.createElement('div')
  dot.className = 'marker-dot'
  dot.style.cssText = isCapital ? `
    width: 26px;
    height: 26px;
    background: linear-gradient(135deg, #d61f45 0%, #8b0000 100%);
    border-radius: 50%;
    border: 3px solid rgba(255, 255, 255, 0.96);
    box-shadow:
      0 10px 24px rgba(192, 12, 0, 0.28),
      inset 0 1px 2px rgba(255, 255, 255, 0.45);
  ` : `
    width: 18px;
    height: 18px;
    background: linear-gradient(135deg, #d61f45 0%, #c00c00 55%, #8b0000 100%);
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.98);
    box-shadow:
      0 8px 18px rgba(192, 12, 0, 0.22),
      inset 0 1px 2px rgba(255, 255, 255, 0.35);
  `
  
  const label = document.createElement('div')
  label.className = 'marker-label'
  label.style.cssText = `
    margin-top: 6px;
    padding: ${isCapital ? '5px 12px' : '4px 10px'};
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 244, 238, 0.96) 100%);
    border: 1px solid rgba(139, 21, 56, 0.08);
    border-radius: 999px;
    font-size: ${isCapital ? '14px' : '12px'};
    font-weight: ${isCapital ? '700' : '600'};
    color: ${isCapital ? '#8b1538' : '#3b342f'};
    letter-spacing: ${isCapital ? '1px' : '0.4px'};
    white-space: nowrap;
    box-shadow:
      0 6px 18px rgba(20, 16, 12, 0.08),
      0 0 0 1px rgba(255, 255, 255, 0.8) inset;
    backdrop-filter: blur(10px);
  `
  label.textContent = name
  
  if (isCapital) {
    const badge = document.createElement('span')
    badge.className = 'marker-badge'
    badge.style.cssText = `
      position: absolute;
      top: -10px;
      right: -28px;
      padding: 3px 8px;
      border-radius: 999px;
      background: linear-gradient(135deg, rgba(139, 21, 56, 0.98) 0%, rgba(201, 169, 98, 0.95) 100%);
      color: white;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      box-shadow: 0 8px 16px rgba(139, 21, 56, 0.22);
      white-space: nowrap;
    `
    badge.textContent = '省会'
    wrapper.appendChild(badge)
  }
  
  wrapper.appendChild(halo)
  wrapper.appendChild(dot)
  wrapper.appendChild(label)
  
  wrapper.addEventListener('mouseenter', () => {
    wrapper.style.transform = 'translateY(-2px) scale(1.08)'
    wrapper.style.filter = 'drop-shadow(0 10px 18px rgba(139, 21, 56, 0.15))'
  })
  wrapper.addEventListener('mouseleave', () => {
    wrapper.style.transform = 'translateY(0) scale(1)'
    wrapper.style.filter = 'none'
  })
  
  return wrapper
}

export function createMarkerLayer(AMap, map) {
  return map
}

export function addMarkersToMap(map, markers) {
  if (map && markers && markers.length > 0) {
    map.add(markers)
  }
}

export function destroyMap(map) {
  if (map) {
    map.clearMap()
    map.destroy()
  }
}

export function isMapLoaded() {
  return amapLoaded
}

export function resetMapLoader() {
  amapLoadingPromise = null
  amapLoaded = false
}

export default {
  initMap,
  createLabelMarker,
  createMarkerLayer,
  addMarkersToMap,
  destroyMap,
  isMapLoaded,
  resetMapLoader,
}
