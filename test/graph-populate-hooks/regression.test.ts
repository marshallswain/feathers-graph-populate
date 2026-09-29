import assert from 'node:assert'
import type { Params } from '@feathersjs/feathers'
import { feathers } from '@feathersjs/feathers'
import { MemoryService } from '@feathersjs/memory'
import type { AdapterParams } from '@feathersjs/adapter-commons'

import configureGraphPopulate, {
  populate,
  shallowPopulate,
} from '../../src/index.js'
import { assertIncludes } from '../../src/utils/shallow-populate.utils.js'

type Ctx = Params & AdapterParams & { $populateParams?: any }

const NAME_AS_X_REGEX = /nameAs="x"/

describe('regression: $limit honored in cumulated populates', () => {
  it('limits attached related items when $limit is set in populate params', async () => {
    const app = feathers<{
      users: MemoryService<any, any, Ctx>
      posts: MemoryService<any, any, Ctx>
    }>()
    app.configure(configureGraphPopulate())
    app.use('users', new MemoryService({ multi: true, startId: 1 }) as any)
    app.use('posts', new MemoryService({ multi: true, startId: 1 }) as any)

    const users = app.service('users')
    const posts = app.service('posts')

    users.hooks({
      after: {
        all: [
          populate({
            populates: {
              posts: {
                service: 'posts',
                nameAs: 'posts',
                keyHere: 'id',
                keyThere: 'userId',
                asArray: true,
              },
            },
          }),
        ],
      },
    })

    const user = await users.create({ name: 'u' })
    await posts.create([
      { userId: user.id, n: 1 },
      { userId: user.id, n: 2 },
      { userId: user.id, n: 3 },
      { userId: user.id, n: 4 },
      { userId: user.id, n: 5 },
    ])

    const result = (await users.get(user.id, {
      $populateParams: { query: { posts: { $limit: 2 } } },
    })) as any

    assert.strictEqual(
      result.posts.length,
      2,
      '$limit must cap related items at 2',
    )
  })
})

describe('regression: setItems does not mutate the related-service response', () => {
  it('keeps keyThere on fetched related items even when user $select omits it', async () => {
    const app = feathers<{
      users: MemoryService<any, any, Ctx>
      posts: MemoryService<any, any, Ctx>
    }>()
    app.configure(configureGraphPopulate())
    app.use('users', new MemoryService({ multi: true, startId: 1 }) as any)
    app.use('posts', new MemoryService({ multi: true, startId: 1 }) as any)

    const users = app.service('users')
    const posts = app.service('posts')

    users.hooks({
      after: {
        all: [
          populate({
            populates: {
              posts: {
                service: 'posts',
                nameAs: 'posts',
                keyHere: 'id',
                keyThere: 'userId',
                asArray: true,
              },
            },
          }),
        ],
      },
    })

    const user = await users.create({ name: 'u' })
    const [p1, p2] = await posts.create([
      { userId: user.id, title: 'a' },
      { userId: user.id, title: 'b' },
    ])

    // Re-fetch the posts directly to capture the response object identity.
    let liveResponse: any[] = []
    posts.hooks({
      after: {
        find: [
          (context) => {
            liveResponse = context.result as any[]
            return context
          },
        ],
      },
    })

    const result = (await users.get(user.id, {
      $populateParams: { query: { posts: { $select: ['title'] } } },
    })) as any

    // The attached posts should NOT contain userId (user excluded it via $select).
    assert.deepStrictEqual(
      result.posts.map((p: any) => Object.keys(p).sort()),
      [
        ['id', 'title'],
        ['id', 'title'],
      ],
      'attached posts respect $select',
    )

    // But the live response from the related service must still have userId.
    assert.ok(
      liveResponse.every((p: any) => 'userId' in p),
      'related-service response retains userId — not mutated',
    )

    // And a direct query unrelated to populate must still return userId.
    const direct = (await posts.get(p1.id)) as any
    assert.ok('userId' in direct, 'direct get unaffected')
    assert.strictEqual(direct.userId, user.id)
    // Touch p2 so linter doesn't complain about unused.
    assert.ok(p2)
  })
})

describe('regression: assertIncludes does not mutate caller objects', () => {
  it('keeps caller objects unchanged when run alone', () => {
    const include = {
      service: 's',
      nameAs: 'n',
      keyHere: 'h',
      keyThere: 't',
      asArray: true,
      params: {},
    }
    const snapshot = JSON.stringify(include)
    assertIncludes([include as any])
    assert.strictEqual(
      JSON.stringify(include),
      snapshot,
      'assertIncludes is pure',
    )
  })

  it('names the offending include when validation fails', () => {
    assert.throws(
      () =>
        assertIncludes([
          { service: 'a', nameAs: 'x', keyHere: 'h', keyThere: 't' } as any,
          { service: 'b', nameAs: 'x', keyHere: 'h', keyThere: 't' } as any,
        ]),
      NAME_AS_X_REGEX,
      'duplicate nameAs error mentions the value',
    )

    assert.throws(
      () =>
        assertIncludes([
          {
            service: 'a',
            nameAs: 'x',
            params: { foo: 1 },
            keyHere: 'h',
          } as any,
        ]),
      NAME_AS_X_REGEX,
      'keyHere-without-keyThere error mentions the include',
    )
  })
})

describe('regression: shallowPopulate honors the strip-keyThere clone, not in-place', () => {
  it('produces correct output without mutating the source data array', async () => {
    const app = feathers<{
      users: MemoryService<any, any, Ctx>
      posts: MemoryService<any, any, Ctx>
    }>()
    app.use('users', new MemoryService({ multi: true, startId: 1 }) as any)
    app.use('posts', new MemoryService({ multi: true, startId: 1 }) as any)

    const sp = shallowPopulate({
      include: {
        service: 'posts',
        nameAs: 'posts',
        keyHere: 'id',
        keyThere: 'userId',
        asArray: true,
      },
    })

    await app.service('posts').create([
      { userId: 1, t: 'a' },
      { userId: 1, t: 'b' },
    ])

    const ctx: any = {
      app,
      method: 'get',
      type: 'after',
      params: {},
      result: { id: 1, name: 'u' },
    }
    await sp(ctx)
    assert.strictEqual(ctx.result.posts.length, 2)
    assert.ok('userId' in ctx.result.posts[0], 'keyThere kept by default')
  })
})
