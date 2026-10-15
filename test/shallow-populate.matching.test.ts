import assert from 'node:assert'
import { feathers } from '@feathersjs/feathers'

import { shallowPopulate } from '../src/index.js'
import type { IncludeCumulated, PopulateObject } from '../src/index.js'

// Runs shallowPopulate against a service that always returns `related`, so the
// assertions only cover how related items are matched to `data`.
const populateWith = async (
  related: any[],
  data: any[],
  include: Omit<IncludeCumulated, 'service'>,
) => {
  const app = feathers()
  app.use('related', {
    async find() {
      return related
    },
  })

  const hook = shallowPopulate({
    include: { service: 'related', ...include } as PopulateObject,
  })
  const context: any = {
    app,
    method: 'find',
    type: 'after',
    params: {},
    result: data,
  }
  await hook(context)
  return context.result
}

describe('shallowPopulate: matching related items', () => {
  it('keeps the order of the related items and repeats items matched by several ids', async () => {
    const related = [
      { id: 3, tagIds: [1, 2] },
      { id: 1, tagIds: [1] },
      { id: 2, tagIds: [2] },
    ]

    const [byIds, byTagIds] = await Promise.all([
      populateWith(related, [{ ids: [2, 1, 3] }], {
        nameAs: 'items',
        keyHere: 'ids',
        keyThere: 'id',
      }),
      populateWith(related, [{ tagIds: [1, 2] }], {
        nameAs: 'items',
        keyHere: 'tagIds',
        keyThere: 'tagIds',
      }),
    ])

    assert.deepStrictEqual(
      byIds[0].items.map((item: any) => item.id),
      [3, 1, 2],
    )
    assert.deepStrictEqual(
      byTagIds[0].items.map((item: any) => item.id),
      [3, 3, 1, 2],
    )
  })

  it('matches keyThere inside an array of objects', async () => {
    const related = [
      { id: 'a', members: [{ userId: 1 }, { userId: 2 }] },
      { id: 'b', members: [{ userId: 2 }] },
      { id: 'c', members: [] },
    ]

    const result = await populateWith(
      related,
      [{ id: 1 }, { id: 2 }, { id: 3 }],
      { nameAs: 'groups', keyHere: 'id', keyThere: 'members.userId' },
    )

    assert.deepStrictEqual(
      result.map((item: any) => item.groups.map((group: any) => group.id)),
      [['a'], ['a', 'b'], []],
    )
  })

  it('matches an array keyThere only with asArray', async () => {
    const related = [{ id: 'a', userIds: [1, 2] }]

    const [asArray, single] = await Promise.all([
      populateWith(related, [{ id: 1 }], {
        nameAs: 'groups',
        keyHere: 'id',
        keyThere: 'userIds',
      }),
      populateWith(related, [{ id: 1 }], {
        nameAs: 'group',
        keyHere: 'id',
        keyThere: 'userIds',
        asArray: false,
      }),
    ])

    assert.deepStrictEqual(asArray[0].groups, [related[0]])
    assert.strictEqual(single[0].group, null)
  })

  it('compares ids strictly by type', async () => {
    const related = [{ id: 1 }, { id: '1' }]

    const result = await populateWith(related, [{ userId: '1' }], {
      nameAs: 'user',
      keyHere: 'userId',
      keyThere: 'id',
      asArray: false,
    })

    assert.strictEqual(result[0].user, related[1])
  })

  it('matches object ids by value', async () => {
    const related = [
      { day: new Date('2024-01-01'), n: 1 },
      { day: new Date('2024-01-02'), n: 2 },
    ]

    const result = await populateWith(
      related,
      [{ day: new Date('2024-01-02') }, { day: new Date('2024-01-03') }],
      { nameAs: 'entry', keyHere: 'day', keyThere: 'day', asArray: false },
    )

    assert.strictEqual(result[0].entry, related[1])
    assert.strictEqual(result[1].entry, null)
  })

  it('applies $skip and $limit per item across all of its ids', async () => {
    const related = [
      { id: 1, postId: 'x' },
      { id: 2, postId: 'y' },
      { id: 3, postId: 'x' },
      { id: 4, postId: 'y' },
      { id: 5, postId: 'z' },
    ]

    const result = await populateWith(
      related,
      [{ postIds: ['y', 'x'] }, { postIds: ['z'] }],
      {
        nameAs: 'comments',
        keyHere: 'postIds',
        keyThere: 'postId',
        params: { query: { $skip: 1, $limit: 2 } },
      },
    )

    assert.deepStrictEqual(
      result.map((item: any) => item.comments.map((c: any) => c.id)),
      [[2, 3], []],
    )
  })
})
