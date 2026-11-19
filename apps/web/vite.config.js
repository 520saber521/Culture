import { readFileSync } from 'node:fs'
import { defineConfig, normalizePath } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

const waterSource = fileURLToPath(new URL('./src/data/atlas/water-geometry.json', import.meta.url))
const waterImporter = normalizePath(fileURLToPath(new URL('./src/data/atlas/water.js', import.meta.url)))
const waterEntryId = '\0atlas-water-geometry'
const waterPartPrefix = `${waterEntryId}-part-`
const waterPartLimit = 10 * 1024 * 1024

// Keep coordinate arrays out of the bundler's JavaScript syntax tree.
function parseJsonAtRuntime(json) {
  return `/* @__PURE__ */ JSON.parse(${JSON.stringify(json)})`
}

function splitAtlasWaterGeometry() {
  let modules

  return {
    name: 'split-atlas-water-geometry',
    apply: 'build',
    enforce: 'pre',
    buildStart() {
      modules = undefined
      this.addWatchFile(waterSource)
    },
    resolveId(source, importer) {
      if (source.startsWith(waterPartPrefix)) return source
      if (source === './water-geometry.json' && importer && normalizePath(importer) === waterImporter) {
        return waterEntryId
      }
    },
    load(id) {
      if (id === waterEntryId) {
        const { water, ...geometry } = JSON.parse(readFileSync(waterSource, 'utf8'))
        const parts = []
        let current = []
        let size = 2

        for (const body of water) {
          const encoded = JSON.stringify(body)
          const bytes = Buffer.byteLength(encoded)
          if (bytes + 2 > waterPartLimit) {
            this.error(`Water geometry for ${body.id} exceeds the chunk budget.`)
          }
          if (current.length && size + bytes + 1 > waterPartLimit) {
            parts.push(current)
            current = []
            size = 2
          }
          size += bytes + Number(current.length > 0)
          current.push(encoded)
        }
        if (current.length) parts.push(current)

        modules = new Map(parts.map((part, index) => [
          `${waterPartPrefix}${index + 1}`,
          `export default ${parseJsonAtRuntime(`[${part.join(',')}]`)};`,
        ]))
        const imports = [...modules.keys()].map((key, index) =>
          `import part${index} from ${JSON.stringify(key)};`)
        const batches = parts.map((_, index) => `...part${index}`).join(',')

        return `${imports.join('\n')}\nexport default { ...${parseJsonAtRuntime(JSON.stringify(geometry))}, water: [${batches}] };`
      }
      return modules?.get(id)
    },
  }
}

export default defineConfig({
  plugins: [vue(), splitAtlasWaterGeometry()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  server: {
    host: true,
    port: 3000,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.startsWith(waterPartPrefix)) {
            return `atlas-water-${id.slice(waterPartPrefix.length)}`
          }
        },
      },
    },
  },
  base: '/'
})
