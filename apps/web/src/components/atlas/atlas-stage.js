import { Component, createElement, Fragment, Suspense, useLayoutEffect, useRef } from 'react'
import { createRoot, extend, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { Group } from 'three'

extend({ Group })

class EnvironmentBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? null : this.props.children }
}

function Sky({ requestDraw }) {
  useLayoutEffect(() => { requestDraw() }, [requestDraw])
  return createElement(Environment, { preset: 'dawn', environmentIntensity: .13 })
}

function AtlasStage({ ocean, state, requestDraw, postprocessing }) {
  const bloom = useRef(null)
  useFrame(({ camera, scene }) => {
    ocean.update(state.time, state.reduced, state.opacity, camera, scene.environment)
    if (bloom.current) bloom.current.intensity = ocean.settings.bloom * state.opacity
  })
  return createElement(Fragment, null,
    createElement('primitive', { object: ocean.mesh, dispose: null }),
    createElement(EnvironmentBoundary, null,
      createElement(Suspense, { fallback: null }, createElement(Sky, { requestDraw }))),
    postprocessing && createElement(EffectComposer, { multisampling: 0 },
      createElement(Bloom, { ref: bloom, intensity: 0, luminanceThreshold: 1, luminanceSmoothing: .15, levels: 3, mipmapBlur: true })),
  )
}

export function createAtlasStage(canvas) {
  const root = createRoot(canvas)
  const state = { time: 0, reduced: false, opacity: 0 }
  let store
  let ready = false
  let disposed = false

  return {
    async mount({ renderer, scene, camera, ocean, width, height, requestDraw }) {
      await root.configure({
        gl: renderer, scene, camera, frameloop: 'never', flat: true, size: { width, height, top: 0, left: 0 },
        dpr: [1, 1.5], onCreated: () => { ready = true; requestDraw() },
      })
      if (disposed) return
      const postprocessing = width >= 720 && renderer.extensions.has('EXT_color_buffer_float')
      store = root.render(createElement(AtlasStage, { ocean, state, requestDraw, postprocessing }))
    },
    resize(width, height, dpr) {
      const rootState = store?.getState()
      rootState?.setDpr(dpr)
      rootState?.setSize(width, height)
    },
    draw(timestamp, time, reduced, opacity) {
      if (!ready || !store) return false
      Object.assign(state, { time, reduced, opacity })
      // R3F's manual clock uses seconds. Vue already schedules the atlas frames.
      store.getState().advance(timestamp / 1000, false)
      return true
    },
    dispose() {
      disposed = true
      ready = false
      root.unmount()
    },
  }
}
