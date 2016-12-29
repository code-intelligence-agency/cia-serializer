import test from 'ava'
import serializer from './index'
import fs from 'fs'
import http from 'http'

test('works with error', t => {
  const err = new Error('sample err')
  const deserialized = serializer.parse(serializer.stringify(err))
  t.is(deserialized.message, 'sample err')
  t.is(deserialized.name, 'Error')
})

test('node builtins are serialized', (t) => {
  const deserializedFs = serializer.parse(serializer.stringify(fs))
  const fsInProp = serializer.parse(serializer.stringify({someProp: fs}))
  const deserializedHttp = serializer.parse(serializer.stringify(http))
  t.is(deserializedFs, fs)
  t.deepEqual(fsInProp, {someProp: fs})
  t.is(deserializedHttp, http)
})

test('shortening', (t) => {
  const a = {a: 10, b: 409840984098, c: 'hello world'}
  const b = {topa: a, topb: a}
  const serialized =  serializer.stringify(b, 199)
  t.is(serialized, "{\"topa\":{\"a\":10,\"b\":409840984098,\"c\":\"hello world\"},\"topb\":\"__na_Object__\"}")

  const serializedNoShortening =  serializer.stringify(b, 299)
  t.is(serializedNoShortening, "{\"topa\":{\"a\":10,\"b\":409840984098,\"c\":\"hello world\"},\"topb\":{\"a\":10,\"b\":409840984098,\"c\":\"hello world\"}}")
  
  const serializedMoreShortening =  serializer.stringify(b, 130)
  t.is(serializedMoreShortening, "{\"topa\":\"__na_Object__\",\"topb\":\"__na_Object__\"}")
})