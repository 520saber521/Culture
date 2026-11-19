import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { Leva, useControls } from 'leva'

function OceanControls({ settings, requestDraw }) {
  function slider(key, label, min, max, step) {
    return { label, value: settings[key], min, max, step, onChange(value) {
      settings[key] = value
      requestDraw()
    } }
  }
  useControls('黄海', () => ({
    wind: slider('wind', '风浪', 0, 2.5, .05),
    wake: slider('wake', '鼠标力度', 0, 2.5, .05),
    speed: slider('speed', '传播速度', 5, 35, 1),
    decay: slider('decay', '消退时间', .4, 3, .05),
    reflection: slider('reflection', '反射强度', 0, 1.5, .05),
    bloom: slider('bloom', '高光泛光', 0, .3, .01),
  }))
  return createElement(Leva, { fill: true, titleBar: { title: '海面调参' } })
}

export function mountOceanControls(host, settings, requestDraw) {
  const root = createRoot(host)
  root.render(createElement(OceanControls, { settings, requestDraw }))
  return () => root.unmount()
}
