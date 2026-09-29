import assert from 'node:assert'
import { get, set } from '../src/utils/object.js'

describe('object utils', () => {
  describe('get', () => {
    it('reads nested paths with dot and bracket notation', () => {
      const obj = { a: { b: [{ c: 1 }] }, 'x.y': 2 }

      assert.strictEqual(get(obj, 'a.b[0].c'), 1)
      assert.strictEqual(get(obj, 'a.b.0.c'), 1)
      assert.strictEqual(get(obj, 'x.y'), 2, 'verbatim key wins')
      assert.strictEqual(get(obj, 'a.missing.c'), undefined)
      assert.strictEqual(get(null, 'a'), undefined)
    })
  })

  describe('set', () => {
    it('creates missing objects and arrays', () => {
      const obj: any = { meta: null }

      set(obj, 'meta.posts', [1])
      set(obj, 'list[0].id', 2)
      set(obj, 'x.y', 3)

      assert.deepStrictEqual(obj, {
        meta: { posts: [1] },
        list: [{ id: 2 }],
        x: { y: 3 },
      })
    })

    it('ignores prototype polluting paths', () => {
      const obj: any = {}
      set(obj, '__proto__.polluted', true)
      set(obj, 'constructor.prototype.polluted', true)

      assert.strictEqual(({} as any).polluted, undefined)
    })
  })
})
