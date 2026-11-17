import test from 'node:test'
import assert from 'node:assert/strict'
import { readAtlasQuery, atlasQuery, loadReading, saveReading } from './navigation.js'

test('links validate identifiers and preserve cross-city recommendation context',()=>{
  assert.equal(readAtlasQuery({item:'nanjing-cloud-brocade'}).city.id,'nanjing')
  const state=readAtlasQuery({city:'suzhou',item:'nanjing-cloud-brocade',theme:'textile'})
  assert.equal(state.city.id,'suzhou');assert.equal(state.item.cityId,'nanjing')
  assert.deepEqual(atlasQuery({keep:'yes',city:'invalid',item:'invalid',theme:'invalid'},readAtlasQuery({})),{keep:'yes',atlas:'1'})
  assert.equal(readAtlasQuery({city:['suzhou'],theme:'unknown'}).city,null)
  assert.equal(readAtlasQuery({theme:'unknown'}).theme,'all')
})
test('reading memory tolerates corrupt, unavailable and stale storage',()=>{
  assert.deepEqual(loadReading(undefined),{positions:{},categories:{},recentCity:null})
  assert.deepEqual(loadReading({getItem:()=>'{'}),{positions:{},categories:{},recentCity:null})
  const state=loadReading({getItem:()=>JSON.stringify({positions:{good:850,bad:-10,string:'3'},recentCity:'unknown',categories:{suzhou:'古迹建筑',fake:'全部'}})})
  assert.deepEqual(state,{positions:{good:850},categories:{suzhou:'古迹建筑'},recentCity:null})
  assert.doesNotThrow(()=>saveReading({setItem(){throw Error('blocked')}},state))
})
