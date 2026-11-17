import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { cities, items, categories, themes, themeCounts, relatedItems } from './content.js'
import { cityVisuals, exhibitionItems, themeExamples } from './visuals.js'

test('all thirteen administrative regions have eight curated entries', () => {
  const geo = JSON.parse(readFileSync(new URL('./jiangsu.geo.json', import.meta.url)))
  assert.equal(cities.length, 13)
  assert.equal(items.length, 104)
  assert.equal(new Set(items.map(item => item.id)).size, 104)
  assert.deepEqual(cities.map(c=>c.name).sort(),geo.features.map(f=>f.properties.name.replace('市','')).sort())
  for (const city of cities) {
    assert.equal(city.items.length,8)
    for (const category of categories) assert.equal(city.items.filter(i=>i.category===category).length,2)
    for (const item of city.items) {
      assert.equal(item.cityId,city.id)
      assert.equal(item.observations.length,3)
      assert.ok(item.body.every(p=>p.length>20))
      assert.ok(item.sources.length)
      for (const source of item.sources) assert.equal(new URL(source.url).protocol,'https:')
      for (const theme of item.themes) assert.ok(themes.some(t=>t.id===theme))
    }
  }
})
test('theme counts and cross-city recommendations reference actual content', () => {
  for (const theme of themes) {
    const counts=themeCounts(theme.id)
    assert.equal(Object.values(counts).reduce((a,b)=>a+b,0),items.filter(i=>theme.id==='all'||i.themes.includes(theme.id)).length)
  }
  for (const item of items) for (const related of relatedItems(item)) {
    assert.notEqual(item.id,related.id)
    assert.ok(item.themes.some(t=>related.themes.includes(t)))
  }
})

test('featured selections and theme examples preserve all eight entries', () => {
  for (const city of cities) {
    assert.equal(exhibitionItems(city)[0].id, `${city.id}-${cityVisuals[city.id].feature}`)
    for (const theme of themes) {
      const ordered = exhibitionItems(city, theme.id)
      assert.deepEqual(ordered.map(i=>i.id).sort(),city.items.map(i=>i.id).sort())
      if (city.items.some(i=>i.themes.includes(theme.id))) assert.ok(ordered[0].themes.includes(theme.id))
    }
  }
  for (const theme of themes.filter(t=>t.id!=='all')) {
    for (const example of themeExamples(cities,theme.id)) {
      assert.ok(items.some(i=>i.cityId===example.cityId&&i.title===example.title&&i.themes.includes(theme.id)))
    }
  }
})
